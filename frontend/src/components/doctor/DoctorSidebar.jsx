// src/components/doctor/DoctorSidebar.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  FileText,
  ClipboardList,
  Clock,
  Settings,
  X
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor_dashboard' },
  { name: 'Appointments', icon: Calendar, path: '/doctor_appointments' },
  { name: 'Patients', icon: Users, path: '/doctor_patients' },
  { name: 'Medical Records', icon: FileText, path: '/doctor_medical_records' },
  { name: 'Prescriptions', icon: ClipboardList, path: '/doctor_prescriptions' },
  { name: 'Schedule', icon: Clock, path: '/doctor_schedule' },
  { name: 'Settings', icon: Settings, path: '/doctor_settings' },
];

const DoctorSidebar = ({ isOpen, onClose, currentPath, onNavigate, isDark, doctorName }) => {
  const handleItemClick = (path) => {
    onNavigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-xl border-r lg:static lg:translate-x-0 lg:z-0 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } transition-colors duration-300`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } transition-colors duration-300`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            } transition-colors duration-300`}>
              Doctor Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <li key={item.name}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-600 text-white shadow-md' 
                        : isDark 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-green-400' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`p-6 border-t ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } transition-colors duration-300`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">D</span>
            </div>
            <div>
              <p className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              } transition-colors duration-300`}>
                {doctorName}
              </p>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } transition-colors duration-300`}>
                Doctor
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DoctorSidebar;