import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Settings as SettingsIcon,
  Database,
  Shield,
  Code,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenant';
import { toast } from '@/hooks/use-toast';

const AdvancedSettings: React.FC = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const handleExportData = () => {
    // Simulate data export
    toast({
      title: "Export Started",
      description: "Your data export is being prepared. You'll receive an email when it's ready.",
    });
  };

  const handleImportData = () => {
    // Simulate data import
    toast({
      title: "Import Ready",
      description: "Please select a valid JSON file to import your data.",
    });
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Cache Cleared",
      description: "All cached data has been cleared. Please refresh the page.",
    });
  };

  const handleRegenerateApiKey = () => {
    toast({
      title: "API Key Regenerated",
      description: "Your API key has been regenerated. Please update your integrations.",
    });
  };

  return (
    <div className="space-y-6">
      {/* API Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            API Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input 
                type="password" 
                value="blr_sk_1234567890abcdef"
                readOnly
                className="font-mono"
              />
              <Button variant="outline" onClick={handleRegenerateApiKey}>
                Regenerate
              </Button>
              <Button variant="outline" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Use this API key to integrate with external services. Keep it secure and never share it publicly.
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>API Endpoints</Label>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between p-2 bg-surface-2 rounded">
                <span>GET /api/bookings</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-2 rounded">
                <span>POST /api/bookings</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-2 rounded">
                <span>GET /api/customers</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Test API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Export Data</Label>
              <div className="text-sm text-muted-foreground">
                Export all your restaurant data including bookings, customers, and settings.
              </div>
              <Button variant="outline" onClick={handleExportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Import Data</Label>
              <div className="text-sm text-muted-foreground">
                Import data from a previous export or migrate from another system.
              </div>
              <Button variant="outline" onClick={handleImportData} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Data Retention</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Bookings</div>
                <Input type="number" value="365" min="30" max="3650" />
                <div className="text-xs text-muted-foreground">Days to keep booking data</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Customer Data</div>
                <Input type="number" value="1095" min="365" max="3650" />
                <div className="text-xs text-muted-foreground">Days to keep customer data</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Analytics</div>
                <Input type="number" value="730" min="90" max="3650" />
                <div className="text-xs text-muted-foreground">Days to keep analytics data</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Cache Management</Label>
              <div className="text-sm text-muted-foreground">
                Clear cached data to resolve performance issues or update configurations.
              </div>
              <Button variant="outline" onClick={handleClearCache} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>

            <div className="space-y-3">
              <Label>System Status</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-success text-success-foreground">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API</span>
                  <Badge className="bg-success text-success-foreground">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Integrations</span>
                  <Badge className="bg-warning text-warning-foreground">2 Issues</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Debug Mode</Label>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Enable Debug Logging</div>
                <div className="text-sm text-muted-foreground">
                  Show detailed logs for troubleshooting (affects performance)
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Account Details</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account ID:</span>
                  <span className="font-mono">{tenant?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span>Professional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(tenant?.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span>US-East</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Usage Statistics</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Bookings:</span>
                  <span>247 / 1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Calls:</span>
                  <span>12,847 / 50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Used:</span>
                  <span>2.4 GB / 10 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Members:</span>
                  <span>3 / 10</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-destructive">Danger Zone</div>
              <div className="text-sm text-muted-foreground">
                Irreversible actions that affect your account
              </div>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-sm text-muted-foreground">
            <strong>Need Help?</strong> Contact our support team at{' '}
            <span className="text-primary">support@blunari.com</span> or visit our{' '}
            <span className="text-primary cursor-pointer underline">documentation</span>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSettings;