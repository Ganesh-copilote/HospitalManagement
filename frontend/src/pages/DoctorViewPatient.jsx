import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorPatientFullDetails, addPrescription } from '../services/api';
import Navbar from '../components/Navbar';

const DoctorPatientFullDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getDoctorPatientFullDetails(id);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const prescriptionData = {
        ...prescriptionForm,
        member_id: id,
        doctor_id: data?.doctor?.id
      };
      
      await addPrescription(prescriptionData);
      setShowPrescriptionModal(false);
      setPrescriptionForm({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        notes: ''
      });
      
      // Refresh data to show new prescription
      const res = await getDoctorPatientFullDetails(id);
      setData(res);
      
    } catch (err) {
      setError(err.message || 'Failed to add prescription');
    }
  };

  const handleInputChange = (e) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <>
        <Navbar isDashboard={true} userType="doctor" />
        <div className="container mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-auto p-10">
            <div className="text-center">Loading patient details...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar isDashboard={true} userType="doctor" />
        <div className="container mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-auto p-10">
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error || 'Patient not found'}
            </div>
            <button 
              onClick={() => navigate('/doctor_dashboard')} 
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const { patient, medical_history, previous_appointments, prescriptions, current_appointment } = data;

  return (
    <>
      <Navbar isDashboard={true} userType="doctor" />
      
      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Prescription</h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded mb-4">
              <strong>Patient:</strong> {patient.first_name} {patient.last_name} 
              <span className="text-gray-600 ml-2">
                (Age: {patient.age || 'N/A'}, Gender: {patient.gender || 'N/A'})
              </span>
            </div>

            <form onSubmit={handleAddPrescription}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Medication Name *</label>
                  <input
                    type="text"
                    name="medication"
                    value={prescriptionForm.medication}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Paracetamol, Amoxicillin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dosage *</label>
                  <input
                    type="text"
                    name="dosage"
                    value={prescriptionForm.dosage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 500mg, 1 tablet"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    name="frequency"
                    value={prescriptionForm.frequency}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="As needed">As needed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={prescriptionForm.duration}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 7 days, 2 weeks"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea
                  name="instructions"
                  value={prescriptionForm.instructions}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Take with food, Avoid alcohol, Take before bedtime"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  value={prescriptionForm.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded"
                  placeholder="Any additional notes for the patient"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto pt-20 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Patient Details</h2>
          <button 
            onClick={() => navigate('/doctor_dashboard')}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Current Appointment Information */}
        {current_appointment && Object.keys(current_appointment).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">Current Appointment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Appointment Time:</strong> {current_appointment.slot_time || 'N/A'}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  current_appointment.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  current_appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  current_appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {current_appointment.status || 'Unknown'}
                </span>
              </p>
              <p><strong>Doctor:</strong> {current_appointment.doctor_name || 'N/A'}</p>
              <p><strong>Specialty:</strong> {current_appointment.specialty || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Patient Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-blue-800 mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {patient.first_name} {patient.middle_name || ''} {patient.last_name}</p>
              <p><strong>Age:</strong> {patient.age || 'N/A'}</p>
              <p><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
              <p><strong>Phone:</strong> {patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Email:</strong> {patient.email || 'N/A'}</p>
              <p><strong>Aadhar:</strong> {patient.aadhar || 'N/A'}</p>
              <p><strong>Address:</strong> {patient.address || 'N/A'}</p>
              <p><strong>Registration Date:</strong> {patient.created_date ? patient.created_date.substring(0, 10) : 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <p><strong>Previous Medical Problems:</strong> {patient.prev_problem || 'None recorded'}</p>
            <p><strong>Current Medical Problems:</strong> {patient.curr_problem || 'None recorded'}</p>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">Medical History</h3>
          {medical_history && medical_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Record Type</th>
                    <th className="border border-gray-300 p-2 text-left">Date</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-left">File</th>
                  </tr>
                </thead>
                <tbody>
                  {medical_history.map((record, index) => (
                    <tr key={index} className="odd:bg-gray-50">
                      <td className="border border-gray-300 p-2">{record.record_type || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">
                        {record.record_date ? record.record_date.substring(0, 10) : 'N/A'}
                      </td>
                      <td className="border border-gray-300 p-2">{record.description || 'No description'}</td>
                      <td className="border border-gray-300 p-2">
                        {record.file_path ? (
                          <a 
                            href={`http://localhost:5000/static/${record.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-gray-500">No file</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No medical records available.</p>
          )}
        </div>

        {/* Previous Appointments */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">Previous Appointments</h3>
          {previous_appointments && previous_appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Date & Time</th>
                    <th className="border border-gray-300 p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previous_appointments.map((appt, index) => (
                    <tr key={index} className="odd:bg-gray-50">
                      <td className="border border-gray-300 p-2">{appt.slot_time || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          appt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appt.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No previous appointments with this doctor.</p>
          )}
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-800">Prescriptions</h3>
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Prescription
            </button>
          </div>
          
          {prescriptions && prescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Date</th>
                    <th className="border border-gray-300 p-2 text-left">Medication</th>
                    <th className="border border-gray-300 p-2 text-left">Dosage</th>
                    <th className="border border-gray-300 p-2 text-left">Frequency</th>
                    <th className="border border-gray-300 p-2 text-left">Duration</th>
                    <th className="border border-gray-300 p-2 text-left">Instructions</th>
                    <th className="border border-gray-300 p-2 text-left">Notes</th>
                    <th className="border border-gray-300 p-2 text-left">Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription, index) => (
                    <tr key={index} className="odd:bg-gray-50">
                      <td className="border border-gray-300 p-2">
                        {prescription.prescription_date ? prescription.prescription_date.substring(0, 10) : 'N/A'}
                      </td>
                      <td className="border border-gray-300 p-2">{prescription.medication || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">{prescription.dosage || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">{prescription.frequency || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">{prescription.duration || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">{prescription.instructions || 'None'}</td>
                      <td className="border border-gray-300 p-2">{prescription.notes || 'None'}</td>
                      <td className="border border-gray-300 p-2">{prescription.doctor_name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No prescriptions available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorPatientFullDetails;