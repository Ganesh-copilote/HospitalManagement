// src/pages/Billing.jsx
import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, FileText, TrendingUp, Search, Plus, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import AdminModal from '../components/AdminModal';
import Sidebar from '../components/admin/sidebar';
import StatCard from '../components/admin/StatCard';
import ChartCard from '../components/admin/ChartCard';
import { AdminDashboard as getAdminDashboard, addUser, updateUser, deleteUser } from '../services/api';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('bills');
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      console.log("📊 FULL API RESPONSE:", data);
      
      // Try different possible data structures for patients/members
      let patientsData = [];
      let membersData = [];
      
      // Check various possible locations for patient/member data
      if (data.patients && Array.isArray(data.patients)) {
        patientsData = data.patients;
        console.log("✅ Found patients in data.patients");
      } else if (data.members && Array.isArray(data.members)) {
        patientsData = data.members;
        console.log("✅ Found patients in data.members");
      } else if (data.users && Array.isArray(data.users)) {
        // Filter for patients only if users array contains different types
        patientsData = data.users.filter(user => user.user_type === 1 || user.user_type === 'patient');
        console.log("✅ Found patients in data.users");
      }
      
      console.log("👥 Final patients data:", patientsData);
      setPatients(patientsData);
      setAllMembers(patientsData); // Also store in allMembers for backup

      // Process bills with patient names
      const billsWithPatientNames = (data.bills || []).map(bill => {
        // Try to find patient in different ways
        let patient = null;
        
        if (patientsData.length > 0) {
          // Try by member_id
          patient = patientsData.find(p => p.id === bill.member_id);
          if (!patient) {
            // Try by patient_id if exists
            patient = patientsData.find(p => p.id === bill.patient_id);
          }
        }
        
        return {
          ...bill,
          patient_name: patient ? `${patient.first_name || patient.name || ''} ${patient.last_name || ''}`.trim() : `Patient ${bill.member_id}`,
          bill_date: bill.bill_date || bill.created_date || bill.date
        };
      });

      // Process payments with patient names
      const paymentsWithPatientNames = (data.payments || []).map(payment => {
        let patient = null;
        
        if (patientsData.length > 0) {
          patient = patientsData.find(p => p.id === payment.member_id);
          if (!patient) {
            patient = patientsData.find(p => p.id === payment.patient_id);
          }
        }
        
        return {
          ...payment,
          patient_name: patient ? `${patient.first_name || patient.name || ''} ${patient.last_name || ''}`.trim() : `Patient ${payment.member_id}`,
          payment_date: payment.payment_date || payment.created_date || payment.date
        };
      });

      console.log("🧾 Processed bills:", billsWithPatientNames);
      console.log("💳 Processed payments:", paymentsWithPatientNames);
      
      setBills(billsWithPatientNames);
      setPayments(paymentsWithPatientNames);
      
      // Calculate stats
      // Calculate stats - FIXED REVENUE CALCULATION
const totalRevenue = billsWithPatientNames
  .filter(bill => bill.status === 'Paid' || bill.status === 'paid')
  .reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);

const pendingAmount = billsWithPatientNames
  .filter(bill => bill.status === 'Pending' || bill.status === 'pending')
  .reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);

