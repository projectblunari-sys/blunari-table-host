import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/state';

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

      <EmptyState
        variant="no-staff"
        action={{
          label: "Add Staff Member",
          onClick: () => console.log('Add staff member'),
          icon: UserPlus
        }}
      />
    </div>
  );
};

export default Staff;