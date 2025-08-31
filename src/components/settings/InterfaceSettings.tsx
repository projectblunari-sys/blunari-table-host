import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  Monitor, 
  Smartphone, 
  Sidebar, 
  Navigation2,
  Palette,
  Layout
} from 'lucide-react';

const InterfaceSettings: React.FC = () => {
  const { preference, setPreference } = useNavigation();

  const navigationOptions = [
    {
      value: 'auto',
      label: 'Auto (Responsive)',
      description: 'Sidebar on desktop, bottom navigation on mobile',
      icon: Monitor,
      badge: 'Recommended'
    },
    {
      value: 'sidebar',
      label: 'Always Sidebar',
      description: 'Sidebar navigation on all devices',
      icon: Sidebar,
      badge: null
    },
    {
      value: 'bottom',
      label: 'Always Bottom Navigation',
      description: 'Bottom navigation on all devices',
      icon: Smartphone,
      badge: 'Mobile-first'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Navigation Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Choose your preferred navigation style</Label>
            <p className="text-sm text-muted-foreground mt-1">
              This setting controls how the main navigation is displayed across your dashboard.
            </p>
          </div>

          <RadioGroup 
            value={preference} 
            onValueChange={(value) => setPreference(value as any)}
            className="space-y-4"
          >
            {navigationOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div key={option.value} className="space-y-2">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={option.value} 
                            className="font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          {option.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation2 className="h-4 w-4" />
              <span>Changes take effect immediately</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Theme Settings Coming Soon</h3>
            <p className="text-muted-foreground">
              Dark mode, color themes, and visual customization options will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterfaceSettings;