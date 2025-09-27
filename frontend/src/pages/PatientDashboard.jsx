import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientDashboardData, uploadMedicalRecord, deleteFamilyMember, cancelAppointment, payBill } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const PatientDashboard = () => {
  const [data, setData] = useState({
    profile: {}, family_members: [], appointments: [], medical_records: [], bills: [], family_id: ''
  });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ member_id: '', record_type: '', record_date: new Date().toISOString().split('T')[0], description: '', record_file: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, []);

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const uploadData = new FormData();
    for (const key in formData) {
      uploadData.append(key, formData[key]);
    }
    try {
      await uploadMedicalRecord(uploadData);
      setShowModal(false);
      const res = await getPatientDashboardData();
      setData(res);
    } catch (err) {
      setError(err);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      try {
        await deleteFamilyMember(id);
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(id);
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    }
  };

  const handlePayBill = async (id) => {
    try {
      await payBill(id);
      const res = await getPatientDashboardData();
      setData(res);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <Navbar isDashboard={true} userName={data.profile.first_name || 'Patient'} userType="patient" />
      <div className="container mx-auto pt-20 px-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="bg-blue-500 text-white p-4 rounded-t-lg">
                <h5 className="font-bold">Dashboard</h5>
              </div>
              <ul className="divide-y divide-gray-200">
                <li><a href="#profile" className="block p-4 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' }); }}>Profile</a></li>
                <li><a href="#family" className="block p-4 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); document.getElementById('family')?.scrollIntoView({ behavior: 'smooth' }); }}>Family Members</a></li>
                <li><a href="#appointments" className="block p-4 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); document.getElementById('appointments')?.scrollIntoView({ behavior: 'smooth' }); }}>Appointments</a></li>
                <li><a href="#medical" className="block p-4 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); document.getElementById('medical')?.scrollIntoView({ behavior: 'smooth' }); }}>Medical Records</a></li>
                <li><a href="#billing" className="block p-4 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); document.getElementById('billing')?.scrollIntoView({ behavior: 'smooth' }); }}>Billing</a></li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <h6 className="font-semibold">Family ID</h6>
              <p className="text-gray-600">{data.family_id}</p>
              <button onClick={() => navigate('/add_family_member')} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm mt-2">Add Family Member</button>
            </div>
          </div>
          <div className="col-span-3">
            <section id="profile" className="bg-white rounded-lg shadow-md mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-lg">Profile Information</h5>
                <button onClick={() => navigate(`/edit_family_member/${data.profile.id}`)} className="bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm hover:bg-gray-300">Edit Profile</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Name:</strong> {data.profile.first_name} {data.profile.last_name}</p>
                <p><strong>Email:</strong> {data.profile.email}</p>
                <p><strong>Phone:</strong> {data.profile.phone}</p>
                <p><strong>Age:</strong> {data.profile.age}</p>
                <p><strong>Gender:</strong> {data.profile.gender}</p>
                <p><strong>Aadhar:</strong> {data.profile.aadhar}</p>
                <p className="col-span-2"><strong>Address:</strong> {data.profile.address}</p>
                <p className="col-span-2"><strong>Previous Medical Problems:</strong> {data.profile.prev_problem}</p>
                <p className="col-span-2"><strong>Current Medical Problems:</strong> {data.profile.curr_problem}</p>
              </div>
            </section>
            <section id="family" className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Family Members</h5>
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
                  {data.family_members.map(member => (
                    <tr key={member.id} className="odd:bg-gray-50">
                      <td className="p-3">{member.first_name} {member.last_name}</td>
                      <td className="p-3">{member.age}</td>
                      <td className="p-3">{member.gender}</td>
                      <td className="p-3">
                        <button onClick={() => navigate(`/edit_family_member/${member.id}`)} className="text-blue-600 hover:underline mr-2">Edit</button>
                        <button onClick={() => handleDeleteMember(member.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section id="appointments" className="bg-white rounded-lg shadow-md mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-lg">Appointments</h5>
                <button onClick={() => navigate('/book_appointment')} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm">Book Appointment</button>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Member</th>
                    <th className="p-3 text-left">Doctor</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.map(apt => (
                    <tr key={apt.id} className="odd:bg-gray-50">
                      <td className="p-3">{apt.member_name}</td>
                      <td className="p-3">{apt.doctor_name}</td>
                      <td className="p-3">{apt.date}</td>
                      <td className="p-3">{apt.time}</td>
                      <td className="p-3">{apt.status}</td>
                      <td className="p-3">
                        <a href={`/view_appointment/${apt.id}`} className="text-blue-600 hover:underline mr-2">View</a>
                        {apt.status === 'Scheduled' && (
                          <>
                            <a href={`/reschedule_appointment/${apt.id}`} className="text-blue-600 hover:underline mr-2">Reschedule</a>
                            <button onClick={() => handleCancelAppointment(apt.id)} className="text-red-600 hover:underline">Cancel</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section id="medical" className="bg-white rounded-lg shadow-md mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-lg">Medical Records</h5>
                <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm">Upload Record</button>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Member</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">File</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medical_records.map(record => (
                    <tr key={record.id} className="odd:bg-gray-50">
                      <td className="p-3">{record.member_name}</td>
                      <td className="p-3">{record.record_type}</td>
                      <td className="p-3">{record.record_date}</td>
                      <td className="p-3">{record.description}</td>
                      <td className="p-3">
                        {record.file_path && <a href={record.file_path} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">View</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section id="billing" className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Billing</h5>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Bill ID</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bills.map(bill => (
                    <tr key={bill.id} className="odd:bg-gray-50">
                      <td className="p-3">{bill.id}</td>
                      <td className="p-3">{bill.amount}</td>
                      <td className="p-3">{bill.status}</td>
                      <td className="p-3">{bill.date}</td>
                      <td className="p-3">
                        {bill.status === 'Pending' && (
                          <button onClick={() => handlePayBill(bill.id)} className="text-blue-600 hover:underline">Pay Now</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <h3 className="text-lg font-bold mb-4">Upload Medical Record</h3>
          <form onSubmit={handleUploadSubmit}>
            <div className="mb-4">
              <select name="member_id" onChange={handleUploadChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" required>
                <option value="">Select Family Member</option>
                {data.family_members.map(member => (
                  <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <input name="record_type" onChange={handleUploadChange} placeholder="Record Type" className="w-full p-3 rounded-lg border border-gray-300 outline-none" required />
            </div>
            <div className="mb-4">
              <input name="record_date" type="date" value={formData.record_date} onChange={handleUploadChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" required />
            </div>
            <div className="mb-4">
              <textarea name="description" onChange={handleUploadChange} placeholder="Description" className="w-full p-3 rounded-lg border border-gray-300 outline-none" />
            </div>
            <div className="mb-4">
              <input name="record_file" type="file" onChange={handleUploadChange} className="w-full p-3 rounded-lg border border-gray-300 outline-none" />
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Upload</button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default PatientDashboard;