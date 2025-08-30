import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface WebhookRequest {
  provider: string;
  event_type: string;
  data: any;
  signature?: string;
  timestamp?: string;
}

// POS provider webhook signature verification
const verifySignature = (provider: string, signature: string, payload: string, secret: string): boolean => {
  try {
    switch (provider) {
      case 'toast':
        // Toast webhook signature verification
        const toastExpected = `sha256=${crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret + payload))}`;
        return signature === toastExpected;
      
      case 'square':
        // Square webhook signature verification  
        const squareExpected = crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload + secret));
        return signature === squareExpected;
      
      case 'clover':
        // Clover webhook signature verification
        return signature === secret; // Simplified for demo
      
      default:
        return true; // Allow custom webhooks without signature verification
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Process different event types
const processEvent = async (integrationId: string, eventType: string, eventData: any) => {
  console.log(`Processing ${eventType} event for integration ${integrationId}`);
  
  try {
    // Call the database function to process the event
    const { data, error } = await supabase.rpc('process_pos_event', {
      p_integration_id: integrationId,
      p_event_type: eventType,
      p_event_data: eventData,
      p_external_id: eventData.id || eventData.order_id || null
    });

    if (error) {
      console.error('Error processing event:', error);
      throw error;
    }

    // Handle specific event types
    switch (eventType) {
      case 'order.created':
      case 'order.updated':
        await handleOrderEvent(integrationId, eventData);
        break;
      
      case 'menu.item.updated':
        await handleMenuItemUpdate(integrationId, eventData);
        break;
      
      case 'payment.processed':
        await handlePaymentEvent(integrationId, eventData);
        break;
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return data;
  } catch (error) {
    console.error('Event processing failed:', error);
    throw error;
  }
};

const handleOrderEvent = async (integrationId: string, orderData: any) => {
  console.log('Handling order event:', orderData);
  
  // Transform order data to standard format
  const standardizedOrder = {
    external_id: orderData.id || orderData.order_id,
    customer_name: orderData.customer?.name || orderData.guest_name,
    customer_email: orderData.customer?.email || orderData.guest_email,
    total_amount: orderData.total || orderData.amount,
    currency: orderData.currency || 'USD',
    status: orderData.status,
    items: orderData.items || orderData.line_items || [],
    created_at: orderData.created_at || orderData.timestamp,
    metadata: orderData
  };
  
  // Store in events table for further processing
  console.log('Standardized order:', standardizedOrder);
};

const handleMenuItemUpdate = async (integrationId: string, menuData: any) => {
  console.log('Handling menu item update:', menuData);
  
  try {
    // Sync menu item using database function
    const { data, error } = await supabase.rpc('sync_pos_menu_item', {
      p_integration_id: integrationId,
      p_external_id: menuData.id || menuData.item_id,
      p_item_data: {
        name: menuData.name || menuData.title,
        description: menuData.description,
        category: menuData.category,
        price: Math.round((menuData.price || 0) * 100), // Convert to cents
        currency: menuData.currency || 'USD',
        available: menuData.available !== false,
        modifiers: menuData.modifiers || [],
        allergens: menuData.allergens || [],
        nutrition_info: menuData.nutrition || {},
        image_url: menuData.image_url || menuData.photo_url,
        metadata: menuData
      }
    });

    if (error) {
      console.error('Error syncing menu item:', error);
      throw error;
    }

    console.log('Menu item synced successfully:', data);
  } catch (error) {
    console.error('Menu item sync failed:', error);
    throw error;
  }
};

const handlePaymentEvent = async (integrationId: string, paymentData: any) => {
  console.log('Handling payment event:', paymentData);
  
  // Process payment data for analytics and reporting
  const standardizedPayment = {
    external_id: paymentData.id || paymentData.payment_id,
    order_id: paymentData.order_id,
    amount: paymentData.amount,
    currency: paymentData.currency || 'USD',
    method: paymentData.method || paymentData.payment_method,
    status: paymentData.status,
    processed_at: paymentData.processed_at || paymentData.timestamp,
    metadata: paymentData
  };
  
  console.log('Standardized payment:', standardizedPayment);
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const integrationId = pathParts[pathParts.length - 1];

    if (!integrationId || integrationId === 'pos-webhook') {
      return new Response(JSON.stringify({ error: 'Integration ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('pos_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return new Response(JSON.stringify({ error: 'Integration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the webhook request
    const requestBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    
    const { error: logError } = await supabase
      .from('pos_webhook_logs')
      .insert({
        integration_id: integrationId,
        tenant_id: integration.tenant_id,
        webhook_url: req.url,
        http_method: req.method,
        headers,
        request_body: requestBody ? JSON.parse(requestBody) : null,
        ip_address: headers['x-forwarded-for'] || headers['x-real-ip'],
        user_agent: headers['user-agent']
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Parse webhook data
    let webhookData: WebhookRequest;
    try {
      webhookData = JSON.parse(requestBody);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook signature if present
    const signature = headers['x-signature'] || headers['signature'];
    if (signature && integration.webhook_secret) {
      const isValid = verifySignature(
        integration.provider,
        signature,
        requestBody,
        integration.webhook_secret
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Process the event
    await processEvent(integrationId, webhookData.event_type, webhookData.data);

    // Update integration health
    await supabase.rpc('update_pos_integration_health', {
      p_integration_id: integrationId,
      p_status: 'healthy',
      p_error_message: null
    });

    // Update webhook log with success
    await supabase
      .from('pos_webhook_logs')
      .update({
        response_status: 200,
        processing_result: 'success',
        signature_valid: !signature || !!integration.webhook_secret
      })
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(1);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      event_type: webhookData.event_type 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Update webhook log with error
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const integrationId = pathParts[pathParts.length - 1];

    if (integrationId && integrationId !== 'pos-webhook') {
      await supabase
        .from('pos_webhook_logs')
        .update({
          response_status: 500,
          processing_result: 'error',
          error_message: error.message
        })
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Update integration health
      await supabase.rpc('update_pos_integration_health', {
        p_integration_id: integrationId,
        p_status: 'unhealthy',
        p_error_message: error.message
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});