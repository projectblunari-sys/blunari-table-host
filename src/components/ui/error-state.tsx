import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Wifi,
  Server,
  Shield,
  FileX
} from 'lucide-react';

interface ErrorStateProps {
  title: string;
  description: string;
  error?: string | Error;
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
  type?: 'general' | 'network' | 'server' | 'permission' | 'notfound';
  showDetails?: boolean;
}

const errorIcons = {
  general: AlertTriangle,
  network: Wifi,
  server: Server,
  permission: Shield,
  notfound: FileX
};

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  error,
  action,
  secondaryAction,
  type = 'general',
  showDetails = false
}) => {
  const ErrorIcon = errorIcons[type];
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="space-y-4">
      <Card className="border-destructive/20">
        <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ErrorIcon className="h-8 w-8 text-destructive" />
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

      {/* Error Details */}
      {showDetails && errorMessage && (
        <Alert variant="destructive">
          <Bug className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="text-code font-mono mt-2 text-xs">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ErrorState;