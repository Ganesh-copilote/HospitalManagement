
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFrontOfficePatientDetails } from '../services/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import ScrollToTop from '../components/ScrollToTop';
const FrontOfficeViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    patient: {},
    medical_history: [],
    previous_appointments: [],
    prescriptions: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getFrontOfficePatientDetails(id);
        if (res.success) {
          setDetails({
            patient: res.patient || {},
            medical_history: res.medical_history || [],
            previous_appointments: res.previous_appointments || [],
            prescriptions: res.prescriptions || []
          });
        } else {
          setError(res.error || 'Failed to load patient details');
        }
      } catch (err) {
        setError(err.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPatient();
  }, [id]);

  // Find current appointment (latest or today's)
  const currentAppointment = details.previous_appointments[0] || {};

  if (loading) {
    return (
      <>
        <Navbar isDashboard={true} userType="front_office" />
        <div className="container mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-auto p-10">
            <div className="text-center">Loading patient details...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || Object.keys(details.patient).length === 0) {
    return (
      <>
        <Navbar isDashboard={true} userType="front_office" />
        <div className="container mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-auto p-10">
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error || 'Patient not found'}
            </div>
            <button 
              onClick={() => navigate('/front_office_dashboard')} 
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      
      <div className="container mx-auto pt-20 px-4">
        {/* Use Breadcrumb component correctly */}
        <Breadcrumb />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Patient Details</h2>
          <button 
            onClick={() => navigate('/front_office_dashboard')}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>


        {/* Patient Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-blue-800 mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {details.patient.first_name} {details.patient.middle_name || ''} {details.patient.last_name}</p>
              <p><strong>Age:</strong> {details.patient.age || 'N/A'}</p>
              <p><strong>Gender:</strong> {details.patient.gender || 'N/A'}</p>
              <p><strong>Phone:</strong> {details.patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Email:</strong> {details.patient.email || 'N/A'}</p>
              <p><strong>Aadhar:</strong> {details.patient.aadhar || 'N/A'}</p>
              <p><strong>Address:</strong> {details.patient.address || 'N/A'}</p>
              <p><strong>Registration Date:</strong> {details.patient.registration_date?.substring(0, 10) || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <p><strong>Previous Medical Problems:</strong> {details.patient.prev_problem || 'None recorded'}</p>
            <p><strong>Current Medical Problems:</strong> {details.patient.curr_problem || 'None recorded'}</p>
          </div>
        </div>

        {/* Current Appointment */}
        {Object.keys(currentAppointment).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">Current Appointment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Appointment Time:</strong> {currentAppointment.slot_time || 'N/A'}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  currentAppointment.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  currentAppointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  currentAppointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentAppointment.status || 'Unknown'}
                </span>
              </p>
              <p><strong>Doctor:</strong> {currentAppointment.doctor_name || 'N/A'}</p>
              <p><strong>Specialty:</strong> {currentAppointment.specialty || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Previous Appointments */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">Previous Appointments</h3>
          {details.previous_appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Date & Time</th>
                    <th className="border border-gray-300 p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {details.previous_appointments.map((apt, index) => (
                    <tr key={index} className="odd:bg-gray-50">
                      <td className="border border-gray-300 p-2">{apt.slot_time || 'N/A'}</td>
                      <td className="border border-gray-300 p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No previous appointments.</p>
          )}
        </div>

        {/* Medical History */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">Medical History</h3>
          {details.medical_history.length > 0 ? (
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
                  {details.medical_history.map((record, index) => (
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

        {/* Prescriptions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-purple-800 mb-4">Prescriptions</h3>
          {details.prescriptions.length > 0 ? (
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
                  {details.prescriptions.map((prescription, index) => (
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
      <ScrollToTop />
    </>
  );
};

export default FrontOfficeViewPatient;
