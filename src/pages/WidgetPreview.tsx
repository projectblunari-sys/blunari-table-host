import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenant } from '@/hooks/useTenant';

const WidgetPreview: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { tenant, isLoading } = useTenant();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const bookingUrl = `/book/${slug}`;
  const fullBookingUrl = `${window.location.origin}${bookingUrl}`;

  const deviceSizes = {
    desktop: 'w-full max-w-4xl',
    tablet: 'w-full max-w-2xl',
    mobile: 'w-full max-w-sm',
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Widget Preview</h1>
          <p className="text-muted-foreground">
            Preview how your booking widget appears to customers
          </p>
        </div>
        <Button asChild>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Widget
          </a>
        </Button>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* Device selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Preview as:</span>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview iframe */}
          <div className="flex justify-center">
            <div className={`${deviceSizes[previewDevice]} transition-all duration-300`}>
              <Card>
                <CardContent className="p-0">
                  <iframe
                    src={bookingUrl}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title="Booking Widget Preview"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <p className="text-sm text-muted-foreground">
                Copy this code to embed the booking widget on your website
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>
{`<!-- Booking Widget Embed -->
<iframe 
  src="${fullBookingUrl}"
  width="100%" 
  height="600" 
  frameborder="0"
  title="Restaurant Booking Widget">
</iframe>`}
                </pre>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="${fullBookingUrl}" width="100%" height="600" frameborder="0" title="Restaurant Booking Widget"></iframe>`);
                  }}
                >
                  Copy Embed Code
                </Button>
                <Badge variant="outline">
                  Responsive & Mobile-Friendly
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Integration Notes:</h4>
                <ul className="space-y-1">
                  <li>• The widget is fully responsive and mobile-optimized</li>
                  <li>• All bookings are processed in real-time</li>
                  <li>• No additional configuration required</li>
                  <li>• Works on any website that supports iframes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current widget settings for {tenant?.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Restaurant Name</label>
                  <p className="text-sm text-muted-foreground">{tenant?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <p className="text-sm text-muted-foreground">{tenant?.timezone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <p className="text-sm text-muted-foreground">{tenant?.currency || 'USD'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Booking URL</label>
                  <p className="text-sm text-muted-foreground break-all">{fullBookingUrl}</p>
                </div>
              </div>

              {tenant?.primary_color && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branding Colors</label>
                  <div className="flex items-center gap-4">
                    {tenant.primary_color && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: tenant.primary_color }}
                        ></div>
                        <span className="text-sm">{tenant.primary_color}</span>
                      </div>
                    )}
                    {tenant.secondary_color && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: tenant.secondary_color }}
                        ></div>
                        <span className="text-sm">{tenant.secondary_color}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>To modify these settings, use the Settings page in your dashboard.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WidgetPreview;