import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFrontOfficeAppointments, cancelAppointment } from '../services/api';
import FrontOfficeSidebar from '../components/FrontOfficeSidebar.jsx';
import { Menu, LogOut, Calendar, X, CheckCircle, Clock } from 'lucide-react';

const FrontOfficeAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/front_office_appointments');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getFrontOfficeAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancelLoading(appointmentId);
      await cancelAppointment(appointmentId);
      
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'Cancelled' }
            : apt
        )
      );
      
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: 'Cancelled' }));
      }
      
      alert('Appointment cancelled successfully');
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': { 
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: CheckCircle 
      },
      'Pending': { 
        bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: Clock 
      },
      'Cancelled': { 
        bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: X 
      },
      'Scheduled': { 
        bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        icon: Calendar 
      }
    };
    
    const config = statusConfig[status] || { 
      bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      icon: Calendar 
    };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        <IconComponent size={14} className="mr-1" />
        {status}
      </span>
    );
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    };
  };

  const canCancelAppointment = (appointment) => {
    return appointment.status === 'Scheduled' || appointment.status === 'Pending';
  };

  const stats = [
    { 
      title: "Total Appointments", 
      value: appointments.length, 
      description: "All appointments",
      color: "from-blue-500 to-blue-600",
      icon: Calendar
    },
    { 
      title: "Completed", 
      value: appointments.filter(apt => apt.status === 'Completed').length,
      description: "Finished appointments",
      color: "from-green-500 to-green-600",
      icon: CheckCircle
    },
    { 
      title: "Pending", 
      value: appointments.filter(apt => apt.status === 'Pending').length,
      description: "Awaiting appointments",
      color: "from-yellow-500 to-yellow-600",
      icon: Clock
    },
    { 
      title: "Cancelled", 
      value: appointments.filter(apt => apt.status === 'Cancelled').length,
      description: "Cancelled appointments",
      color: "from-red-500 to-red-600",
      icon: X
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
                  Appointments Management
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
              <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Appointments</h1>
                    <p className="text-purple-100 opacity-90">
                      Manage and view all patient appointments efficiently.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <p className="text-sm font-medium">
                      Total: {appointments.length} appointments
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
                    className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-purple-500`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-2 text-purple-600">
                          {stat.value}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
                        <IconComponent size={24} className="text-purple-600" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Appointments Table */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All Appointments
                </h2>
              </div>

              <div className="p-6">
                {appointments.length > 0 ? (
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
                            Date
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
                        {appointments.map((apt, index) => (
                          <tr 
                            key={apt.id} 
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
                                    {(apt.first_name?.[0] || '') + (apt.last_name?.[0] || '')}
                                  </span>
                                </div>
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {apt.first_name} {apt.last_name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{apt.doctor_name}</p>
                            </td>
                            <td className="p-4">
                              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatDateTime(apt.slot_time).date}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatDateTime(apt.slot_time).time}
                              </p>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(apt.status)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewAppointment(apt)}
                                  className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-colors duration-200 ${
                                    isDark
                                      ? 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
                                      : 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                >
                                  <Calendar size={16} className="mr-2" />
                                  View
                                </button>
                                
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  disabled={!canCancelAppointment(apt) || cancelLoading === apt.id}
                                  className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-colors duration-200 ${
                                    canCancelAppointment(apt) 
                                      ? (isDark
                                          ? 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
                                          : 'border-red-300 text-red-700 bg-white hover:bg-red-50 hover:border-red-400')
                                      : (isDark
                                          ? 'border-gray-600 text-gray-500 bg-gray-700 cursor-not-allowed'
                                          : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed')
                                  } ${cancelLoading === apt.id ? 'opacity-50' : ''}`}
                                >
                                  {cancelLoading === apt.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Cancelling...
                                    </>
                                  ) : (
                                    <>
                                      <X size={16} className="mr-2" />
                                      Cancel
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No appointments found</p>
                    <p className="mt-2">There are no appointments scheduled yet.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Appointment Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} text-2xl`}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Patient Information */}
                <div className={`rounded-xl p-4 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border`}>
                  <h3 className={`text-lg font-semibold mb-3 flex items-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Calendar className="mr-2" size={20} />
                    Patient Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name</label>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAppointment.first_name} {selectedAppointment.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className={`rounded-xl p-4 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border`}>
                  <h3 className={`text-lg font-semibold mb-3 flex items-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Calendar className="mr-2" size={20} />
                    Doctor Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Doctor</label>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAppointment.doctor_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className={`rounded-xl p-4 md:col-span-2 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border`}>
                  <h3 className={`text-lg font-semibold mb-3 flex items-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Calendar className="mr-2" size={20} />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDateTime(selectedAppointment.slot_time).date}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time</label>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDateTime(selectedAppointment.slot_time).time}
                      </p>
                    </div>
                    <div>
                      <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedAppointment.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    if (canCancelAppointment(selectedAppointment)) {
                      handleCancelAppointment(selectedAppointment.id);
                      setShowDetailsModal(false);
                    }
                  }}
                  disabled={!canCancelAppointment(selectedAppointment) || cancelLoading === selectedAppointment.id}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                    canCancelAppointment(selectedAppointment) 
                      ? (isDark
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white')
                      : (isDark
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                  } ${cancelLoading === selectedAppointment.id ? 'opacity-50' : ''}`}
                >
                  {cancelLoading === selectedAppointment.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X size={16} className="mr-2" />
                      {selectedAppointment.status === 'Cancelled' ? 'Already Cancelled' : 'Cancel Appointment'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontOfficeAppointments;