import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboard as fetchAdminDashboard } from "../services/api";
import { 
  Users, 
  Stethoscope, 
  CalendarDays, 
  FileText, 
  Menu,
  Plus,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Calendar,
  AlertCircle,
  Star
} from "lucide-react";
import StatCard from "../components/admin/StatCard";
import Sidebar from "../components/admin/sidebar";
import QuickActions from "../components/admin/QuickActions";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [allData, setAllData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState("/");
  const [isDark, setIsDark] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAdminDashboard();
        console.log("📊 Full Dashboard Data:", data);
        setAllData(data);

        // Extract data from different possible structures
        const patients = data.members || data.family_members || [];
        const doctors = data.doctors || data.Doctors || [];
        const appointments = data.appointments || [];
        const bills = data.bills || [];

        console.log("👥 Patients:", patients);
        console.log("👨‍⚕️ Doctors:", doctors);
        console.log("📅 Appointments:", appointments);
        console.log("💰 Bills:", bills);

        // Upcoming appointments (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const upcomingApps = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate > new Date() && 
                 aptDate <= nextWeek &&
                 (apt.status === 'scheduled' || apt.status === 'Scheduled' || !apt.status);
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log("📅 Upcoming Appointments:", upcomingApps);
        setUpcomingAppointments(upcomingApps.slice(0, 5));

        // Recent patients (last 5)
        const recentPatientsData = patients
          .sort((a, b) => new Date(b.created_date || b.date) - new Date(a.created_date || a.date))
          .slice(0, 5);
        
        console.log("🆕 Recent Patients:", recentPatientsData);
        setRecentPatients(recentPatientsData);

        // Calculate statistics
        const totalPatients = patients.length;
        const totalDoctors = doctors.length;
        const totalAppointments = appointments.length;
        const totalBills = bills.length;
        
        const pendingBills = bills.filter(bill => 
          bill.status === 'pending' || bill.status === 'Pending'
        ).length;
        
        const upcomingAppointmentsCount = appointments.filter(apt => 
          new Date(apt.date) > new Date() && 
          (apt.status === 'scheduled' || apt.status === 'Scheduled' || !apt.status)
        ).length;
        
        const totalRevenue = bills
          .filter(bill => bill.status === 'paid' || bill.status === 'Paid')
          .reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);

        const completedAppointments = appointments.filter(apt => 
          apt.status === 'completed' || apt.status === 'Completed'
        ).length;
        
        const completionRate = totalAppointments > 0 ? 
          Math.round((completedAppointments / totalAppointments) * 100) : 0;

        // Today's appointments count
        const today = new Date().toISOString().split('T')[0];
        const todayAppsCount = appointments.filter(apt => apt.date === today).length;

        setStats({
          total_patients: totalPatients,
          total_doctors: totalDoctors,
          total_appointments: totalAppointments,
          total_bills: totalBills,
          pending_bills: pendingBills,
          upcoming_appointments: upcomingAppointmentsCount,
          today_appointments: todayAppsCount,
          total_revenue: totalRevenue,
          completion_rate: completionRate,
          completed_appointments: completedAppointments
        });

        generateRecentActivity(data, patients, appointments, bills);

      } catch (error) {
        console.error("❌ Error fetching admin dashboard data:", error);
      }
    };

    loadData();
  }, []);

  const generateRecentActivity = (data, patients, appointments, bills) => {
    const activities = [];

    // Recent appointments
    appointments.slice(0, 3).forEach(apt => {
      const patientName = apt.patient_name || 
                         `${apt.patient_first_name || 'Patient'} ${apt.patient_last_name || ''}`.trim() ||
                         'Patient';
      const doctorName = apt.doctor_name || 'Doctor';
      
      activities.push({
        id: `appointment-${apt.id}`,
        type: 'appointment',
        title: 'New Appointment',
        description: `${patientName} with Dr. ${doctorName}`,
        time: apt.date,
        icon: CalendarDays,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900'
      });
    });

    // Recent patients
    patients.slice(0, 2).forEach(patient => {
      activities.push({
        id: `patient-${patient.id}`,
        type: 'patient',
        title: 'New Patient Registered',
        description: `${patient.first_name || patient.name} ${patient.last_name || ''}`,
        time: patient.created_date || patient.date,
        icon: UserPlus,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900'
      });
    });

    // Recent bills
    bills.slice(0, 2).forEach(bill => {
      activities.push({
        id: `bill-${bill.id}`,
        type: 'bill',
        title: bill.status === 'paid' || bill.status === 'Paid' ? 'Payment Received' : 'New Bill Generated',
        description: `₹${bill.amount || 0} - ${bill.patient_name || 'Patient'}`,
        time: bill.bill_date || bill.created_date || bill.date,
        icon: DollarSign,
        color: bill.status === 'paid' || bill.status === 'Paid' ? 'text-green-500' : 'text-orange-500',
        bgColor: bill.status === 'paid' || bill.status === 'Paid' ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'
      });
    });

    // Sort by time and limit to 6 activities
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    console.log("📋 Recent Activities:", sortedActivities);
    setRecentActivity(sortedActivities);
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    navigate(path);
  };

  const quickActions = [
    {
      title: "Add Doctor",
      icon: Stethoscope,
      action: () => navigate('/doctors'),
      color: "from-blue-500 to-blue-600",
      description: "Register new doctor"
    },
    {
      title: "Add Patient",
      icon: Users,
      action: () => navigate('/patients'),
      color: "from-emerald-500 to-emerald-600",
      description: "Register new patient"
    },
    {
      title: "Schedule Appointment",
      icon: CalendarDays,
      action: () => navigate('/appointments'),
      color: "from-purple-500 to-purple-600",
      description: "Book new appointment"
    },
    {
      title: "Create Bill",
      icon: FileText,
      action: () => navigate('/billing'),
      color: "from-orange-500 to-orange-600",
      description: "Generate new bill"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return `${Math.floor(diffInDays / 7)}w ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatAppointmentTime = (timeString) => {
    if (!timeString) return 'All day';
    
    const time = timeString.substring(0, 5);
    return time;
  };

  const getPatientName = (patient) => {
    if (patient.name) return patient.name;
    if (patient.first_name && patient.last_name) return `${patient.first_name} ${patient.last_name}`;
    if (patient.first_name) return patient.first_name;
    return `Patient ${patient.id}`;
  };

  const getDaysUntilAppointment = (dateString) => {
    if (!dateString) return 0;
    
    try {
      const aptDate = new Date(dateString);
      const today = new Date();
      const diffTime = aptDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
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
                  Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200`}
                >
                  {isDark ? '🌙' : '☀️'}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className={`rounded-2xl p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin!</h1>
                    <p className="text-blue-100 opacity-90">
                      Here's what's happening with your clinic today.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <p className="text-sm font-medium">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Patients */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-emerald-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Patients
                    </p>
                    <p className="text-2xl font-bold mt-2 text-emerald-600">
                      {stats.total_patients}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900' : 'bg-emerald-100'}`}>
                    <Users size={24} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-emerald-600">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Active registrations</span>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-blue-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Upcoming Appointments
                    </p>
                    <p className="text-2xl font-bold mt-2 text-blue-600">
                      {stats.upcoming_appointments}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-blue-600">
                  <Clock size={16} className="mr-1" />
                  <span>Next 7 days</span>
                </div>
              </div>

              {/* Total Revenue */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-orange-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold mt-2 text-orange-600">
                      {formatCurrency(stats.total_revenue)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${isDark ? 'bg-orange-900' : 'bg-orange-100'}`}>
                    <DollarSign size={24} className="text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-orange-600">
                  <TrendingUp size={16} className="mr-1" />
                  <span>All time earnings</span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-purple-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold mt-2 text-purple-600">
                      {stats.completion_rate}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
                    <CheckCircle2 size={24} className="text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-purple-600">
                  <CheckCircle2 size={16} className="mr-1" />
                  <span>Appointments completed</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Upcoming Appointments & Recent Patients */}
              <div className="lg:col-span-2 space-y-8">
                {/* Upcoming Appointments */}
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Upcoming Appointments
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {upcomingAppointments.length} upcoming
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment, index) => {
                          const daysUntil = getDaysUntilAppointment(appointment.date);
                          
                          return (
                            <div key={appointment.id || index} className={`p-4 rounded-lg border ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isDark ? 'bg-blue-600' : 'bg-blue-100'
                                  }`}>
                                    <Users size={20} className={isDark ? 'text-white' : 'text-blue-600'} />
                                  </div>
                                  <div>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {appointment.patient_name || 'Patient'}
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      with Dr. {appointment.doctor_name || 'Doctor'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatAppointmentDate(appointment.date)}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatAppointmentTime(appointment.time)}
                                  </p>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    daysUntil === 0 
                                      ? (isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800')
                                      : daysUntil <= 2
                                      ? (isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                                      : (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                  }`}>
                                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No upcoming appointments</p>
                        <p className="mt-2">Schedule new appointments to see them here</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => navigate('/appointments')}
                      className={`w-full mt-4 py-2 rounded-lg border-2 border-dashed ${
                        isDark 
                          ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                      } transition-colors duration-200`}
                    >
                      View All Appointments
                    </button>
                  </div>
                </div>

                {/* Recent Patients */}
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Recent Patients
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        {recentPatients.length} new
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {recentPatients.length > 0 ? (
                      <div className="space-y-4">
                        {recentPatients.map((patient, index) => (
                          <div key={patient.id || index} className={`p-4 rounded-lg border ${
                            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isDark ? 'bg-green-600' : 'bg-green-100'
                                }`}>
                                  <UserPlus size={20} className={isDark ? 'text-white' : 'text-green-600'} />
                                </div>
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {getPatientName(patient)}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {patient.email || 'No email'} • {patient.phone || 'No phone'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {getTimeAgo(patient.created_date || patient.date)}
                                </p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
                                }`}>
                                  Patient
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No recent patients</p>
                        <p className="mt-2">New patient registrations will appear here</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => navigate('/patients')}
                      className={`w-full mt-4 py-2 rounded-lg border-2 border-dashed ${
                        isDark 
                          ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                      } transition-colors duration-200`}
                    >
                      View All Patients
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions & Recent Activity */}
              <div className="space-y-8">
                {/* Quick Actions - Fixed */}
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Quick Actions
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <action.icon size={24} className="mb-2" />
                            <span className="text-sm font-medium">{action.title}</span>
                            <span className="text-xs opacity-90 mt-1">{action.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Recent Activity
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${activity.bgColor} flex-shrink-0`}>
                              <activity.icon size={16} className={activity.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {activity.title}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {getTimeAgo(activity.time)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Activity size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;