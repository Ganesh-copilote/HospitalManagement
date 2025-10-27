import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorDashboardData } from '../services/api';
import DoctorSidebar from '../components/DoctorSidebar';
import { Menu, LogOut, Users, Calendar, FileText } from 'lucide-react';

const DoctorDashboard = () => {
  const [data, setData] = useState({
    profile: {}, 
    upcoming_appointments: [], 
    recent_records: [], 
    stats: { 
      total_appointments: 18, 
      patients_today: 4, 
      prescriptions_issued: 0 
    }
  });
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/doctor_dashboard');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDoctorDashboardData();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNavigate = (path) => {
    setCurrentPath(path);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const stats = [
    { 
      title: "Total Appointments", 
      value: data.stats.total_appointments, 
      description: "All time appointments",
      color: "from-blue-500 to-blue-600",
      icon: Calendar
    },
    { 
      title: "Patients Today", 
      value: data.stats.patients_today, 
      description: "Patients scheduled today",
      color: "from-green-500 to-green-600",
      icon: Users
    },
    { 
      title: "Prescriptions Issued", 
      value: data.stats.prescriptions_issued, 
      description: "Total prescriptions",
      color: "from-purple-500 to-purple-600",
      icon: FileText
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="flex">
          <DoctorSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            isDark={isDark}
            onThemeToggle={() => setIsDark(!isDark)}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="flex">
        {/* Doctor Sidebar */}
        <DoctorSidebar 
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
                  Doctor Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200`}
                >
                  {isDark ? '🌙' : '☀'}
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  } transition-colors duration-200`}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-500 text-red-700'
              }`}>
                {error}
              </div>
            )}
            
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Welcome back, Dr. {data.profile.name || 'Doctor'}!
                    </h1>
                    <p className="text-indigo-100 opacity-90">
                      Here's your schedule and patient overview for today.
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

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.title} className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-indigo-500 transition-colors duration-300`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-2 text-indigo-600">
                          {stat.value}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
                        <IconComponent size={24} className="text-indigo-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <section className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Upcoming Appointments
                  </h2>
                  <button 
                    onClick={() => navigate('/doctor_appointments')}
                    className={`text-sm font-medium ${
                      isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                    } transition-colors duration-200`}
                  >
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Patient</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.upcoming_appointments.map((apt, index) => (
                        <tr key={apt.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3 ${
                                isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                              }`}>
                                {apt.patient_name?.charAt(0) || 'P'}
                              </div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {apt.patient_name}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {apt.date}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {apt.time}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <button 
                              onClick={() => navigate(`/doctor_view_patient/${apt.patient_id}`)}
                              className={`font-medium text-sm inline-flex items-center ${
                                isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                              } transition-colors duration-200`}
                            >
                              View
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {data.upcoming_appointments.length === 0 && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No upcoming appointments</p>
                    <p className="mt-2">Scheduled appointments will appear here</p>
                  </div>
                )}
              </section>
              
              {/* Recent Medical Records */}
              <section className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Recent Medical Records
                  </h2>
                  <button 
                    onClick={() => navigate('/doctor_medical_records')}
                    className={`text-sm font-medium ${
                      isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                    } transition-colors duration-200`}
                  >
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Patient</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_records.map((record, index) => (
                        <tr key={record.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3 ${
                                isDark ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'
                              }`}>
                                {record.patient_name?.charAt(0) || 'P'}
                              </div>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {record.patient_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                            } capitalize`}>
                              {record.record_type}
                            </span>
                          </td>
                          <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {record.record_date}
                          </td>
                          <td className={`py-3 px-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {record.description || (
                              <span className={isDark ? 'text-gray-500 italic' : 'text-gray-400 italic'}>
                                No description
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {data.recent_records.length === 0 && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No recent medical records</p>
                    <p className="mt-2">Patient records will appear here</p>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;