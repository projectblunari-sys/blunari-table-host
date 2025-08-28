import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActions from "@/components/dashboard/QuickActions";
import TodaysBookings from "@/components/dashboard/TodaysBookings";
import TableStatus from "@/components/dashboard/TableStatus";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Bookings */}
          <TodaysBookings />
          
          {/* Table Status */}
          <TableStatus />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;