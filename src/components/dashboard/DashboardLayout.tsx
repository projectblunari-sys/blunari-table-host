import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import BottomNavigation from './BottomNavigation';
import BreadcrumbHeader from './BreadcrumbHeader';
import GlobalStatusStrip from './GlobalStatusStrip';
import { useNavigation } from '@/contexts/NavigationContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const DashboardLayout: React.FC = () => {
  const { actualLayout } = useNavigation();
  const { getLayoutClasses } = useResponsiveLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {/* Global Status Strip */}
      <GlobalStatusStrip />
      
      <div className="flex min-h-screen">
        {/* Sidebar - Show based on user preference */}
        {actualLayout === 'sidebar' && (
          <nav role="navigation" aria-label="Main navigation">
            <DashboardSidebar />
          </nav>
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb Header */}
          <header role="banner">
            <BreadcrumbHeader />
          </header>
          
          <main 
            id="main-content"
            role="main" 
            className={getLayoutClasses().main}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
              className={getLayoutClasses().container}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Bottom Navigation - Show based on user preference */}
      {actualLayout === 'bottom' && (
        <nav role="navigation" aria-label="Mobile navigation">
          <BottomNavigation />
        </nav>
      )}
    </div>
  );
};

export default DashboardLayout;