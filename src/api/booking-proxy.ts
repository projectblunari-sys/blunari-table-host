// Live booking API proxy via Supabase Edge Functions
import { supabase } from '@/integrations/supabase/client';
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

class BookingAPIError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'BookingAPIError';
  }
}

// Live API functions using Supabase edge functions
async function callEdgeFunction(functionName: string, body: any = {}): Promise<any> {
  try {
    console.log(`Calling edge function: ${functionName}`, body);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error(`Edge function ${functionName} error:`, error);
      throw new BookingAPIError('EDGE_FUNCTION_ERROR', error.message || 'Edge function failed', error);
    }

    if (!data) {
      throw new BookingAPIError('NO_DATA', 'No data received from booking service');
    }

    if (data.success === false && data.error) {
      throw new BookingAPIError(data.error.code || 'API_ERROR', data.error.message, data.error);
    }

    // Handle case where success is not explicitly set but no error exists
    if (data.success !== true && !data.slots && !data.hold_id && !data.reservation_id) {
      console.warn('Unexpected response format:', data);
      throw new BookingAPIError('INVALID_RESPONSE', 'Invalid response from booking service');
    }

    return data;
  } catch (error) {
    if (error instanceof BookingAPIError) {
      throw error;
    }
    console.error(`Failed to call edge function ${functionName}:`, error);
    throw new BookingAPIError('NETWORK_ERROR', `Failed to communicate with booking service`, error);
  }
}

export async function getTenantBySlug(slug: string) {
  try {
    // First try direct Supabase query for better performance
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !tenantData) {
      throw new BookingAPIError('TENANT_NOT_FOUND', `Restaurant not found: ${slug}`);
    }

    const transformedData = {
      tenant_id: tenantData.id,
      slug: tenantData.slug,
      name: tenantData.name,
      timezone: tenantData.timezone,
      currency: tenantData.currency,
      branding: {
        primary_color: tenantData.primary_color || '#3b82f6',
        secondary_color: tenantData.secondary_color || '#1e40af',
      },
      features: {
        deposit_enabled: false, // Get from policies later
        revenue_optimization: true,
      },
    };

    return TenantInfoSchema.parse(transformedData);
  } catch (error) {
    if (error instanceof BookingAPIError) {
      throw error;
    }
    throw new BookingAPIError('TENANT_LOOKUP_FAILED', 'Failed to lookup restaurant information', error);
  }
}

export async function searchAvailability(request: SearchRequest) {
  try {
    const data = await callEdgeFunction('widget-booking-live', {
      action: 'search',
      ...request,
    });
    
    return AvailabilityResponseSchema.parse(data);
  } catch (error) {
    throw new BookingAPIError('AVAILABILITY_SEARCH_FAILED', 'Failed to search availability', error);
  }
}

export async function createHold(request: HoldRequest) {
  try {
    const data = await callEdgeFunction('widget-booking-live', {
      action: 'hold',
      ...request,
    });
    
    return HoldResponseSchema.parse(data);
  } catch (error) {
    throw new BookingAPIError('HOLD_CREATION_FAILED', 'Failed to create booking hold', error);
  }
}

export async function confirmReservation(
  request: ReservationRequest, 
  idempotencyKey: string
) {
  try {
    const data = await callEdgeFunction('widget-booking-live', {
      action: 'confirm',
      idempotency_key: idempotencyKey,
      ...request,
    });
    
    return ReservationResponseSchema.parse(data);
  } catch (error) {
    throw new BookingAPIError('RESERVATION_CONFIRMATION_FAILED', 'Failed to confirm reservation', error);
  }
}

export async function getTenantPolicies(tenantId: string) {
  try {
    // For now, return default policies - can be enhanced with database queries
    const data = {
      deposit: {
        enabled: false,
      },
      cancellation: {
        allowed_hours: 24,
        fee_percentage: 10,
      },
    };
    
    return PolicyResponseSchema.parse(data);
  } catch (error) {
    throw new BookingAPIError('POLICY_RETRIEVAL_FAILED', 'Failed to retrieve policies', error);
  }
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
