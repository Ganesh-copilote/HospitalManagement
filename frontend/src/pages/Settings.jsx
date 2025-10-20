// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Shield, Bell, Database, Download, Upload, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import Modal from '../components/Modal';
import Sidebar from '../components/admin/sidebar';
import { AdminDashboard as getAdminDashboard } from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [admins, setAdmins] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({
    clinicName: 'MedCare Hospital',
    clinicEmail: 'contact@medcare.com',
    clinicPhone: '+91 9876543210',
    clinicAddress: '123 Healthcare Street, Medical City, MC 12345',
    workingHours: '9:00 AM - 6:00 PM',
    appointmentDuration: 30,
    enableSMS: true,
    enableEmail: true,
    backupFrequency: 'daily'
  });

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      console.log("Settings Data:", data);
      
      setAdmins(data.admins || []);
      setConfigs(data.configs || []);
      
    } catch (error) {
      console.error("Error fetching settings data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    // Save system settings logic
    console.log('Saving settings:', systemSettings);
    // Add API call to save settings
  };

  const handleBackup = () => {
    console.log('Initiating backup...');
    // Add backup logic
  };

  const handleRestore = () => {
    console.log('Initiating restore...');
    // Add restore logic
  };

  const settingsCategories = [
    {
      id: 'admin',
      name: 'Admin Management',
      icon: Users,
      description: 'Manage system administrators and permissions'
    },
    {
      id: 'system',
      name: 'System Settings',
      icon: SettingsIcon,
      description: 'Configure clinic settings and preferences'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Security settings and access controls'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Configure notification preferences'
    },
    {
      id: 'backup',
      name: 'Backup & Restore',
      icon: Database,
      description: 'System backup and data management'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/settings"
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
                <h1 className="text-2xl font-bold">System Settings</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage system configuration and administrator settings
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Settings Navigation */}
              <div className="lg:w-1/4">
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 p-6`}>
                  <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Settings Categories
                  </h2>
                  <nav className="space-y-2">
                    {settingsCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveTab(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                          activeTab === category.id
                            ? isDark
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700'
                            : isDark
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <category.icon size={20} />
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs opacity-75">{category.description}</div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:w-3/4">
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 p-6`}>
                  {activeTab === 'admin' && (
                    <div>
                      <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Admin Management
                      </h2>
                      <div className="space-y-4">
                        {admins.map((admin, index) => (
                          <motion.div
                            key={admin.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {admin.name}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {admin.email} • {admin.role}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.status === 'active'
                                  ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                  : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                              }`}>
                                {admin.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'system' && (
                    <div>
                      <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        System Settings
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Clinic Name
                          </label>
                          <input
                            type="text"
                            value={systemSettings.clinicName}
                            onChange={(e) => setSystemSettings({...systemSettings, clinicName: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Clinic Email
                          </label>
                          <input
                            type="email"
                            value={systemSettings.clinicEmail}
                            onChange={(e) => setSystemSettings({...systemSettings, clinicEmail: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Clinic Phone
                          </label>
                          <input
                            type="tel"
                            value={systemSettings.clinicPhone}
                            onChange={(e) => setSystemSettings({...systemSettings, clinicPhone: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Appointment Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={systemSettings.appointmentDuration}
                            onChange={(e) => setSystemSettings({...systemSettings, appointmentDuration: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Clinic Address
                          </label>
                          <textarea
                            value={systemSettings.clinicAddress}
                            onChange={(e) => setSystemSettings({...systemSettings, clinicAddress: e.target.value})}
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={systemSettings.enableSMS}
                            onChange={(e) => setSystemSettings({...systemSettings, enableSMS: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Enable SMS Notifications
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={systemSettings.enableEmail}
                            onChange={(e) => setSystemSettings({...systemSettings, enableEmail: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Enable Email Notifications
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveSettings}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                        >
                          <Save size={18} />
                          <span>Save Settings</span>
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'backup' && (
                    <div>
                      <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Backup & Restore
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`p-6 rounded-lg border-2 border-dashed ${
                            isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                          } text-center`}
                        >
                          <Download size={48} className={`mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Backup Database
                          </h3>
                          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Create a backup of all system data
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBackup}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                          >
                            Backup Now
                          </motion.button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`p-6 rounded-lg border-2 border-dashed ${
                            isDark ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-500 bg-emerald-50'
                          } text-center`}
                        >
                          <Upload size={48} className={`mx-auto mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Restore Database
                          </h3>
                          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Restore system data from backup
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRestore}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                          >
                            Restore Now
                          </motion.button>
                        </motion.div>
                      </div>

                      <div className={`mt-8 p-4 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Backup Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Last Backup:</strong>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>2024-01-15 14:30</p>
                          </div>
                          <div>
                            <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Backup Size:</strong>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>45.2 MB</p>
                          </div>
                          <div>
                            <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Next Backup:</strong>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>2024-01-16 02:00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add other tabs content similarly */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;