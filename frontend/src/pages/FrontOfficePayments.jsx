import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficePayments, createBill, markBillAsPaid } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Breadcrumb from '../components/Breadcrumb';
import ScrollToTop from '../components/ScrollToTop';
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getFrontOfficePayments();
        console.log("API Response:", res);
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
        console.error("Fetch Error:", err);
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

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (loading) {
    return (
      <>
        <Navbar isDashboard={true} userType="front_office" />
        <div className="container mx-auto pt-20 px-4 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      
      <div className="container mx-auto pt-20 px-4 min-h-screen bg-gray-50">
        

        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button 
                onClick={() => navigate('/front_office_dashboard')}
                className="hover:text-blue-600 transition-colors"
              >
                Dashboard
              </button>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-blue-600 font-medium">Payments</li>
          </ol>
        </nav>
<ScrollToTop/>
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Payment Processing</h1>
          <p className="text-gray-600 mt-2">Manage patient bills and payments</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl w-full overflow-hidden">
          <div className="p-8">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Bills Management</h2>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                onClick={() => setShowCreateBillModal(true)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Bill
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Filter Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
              <select 
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Bills</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Bills Table */}
            {filteredBills.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                <p className="text-gray-500 mb-6">Create your first bill to get started</p>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setShowCreateBillModal(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Bill
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBills.map(bill => (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{bill.first_name} {bill.last_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{parseFloat(bill.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bill.status === 'Paid' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{bill.description || 'No description'}</span>
                        </td>
                        {/* // In the FrontOfficePayments component, update the actions column in the table: */}
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex space-x-2">
    <button 
      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      onClick={() => handleViewBill(bill)}
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      View
    </button>
    {bill.status === 'Pending' ? (
      <button 
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
        onClick={() => handleMarkAsPaid(bill.id)}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Mark Paid
      </button>
    ) : (
      <button 
        className="inline-flex items-center px-3 py-1.5 border border-green-600 text-xs font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors cursor-default"
        disabled
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
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
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Create Bill Modal */}
      <Modal show={showCreateBillModal} onClose={() => setShowCreateBillModal(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Create New Bill</h3>
            <button 
              onClick={() => setShowCreateBillModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateBill}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="amount" 
                  value={formData.amount}
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowCreateBillModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Bill
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Bill Details Modal */}
      <Modal show={showBillDetailsModal} onClose={() => setShowBillDetailsModal(false)}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Bill Details</h3>
            <button 
              onClick={() => setShowBillDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {selectedBill && (
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Bill #{selectedBill.id}</h4>
                    <p className="text-gray-600 text-sm">
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
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBill.status}
                  </span>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Patient Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Name:</span> {selectedBill.first_name} {selectedBill.last_name}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Patient ID:</span> {selectedBill.member_id}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bill Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Amount:</span> 
                      <span className="ml-2 text-lg font-bold text-blue-600">
                        ₹{parseFloat(selectedBill.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Status:</span> {selectedBill.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {selectedBill.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              {selectedBill.status === 'Paid' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        This bill has been paid
                      </span>
                    </div>
                    {selectedBill.payment_date && (
                      <p className="text-sm text-green-700 mt-1 ml-7">
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
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowBillDetailsModal(false)}
                >
                  Close
                </button>
                {selectedBill.status === 'Pending' && (
                  <button 
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors"
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
          )}
        </div>
      </Modal>
    </>
  );
};

export default FrontOfficePayments;