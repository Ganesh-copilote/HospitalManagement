import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookAppointmentData, bookAppointment, getRescheduleAppointment, getAvailableSlots } from '../services/api';
import Navbar from '../components/Navbar';

const RescheduleAppointment = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    member_id: '', 
    doctor_id: '', 
    slot_id: '',
    appointment_date: '',
    appointment_id: id
  });
  const [data, setData] = useState({ 
    members: [], 
    doctors: [], 
    available_slots: [] 
  });
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if a date is in the past
  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    const selectedDate = new Date(dateString);
    return selectedDate < today;
  };

  // Fetch initial data and current appointment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log(`📋 Fetching data for rescheduling appointment ${id}...`);
        
        // Fetch current appointment details
        const rescheduleData = await getRescheduleAppointment(id);
        if (rescheduleData.success && rescheduleData.appointment) {
          console.log('✅ Current appointment data:', rescheduleData.appointment);
          setCurrentAppointment(rescheduleData.appointment);
          
          // Pre-fill form with current appointment data, but only if it's today or future
          const appointmentDate = rescheduleData.appointment.slot_date;
          const today = getTodayDate();
          
          setFormData(prev => ({
            ...prev,
            member_id: rescheduleData.appointment.member_id,
            doctor_id: rescheduleData.appointment.doctor_id,
            appointment_date: appointmentDate >= today ? appointmentDate : today,
            appointment_id: id
          }));
        } else {
          throw new Error(rescheduleData.error || 'Failed to load appointment details');
        }

        // Fetch available data for booking
        const bookingData = await getBookAppointmentData();
        console.log('✅ Booking data received:', {
          members: bookingData.members?.length,
          doctors: bookingData.doctors?.length
        });
        
        setData({
          members: bookingData.members || [],
          doctors: bookingData.doctors || [],
          available_slots: []
        });

      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError(err.message || 'Failed to load appointment data');
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    if (id) {
      fetchData();
    } else {
      setError('No appointment ID provided');
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [id]);

  // Fetch available slots when doctor or date changes OR after initial load
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.doctor_id && formData.appointment_date) {
        // Don't fetch if date is in the past
        if (isPastDate(formData.appointment_date)) {
          setData(prev => ({
            ...prev,
            available_slots: []
          }));
          setError('Cannot book appointments for past dates');
          return;
        }

        try {
          setError('');
          console.log(`🔄 Fetching slots for doctor ${formData.doctor_id} and date ${formData.appointment_date}`);
          const slots = await getAvailableSlots(formData.doctor_id, formData.appointment_date);
          console.log('✅ Available slots received:', slots);
          
          // Filter out past time slots on the client side as well (double safety)
          const currentTime = new Date();
          const futureSlots = slots.filter(slot => {
            if (slot.slot_time) {
              const slotDateTime = new Date(slot.slot_time);
              return slotDateTime > currentTime;
            }
            return true; // If no time info, assume it's valid
          });
          
          setData(prev => ({
            ...prev,
            available_slots: futureSlots
          }));
        } catch (err) {
          console.error('❌ Failed to load available slots:', err);
          setError('Failed to load available slots');
          setData(prev => ({
            ...prev,
            available_slots: []
          }));
        }
      } else {
        setData(prev => ({
          ...prev,
          available_slots: []
        }));
      }
    };

    // Only fetch slots if initial load is complete and we have both doctor and date
    if (initialLoadComplete && formData.doctor_id && formData.appointment_date) {
      fetchSlots();
    }
  }, [formData.doctor_id, formData.appointment_date, initialLoadComplete]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate date before setting
    if (name === 'appointment_date' && isPastDate(value)) {
      setError('Cannot select past dates for appointments');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear slot when doctor or date changes
    if (name === 'doctor_id' || name === 'appointment_date') {
      setFormData(prev => ({
        ...prev,
        slot_id: ''
      }));
      setError(''); // Clear previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      console.log('🔄 Submitting reschedule form:', formData);
      
      // Validate form
      if (!formData.member_id || !formData.doctor_id || !formData.appointment_date || !formData.slot_id) {
        setError('Please fill in all required fields');
        return;
      }

      // Double-check date validation before submission
      if (isPastDate(formData.appointment_date)) {
        setError('Cannot book appointments for past dates');
        return;
      }

      const result = await bookAppointment(formData);
      if (result.success) {
        alert('Appointment rescheduled successfully!');
        navigate('/patient_dashboard');
      } else {
        setError(result.error || 'Failed to reschedule appointment');
      }
    } catch (err) {
      console.error('❌ Error rescheduling appointment:', err);
      setError(err.message || 'Failed to reschedule appointment');
    }
  };

  const handleCancel = () => {
    navigate('/patient_dashboard');
  };

  // Format the slot display
  const formatSlotDisplay = (slot) => {
    if (slot.slot_time) {
      // Extract time from datetime string like "2025-10-01 10:00:00"
      const timePart = slot.slot_time.split(' ')[1];
      return timePart.substring(0, 5); // Return HH:MM format
    } else if (slot.time) {
      return slot.time;
    } else if (slot.display) {
      return slot.display;
    }
    return 'Unknown time';
  };

  if (loading) {
    return (
      <>
        <Navbar isDashboard={true} userType="patient" />
        <div className="container mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10 text-center">
            <div className="text-lg">Loading appointment data...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isDashboard={true} userType="patient" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-2">Reschedule Appointment</h2>
          
          {/* Current Appointment Details - Top Section */}
          {currentAppointment && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Current Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-blue-50 p-4 rounded-lg">
                <div>
                  <p><strong>Patient:</strong> {currentAppointment.patient_name}</p>
                  <p><strong>Current Date:</strong> {currentAppointment.slot_date}</p>
                </div>
                <div>
                  <p><strong>Doctor:</strong> {currentAppointment.doctor_name}</p>
                  <p><strong>Current Time:</strong> {currentAppointment.slot_time}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-6 pt-6"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Patient Selection - Simple display instead of dropdown */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-lg">Patient</label>
              <div className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
                {data.members.find(member => member.id == formData.member_id)?.first_name + ' ' + 
                 data.members.find(member => member.id == formData.member_id)?.last_name}
              </div>
              <p className="text-sm text-gray-500 mt-1">Patient cannot be changed when rescheduling</p>
              <input type="hidden" name="member_id" value={formData.member_id} />
            </div>

            {/* Doctor Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-lg">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select 
                name="doctor_id" 
                value={formData.doctor_id} 
                onChange={handleChange} 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select Doctor</option>
                {data.doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-lg">
                Select Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="appointment_date" 
                value={formData.appointment_date} 
                onChange={handleChange} 
                min={getTodayDate()}
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Only future dates are allowed</p>
            </div>

            {/* Time Slot Selection */}
            <div className="mb-8">
              <label className="block text-gray-700 mb-2 text-lg">
                Select Time Slot <span className="text-red-500">*</span>
              </label>
              <select 
                name="slot_id" 
                value={formData.slot_id} 
                onChange={handleChange} 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                disabled={!formData.doctor_id || !formData.appointment_date}
              >
                <option value="">
                  {!formData.doctor_id || !formData.appointment_date 
                    ? 'Please select doctor and date first' 
                    : isPastDate(formData.appointment_date)
                    ? 'Cannot select past dates'
                    : data.available_slots.length === 0 
                    ? 'No available slots for selected criteria'
                    : 'Select a time slot'
                  }
                </option>
                {data.available_slots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {formatSlotDisplay(slot)}
                  </option>
                ))}
              </select>
              {formData.doctor_id && formData.appointment_date && data.available_slots.length === 0 && !isPastDate(formData.appointment_date) && (
                <p className="text-yellow-600 text-sm mt-1">
                  No available slots for selected criteria
                </p>
              )}
            </div>

            {/* Hidden appointment_id */}
            <input type="hidden" name="appointment_id" value={formData.appointment_id} />

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!formData.member_id || !formData.doctor_id || !formData.appointment_date || !formData.slot_id || isPastDate(formData.appointment_date)}
              >
                Reschedule Appointment
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">Rescheduling Information</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                You can change the doctor, date, and time slot for this appointment
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                The patient cannot be changed when rescheduling
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Only future dates and times are available for booking
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Appointments can be rescheduled up to 2 hours before the scheduled time
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Your original appointment will be cancelled once you confirm the reschedule
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default RescheduleAppointment;