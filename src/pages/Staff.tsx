import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

const Staff: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage restaurant staff and roles</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </motion.div>

      <Card>
        <CardContent className="text-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Staff Management Coming Soon</h3>
          <p className="text-muted-foreground">Manage your restaurant team, roles, and schedules.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Staff;