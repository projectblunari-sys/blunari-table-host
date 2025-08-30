import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Copy, 
  Palette, 
  Settings, 
  Eye, 
  Globe,
  Smartphone,
  Monitor,
  Check,
  ExternalLink
} from 'lucide-react';

interface WidgetSettings {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  showLogo: boolean;
  customMessage: string;
  maxPartySize: number;
  allowSpecialRequests: boolean;
  requirePhone: boolean;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const WidgetConfiguration: React.FC = () => {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('customize');
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [settings, setSettings] = useState<WidgetSettings>({
    primaryColor: '#1e40af',
    secondaryColor: '#f3f4f6',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    showLogo: true,
    customMessage: 'Book your table at our restaurant',
    maxPartySize: 12,
    allowSpecialRequests: true,
    requirePhone: false,
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '22:00'
    }
  });

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const tenantSlug = tenant?.slug || 'demo';
    
    return `<!-- Blunari Booking Widget -->
<div id="blunari-booking-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/widget/booking.js';
    script.setAttribute('data-tenant', '${tenantSlug}');
    script.setAttribute('data-primary-color', '${settings.primaryColor}');
    script.setAttribute('data-secondary-color', '${settings.secondaryColor}');
    script.setAttribute('data-text-color', '${settings.textColor}');
    script.setAttribute('data-background-color', '${settings.backgroundColor}');
    script.setAttribute('data-border-radius', '${settings.borderRadius}');
    script.setAttribute('data-show-logo', '${settings.showLogo}');
    script.setAttribute('data-custom-message', '${settings.customMessage}');
    script.setAttribute('data-max-party-size', '${settings.maxPartySize}');
    script.setAttribute('data-allow-special-requests', '${settings.allowSpecialRequests}');
    script.setAttribute('data-require-phone', '${settings.requirePhone}');
    document.head.appendChild(script);
  })();
</script>`;
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy embed code",
        variant: "destructive",
      });
    }
  };

  const saveSettings = () => {
    // Here you would save settings to your backend
    toast({
      title: "Settings Saved",
      description: "Your booking widget settings have been updated",
    });
  };

  const WidgetPreview = () => (
    <div 
      className={`border rounded-lg overflow-hidden ${
        previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
      }`}
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div 
        className="p-6"
        style={{ borderRadius: `${settings.borderRadius}px` }}
      >
        {settings.showLogo && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-primary"></div>
            <span className="font-semibold" style={{ color: settings.textColor }}>
              {tenant?.name || 'Restaurant Name'}
            </span>
          </div>
        )}
        
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: settings.textColor }}
        >
          {settings.customMessage}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm" style={{ color: settings.textColor }}>Date</Label>
              <Input 
                type="date" 
                className="mt-1"
                style={{ borderColor: settings.secondaryColor }}
              />
            </div>
            <div>
              <Label className="text-sm" style={{ color: settings.textColor }}>Time</Label>
              <Input 
                type="time" 
                className="mt-1"
                style={{ borderColor: settings.secondaryColor }}
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm" style={{ color: settings.textColor }}>Party Size</Label>
            <Input 
              type="number" 
              placeholder="2" 
              max={settings.maxPartySize}
              className="mt-1"
              style={{ borderColor: settings.secondaryColor }}
            />
          </div>
          
          <div>
            <Label className="text-sm" style={{ color: settings.textColor }}>Name</Label>
            <Input 
              placeholder="Your name" 
              className="mt-1"
              style={{ borderColor: settings.secondaryColor }}
            />
          </div>
          
          <div>
            <Label className="text-sm" style={{ color: settings.textColor }}>Email</Label>
            <Input 
              type="email" 
              placeholder="your@email.com" 
              className="mt-1"
              style={{ borderColor: settings.secondaryColor }}
            />
          </div>
          
          {settings.requirePhone && (
            <div>
              <Label className="text-sm" style={{ color: settings.textColor }}>Phone</Label>
              <Input 
                type="tel" 
                placeholder="Your phone number" 
                className="mt-1"
                style={{ borderColor: settings.secondaryColor }}
              />
            </div>
          )}
          
          {settings.allowSpecialRequests && (
            <div>
              <Label className="text-sm" style={{ color: settings.textColor }}>Special Requests</Label>
              <Textarea 
                placeholder="Any special requests..." 
                className="mt-1"
                style={{ borderColor: settings.secondaryColor }}
              />
            </div>
          )}
          
          <Button 
            className="w-full"
            style={{ 
              backgroundColor: settings.primaryColor,
              borderRadius: `${settings.borderRadius}px`
            }}
          >
            Book Table
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Booking Widget</h1>
            <p className="text-muted-foreground">
              Embed a booking form on your website to accept reservations directly
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Globe className="w-4 h-4" />
            Widget Ready
          </Badge>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customize" className="gap-2">
            <Palette className="w-4 h-4" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2">
            <Code className="w-4 h-4" />
            Embed Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your booking widget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="textColor"
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.textColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="borderRadius">Border Radius (px)</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    value={settings.borderRadius}
                    onChange={(e) => setSettings(prev => ({ ...prev, borderRadius: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <Label htmlFor="customMessage">Custom Message</Label>
                  <Input
                    id="customMessage"
                    value={settings.customMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                    className="mt-1"
                    placeholder="Book your table at our restaurant"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Configure booking options and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Restaurant Logo</Label>
                    <p className="text-sm text-muted-foreground">Display your restaurant logo in the widget</p>
                  </div>
                  <Switch
                    checked={settings.showLogo}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLogo: checked }))}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="maxPartySize">Maximum Party Size</Label>
                  <Input
                    id="maxPartySize"
                    type="number"
                    value={settings.maxPartySize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxPartySize: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Phone Number</Label>
                    <p className="text-sm text-muted-foreground">Make phone number a required field</p>
                  </div>
                  <Switch
                    checked={settings.requirePhone}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requirePhone: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Special Requests</Label>
                    <p className="text-sm text-muted-foreground">Show special requests text area</p>
                  </div>
                  <Switch
                    checked={settings.allowSpecialRequests}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowSpecialRequests: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Working Hours Restriction</Label>
                    <p className="text-sm text-muted-foreground">Only allow bookings during working hours</p>
                  </div>
                  <Switch
                    checked={settings.workingHours.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, enabled: checked }
                    }))}
                  />
                </div>

                {settings.workingHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workingStart">Start Time</Label>
                      <Input
                        id="workingStart"
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          workingHours: { ...prev.workingHours, start: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workingEnd">End Time</Label>
                      <Input
                        id="workingEnd"
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          workingHours: { ...prev.workingHours, end: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <Button onClick={saveSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Widget Preview</CardTitle>
                  <CardDescription>
                    See how your booking widget will look on your website
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <WidgetPreview />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Embed Code
              </CardTitle>
              <CardDescription>
                Copy this code and paste it into your website where you want the booking widget to appear
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generateEmbedCode()}
                  readOnly
                  className="font-mono text-sm min-h-[200px] resize-none"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyEmbedCode}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Installation Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Copy the embed code above</li>
                  <li>Paste it into your website's HTML where you want the widget to appear</li>
                  <li>The widget will automatically load and be ready to accept bookings</li>
                  <li>All bookings will appear in your Blunari dashboard</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                <span>
                  Need help? Check our{' '}
                  <a href="#" className="text-primary hover:underline">
                    integration documentation
                  </a>
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WidgetConfiguration;