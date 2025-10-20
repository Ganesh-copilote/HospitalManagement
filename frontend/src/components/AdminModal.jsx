// src/components/AdminModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, title, children, isDark = false }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-opacity-20 transition-colors ${
                isDark ? 'hover:bg-white text-white' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminModal;