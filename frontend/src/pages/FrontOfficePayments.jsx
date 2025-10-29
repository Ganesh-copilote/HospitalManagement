import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFrontOfficePayments, createBill, markBillAsPaid } from '../services/api';
import FrontOfficeSidebar from '../components/FrontOfficeSidebar.jsx';
import { Menu, LogOut, DollarSign, FileText, Plus, CheckCircle } from 'lucide-react';

const FrontOfficePayments = () => {
  const [data, setData] = useState({
    front_office: {},
    bills: [],
    members: []
  });
  const [filteredBills, setFilteredBills] = useState([]);
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [showBillDetailsModal, setShowBillDetailsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/front_office_payments');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getFrontOfficePayments();
        if (res.success) {
          setData({
            front_office: res.front_office || {},
            bills: res.bills || [],
            members: res.members || []
          });
          setFilteredBills(res.bills || []);
        } else {
          setError(res.error || 'Failed to load payments');
        }
      } catch (err) {
        setError(err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (statusFilter === '') {
      setFilteredBills(data.bills);
    } else {
      setFilteredBills(data.bills.filter(bill => bill.status === statusFilter));
    }
  }, [statusFilter, data.bills]);

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

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const result = await createBill(formData);
      if (result.success) {
        setShowCreateBillModal(false);
        setFormData({ member_id: '', amount: '', description: '' });
        setStatusFilter('');
        
        const res = await getFrontOfficePayments();
        setData({
          front_office: res.front_office || {},
          bills: res.bills || [],
          members: res.members || []
        });
        setFilteredBills(res.bills || []);
        
        alert('Bill created successfully!');
      } else {
        setError(result.error || 'Failed to create bill');
      }
    } catch (err) {
      setError(err.message || 'Failed to create bill');
    }
  };

  const handleMarkAsPaid = async (billId) => {
    if (window.confirm('Are you sure you want to mark this bill as paid?')) {
      try {
        const result = await markBillAsPaid(billId);
        if (result.success) {
          const res = await getFrontOfficePayments();
          setData({
            front_office: res.front_office || {},
            bills: res.bills || [],
            members: res.members || []
          });
          setFilteredBills(res.bills || []);
          
          alert('Bill marked as paid successfully!');
        } else {
          setError(result.error || 'Failed to update bill');
        }
      } catch (err) {
        setError(err.message || 'Failed to update bill');
      }
    }
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowBillDetailsModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const stats = [
    { 
      title: "Total Bills", 
      value: data.bills.length, 
      description: "All generated bills",
      color: "from-blue-500 to-blue-600",
      icon: FileText
    },
    { 
      title: "Pending Payments", 
      value: data.bills.filter(bill => bill.status === 'Pending').length,
      description: "Awaiting payment",
      color: "from-yellow-500 to-yellow-600",
      icon: DollarSign
    },
    { 
      title: "Paid Bills", 
      value: data.bills.filter(bill => bill.status === 'Paid').length,
      description: "Completed payments",
      color: "from-green-500 to-green-600",
      icon: CheckCircle
    },
    { 
      title: "Total Revenue", 
      value: `₹${data.bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0).toLocaleString('en-IN')}`,
      description: "Total collections",
      color: "from-purple-500 to-purple-600",
      icon: DollarSign
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
                  Payment Processing
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
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Payment Processing</h1>
                    <p className="text-purple-100 opacity-90">
                      Manage patient bills and payments efficiently.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <p className="text-sm font-medium">
                      Total Bills: {data.bills.length}
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

            {/* Bills Management Section */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Bills Management
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Showing {filteredBills.length} of {data.bills.length} bills
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
                    {/* Filter */}
                    <select 
                      className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Bills</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                    
                    {/* Create Bill Button */}
                    <button 
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => setShowCreateBillModal(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Create New Bill
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredBills.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Patient
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Amount
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description
                          </th>
                          <th className={`p-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBills.map(bill => (
                          <tr 
                            key={bill.id} 
                            className={`transition-colors duration-150 ${
                              isDark 
                                ? 'border-b border-gray-700 hover:bg-gray-700' 
                                : 'border-b border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <td className="p-4">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {bill.first_name} {bill.last_name}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {bill.bill_date ? 
                                  new Date(bill.bill_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 
                                  'N/A'
                                }
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ₹{parseFloat(bill.amount || 0).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="p-4">
                              {bill.status === 'Paid' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle size={14} className="mr-1" />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  <DollarSign size={14} className="mr-1" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {bill.description || 'No description'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewBill(bill)}
                                  className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors duration-200 ${
                                    isDark
                                      ? 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
                                      : 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400'
                                  }`}
                                >
                                  <FileText size={14} className="mr-1" />
                                  View
                                </button>
                                {bill.status === 'Pending' ? (
                                  <button
                                    onClick={() => handleMarkAsPaid(bill.id)}
                                    className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors duration-200 ${
                                      isDark
                                        ? 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
                                        : 'border-green-300 text-green-700 bg-white hover:bg-green-50 hover:border-green-400'
                                    }`}
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    Mark Paid
                                  </button>
                                ) : (
                                  <button
                                    className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors duration-200 ${
                                      isDark
                                        ? 'border-green-600 text-green-600 bg-green-900 cursor-default'
                                        : 'border-green-600 text-green-600 bg-green-50 cursor-default'
                                    }`}
                                    disabled
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    Paid
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No bills found</p>
                    <p className="mt-2">Create your first bill to get started</p>
                    <button 
                      className={`inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      onClick={() => setShowCreateBillModal(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Create New Bill
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Create Bill Modal */}
      {showCreateBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Create New Bill
                </h3>
                <button 
                  onClick={() => setShowCreateBillModal(false)}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateBill} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Patient
                  </label>
                  <select 
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                    name="member_id" 
                    value={formData.member_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a patient</option>
                    {data.members.length > 0 ? (
                      data.members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No patients available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount (₹)
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                    name="amount" 
                    value={formData.amount}
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea 
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                    name="description" 
                    rows="3" 
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowCreateBillModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg border border-transparent transition-colors duration-200 ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {showBillDetailsModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Bill Details
                </h3>
                <button 
                  onClick={() => setShowBillDetailsModal(false)}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors duration-200`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Bill Header */}
                <div className={`rounded-lg p-4 ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Bill #{selectedBill.id}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Created on: {selectedBill.bill_date ? 
                          new Date(selectedBill.bill_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 
                          'N/A'
                        }
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedBill.status === 'Paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {selectedBill.status}
                    </span>
                  </div>
                </div>

                {/* Patient and Bill Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Patient Information
                    </h4>
                    <div className="space-y-2">
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className="font-medium">Name:</span> {selectedBill.first_name} {selectedBill.last_name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className="font-medium">Patient ID:</span> {selectedBill.member_id}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bill Information
                    </h4>
                    <div className="space-y-2">
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className="font-medium">Amount:</span> 
                        <span className="ml-2 text-lg font-bold text-blue-600">
                          ₹{parseFloat(selectedBill.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </p>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className="font-medium">Status:</span> {selectedBill.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </h4>
                  <div className={`rounded-lg p-4 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border`}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedBill.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedBill.status === 'Paid' && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Information
                    </h4>
                    <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900">
                      <div className="flex items-center">
                        <CheckCircle size={20} className="text-green-500 mr-2 dark:text-green-300" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          This bill has been paid
                        </span>
                      </div>
                      {selectedBill.payment_date && (
                        <p className="text-sm text-green-700 mt-1 ml-7 dark:text-green-300">
                          Paid on: {new Date(selectedBill.payment_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    type="button" 
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                      isDark
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setShowBillDetailsModal(false)}
                  >
                    Close
                  </button>
                  {selectedBill.status === 'Pending' && (
                    <button 
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg border border-transparent transition-colors duration-200 ${
                        isDark
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      onClick={() => {
                        handleMarkAsPaid(selectedBill.id);
                        setShowBillDetailsModal(false);
                      }}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontOfficePayments;