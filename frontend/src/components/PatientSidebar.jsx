import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  User,
  Calendar,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Pill,
  X,
  LogOut
} from 'lucide-react';

const patientMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { name: 'Profile', icon: User, section: 'profile' },
  { name: 'Appointments', icon: Calendar, section: 'appointments' },
  { name: 'Medical Records', icon: FileText, section: 'medical' },
  { name: 'Prescriptions', icon: Pill, section: 'prescriptions' },
  { name: 'Family Members', icon: Users, section: 'family' },
  { name: 'Billing & Payments', icon: CreditCard, section: 'billing' },
  { name: 'Reports', icon: BarChart3, section: 'reports' },
  { name: 'Settings', icon: Settings, section: 'settings' },
];

const PatientSidebar = ({ 
  isOpen, 
  onClose, 
  currentPath, 
  onNavigate, 
  isDark, 
  onThemeToggle,
  familyId,
  patientName,
  activeSection = 'dashboard', // Default value
  onSectionChange = () => {} // Default empty function to prevent errors
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/');
  };

  const handleSectionClick = (section) => {
    if (onSectionChange && typeof onSectionChange === 'function') {
      onSectionChange(section);
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose && onClose();
    }
  };

  const isItemActive = (section) => {
    return activeSection === section;
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
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <span className={`text-lg font-bold block ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Patient Portal
              </span>
              <span className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {patientName || 'Patient'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>

        {/* Family ID Card */}
        <div className={`p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`rounded-lg p-3 ${
            isDark ? 'bg-teal-900' : 'bg-gradient-to-r from-teal-500 to-blue-600'
          } text-white`}>
            {/* <p className="text-xs opacity-90 mb-1">Family ID</p>
            <p className="font-mono font-bold text-sm mb-2">{familyId || 'Loading...'}</p> */}
            <button 
              onClick={() => onNavigate && onNavigate('/add_family_member')}
              className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-teal-800 hover:bg-teal-700 text-white' 
                  : 'bg-white text-teal-600 hover:bg-gray-100'
              }`}
            >
              Add Family Member
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {patientMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.section);

              return (
                <li key={item.name}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSectionClick(item.section)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-teal-600 text-white shadow-md' 
                        : isDark 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'
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
        {/* <div className={`p-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Theme
            </span>
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isDark ? '🌙' : '☀️'}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            }`}
          >
            <LogOut size={16} />
            <span className="font-medium">Logout</span>
          </button>
        </div> */}
      </motion.div>
    </>
  );
};

export default PatientSidebar;