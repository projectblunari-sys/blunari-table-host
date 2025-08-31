import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import BottomNavigation from './BottomNavigation';
import { useNavigation } from '@/contexts/NavigationContext';

const DashboardLayout: React.FC = () => {
  const { actualLayout } = useNavigation();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar - Show based on user preference */}
        {actualLayout === 'sidebar' && <DashboardSidebar />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className={`flex-1 overflow-y-auto bg-muted/30 p-4 ${
            actualLayout === 'bottom' ? 'pb-safe-mobile' : ''
          }`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Bottom Navigation - Show based on user preference */}
      {actualLayout === 'bottom' && <BottomNavigation />}
    </div>
  );
};

export default DashboardLayout;