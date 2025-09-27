import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeCheckins, checkInPatient } from '../services/api';
import Navbar from '../components/Navbar';

const FrontOfficeCheckins = () => {
  const [checkins, setCheckins] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const res = await getFrontOfficeCheckins();
        setCheckins(res.checkins);
      } catch (err) {
        setError('Failed to fetch check-ins. Please try again.');
      }
    };
    fetchCheckins();
  }, []);

  const handleCheckin = async (id) => {
    try {
      await checkInPatient(id);
      const res = await getFrontOfficeCheckins();
      setCheckins(res.checkins);
      setError('');
    } catch (err) {
      setError('Failed to check in patient. Please try again.');
    }
  };

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Patient Check-ins</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {checkins.length === 0 ? (
            <p className="text-center text-gray-600">No check-ins available.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Patient</th>
                  <th className="p-3 text-left">Appointment Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map(checkin => (
                  <tr key={checkin.id} className="odd:bg-gray-50">
                    <td className="p-3">{checkin.patient_name}</td>
                    <td className="p-3">{checkin.date}</td>
                    <td className="p-3">{checkin.time}</td>
                    <td className="p-3">{checkin.status}</td>
                    <td className="p-3">
                      {checkin.status === 'Pending' && (
                        <button
                          onClick={() => handleCheckin(checkin.id)}
                          className="text-blue-600 hover:underline focus:outline-none"
                        >
                          Check-in
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/front_office_dashboard')}
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

export default FrontOfficeCheckins;