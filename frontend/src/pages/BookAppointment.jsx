import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookAppointmentData, bookAppointment } from '../services/api';
import Navbar from '../components/Navbar';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    member_id: '', doctor_id: '', slot_id: ''
  });
  const [data, setData] = useState({ members: [], doctors: [], slots: [] });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBookAppointmentData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookAppointment(formData);
      navigate('/patient_dashboard');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <Navbar isDashboard={true} userType="patient" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Book Appointment</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Family Member</label>
              <select name="member_id" value={formData.member_id} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" required>
                <option value="">Select Member</option>
                {data.members.map(member => (
                  <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Doctor</label>
              <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" required>
                <option value="">Select Doctor</option>
                {data.doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name} ({doctor.specialty})</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Slot</label>
              <select name="slot_id" value={formData.slot_id} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" required>
                <option value="">Select Slot</option>
                {data.slots.map(slot => (
                  <option key={slot.id} value={slot.id}>{slot.date} {slot.time}</option>
                ))}
              </select>
            </div>
            <div className="text-center mt-5">
              <button type="submit" className="bg-blue-600 text-white py-3 px-10 rounded-lg font-bold hover:bg-blue-700">Book</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BookAppointment;