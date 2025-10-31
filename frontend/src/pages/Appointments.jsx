// src/pages/Appointments.jsx
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Search, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import Sidebar from '../components/admin/sidebar';
import StatCard from '../components/admin/StatCard';
import ChartCard from '../components/admin/ChartCard';
import AdminModal from '../components/AdminModal';
import { 
  getAdminAppointments, 
  getAdminSlots,
  getAdminPatientData,
  getAdminDoctordata,
  addUser,
  updateUser, 
  deleteUser 
} from '../services/api';

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAppointmentsData();
    fetchPatientsAndDoctors();
  }, []);

  const fetchAppointmentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching appointments and slots data...');

      // Fetch appointments and slots data
      const [appointmentsResponse, slotsResponse] = await Promise.all([
        getAdminAppointments(),
        getAdminSlots()
      ]);

      console.log('✅ Appointments data:', appointmentsResponse);
      console.log('✅ Slots data:', slotsResponse);

      // Transform appointments data
      if (appointmentsResponse.success && appointmentsResponse.appointments) {
        const transformedAppointments = appointmentsResponse.appointments.map(apt => ({
          id: apt.id,
          patient_name: apt.patient_name || `${apt.patient_first_name} ${apt.patient_last_name}`,
          doctor_name: apt.doctor_name,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          patient_id: apt.patient_id,
          doctor_id: apt.doctor_id,
          reason: apt.reason || ''
        }));
        setAppointments(transformedAppointments);
      } else {
        setAppointments([]);
      }

      // Transform slots data
      if (slotsResponse.success && slotsResponse.slots) {
        const transformedSlots = slotsResponse.slots.map(slot => ({
          id: slot.id,
          doctor_name: slot.doctor_name,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
          doctor_id: slot.doctor_id,
          max_patients: slot.max_patients || 1
        }));
        setSlots(transformedSlots);
      } else {
        setSlots([]);
      }

      // Calculate stats
      calculateStats(appointmentsResponse.appointments || []);

    } catch (err) {
      console.error('❌ Error fetching appointments data:', err);
      setError(err.message || 'Failed to load appointments data');
      setAppointments([]);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      console.log('🔄 Fetching patients and doctors data...');
      
      const [patientsResponse, doctorsResponse] = await Promise.all([
        getAdminPatientData(),
        getAdminDoctordata()
      ]);

      console.log('✅ Patients data:', patientsResponse);
      console.log('✅ Doctors data:', doctorsResponse);

      if (patientsResponse.success && patientsResponse.family_members) {
        const transformedPatients = patientsResponse.family_members.map(patient => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          first_name: patient.first_name,
          last_name: patient.last_name
        }));
        setPatients(transformedPatients);
      }

      if (doctorsResponse.success && doctorsResponse.Doctors) {
        const transformedDoctors = doctorsResponse.Doctors.map(doctor => ({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty
        }));
        setDoctors(transformedDoctors);
      }

    } catch (err) {
      console.error('❌ Error fetching patients and doctors:', err);
    }
  };

  const calculateStats = (appointmentsData) => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointmentsData.filter(apt => apt.date === today);
    const upcomingAppointments = appointmentsData.filter(apt => 
      new Date(apt.date) > new Date() && apt.status === 'Scheduled'
    );

    setStats({
      total: appointmentsData.length,
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: appointmentsData.filter(apt => apt.status === 'Completed').length
    });
  };

  useEffect(() => {
    const data = activeTab === 'appointments' ? appointments : slots;
    const filtered = data.filter(item =>
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date?.includes(searchTerm) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activeTab === 'slots' && item.start_time?.includes(searchTerm))
    );
    setFilteredData(filtered);
  }, [searchTerm, appointments, slots, activeTab]);

  const getAppointmentStats = () => {
    const statusCounts = {
      Scheduled: appointments.filter(apt => apt.status === 'Scheduled').length,
      Completed: appointments.filter(apt => apt.status === 'Completed').length,
      Cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
      'No Show': appointments.filter(apt => apt.status === 'No Show').length
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status,
      count: count,
      color: getStatusColor(status)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      Scheduled: 'bg-blue-500',
      Completed: 'bg-emerald-500',
      Cancelled: 'bg-red-500',
      'No Show': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleEdit = (item) => {
    console.log('🔄 Edit button clicked for:', item);
    setEditingItem(item);
    setShowModal(true);
  };
const handleDelete = async (itemId) => {
  console.log('🗑️ Delete button clicked for:', { 
    itemId, 
    activeTab, 
    userType: activeTab.slice(0, -1) // Convert to singular
  });

  if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
    try {
      // Convert to singular for API call
      const apiUserType = activeTab.slice(0, -1); // 'appointments' -> 'appointment', 'slots' -> 'slot'
      console.log(`🔄 Calling deleteUser with: ${apiUserType}, ${itemId}`);
      
      const result = await deleteUser(apiUserType, itemId);
      console.log('✅ Delete API response:', result);
      
      if (result.success) {
        console.log('✅ Delete successful, refreshing data...');
        await fetchAppointmentsData();
        console.log('✅ Data refreshed after delete');
      } else {
        throw new Error(result.error || `Failed to delete ${apiUserType}`);
      }
    } catch (err) {
      console.error(`❌ Error deleting ${activeTab.slice(0, -1)}:`, err);
      console.error('❌ Error details:', err.message);
      setError(`Failed to delete ${activeTab.slice(0, -1)}: ${err.message}`);
    }
  }
};

  const handleSaveItem = async (itemData) => {
    try {
      console.log('🔄 handleSaveItem called with:', { 
        editingItem, 
        activeTab, 
        itemData 
      });
      
      // Convert to singular for API calls
      const apiUserType = activeTab.slice(0, -1); // 'appointments' -> 'appointment', 'slots' -> 'slot'
      
      if (editingItem) {
        console.log(`🔄 Updating ${apiUserType} ${editingItem.id}`);
        const result = await updateUser(apiUserType, editingItem.id, itemData);
        console.log('✅ Update result:', result);
        
        if (result.success) {
          await fetchAppointmentsData();
          setShowModal(false);
          setEditingItem(null);
          console.log(`${apiUserType} updated successfully`);
        } else {
          throw new Error(result.error || `Failed to update ${apiUserType}`);
        }
      } else {
        console.log(`🔄 Adding new ${apiUserType}`);
        const result = await addUser(apiUserType, itemData);
        console.log('✅ Add result:', result);
        
        if (result.success) {
          await fetchAppointmentsData();
          setShowModal(false);
          console.log(`${apiUserType} added successfully`);
        } else {
          throw new Error(result.error || `Failed to add ${apiUserType}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error saving ${activeTab.slice(0, -1)}:`, err);
      setError(err.message || `Failed to save ${activeTab.slice(0, -1)}`);
    }
  };

  const handleAddNew = () => {
    console.log('➕ Add new button clicked');
    setEditingItem(null);
    setShowModal(true);
  };

  const refreshData = () => {
    fetchAppointmentsData();
  };

  // Appointment Form Component
  const AppointmentForm = ({ appointment, onSave, onCancel, isDark }) => {
    const [formData, setFormData] = useState({
      patient_id: '',
      doctor_id: '',
      date: '',
      time: '',
      status: 'Scheduled',
      reason: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      console.log('🔄 AppointmentForm: Appointment data changed', appointment);
      console.log('📋 Available patients:', patients);
      console.log('👨‍⚕️ Available doctors:', doctors);
      
      if (appointment) {
        // Ensure we're using the correct field names that match backend expectations
        setFormData({
          patient_id: appointment.patient_id?.toString() || '',
          doctor_id: appointment.doctor_id?.toString() || '',
          date: appointment.date || '',
          time: appointment.time || '',
          status: appointment.status || 'Scheduled',
          reason: appointment.reason || ''
        });
      } else {
        setFormData({
          patient_id: '',
          doctor_id: '',
          date: '',
          time: '',
          status: 'Scheduled',
          reason: ''
        });
      }
    }, [appointment, patients, doctors]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('📤 AppointmentForm: Form submitted', formData);
      
      // Validate form
      if (!formData.patient_id || !formData.doctor_id || !formData.date || !formData.time) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Prepare data for API - ensure types are correct
      const submitData = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        date: formData.date,
        time: formData.time,
        status: formData.status,
        reason: formData.reason
      };
      
      console.log('📤 Prepared data for API:', submitData);
      
      setIsSubmitting(true);
      try {
        await onSave(submitData);
        console.log('✅ AppointmentForm: Form saved successfully');
      } catch (error) {
        console.error('❌ AppointmentForm: Error in form submission:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Dropdown */}
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
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.id})
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Dropdown */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Doctor *
            </label>
            <select
              name="doctor_id"
              required
              value={formData.doctor_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Date *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Time *
            </label>
            <input
              type="time"
              name="time"
              required
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="md:col-span-2">
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
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              placeholder="Enter appointment reason..."
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
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } transition-colors duration-200 disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {appointment ? 'Update Appointment' : 'Create Appointment'}
          </button>
        </div>
      </form>
    );
  };

  // Slot Form Component
  const SlotForm = ({ slot, onSave, onCancel, isDark }) => {
    const [formData, setFormData] = useState({
      doctor_id: '',
      date: '',
      start_time: '',
      end_time: '',
      is_available: true,
      max_patients: 1
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      console.log('🔄 SlotForm: Slot data changed', slot);
      
      if (slot) {
        setFormData({
          doctor_id: slot.doctor_id?.toString() || '',
          date: slot.date || '',
          start_time: slot.start_time || '',
          end_time: slot.end_time || '',
          is_available: slot.is_available !== undefined ? slot.is_available : true,
          max_patients: slot.max_patients || 1
        });
      } else {
        setFormData({
          doctor_id: '',
          date: '',
          start_time: '',
          end_time: '',
          is_available: true,
          max_patients: 1
        });
      }
    }, [slot]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('📤 SlotForm: Form submitted', formData);
      
      // Prepare data for API
      const submitData = {
        doctor_id: parseInt(formData.doctor_id),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
        max_patients: parseInt(formData.max_patients)
      };
      
      console.log('📤 Prepared data for API:', submitData);
      
      setIsSubmitting(true);
      try {
        await onSave(submitData);
        console.log('✅ SlotForm: Form saved successfully');
      } catch (error) {
        console.error('❌ SlotForm: Error in form submission:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doctor Dropdown for Slots */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Doctor *
            </label>
            <select
              name="doctor_id"
              required
              value={formData.doctor_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Date *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Start Time *
            </label>
            <input
              type="time"
              name="start_time"
              required
              value={formData.start_time}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              End Time *
            </label>
            <input
              type="time"
              name="end_time"
              required
              value={formData.end_time}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Patients
            </label>
            <input
              type="number"
              name="max_patients"
              value={formData.max_patients}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="flex items-center justify-start">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Available for booking
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } transition-colors duration-200 disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {slot ? 'Update Slot' : 'Create Slot'}
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
          currentPath="/appointments"
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
                <h1 className="text-2xl font-bold">Appointments & Slots</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage appointments and doctor availability slots
                </p>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshData}
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
                  <span>Add New</span>
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

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Appointments"
                value={stats.total}
                icon={Calendar}
                trend={{ value: 8, isPositive: true }}
                color="gradient-blue"
                isDark={isDark}
              />
              <StatCard
                title="Today's Appointments"
                value={stats.today}
                icon={Clock}
                trend={{ value: 2, isPositive: true }}
                color="gradient-emerald"
                isDark={isDark}
              />
              <StatCard
                title="Upcoming"
                value={stats.upcoming}
                icon={Users}
                trend={{ value: 5, isPositive: false }}
                color="gradient-purple"
                isDark={isDark}
              />
              <StatCard
                title="Completed"
                value={stats.completed}
                icon={Calendar}
                trend={{ value: 12, isPositive: true }}
                color="gradient-orange"
                isDark={isDark}
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              {['appointments', 'slots'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-t-lg font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? isDark
                        ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                        : 'bg-white text-gray-900 border-b-2 border-blue-500 shadow-sm'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Area */}
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
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading {activeTab}...</p>
                </div>
              )}

              {/* Data Table */}
              {!loading && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        {activeTab === 'appointments' ? (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Time Slot</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Availability</th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
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
                            {activeTab === 'appointments' ? (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      isDark ? 'bg-blue-600' : 'bg-blue-100'
                                    }`}>
                                      <Users size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                    </div>
                                    <div className="ml-4">
                                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {item.patient_name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {item.doctor_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div>{item.date}</div>
                                  <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                    {item.time}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isDark 
                                      ? `${getStatusColor(item.status)} text-white`
                                      : `${getStatusColor(item.status)} text-white`
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
                                      onClick={() => handleDelete(item.id)}
                                      className={`p-2 rounded ${
                                        isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                                      } transition-colors duration-200`}
                                    >
                                      <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                                    </motion.button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {item.doctor_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {item.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {item.start_time} {item.end_time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.is_available
                                      ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                                      : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                  }`}>
                                    {item.is_available ? 'Available' : 'Booked'}
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
                                  </div>
                                </td>
                              </>
                            )}
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={activeTab === 'appointments' ? 5 : 5} className="px-6 py-8 text-center">
                            <div className={`flex flex-col items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Calendar size={48} className="mb-4 opacity-50" />
                              <p className="text-lg">No {activeTab} found</p>
                              <p className="mt-2">
                                {searchTerm ? 'Try adjusting your search terms' : `Add your first ${activeTab.slice(0, -1)} to get started`}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Charts Section */}
            {/* {!loading && activeTab === 'appointments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <ChartCard 
                  title="Appointments by Status" 
                  type="pie" 
                  data={getAppointmentStats()}
                  dataKey="count"
                  isDark={isDark}
                />
                <ChartCard 
                  title="Weekly Appointments Trend" 
                  type="area" 
                  data={[]}
                  dataKey="appointments"
                  isDark={isDark}
                />
              </div>
            )} */}
          </main>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => {
          console.log('🔒 Modal close triggered');
          setShowModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? `Edit ${activeTab === 'appointments' ? 'Appointment' : 'Slot'}` : `Add New ${activeTab === 'appointments' ? 'Appointment' : 'Slot'}`}
        isDark={isDark}
      >
        {activeTab === 'appointments' ? (
          <AppointmentForm
            appointment={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              console.log('❌ Form cancel triggered');
              setShowModal(false);
              setEditingItem(null);
            }}
            isDark={isDark}
          />
        ) : (
          <SlotForm
            slot={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              console.log('❌ Form cancel triggered');
              setShowModal(false);
              setEditingItem(null);
            }}
            isDark={isDark}
          />
        )}
      </AdminModal>
    </div>
  );
};

export default Appointments;