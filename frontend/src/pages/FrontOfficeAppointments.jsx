import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeAppointments } from '../services/api';
import Navbar from '../components/Navbar';

const FrontOfficeAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await getFrontOfficeAppointments();
        setAppointments(res.appointments);
      } catch (err) {
        setError(err);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Appointments</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Doctor</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id} className="odd:bg-gray-50">
                  <td className="p-3">{apt.patient_name}</td>
                  <td className="p-3">{apt.doctor_name}</td>
                  <td className="p-3">{apt.date}</td>
                  <td className="p-3">{apt.time}</td>
                  <td className="p-3">{apt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FrontOfficeAppointments;