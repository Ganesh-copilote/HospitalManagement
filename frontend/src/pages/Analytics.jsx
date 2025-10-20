// src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import Sidebar from '../components/admin/sidebar';
import StatCard from '../components/admin/StatCard';
import ChartCard from '../components/admin/ChartCard';
import { AdminDashboard as getAdminDashboard } from '../services/api';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState('month');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      console.log("Analytics Data:", data);
      
      setAnalyticsData(data);
      
      // Calculate comprehensive stats
      const totalRevenue = data.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const monthlyGrowth = calculateGrowth(data.payments || []);
      const patientSatisfaction = calculateSatisfaction(data.appointments || []);
      
      setStats({
        totalPatients: data.members?.length || 0,
        totalDoctors: data.doctors?.length || 0,
        totalAppointments: data.appointments?.length || 0,
        totalRevenue: totalRevenue,
        monthlyGrowth: monthlyGrowth,
        patientSatisfaction: patientSatisfaction,
        avgAppointmentDuration: 45, // Could be calculated from actual data
        occupancyRate: calculateOccupancyRate(data.appointments || [], data.slots || [])
      });
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (payments) => {
    // Simple growth calculation - in real app, compare with previous period
    return 12.5; // Percentage
  };

  const calculateSatisfaction = (appointments) => {
    // Mock satisfaction calculation
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const total = appointments.length;
    return total > 0 ? Math.round((completed / total) * 100) : 85;
  };

  const calculateOccupancyRate = (appointments, slots) => {
    const bookedSlots = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'completed').length;
    const totalSlots = slots.length;
    return totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 65;
  };

  const getPatientDemographics = () => {
    if (!analyticsData.members) return [];
    
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };
    
    analyticsData.members.forEach(patient => {
      const age = patient.age || 30;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });
    
    return Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      patients: count
    }));
  };

  const getRevenueByDepartment = () => {
    // Mock data - in real app, this would come from your billing data
    return [
      { department: 'Cardiology', revenue: 125000 },
      { department: 'Neurology', revenue: 98000 },
      { department: 'Pediatrics', revenue: 75000 },
      { department: 'Orthopedics', revenue: 110000 },
      { department: 'Dermatology', revenue: 65000 }
    ];
  };

  const getAppointmentTrends = () => {
    if (!analyticsData.appointments) return [];
    
    const monthlyCounts = {};
    analyticsData.appointments.forEach(apt => {
      const month = new Date(apt.date).getMonth();
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    
    return Object.entries(monthlyCounts).map(([month, count]) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][month],
      appointments: count
    }));
  };

  const getTopDoctors = () => {
    if (!analyticsData.doctors || !analyticsData.appointments) return [];
    
    const doctorAppointments = {};
    analyticsData.appointments.forEach(apt => {
      if (apt.doctor_name) {
        doctorAppointments[apt.doctor_name] = (doctorAppointments[apt.doctor_name] || 0) + 1;
      }
    });
    
    return Object.entries(doctorAppointments)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([doctor, appointments]) => ({
        doctor,
        appointments
      }));
  };

  const exportReport = () => {
    console.log('Exporting analytics report...');
    // Add export functionality here
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/analytics"
          onNavigate={() => {}}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isDark={isDark}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Comprehensive insights and performance metrics
                </p>
              </div>
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportReport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Download size={18} />
                  <span>Export Report</span>
                </motion.button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={`₹${stats.totalRevenue?.toLocaleString() || '0'}`}
                icon={DollarSign}
                trend={{ value: stats.monthlyGrowth || 0, isPositive: stats.monthlyGrowth > 0 }}
                color="gradient-emerald"
                isDark={isDark}
              />
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={Users}
                trend={{ value: 8, isPositive: true }}
                color="gradient-blue"
                isDark={isDark}
              />
              <StatCard
                title="Appointments"
                value={stats.totalAppointments}
                icon={Calendar}
                trend={{ value: 15, isPositive: true }}
                color="gradient-purple"
                isDark={isDark}
              />
              <StatCard
                title="Satisfaction Rate"
                value={`${stats.patientSatisfaction || 0}%`}
                icon={TrendingUp}
                trend={{ value: 5, isPositive: true }}
                color="gradient-orange"
                isDark={isDark}
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Occupancy Rate
                  </h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <Calendar size={24} className={isDark ? 'text-white' : 'text-blue-600'} />
                  </div>
                </div>
                <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.occupancyRate || 0}%
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Facility utilization
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Avg. Duration
                  </h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-purple-600' : 'bg-purple-100'
                  }`}>
                    <BarChart3 size={24} className={isDark ? 'text-white' : 'text-purple-600'} />
                  </div>
                </div>
                <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.avgAppointmentDuration || 0}m
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Per appointment
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Active Doctors
                  </h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-green-600' : 'bg-green-100'
                  }`}>
                    <Users size={24} className={isDark ? 'text-white' : 'text-green-600'} />
                  </div>
                </div>
                <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalDoctors || 0}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Medical staff
                </p>
              </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard 
                title="Appointment Trends" 
                type="line" 
                data={getAppointmentTrends()}
                dataKey="appointments"
                isDark={isDark}
                height={300}
              />
              <ChartCard 
                title="Patient Demographics" 
                type="bar" 
                data={getPatientDemographics()}
                dataKey="patients"
                isDark={isDark}
                height={300}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard 
                title="Revenue by Department" 
                type="pie" 
                data={getRevenueByDepartment()}
                dataKey="revenue"
                isDark={isDark}
                height={300}
              />
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg transition-colors duration-300`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Top Performing Doctors
                </h3>
                <div className="space-y-4">
                  {getTopDoctors().map((doctor, index) => (
                    <motion.div
                      key={doctor.doctor}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-blue-600' : 'bg-blue-100'
                        }`}>
                          <Users size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                        </div>
                        <span className={isDark ? 'text-white' : 'text-gray-900'}>
                          {doctor.doctor}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doctor.appointments} appointments
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className={`p-6 rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg transition-colors duration-300`}>
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Key Performance Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Patient Retention', value: '92%', trend: '+2%' },
                  { label: 'Avg. Wait Time', value: '15m', trend: '-3m' },
                  { label: 'Revenue Growth', value: '18%', trend: '+4%' },
                  { label: 'New Patients', value: '45', trend: '+12' }
                ].map((kpi, index) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {kpi.value}
                    </p>
                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {kpi.label}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kpi.trend.startsWith('+') 
                        ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                        : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                    }`}>
                      {kpi.trend}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Analytics;