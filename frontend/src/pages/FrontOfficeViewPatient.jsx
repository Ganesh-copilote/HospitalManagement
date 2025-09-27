import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFrontOfficePatientDetails } from '../services/api';
import Navbar from '../components/Navbar';

const FrontOfficeViewPatient = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getFrontOfficePatientDetails(id);
        setPatient(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchPatient();
  }, [id]);

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Patient Details</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Aadhar:</strong> {patient.aadhar}</p>
            <p className="col-span-2"><strong>Address:</strong> {patient.address}</p>
            <p className="col-span-2"><strong>Previous Medical Problems:</strong> {patient.prev_problem}</p>
            <p className="col-span-2"><strong>Current Medical Problems:</strong> {patient.curr_problem}</p>
            <div className="col-span-2">
              <button onClick={() => navigate('/front_office_dashboard')} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontOfficeViewPatient;