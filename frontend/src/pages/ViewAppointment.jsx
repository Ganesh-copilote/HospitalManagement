import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointment } from '../services/api';
import Navbar from '../components/Navbar';

const ViewAppointment = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await getAppointment(id);
        setAppointment(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchAppointment();
  }, [id]);

  return (
    <>
      <Navbar isDashboard={true} userType="patient" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Appointment Details</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Member:</strong> {appointment.member_name}</p>
            <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Status:</strong> {appointment.status}</p>
            {appointment.status === 'Scheduled' && (
              <div className="col-span-2">
                <button onClick={() => navigate(`/reschedule_appointment/${id}`)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2">Reschedule</button>
                <button onClick={() => navigate('/patient_dashboard')} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Cancel</button>
                </div>
            )}
          </div>
        </div>
        </div>
    </>
  );
}
export default ViewAppointment;
                