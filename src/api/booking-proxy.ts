// Server-side API proxy functions - NO CLIENT SECRETS
import { 
  TenantInfoSchema, 
  AvailabilityResponseSchema, 
  HoldResponseSchema, 
  ReservationResponseSchema, 
  PolicyResponseSchema,
  SearchRequest,
  HoldRequest,
  ReservationRequest,
  APIError 
} from '@/types/booking-api';

const API_BASE_URL = process.env.CLIENT_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('CLIENT_API_BASE_URL environment variable is required');
}

class BookingAPIError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'BookingAPIError';
  }
}

async function makeAPIRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new BookingAPIError(
      `HTTP_${response.status}`,
      errorData.message || `API request failed: ${response.statusText}`,
      errorData
    );
  }

  return response.json();
}

export async function getTenantBySlug(slug: string) {
  const data = await makeAPIRequest(`/api/public/tenants/by-slug/${slug}`);
  return TenantInfoSchema.parse(data);
}

export async function searchAvailability(request: SearchRequest) {
  const data = await makeAPIRequest('/api/public/booking/search', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return AvailabilityResponseSchema.parse(data);
}

export async function createHold(request: HoldRequest) {
  const data = await makeAPIRequest('/api/public/booking/holds', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return HoldResponseSchema.parse(data);
}

export async function confirmReservation(
  request: ReservationRequest, 
  idempotencyKey: string
) {
  const data = await makeAPIRequest('/api/public/booking/reservations', {
    method: 'POST',
    headers: {
      'x-idempotency-key': idempotencyKey,
    },
    body: JSON.stringify(request),
  });
  return ReservationResponseSchema.parse(data);
}

export async function getTenantPolicies(tenantId: string) {
  const data = await makeAPIRequest(`/api/public/tenants/${tenantId}/policies`);
  return PolicyResponseSchema.parse(data);
}

export async function sendAnalyticsEvent(
  event: string, 
  data: Record<string, any>
): Promise<void> {
  // Only send if analytics endpoint is configured
  const analyticsURL = process.env.ANALYTICS_API_URL;
  if (!analyticsURL) {
    // Silent no-op if not configured
    return;
  }

  try {
    await fetch(`${analyticsURL}/api/public/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    });
  } catch (error) {
    // Silent failure for analytics
    console.warn('Analytics event failed:', error);
  }
}