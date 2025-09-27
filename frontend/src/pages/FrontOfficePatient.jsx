import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficePatients } from '../services/api';
import Navbar from '../components/Navbar';

const FrontOfficePatient = () => {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getFrontOfficePatients();
        setPatients(res.patients);
      } catch (err) {
        setError(err);
      }
    };
    fetchPatients();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Patients</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient.id} className="odd:bg-gray-50">
                  <td className="p-3">{patient.first_name} {patient.last_name}</td>
                  <td className="p-3">{patient.age}</td>
                  <td className="p-3">{patient.gender}</td>
                  <td className="p-3">
                    <a href={`/front_office_view_patient/${patient.id}`} className="text-blue-600 hover:underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FrontOfficePatient;