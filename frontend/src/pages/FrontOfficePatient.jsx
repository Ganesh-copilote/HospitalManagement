import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFrontOfficePatients } from '../services/api';
import FrontOfficeSidebar from '../components/FrontOfficeSidebar.jsx';
import { Menu, LogOut, Users, Search } from 'lucide-react';

const FrontOfficePatient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/front_office_patient');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await getFrontOfficePatients();
        setPatients(res.patients || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
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

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    (`${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm))
  );

  const stats = [
    { 
      title: "Total Patients", 
      value: patients.length, 
      description: "Registered in system",
      color: "from-blue-500 to-blue-600",
      icon: Users
    },
    { 
      title: "Average Age", 
      value: patients.length > 0 
        ? Math.round(patients.reduce((sum, p) => sum + parseInt(p.age || 0), 0) / patients.length)
        : 0,
      description: "Average patient age",
      color: "from-green-500 to-green-600",
      icon: Users
    },
    { 
      title: "Male Patients", 
      value: patients.filter(p => p.gender?.toLowerCase() === 'male').length,
      description: "Male patients count",
      color: "from-purple-500 to-purple-600",
      icon: Users
    },
    { 
      title: "Female Patients", 
      value: patients.filter(p => p.gender?.toLowerCase() === 'female').length,
      description: "Female patients count",
      color: "from-pink-500 to-pink-600",
      icon: Users
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
                  Patient Management
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
              <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Patient Records</h1>
                    <p className="text-blue-100 opacity-90">
                      Manage and view all patient records efficiently.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <p className="text-sm font-medium">
                      Total Patients: {patients.length}
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
                    className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-blue-500`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-2 text-blue-600">
                          {stat.value}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <IconComponent size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Search and Table Section */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Patient Records
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Showing {filteredPatients.length} of {patients.length} patients
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-10 pr-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                            : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 w-full md:w-64`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredPatients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Patient Name
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Age
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Gender
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phone
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient, index) => (
                          <tr 
                            key={patient.id} 
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
                                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {patient.first_name} {patient.last_name}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    ID: {patient.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {patient.age} years
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                patient.gender?.toLowerCase() === 'male' 
                                  ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                  : (isDark ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800')
                              }`}>
                                {patient.gender}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {patient.phone || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => navigate(`/front_office_view_patient/${patient.id}`)}
                                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-colors duration-200 ${
                                  isDark
                                    ? 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
                                    : 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400'
                                }`}
                              >
                                <Users size={16} className="mr-2" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No patients found</p>
                    <p className="mt-2">
                      {searchTerm ? 'Try adjusting your search term' : 'No patients registered yet'}
                    </p>
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

export default FrontOfficePatient;