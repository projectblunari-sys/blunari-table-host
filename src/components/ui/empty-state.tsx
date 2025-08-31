import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileX, 
  Search, 
  Plus, 
  RefreshCw,
  Inbox,
  Users,
  Calendar,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  };
  illustration?: 'inbox' | 'search' | 'users' | 'calendar' | 'chart' | 'settings' | 'default';
}

const illustrations = {
  inbox: Inbox,
  search: Search,
  users: Users,
  calendar: Calendar,
  chart: BarChart3,
  settings: Settings,
  default: FileX
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration = 'default'
}) => {
  const IllustrationIcon = icon || illustrations[illustration];

  return (
    <Card className="border-dashed border-2 border-border/50">
      <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-surface-2 rounded-full flex items-center justify-center mb-4">
            <IllustrationIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="max-w-md space-y-2 mb-6">
          <h3 className="text-h3 font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-body text-muted-foreground">
            {description}
          </p>
        </div>

        {(action || secondaryAction) && (
          <div className="flex items-center gap-3">
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                className="transition-brand"
              >
                {secondaryAction.label}
              </Button>
            )}
            
            {action && (
              <Button
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className="transition-brand shadow-elev-1"
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;