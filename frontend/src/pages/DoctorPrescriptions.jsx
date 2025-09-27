import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorPrescriptions, addPrescription } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ patient_id: '', medication: '', dosage: '', instructions: '' });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDoctorPrescriptions();
        setPrescriptions(res.prescriptions);
        setPatients(res.patients);
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
      await addPrescription(formData);
      setShowModal(false);
      const res = await getDoctorPrescriptions();
      setPrescriptions(res.prescriptions);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <Navbar isDashboard={true} userType="doctor" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Prescriptions</h2>
            <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm">Add Prescription</button>
          </div>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Medication</th>
                <th className="p-3 text-left">Dosage</th>
                <th className="p-3 text-left">Instructions</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(prescription => (
                <tr key={prescription.id} className="odd:bg-gray-50">
                  <td className="p-3">{prescription.patient_name}</td>
                  <td className="p-3">{prescription.medication}</td>
                  <td className="p-3">{prescription.dosage}</td>
                  <td className="p-3">{prescription.instructions}</td>
                  <td className="p-3">{prescription.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <h3 className="text-lg font-bold mb-4">Add Prescription</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <select name="patient_id" value={formData.patient_id} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" required>
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <input name="medication" value={formData.medication} onChange={handleChange} placeholder="Medication" className="w-full p-3 rounded-lg border border-gray-300 outline-none" required />
            </div>
            <div className="mb-4">
              <input name="dosage" value={formData.dosage} onChange={handleChange} placeholder="Dosage" className="w-full p-3 rounded-lg border border-gray-300 outline-none" required />
            </div>
            <div className="mb-4">
              <textarea name="instructions" value={formData.instructions} onChange={handleChange} placeholder="Instructions" className="w-full p-3 rounded-lg border border-gray-300 outline-none" />
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add</button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default DoctorPrescriptions;