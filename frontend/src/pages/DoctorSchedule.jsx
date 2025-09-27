import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorSchedule } from '../services/api';
import Navbar from '../components/Navbar';

const DoctorSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await getDoctorSchedule();
        setSchedule(res.schedule);
      } catch (err) {
        setError('Failed to fetch schedule. Please try again.');
      }
    };
    fetchSchedule();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userType="doctor" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">My Schedule</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {schedule.length === 0 ? (
            <p className="text-center text-gray-600">No schedule available.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map(slot => (
                  <tr key={slot.id} className="odd:bg-gray-50">
                    <td className="p-3">{slot.date}</td>
                    <td className="p-3">{slot.time}</td>
                    <td className="p-3">{slot.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/doctor_dashboard')}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorSchedule;