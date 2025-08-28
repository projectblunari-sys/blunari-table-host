import { Bell, Settings, User, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-gradient-subtle border-b border-border px-4 py-6 md:px-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* Restaurant Info & Date */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            The Golden Spoon
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3">
          <Card className="px-3 py-2 bg-gradient-warm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary-foreground" />
              <div className="text-sm">
                <div className="font-semibold text-secondary-foreground">87%</div>
                <div className="text-xs text-secondary-foreground/80">Capacity</div>
              </div>
            </div>
          </Card>

          <Card className="px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft"></div>
              <div className="text-sm">
                <div className="font-semibold">23</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-destructive"></Badge>
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;