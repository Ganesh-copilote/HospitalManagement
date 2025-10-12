// src/components/StatCard.jsx
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`p-5 rounded-2xl shadow-md ${color} flex items-center gap-4`}
    >
      <div className="p-3 bg-white rounded-xl shadow-sm">
        <Icon size={28} className="text-primary" />
      </div>
      <div>
        <h3 className="text-gray-700 text-sm font-semibold">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
