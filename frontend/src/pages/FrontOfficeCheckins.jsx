import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFrontOfficeCheckins, checkInPatient, checkOutPatient } from '../services/api';
import FrontOfficeSidebar from '../components/FrontOfficeSidebar.jsx';
import { Menu, LogOut, UserCheck, UserX, Search } from 'lucide-react';

const FrontOfficeCheckins = () => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/front_office_checkins');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCheckins();
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

  const fetchCheckins = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getFrontOfficeCheckins();
      if (res.success) {
        setCheckins(res.checkins || []);
      } else {
        setError(res.error || 'Failed to fetch check-ins');
      }
    } catch (err) {
      setError('Failed to fetch check-ins. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (id) => {
    try {
      setError('');
      const result = await checkInPatient(id);
      if (result.success) {
        await fetchCheckins();
        setSelectedPatientId('');
        alert('Patient checked in successfully!');
      } else {
        setError(result.error || 'Failed to check in patient');
      }
    } catch (err) {
      setError('Failed to check in patient. Please try again.');
    }
  };

  const handleCheckout = async (id) => {
    try {
      setError('');
      const result = await checkOutPatient(id);
      if (result.success) {
        await fetchCheckins();
        alert('Patient checked out successfully!');
      } else {
        setError(result.error || 'Failed to check out patient');
      }
    } catch (err) {
      setError('Failed to check out patient. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Checked In': { 
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: UserCheck 
      },
      'Completed': { 
        bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: UserCheck 
      },
      'Scheduled': { 
        bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        icon: UserCheck 
      }
    };
    
    const config = statusConfig[status] || { 
      bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      icon: UserX 
    };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        <IconComponent size={14} className="mr-1" />
        {status}
      </span>
    );
  };

  const stats = [
    { 
      title: "Total Check-ins", 
      value: checkins.length, 
      description: "All patient visits",
      color: "from-blue-500 to-blue-600",
      icon: UserCheck
    },
    { 
      title: "Checked In", 
      value: checkins.filter(c => c.status === 'Checked In').length,
      description: "Currently checked in",
      color: "from-green-500 to-green-600",
      icon: UserCheck
    },
    { 
      title: "Pending", 
      value: checkins.filter(c => c.status === 'Pending').length,
      description: "Awaiting check-in",
      color: "from-yellow-500 to-yellow-600",
      icon: UserX
    },
    { 
      title: "Scheduled", 
      value: checkins.filter(c => c.status === 'Scheduled').length,
      description: "Scheduled for today",
      color: "from-purple-500 to-purple-600",
      icon: UserCheck
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="flex">
          <FrontOfficeSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            isDark={isDark}
            onThemeToggle={() => setIsDark(!isDark)}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="flex">
        {/* Front Office Sidebar */}
        <FrontOfficeSidebar 
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
                  Patient Check-ins
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
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
              >
                {error}
              </motion.div>
            )}
            
            {/* Welcome Section */}
            {/* <div className="mb-8">
              <div className="rounded-2xl p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Patient Check-ins</h1>
                    <p className="text-green-100 opacity-90">
                      Manage patient arrivals and departures efficiently.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <p className="text-sm font-medium">
                      Total Visits: {checkins.length}
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-green-500`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-2 text-green-600">
                          {stat.value}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                        <IconComponent size={24} className="text-green-600" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Check-in Section */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden mb-6`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Check In Patient
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Patient to Check In
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select a patient...</option>
                    {checkins
                      .filter(checkin => ['Scheduled', 'Pending'].includes(checkin.status))
                      .map(checkin => (
                        <option key={checkin.id} value={checkin.id}>
                          {checkin.patient_name} - {checkin.time} with Dr. {checkin.doctor_name}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={() => selectedPatientId && handleCheckin(selectedPatientId)}
                  disabled={!selectedPatientId}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200 ${
                    selectedPatientId
                      ? (isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white')
                      : (isDark
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                  }`}
                >
                  <UserCheck size={16} className="mr-2" />
                  Check In Selected Patient
                </button>
              </div>
            </div>

            {/* All Patients Table */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All Patients
                </h2>
              </div>

              <div className="p-6">
                {checkins.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Patient
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Doctor
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Time
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkins.map(checkin => (
                          <tr 
                            key={checkin.id} 
                            className={`transition-colors duration-150 ${
                              isDark 
                                ? 'border-b border-gray-700 hover:bg-gray-700' 
                                : 'border-b border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                  isDark ? 'bg-blue-600' : 'bg-blue-100'
                                }`}>
                                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-blue-600'}`}>
                                    {checkin.patient_name?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {checkin.patient_name}
                                  </p>
                                  {checkin.phone && (
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {checkin.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {checkin.doctor_name}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {checkin.time}
                              </span>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(checkin.status)}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                {checkin.status === 'Scheduled' || checkin.status === 'Pending' ? (
                                  <button
                                    onClick={() => handleCheckin(checkin.id)}
                                    className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors duration-200 ${
                                      isDark
                                        ? 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
                                        : 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400'
                                    }`}
                                  >
                                    <UserCheck size={14} className="mr-1" />
                                    Check In
                                  </button>
                                ) : checkin.status === 'Checked In' ? (
                                  <button
                                    onClick={() => handleCheckout(checkin.id)}
                                    className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors duration-200 ${
                                      isDark
                                        ? 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
                                        : 'border-green-300 text-green-700 bg-white hover:bg-green-50 hover:border-green-400'
                                    }`}
                                  >
                                    <UserCheck size={14} className="mr-1" />
                                    Check Out
                                  </button>
                                ) : (
                                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                                    No Action
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No patients found</p>
                    <p className="mt-2">Check back later or ensure appointments are scheduled for today.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FrontOfficeCheckins;