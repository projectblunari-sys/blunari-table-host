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

// For demo purposes, we'll use mock responses since this is a client-side app
// In production, this should be replaced with actual API calls through Supabase Edge Functions
const API_BASE_URL = 'https://demo-booking-api.example.com'; // Mock URL for demo

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
  // For demo purposes, return mock data instead of making real API calls
  // In production, this should make actual HTTP requests to the booking API
  
  console.log('Mock API request:', endpoint, options);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Return mock responses based on endpoint
  if (endpoint.includes('/tenants/by-slug/')) {
    return {
      tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Valid UUID format
      slug: endpoint.split('/').pop(),
      name: 'Demo Restaurant',
      timezone: 'America/New_York',
      currency: 'USD',
      branding: {
        primary_color: '#3b82f6',
        secondary_color: '#1e40af',
      },
      features: {
        deposit_enabled: false,
        revenue_optimization: true,
      },
    };
  }
  
  if (endpoint.includes('/booking/search')) {
    const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
    return {
      slots: times.map((time, index) => ({
        time: `2024-01-15T${time}:00.000Z`,
        available_tables: Math.max(1, 5 - index),
        revenue_projection: 150 + Math.random() * 100,
        optimal: index === 2, // Make 19:00 optimal
      })),
    };
  }
  
  if (endpoint.includes('/booking/holds')) {
    return {
      hold_id: 'demo-hold-' + Date.now(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      table_identifiers: ['Table 5'],
    };
  }
  
  if (endpoint.includes('/booking/reservations')) {
    return {
      reservation_id: 'demo-reservation-' + Date.now(),
      confirmation_number: 'CONF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: 'confirmed',
      summary: {
        date: '2024-01-15T19:00:00.000Z',
        time: '7:00 PM',
        party_size: 4,
        table_info: 'Table 5',
        deposit_required: false,
      },
    };
  }
  
  if (endpoint.includes('/policies')) {
    return {
      deposit: {
        enabled: false,
      },
      cancellation: {
        allowed_hours: 24,
        fee_percentage: 10,
      },
    };
  }
  
  throw new Error(`Unknown endpoint: ${endpoint}`);
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
  // For demo, we'll just log analytics events
  // In production, this should be replaced with actual analytics API calls
  console.log('Analytics event:', event, data);
  return Promise.resolve();
}
