import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { AdminDashboard as fetchAdminDashboard } from "../services/api";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  FileText, 
  Menu,
  Plus,
  TrendingUp,
  DollarSign
} from "lucide-react";
import StatCard from "../components/admin/StatCard";
import ChartCard from "../components/admin/ChartCard";
import DataTable from "../components/admin/DataTable";
import Sidebar from "../components/admin/sidebar";
import QuickActions from "../components/admin/QuickActions";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [allData, setAllData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState("/");
  const [isDark, setIsDark] = useState(false);
  
  const navigate = useNavigate(); // Add this hook

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAdminDashboard();
        console.log("Admin Dashboard Data:", data);
        setAllData(data);

        setStats({
          total_patients: data.members?.length || 0,
          total_doctors: data.doctors?.length || 0,
          total_appointments: data.appointments?.length || 0,
          total_bills: data.bills?.length || 0,
          pending_bills: data.bills?.filter(bill => bill.status === 'pending')?.length || 0,
          upcoming_appointments: data.appointments?.filter(apt => 
            new Date(apt.date) > new Date() && apt.status === 'scheduled'
          )?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    loadData();
  }, []);

  const handleNavigate = (path) => {
    setCurrentPath(path);
    console.log("Navigating to:", path);
    navigate(path); // Add this line to actually navigate
  };

  // ... rest of your component code remains the same

  // Process data for charts
  const getAppointmentData = () => {
    if (!allData.appointments) return [];
    
    const dailyCounts = {};
    allData.appointments.forEach(apt => {
      const date = new Date(apt.date).toLocaleDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    return Object.entries(dailyCounts).map(([date, count]) => ({
      date: date.split('/')[1],
      appointments: count
    }));
  };

  const getRevenueData = () => {
    if (!allData.bills) return [];
    
    const monthlyRevenue = {};
    allData.bills.forEach(bill => {
      if (bill.status === 'paid') {
        const month = new Date(bill.payment_date).getMonth();
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (bill.amount || 0);
      }
    });
    
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][month],
      revenue: revenue
    }));
  };

  const quickActions = [
    {
      title: "Add Doctor",
      icon: Stethoscope,
      action: () => console.log("Add Doctor"),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Add Patient",
      icon: Users,
      action: () => console.log("Add Patient"),
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "Schedule Appointment",
      icon: CalendarDays,
      action: () => console.log("Schedule Appointment"),
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors duration-300`}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-md ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} lg:hidden transition-colors duration-200`}
                >
                  <Menu size={24} />
                </button>
                <h1 className={`text-xl font-semibold ml-4 lg:ml-0 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Admin Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200`}
                >
                  {isDark ? '🌙' : '☀️'}
                </button>
                {/* Add other navbar items here */}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Patients"
                value={stats.total_patients}
                icon={Users}
                trend={{ value: 12, isPositive: true }}
                color="gradient-emerald"
                isDark={isDark}
              />
              <StatCard
                title="Total Doctors"
                value={stats.total_doctors}
                icon={Stethoscope}
                trend={{ value: 5, isPositive: true }}
                color="gradient-blue"
                isDark={isDark}
              />
              <StatCard
                title="Upcoming Appointments"
                value={stats.upcoming_appointments}
                icon={CalendarDays}
                trend={{ value: 8, isPositive: false }}
                color="gradient-purple"
                isDark={isDark}
              />
              <StatCard
                title="Pending Bills"
                value={stats.pending_bills}
                icon={FileText}
                trend={{ value: 3, isPositive: false }}
                color="gradient-orange"
                isDark={isDark}
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <QuickActions actions={quickActions} isDark={isDark} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard 
                title="Appointments Overview" 
                type="bar" 
                data={getAppointmentData()}
                dataKey="appointments"
                isDark={isDark}
              />
              <ChartCard 
                title="Revenue Overview" 
                type="line" 
                data={getRevenueData()}
                dataKey="revenue"
                isDark={isDark}
              />
            </div>

            {/* Recent Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataTable 
                title="Recent Patients" 
                data={allData.members?.slice(0, 5) || []} 
                isDark={isDark}
                onViewAll={() => handleNavigate('/patients')}
              />
              <DataTable 
                title="Upcoming Appointments" 
                data={allData.appointments?.slice(0, 5) || []} 
                isDark={isDark}
                onViewAll={() => handleNavigate('/appointments')}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;