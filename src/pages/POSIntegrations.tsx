import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plug, 
  Activity, 
  Settings, 
  Eye, 
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';

// Use any type for Supabase data to avoid TypeScript conflicts
type DbRecord = any;

const providerInfo = {
  clover: {
    name: 'Clover',
    logo: '🍀',
    color: 'bg-green-500',
    description: 'POS and business management'
  },
  toast: {
    name: 'Toast',
    logo: '🍞',
    color: 'bg-orange-500',
    description: 'Restaurant management and POS system'
  },
  square: {
    name: 'Square',
    logo: '⬜',
    color: 'bg-blue-500',
    description: 'Payment processing and POS'
  },
  lightspeed: {
    name: 'Lightspeed',
    logo: '⚡',
    color: 'bg-yellow-500',
    description: 'Retail and restaurant POS'
  },
  spoton: {
    name: 'SpotOn',
    logo: '🎯',
    color: 'bg-purple-500',
    description: 'Restaurant technology platform'
  }
};

const availableProviders = [
  'clover',
  'toast', 
  'square',
  'lightspeed',
  'spoton'
];

const POSIntegrations: React.FC = () => {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [integrations, setIntegrations] = useState<DbRecord[]>([]);
  const [healthChecks, setHealthChecks] = useState<DbRecord[]>([]);
  const [events, setEvents] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthCheckLoading, setHealthCheckLoading] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchIntegrations();
      fetchRecentEvents();
      fetchHealthChecks();
    }
  }, [tenant?.id]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_integrations')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load POS integrations",
        variant: "destructive",
      });
    }
  };

  const fetchHealthChecks = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_health_checks')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('checked_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHealthChecks(data || []);
    } catch (error) {
      console.error('Error fetching health checks:', error);
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_events')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleIntegrateProvider = (provider: string) => {
    toast({
      title: "Integration Started",
      description: `Setting up ${providerInfo[provider as keyof typeof providerInfo].name} integration...`,
    });
    setIsAddDialogOpen(false);
    // TODO: Implement actual integration setup
  };

  const runHealthCheck = async (integrationId: string) => {
    setHealthCheckLoading(integrationId);
    
    try {
      const { data, error } = await supabase.functions.invoke('pos-health-check', {
        body: { integration_id: integrationId }
      });

      if (error) throw error;

      toast({
        title: "Health Check Complete",
        description: `Integration status: ${data.status}`,
      });

      // Refresh data
      await fetchIntegrations();
      await fetchHealthChecks();
    } catch (error) {
      console.error('Health check error:', error);
      toast({
        title: "Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setHealthCheckLoading(null);
    }
  };

  const getStatusIcon = (status: string, healthStatus: string) => {
    if (status === 'active' && healthStatus === 'healthy') {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    if (status === 'active' && healthStatus === 'degraded') {
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
    if (status === 'error' || healthStatus === 'unhealthy') {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string, healthStatus: string) => {
    if (status === 'active' && healthStatus === 'healthy') {
      return <Badge variant="secondary" className="bg-success/10 text-success">Healthy</Badge>;
    }
    if (status === 'active' && healthStatus === 'degraded') {
      return <Badge variant="secondary" className="bg-warning/10 text-warning">Degraded</Badge>;
    }
    if (status === 'error' || healthStatus === 'unhealthy') {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const IntegrationCard = ({ integration }: { integration: DbRecord }) => {
    const provider = providerInfo[integration.provider as keyof typeof providerInfo];
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${provider?.color} flex items-center justify-center text-white text-lg`}>
                {provider?.logo}
              </div>
              <div>
                <CardTitle className="text-lg">{provider?.name}</CardTitle>
                <CardDescription>{provider?.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(integration.status, integration.health_status)}
              {getStatusBadge(integration.status, integration.health_status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Sync</span>
              <span>{integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleDateString() : 'Never'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Health Check</span>
              <span>{integration.last_health_check ? new Date(integration.last_health_check).toLocaleDateString() : 'Never'}</span>
            </div>
            
            {integration.error_message && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{integration.error_message}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => runHealthCheck(integration.id)}
                disabled={healthCheckLoading === integration.id}
              >
                {healthCheckLoading === integration.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                Test
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4" />
                Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">POS Integrations</h1>
            <p className="text-muted-foreground">
              Connect and manage your Point of Sale systems
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add POS Integration</DialogTitle>
                <DialogDescription>
                  Choose a POS provider to integrate with your restaurant
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {availableProviders.map((providerId) => {
                  const provider = providerInfo[providerId as keyof typeof providerInfo];
                  return (
                    <Card key={providerId} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 rounded-lg ${provider.color} flex items-center justify-center text-white text-2xl mx-auto mb-4`}>
                          {provider.logo}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>
                        <Button 
                          onClick={() => handleIntegrateProvider(providerId)}
                          className="w-full"
                        >
                          Integrate
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Zap className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plug className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                    <p className="text-sm text-muted-foreground">Total Integrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.health_status === 'healthy').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Healthy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{events.length}</p>
                    <p className="text-sm text-muted-foreground">Recent Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.last_sync_at && 
                        new Date(i.last_sync_at) > new Date(Date.now() - 24*60*60*1000)
                      ).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Synced Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Current status of all integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.slice(0, 5).map(integration => {
                    const provider = providerInfo[integration.provider as keyof typeof providerInfo];
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded ${provider?.color} flex items-center justify-center text-white text-xs`}>
                            {provider?.logo}
                          </div>
                          <span className="font-medium">{provider?.name}</span>
                        </div>
                        {getStatusBadge(integration.status, integration.health_status)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest POS system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={event.processing_status === 'pending' ? 'outline' : 'secondary'}>
                        {event.processing_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
            
            {integrations.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plug className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Connect your first POS system to start syncing data
                  </p>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Integration
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>All events received from POS systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.event_type}</span>
                        <Badge variant="outline">{event.event_source}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.error_message && (
                        <p className="text-sm text-destructive mt-1">{event.error_message}</p>
                      )}
                    </div>
                    <Badge variant={
                      event.processing_status === 'processed' ? 'secondary' :
                      event.processing_status === 'error' ? 'destructive' : 'outline'
                    }>
                      {event.processing_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Monitoring</CardTitle>
              <CardDescription>Integration health checks and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthChecks.map(check => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{check.check_type} check</span>
                        <Badge variant={
                          check.status === 'success' ? 'secondary' :
                          check.status === 'warning' ? 'outline' : 'destructive'
                        }>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(check.checked_at).toLocaleString()}
                        {check.response_time_ms && ` • ${check.response_time_ms}ms`}
                      </p>
                      {check.error_message && (
                        <p className="text-sm text-destructive mt-1">{check.error_message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default POSIntegrations;