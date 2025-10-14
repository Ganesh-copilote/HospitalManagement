// src/components/admin/QuickActions.jsx
import { motion } from 'framer-motion';

const QuickActions = ({ actions, isDark }) => {
  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            className={`${action.color} text-white p-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2`}
          >
            <action.icon size={20} />
            <span className="font-medium">{action.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;