setStats({
  totalBills: billsWithPatientNames.length || 0,
  totalPayments: paymentsWithPatientNames.length || 0,
  totalRevenue: totalRevenue,
  pendingAmount: pendingAmount,
  paidBills: billsWithPatientNames.filter(bill => bill.status === 'Paid' || bill.status === 'paid')?.length || 0
});
      
    } catch (error) {
      console.error("❌ Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = activeTab === 'bills' ? bills : payments;
    const filtered = data.filter(item =>
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.bill_id || item.id)?.toString().includes(searchTerm) ||
      item.amount?.toString().includes(searchTerm) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, bills, payments, activeTab]);

  const handleAddBill = async (formData) => {
    try {
      console.log("🔄 Adding bill with data:", formData);
      await addUser('bill', formData);
      setShowModal(false);
      setEditingItem(null);
      fetchBillingData();
    } catch (error) {
      console.error('❌ Error adding bill:', error);
      alert('Error adding bill: ' + error.message);
    }
  };

  const handleEditBill = async (formData) => {
    try {
      console.log("🔄 Updating bill with data:", formData);
      await updateUser('bills', editingItem.id, formData);
      setShowModal(false);
      setEditingItem(null);
      fetchBillingData();
    } catch (error) {
      console.error('❌ Error updating bill:', error);
      alert('Error updating bill: ' + error.message);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteUser('bills', billId);
        fetchBillingData();
      } catch (error) {
        console.error('❌ Error deleting bill:', error);
        alert('Error deleting bill: ' + error.message);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const getRevenueData = () => {
    const monthlyRevenue = {};
    payments.forEach(payment => {
      if (payment.payment_date) {
        const date = new Date(payment.payment_date);
        const month = date.getMonth();
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (payment.amount || 0);
      }
    });
    
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][month],
      revenue: revenue
    }));
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      paid: 'bg-emerald-500',
      pending: 'bg-orange-500',
      overdue: 'bg-red-500',
      draft: 'bg-gray-500'
    };
    return colors[statusLower] || 'bg-gray-500';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  // If it already has time, return as is. If not, add default time for display only
  if (dateString.includes(' ')) {
    return dateString; // Already has time like "2025-10-07 18:57:05"
  } else {
    return dateString + ' 00:00:00'; // Add default time for date-only strings (display only)
  }
};
const BillForm = ({ bill, onSave, onCancel, isDark }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    bill_date: '',
    amount: '',
    status: 'Pending',
    description: ''
  });

  useEffect(() => {
    if (bill) {
      // For editing: Extract just the date part (remove time) for the date input
      const billDateOnly = bill.bill_date ? bill.bill_date.split(' ')[0] : '';
      
      setFormData({
        patient_id: bill.member_id || bill.patient_id || '',
        bill_date: billDateOnly, // Only the date part for editing
        amount: bill.amount || '',
        status: bill.status || 'Pending',
        description: bill.description || ''
      });
    } else {
      // For new bills: Set current date only (time will be added on submit)
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        patient_id: '',
        bill_date: today,
        amount: '',
        status: 'Pending',
        description: ''
      });
    }
  }, [bill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // Add current time for new bills, keep existing time for edits
    if (!bill) {
      // New bill - add current time
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8);
      finalFormData.bill_date = `${formData.bill_date} ${currentTime}`;
    } else {
      // Editing existing bill - preserve the original time if it exists
      const originalTime = bill.bill_date.includes(' ') ? bill.bill_date.split(' ')[1] : '00:00:00';
      finalFormData.bill_date = `${formData.bill_date} ${originalTime}`;
    }
    
    console.log("📤 Submitting form data:", finalFormData);
    onSave(finalFormData);
  };

  // ... rest of your BillForm code
  // ... rest of your BillForm code

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    // Get display name for patient
    const getPatientDisplayName = (patient) => {
      if (!patient) return '';
      
      const firstName = patient.first_name || patient.name || '';
      const lastName = patient.last_name || '';
      const phone = patient.phone || '';
      
      let displayName = `${firstName} ${lastName}`.trim();
      if (phone) {
        displayName += ` (${phone})`;
      }
      if (!displayName) {
        displayName = `Patient ${patient.id}`;
      }
      
      return displayName;
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Patient *
            </label>
            <select
              name="patient_id"
              required
              value={formData.patient_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Patient</option>
              {patients && patients.length > 0 ? (
                patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {getPatientDisplayName(patient)}
                  </option>
                ))
              ) : (
                <option value="" disabled>No patients available</option>
              )}
            </select>
            {patients.length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                No patients found in the system. Please add patients first.
              </p>
            )}
            {patients.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {patients.length} patient(s) available
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Bill Date *
            </label>
            <input
              type="date"
              name="bill_date"
              required
              value={formData.bill_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              required
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Status *
            </label>
            <select
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter bill description or services provided..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } transition-colors duration-200`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={patients.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bill ? 'Update Bill' : 'Add Bill'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/billing"
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
            {/* Header and Stats - Keep as is */}

{/* Billing Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Total Bills Card */}
  <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Total Bills
        </p>
        <p className="text-2xl font-bold mt-2">
          {stats.totalBills}
        </p>
      </div>
      <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
        <FileText size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
      </div>
    </div>
  </div>

  {/* Pending Bills Card */}
  <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Pending Bills
        </p>
        <p className="text-2xl font-bold mt-2 text-orange-500">
          {bills.filter(bill => bill.status === 'Pending' || bill.status === 'pending').length}
        </p>
      </div>
      <div className={`p-3 rounded-full ${isDark ? 'bg-orange-900' : 'bg-orange-100'}`}>
        <CreditCard size={24} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
      </div>
    </div>
  </div>

  {/* Paid Bills Card */}
  <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Paid Bills
        </p>
        <p className="text-2xl font-bold mt-2 text-emerald-500">
          {bills.filter(bill => bill.status === 'Paid' || bill.status === 'paid').length}
        </p>
      </div>
      <div className={`p-3 rounded-full ${isDark ? 'bg-emerald-900' : 'bg-emerald-100'}`}>
        <DollarSign size={24} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
      </div>
    </div>
  </div>

  {/* Total Revenue Card */}
  <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Total Revenue
        </p>
        <p className="text-2xl font-bold mt-2 text-purple-500">
          {formatCurrency(stats.totalRevenue)}
        </p>
      </div>
      <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
        <TrendingUp size={24} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
      </div>
    </div>
  </div>
</div>
            {/* ... your existing header and stats code ... */}

            {/* Data Table Section */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
              {/* Search and Filters */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={`flex-1 relative ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-2 flex items-center transition-colors duration-200`}>
                    <Search size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`bg-transparent outline-none px-2 flex-1 ${
                        isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      } transition-colors duration-200`}
                    >
                      <Filter size={18} />
                      <span>Filters</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNew}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Plus size={18} />
                      <span>Add New</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                      {activeTab === 'bills' ? (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Bill ID</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Payment ID</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Method</th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredData.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ 
                          backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                        }}
                        className="transition-colors duration-200"
                      >
                        {activeTab === 'bills' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {item.bill_id || `BILL${item.id}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.patient_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDate(item.bill_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
                                getStatusColor(item.status)
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(item)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                                  } transition-colors duration-200`}
                                >
                                  <Edit size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteBill(item.id)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                                  } transition-colors duration-200`}
                                >
                                  <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                                </motion.button>
                                {/* <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-100 hover:bg-emerald-200'
                                  } transition-colors duration-200`}
                                >
                                  <Download size={16} className={isDark ? 'text-white' : 'text-emerald-600'} />
                                </motion.button> */}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {item.payment_id || `PAY${item.id}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.patient_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.payment_date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.payment_method || 'Cash'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                                  } transition-colors duration-200`}
                                >
                                  <Eye size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-100 hover:bg-emerald-200'
                                  } transition-colors duration-200`}
                                >
                                  <Download size={16} className={isDark ? 'text-white' : 'text-emerald-600'} />
                                </motion.button>
                              </div>
                            </td>
                          </>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Bill Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingItem ? 'Edit Bill' : 'Add New Bill'}
        isDark={isDark}
      >
        <BillForm
          bill={editingItem}
          onSave={editingItem ? handleEditBill : handleAddBill}
          onCancel={handleModalClose}
          isDark={isDark}
        />
      </AdminModal>
    </div>
  );
};

export default Billing;