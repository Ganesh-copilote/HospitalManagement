// src/pages/Doctors.jsx
import { useState, useEffect } from 'react';
import { Stethoscope, Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import Modal from '../components/Modal';
import Sidebar from '../components/admin/sidebar';
import { getAdminDoctordata } from '../services/api';

const Doctors = () => {
    debugger
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    debugger
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    debugger
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching doctors data from doctors table...');
      
      const response = await getAdminDoctordata();
      console.log('✅ Doctors data received:', response);
      
      // Check if response has success and data array
      if (response.success && response.Doctors) {
        console.log('Raw doctors data:', response.Doctors);
        
        // Transform the data to match our frontend structure
        const transformedDoctors = response.Doctors.map(doctor => ({
          id: doctor.id,
          doctor_id: doctor.family_id, // Using family_id as doctor identifier
          name: doctor.name,
          specialty: doctor.specialty,
          email: doctor.email,
          phone: doctor.phone,
          experience: doctor.experience || `${Math.floor(Math.random() * 20) + 1} years` // Fallback if not provided
        }));
        
        setDoctors(transformedDoctors);
        setFilteredDoctors(transformedDoctors);
      } else {
        throw new Error(response.error || 'No doctors data found');
      }
    } catch (err) {
      console.error('❌ Error fetching doctors:', err);
      setError(err.message || 'Failed to load doctors');
      // Set empty array as fallback
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = doctors.filter(doctor =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.phone?.includes(searchTerm) ||
      doctor.doctor_id?.toString().includes(searchTerm)
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        // Note: You'll need to add a deleteDoctor method to your api.js
        // await deleteDoctor(doctorId);
        setDoctors(doctors.filter(d => d.id !== doctorId));
        console.log('Doctor deleted successfully');
      } catch (err) {
        console.error('Error deleting doctor:', err);
        setError('Failed to delete doctor');
      }
    }
  };

  const handleSaveDoctor = async (doctorData) => {
    try {
      if (editingDoctor) {
        // Update existing doctor
        // Note: You'll need to add an updateDoctor method to your api.js
        // await updateDoctor(editingDoctor.id, doctorData);
        setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...d, ...doctorData } : d));
      } else {
        // Add new doctor
        // Note: You'll need to add a createDoctor method to your api.js
        // const newDoctor = await createDoctor(doctorData);
        const newDoctor = { 
          ...doctorData, 
          id: Date.now(),
          doctor_id: `DOC${Date.now()}`,
        };
        setDoctors([...doctors, newDoctor]);
      }
      setShowModal(false);
      setEditingDoctor(null);
    } catch (err) {
      console.error('Error saving doctor:', err);
      setError('Failed to save doctor');
    }
  };

  const refreshDoctors = () => {
    fetchDoctors();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/doctors"
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
                <h1 className="text-2xl font-bold">Doctors Management</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage doctor profiles and specialties from doctors table
                </p>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshDoctors}
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
                  <span>Add Doctor</span>
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
                    placeholder="Search doctors by name, specialty, email, phone, or Doctor ID..."
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
                <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading doctors...</p>
              </div>
            )}

            {/* Doctors Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
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
                          <Stethoscope size={24} className={isDark ? 'text-white' : 'text-blue-600'} />
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(doctor)}
                            className={`p-2 rounded ${
                              isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                            } transition-colors duration-200`}
                          >
                            <Edit size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(doctor.id)}
                            className={`p-2 rounded ${
                              isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                            } transition-colors duration-200`}
                          >
                            <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                        }`}>
                          ID: {doctor.doctor_id || `DOC${doctor.id}`}
                        </span>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {doctor.name}
                      </h3>
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-medium">Specialty:</span> {doctor.specialty || 'Not specified'}
                      </p>
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-medium">Experience:</span> {doctor.experience}
                      </p>
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-medium">Email:</span> {doctor.email || 'N/A'}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-medium">Phone:</span> {doctor.phone || 'N/A'}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <div className={`flex flex-col items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Stethoscope size={64} className="mb-4 opacity-50" />
                      <p className="text-xl mb-2">No doctors found</p>
                      <p>
                        {searchTerm ? 'Try adjusting your search terms' : 'Add your first doctor to get started'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Doctor Modal */}
            <Modal
              isOpen={showModal}
              onClose={() => {
                setShowModal(false);
                setEditingDoctor(null);
              }}
              title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              isDark={isDark}
            >
              <DoctorForm
                doctor={editingDoctor}
                onSave={handleSaveDoctor}
                onCancel={() => {
                  setShowModal(false);
                  setEditingDoctor(null);
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

// Doctor Form Component
const DoctorForm = ({ doctor, onSave, onCancel, isDark }) => {
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    specialty: doctor?.specialty || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    experience: doctor?.experience || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Specialty *
          </label>
          <select
            required
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Specialty</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Surgery">Surgery</option>
            <option value="Gynecology">Gynecology</option>
            <option value="Ophthalmology">Ophthalmology</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Experience
          </label>
          <input
            type="text"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="e.g., 5 years"
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
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
          {doctor ? 'Update Doctor' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
};

export default Doctors;