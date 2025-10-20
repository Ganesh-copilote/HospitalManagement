// src/pages/FrontOffice.jsx
import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import Modal from '../components/Modal';
import AdminModal from '../components/AdminModal';

import Sidebar from '../components/admin/sidebar';
import { getAdminFrontOfficedata, addUser, updateUser, deleteUser } from '../services/api';

const FrontOffice = () => {
  const [frontOfficeStaff, setFrontOfficeStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define user types for this page
  const userType = 'frontoffice'; // For UPDATE and DELETE
  const addUserType = 'frontoffice'; // For ADD

  useEffect(() => {
    fetchFrontOfficeStaff();
  }, []);

  const fetchFrontOfficeStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching front office staff data...');

      const response = await getAdminFrontOfficedata();
      console.log('✅ Front office staff data received:', response);

      if (response.success && response.FrontOffice) {
        const staffData = response.FrontOffice;
        const transformedStaff = staffData.map(staff => ({
          id: staff.id,
          staff_id: staff.staff_id || staff.family_id || `FO${staff.id}`,
          name: staff.name || `${staff.first_name} ${staff.last_name}`.trim(),
          first_name: staff.first_name,
          last_name: staff.last_name,
          email: staff.email,
          phone: staff.phone,
          address: staff.address,
          position: staff.position || 'Front Office Staff',
          join_date: staff.join_date || staff.created_date,
          status: staff.status || 'Active'
        }));
        
        setFrontOfficeStaff(transformedStaff);
        setFilteredStaff(transformedStaff);
      } else {
        throw new Error(response.error || 'No front office staff data found');
      }
    } catch (err) {
      console.error('❌ Error fetching front office staff:', err);
      setError(err.message || 'Failed to load front office staff');
      setFrontOfficeStaff([]);
      setFilteredStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = frontOfficeStaff.filter(staff =>
      staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone?.includes(searchTerm) ||
      staff.staff_id?.toString().includes(searchTerm) ||
      staff.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchTerm, frontOfficeStaff]);

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowModal(true);
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const result = await deleteUser(userType, staffId);
        if (result.success) {
          await fetchFrontOfficeStaff();
          console.log('Staff member deleted successfully');
        } else {
          throw new Error(result.error || 'Failed to delete staff member');
        }
      } catch (err) {
        console.error('Error deleting staff:', err);
        setError('Failed to delete staff member');
      }
    }
  };

  const handleSaveStaff = async (staffData) => {
    try {
      if (editingStaff) {
        const result = await updateUser(userType, editingStaff.id, staffData);
        if (result.success) {
          await fetchFrontOfficeStaff();
          setShowModal(false);
          setEditingStaff(null);
          console.log('Staff member updated successfully');
        } else {
          throw new Error(result.error || 'Failed to update staff member');
        }
      } else {
        const result = await addUser(addUserType, staffData);
        if (result.success) {
          await fetchFrontOfficeStaff();
          setShowModal(false);
          alert(`Staff member added successfully!\n\nGenerated Password: ${result.generated_password}\n\nPlease provide this password to the staff member for login.`);
          console.log('Staff member added successfully');
        } else {
          throw new Error(result.error || 'Failed to add staff member');
        }
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      setError(err.message || 'Failed to save staff member');
    }
  };

  const refreshStaff = () => {
    fetchFrontOfficeStaff();
  };

  const handleAddNew = () => {
    console.log('➕ Add new staff member button clicked');
    setEditingStaff(null);
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/front-office"
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
                <h1 className="text-2xl font-bold">Front Office Staff Management</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage front office staff members and their details
                </p>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshStaff}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors duration-200`}
                >
                  <span>Refresh</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Staff</span>
                </motion.button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`flex-1 relative ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-2 flex items-center transition-colors duration-200`}>
                  <Search size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, phone, position, or Staff ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`bg-transparent outline-none px-2 flex-1 ${
                      isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
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
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading staff data...</p>
              </div>
            )}

            {/* Staff Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, index) => (
                    <motion.div
                      key={staff.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className={`rounded-2xl p-6 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } shadow-lg transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-blue-600' : 'bg-blue-100'
                        }`}>
                          <Users size={24} className={isDark ? 'text-white' : 'text-blue-600'} />
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(staff)}
                            className={`p-2 rounded ${
                              isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                            } transition-colors duration-200`}
                          >
                            <Edit size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(staff.id)}
                            className={`p-2 rounded ${
                              isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                            } transition-colors duration-200`}
                          >
                            <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                          </motion.button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                        }`}>
                          ID: {staff.staff_id}
                        </span>
                        <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                          staff.status === 'Active' 
                            ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                            : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                        }`}>
                          {staff.status}
                        </span>
                      </div>

                      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {staff.name}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail size={16} className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {staff.email || 'No email'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone size={16} className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {staff.phone || 'No phone'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users size={16} className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {staff.position}
                          </span>
                        </div>
                        {staff.address && (
                          <div className="flex items-start text-sm">
                            <MapPin size={16} className={`mr-2 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {staff.address}
                            </span>
                          </div>
                        )}
                        {staff.join_date && (
                          <div className="text-xs mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              Joined: {staff.join_date}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <div className={`flex flex-col items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users size={64} className="mb-4 opacity-50" />
                      <p className="text-xl mb-2">No staff members found</p>
                      <p>
                        {searchTerm ? 'Try adjusting your search terms' : 'Add your first staff member to get started'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Staff Modal */}
<AdminModal
  isOpen={showModal}
  onClose={() => {
    setShowModal(false);
    setEditingStaff(null);
  }}
  title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
  isDark={isDark}
>
  <StaffForm
    staff={editingStaff}
    onSave={handleSaveStaff}
    onCancel={() => {
      setShowModal(false);
      setEditingStaff(null);
    }}
    isDark={isDark}
  />
</AdminModal>
          </main>
        </div>
      </div>
    </div>
  );
};

// Staff Form Component
const StaffForm = ({ staff, onSave, onCancel, isDark }) => {
  const [formData, setFormData] = useState({
    first_name: staff?.first_name || '',
    last_name: staff?.last_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    address: staff?.address || '',
    position: staff?.position || 'Front Office Staff'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Position *
          </label>
          <select
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Front Office Staff">Front Office Staff</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Front Desk Manager">Front Desk Manager</option>
            <option value="Administrative Assistant">Administrative Assistant</option>
            <option value="Customer Service Representative">Customer Service Representative</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          {staff ? 'Update Staff' : 'Add Staff'}
        </button>
      </div>
    </form>
  );
};

export default FrontOffice;