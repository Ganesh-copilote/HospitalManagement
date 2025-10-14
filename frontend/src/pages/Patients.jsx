// src/pages/Patients.jsx
import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import Modal from '../components/Modal';
import Sidebar from '../components/admin/sidebar';
import { getAdminPatientData } from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
  try {
    setLoading(true);
    setError(null);
    console.log('🔄 Fetching patients data from members table...');
    
    const response = await getAdminPatientData();
    console.log('✅ Patients data received:', response);
    
    // Check if response has success and family_members array
    if (response.success && response.family_members) {
      console.log('Raw patients data:', response.family_members);
      
      // Transform the data to match our frontend structure
      const transformedPatients = response.family_members.map(patient => ({
        id: patient.id,
        patient_id: patient.family_id, // Using family_id as patient identifier
        name: `${patient.first_name} ${patient.last_name}`.trim(),
        first_name: patient.first_name,
        last_name: patient.last_name,
        middle_name: patient.middle_name,
        age: patient.age,
        gender: patient.gender,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        aadhar: patient.aadhar,
        prev_problem: patient.prev_problem,
        curr_problem: patient.curr_problem,
        created_date: patient.created_date
      }));
      
      setPatients(transformedPatients);
      setFilteredPatients(transformedPatients);
    } else {
      throw new Error(response.error || 'No patients data found');
    }
  } catch (err) {
    console.error('❌ Error fetching patients:', err);
    setError(err.message || 'Failed to load patients');
    // Set empty array as fallback
    setPatients([]);
    setFilteredPatients([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.patient_id?.toString().includes(searchTerm) ||
      patient.aadhar?.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        // Note: You'll need to add a deletePatient method to your api.js
        // await deletePatient(patientId);
        setPatients(patients.filter(p => p.id !== patientId));
        console.log('Patient deleted successfully');
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Failed to delete patient');
      }
    }
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        // Update existing patient
        // Note: You'll need to add an updatePatient method to your api.js
        // await updatePatient(editingPatient.id, patientData);
        setPatients(patients.map(p => p.id === editingPatient.id ? { ...p, ...patientData } : p));
      } else {
        // Add new patient
        // Note: You'll need to add a createPatient method to your api.js
        // const newPatient = await createPatient(patientData);
        const newPatient = { 
          ...patientData, 
          id: Date.now(),
          patient_id: `FAM${Date.now()}`,
          name: `${patientData.first_name} ${patientData.last_name}`.trim()
        };
        setPatients([...patients, newPatient]);
      }
      setShowModal(false);
      setEditingPatient(null);
    } catch (err) {
      console.error('Error saving patient:', err);
      setError('Failed to save patient');
    }
  };

  const refreshPatients = () => {
    fetchPatients();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/patients"
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
                <h1 className="text-2xl font-bold">Patients Management</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage patient records and information from members table
                </p>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshPatients}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors duration-200`}
                >
                  <span>Refresh</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Patient</span>
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
                    placeholder="Search patients by name, email, phone, Aadhar, or Family ID..."
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
                <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading patients...</p>
              </div>
            )}

            {/* Patients Table */}
            {!loading && (
              <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Family ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Patient Name</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Age</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Aadhar</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient, index) => (
                          <motion.tr
                            key={patient.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ 
                              backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                            }}
                            className="transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {patient.patient_id || `PAT${patient.id}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isDark ? 'bg-blue-600' : 'bg-blue-100'
                                }`}>
                                  <Users size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </div>
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {patient.name}
                                  </div>
                                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {patient.address || 'No address'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {patient.age || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {patient.gender || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {patient.email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {patient.phone || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {patient.aadhar ? `${patient.aadhar.substring(0, 4)}****${patient.aadhar.substring(12)}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(patient)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                                  } transition-colors duration-200`}
                                >
                                  <Edit size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(patient.id)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                                  } transition-colors duration-200`}
                                >
                                  <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center">
                            <div className={`flex flex-col items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Users size={48} className="mb-4 opacity-50" />
                              <p className="text-lg">No patients found</p>
                              <p className="mt-2">
                                {searchTerm ? 'Try adjusting your search terms' : 'Add your first patient to get started'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add/Edit Patient Modal */}
            <Modal
              isOpen={showModal}
              onClose={() => {
                setShowModal(false);
                setEditingPatient(null);
              }}
              title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
              isDark={isDark}
            >
              <PatientForm
                patient={editingPatient}
                onSave={handleSavePatient}
                onCancel={() => {
                  setShowModal(false);
                  setEditingPatient(null);
                }}
                isDark={isDark}
              />
            </Modal>
          </main>
        </div>
      </div>
    </div>
  );
};

// Patient Form Component
const PatientForm = ({ patient, onSave, onCancel, isDark }) => {
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    middle_name: patient?.middle_name || '',
    age: patient?.age || '',
    gender: patient?.gender || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    address: patient?.address || '',
    aadhar: patient?.aadhar || '',
    prev_problem: patient?.prev_problem || '',
    curr_problem: patient?.curr_problem || ''
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
            Middle Name
          </label>
          <input
            type="text"
            value={formData.middle_name}
            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Age
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
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
            Aadhar Number
          </label>
          <input
            type="text"
            value={formData.aadhar}
            onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
            placeholder="12-digit Aadhar number"
            maxLength="12"
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
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Previous Medical Problem
          </label>
          <textarea
            value={formData.prev_problem}
            onChange={(e) => setFormData({ ...formData, prev_problem: e.target.value })}
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Medical Problem
          </label>
          <textarea
            value={formData.curr_problem}
            onChange={(e) => setFormData({ ...formData, curr_problem: e.target.value })}
            rows={2}
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
          {patient ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </form>
  );
};

export default Patients;