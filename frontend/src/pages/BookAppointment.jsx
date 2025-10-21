import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBookAppointmentData, bookAppointment, getAvailableSlots } from '../services/api';
import Navbar from '../components/Navbar';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    member_id: '',
    doctor_id: '',
    date: '',
    slot_id: '',
    appointment_id: ''
  });
  const [data, setData] = useState({ 
    members: [], 
    doctors: [], 
    available_slots: [] 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScroll, setShowScroll] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ---------- Breadcrumb Generator ----------
  const generateBreadcrumb = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    return (
      <nav className="text-sm text-gray-600 mb-6">
        <ol className="list-reset flex">
          <li>
            <button
              onClick={() => navigate('/patient_dashboard')}
              className="text-blue-600 hover:underline"
            >
              Dashboard
            </button>
          </li>
          {pathnames.map((value, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            return (
              <li key={index} className="flex items-center">
                <span className="mx-2">›</span>
                {isLast ? (
                  <span className="text-gray-800 font-medium capitalize">
                    {value.replace(/_/g, ' ')}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(routeTo)}
                    className="text-blue-600 hover:underline capitalize"
                  >
                    {value.replace(/_/g, ' ')}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };


  
  // ---------- Scroll-To-Top ----------
  useEffect(() => {
    debugger
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- Utility Functions ----------
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  // ---------- Handle Reschedule ----------
  useEffect(() => {
    debugger
    const searchParams = new URLSearchParams(location.search);
    const appointmentId = searchParams.get('appointment_id');
    const memberId = searchParams.get('member_id');
    const doctorId = searchParams.get('doctor_id');
    const date = searchParams.get('date');

    if (appointmentId || memberId || doctorId || date) {
      setFormData(prev => ({
        ...prev,
        appointment_id: appointmentId || '',
        member_id: memberId || '',
        doctor_id: doctorId || '',
        date: date || ''
      }));
    }
  }, [location]);

  // ---------- Fetch Initial Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBookAppointmentData();
        setData({
          members: res.members || [],
          doctors: res.doctors || [],
          available_slots: []
        });
      } catch (err) {
        setError(err.message || 'Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ---------- Fetch Available Slots ----------
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.doctor_id && formData.date) {
        if (isPastDate(formData.date)) {
          setData(prev => ({ ...prev, available_slots: [] }));
          setError('Cannot book appointments for past dates');
          return;
        }
        try {
          setError('');
          const slots = await getAvailableSlots(formData.doctor_id, formData.date);
          debugger
          setData(prev => ({ ...prev, available_slots: slots }));
        } catch {
          setError('Failed to load available slots');
          setData(prev => ({ ...prev, available_slots: [] }));
        }
      } else {
        setData(prev => ({ ...prev, available_slots: [] }));
      }
    };
    fetchSlots();
  }, [formData.doctor_id, formData.date]);





  
  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date' && isPastDate(value)) {
      setError('Cannot select past dates for appointments');
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'doctor_id' || name === 'date') {
      setFormData(prev => ({ ...prev, slot_id: '' }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.member_id || !formData.doctor_id || !formData.date || !formData.slot_id) {
      setError('Please fill in all required fields');
      return;
    }

    if (isPastDate(formData.date)) {
      setError('Cannot book appointments for past dates');
      return;
    }

    try {
      await bookAppointment(formData);
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/patient_dashboard#appointments'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    }
  };

  const handleCancelReschedule = () => navigate('/patient_dashboard#appointments');

  const formatSlotDisplay = (slot) => {
    if (slot.slot_time) {
      const timePart = slot.slot_time.split(' ')[1];
      return timePart.substring(0, 5);
    }
    return slot.time || slot.display || 'Unknown time';
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <>
        <Navbar isDashboard={true} userType="patient" />
        <div className="container mx-auto pt-24 px-4">
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl text-center">
            <div className="text-lg font-semibold text-blue-700 animate-pulse">
              Loading appointment data...
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---------- Main JSX ----------
  return (
    <>
      <Navbar isDashboard={true} userType="patient" />
      <div className="container mx-auto pt-24 px-4 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="max-w-4xl mx-auto">{generateBreadcrumb()}</div>

        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
            {formData.appointment_id ? 'Reschedule Appointment' : 'Book Appointment'}
          </h2>

          {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-6">{success}</div>}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-lg">
                Select Patient <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="member_id"
                value={formData.member_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a patient</option>
                {data.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-lg">
                Select Doctor <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a doctor</option>
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
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getTodayDate()}
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
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                name="slot_id"
                value={formData.slot_id}
                onChange={handleChange}
                required
                disabled={!formData.doctor_id || !formData.date}
              >
                <option value="">
                  {!formData.doctor_id || !formData.date
                    ? 'Please select doctor and date first'
                    : isPastDate(formData.date)
                    ? 'Cannot select past dates'
                    : data.available_slots.length === 0
                    ? 'No available slots for selected criteria'
                    : 'Select a time slot'}
                </option>
                {data.available_slots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {formatSlotDisplay(slot)}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden Field */}
            <input type="hidden" name="appointment_id" value={formData.appointment_id || ''} />

            {/* Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {formData.appointment_id && (
                <button
                  type="button"
                  className="bg-gray-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
                  onClick={handleCancelReschedule}
                >
                  Cancel Reschedule
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed ml-auto"
                disabled={
                  !formData.member_id ||
                  !formData.doctor_id ||
                  !formData.date ||
                  !formData.slot_id ||
                  isPastDate(formData.date)
                }
              >
                {formData.appointment_id ? 'Reschedule Appointment' : 'Book Appointment'}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">
              {formData.appointment_id ? 'Rescheduling Information' : 'Booking Information'}
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {formData.appointment_id
                  ? 'You can change the doctor, date, and time slot for this appointment'
                  : 'Select a patient, doctor, date, and available time slot'}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Only future dates and times are available for booking
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Appointments can be {formData.appointment_id ? 'rescheduled' : 'cancelled'} up to 2 hours before the scheduled time
              </li>
              {formData.appointment_id && (
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Your original appointment will be cancelled once you confirm the reschedule
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Scroll To Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          title="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default BookAppointment;
