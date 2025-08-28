import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  currency: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: any;
  cuisine_type_id?: string;
  created_at: string;
  updated_at: string;
}

export const useTenant = () => {
  const { user } = useAuth();

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's tenant using the database function
      const { data, error } = await supabase
        .rpc('get_user_tenant', { p_user_id: user.id });

      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      return data[0] as {
        tenant_id: string;
        tenant_name: string;
        tenant_slug: string;
        tenant_status: string;
        provisioning_status: string;
      };
    },
    enabled: !!user,
  });

  const { data: tenantDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['tenant-details', tenant?.tenant_id],
    queryFn: async () => {
      if (!tenant?.tenant_id) return null;

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenant.tenant_id)
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!tenant?.tenant_id,
  });

  return {
    tenant: tenantDetails,
    tenantInfo: tenant,
    isLoading: isLoading || isLoadingDetails,
    error,
  };
};