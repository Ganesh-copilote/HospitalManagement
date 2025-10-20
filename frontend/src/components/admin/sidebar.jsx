import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar,
  FileText,
  DollarSign,
  BarChart3, 
  Settings,
  X,
  ChevronDown
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin_dashboard' },
  { 
    name: 'User Management', 
    icon: Users, 
    children: [
      { name: 'Patients', icon: Users, path: '/patients' },
      { name: 'Doctors', icon: UserCheck, path: '/doctors' },
      { name: 'Front Office', icon: Calendar, path: '/front-office' },
    ]
  },
  { name: 'Appointments & Slots', icon: Calendar, path: '/appointments' },
  { name: 'Medical & Prescriptions', icon: FileText, path: '/medical' },
  { name: 'Billing & Payments', icon: DollarSign, path: '/billing' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ isOpen, onClose, isDark, onThemeToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname; // ✅ Tracks the active route

  const [expandedItems, setExpandedItems] = useState({
    'User Management': true // Keep User Management expanded by default
  });

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isItemActive = (item) => {
    if (item.children) {
      return item.children.some(child => currentPath === child.path);
    }
    return currentPath === item.path;
  };

  const handleItemClick = (item) => {
    if (item.children) {
      toggleExpanded(item.name);
    } else {
      navigate(item.path);
      if (window.innerWidth < 1024) onClose();
    }
  };

  const handleChildClick = (childPath) => {
    navigate(childPath);
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            } transition-colors duration-300`}>
              MedAdmin
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
              const isActive = isItemActive(item);
              const isExpanded = expandedItems[item.name];
              const hasChildren = !!item.children;

              return (
                <li key={item.name}>
                  {/* Parent Item */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : isDark 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </div>

                    {hasChildren && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Children Items */}
                  {hasChildren && (
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = currentPath === child.path;

                            return (
                              <li key={child.name}>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleChildClick(child.path)}
                                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                                    isChildActive
                                      ? 'bg-blue-500 text-white shadow-sm' 
                                      : isDark 
                                      ? 'text-gray-400 hover:bg-gray-700 hover:text-blue-300' 
                                      : 'text-gray-500 hover:bg-gray-100 hover:text-blue-500'
                                  }`}
                                >
                                  <ChildIcon size={16} />
                                  <span className="text-sm font-medium">{child.name}</span>
                                </motion.button>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
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
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div>
              <p className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              } transition-colors duration-300`}>
                Admin User
              </p>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } transition-colors duration-300`}>
                Administrator
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
