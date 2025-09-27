import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorDashboardData } from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

const DoctorDashboard = () => {
  const [data, setData] = useState({
    profile: {}, upcoming_appointments: [], recent_records: [], stats: { total_appointments: 0, patients_today: 0, prescriptions_issued: 0 }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDoctorDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userName={data.profile.name || 'Doctor'} userType="doctor" />
      <div className="container mx-auto pt-20 px-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="bg-blue-500 text-white p-4 rounded-t-lg">
                <h5 className="font-bold">Doctor Dashboard</h5>
              </div>
              <ul className="divide-y divide-gray-200">
                <li><a href="/doctor_appointments" className="block p-4 hover:bg-gray-100">Appointments</a></li>
                <li><a href="/doctor_patients" className="block p-4 hover:bg-gray-100">Patients</a></li>
                <li><a href="/doctor_medical_records" className="block p-4 hover:bg-gray-100">Medical Records</a></li>
                <li><a href="/doctor_prescriptions" className="block p-4 hover:bg-gray-100">Prescriptions</a></li>
                <li><a href="/doctor_schedule" className="block p-4 hover:bg-gray-100">Schedule</a></li>
              </ul>
            </div>
          </div>
          <div className="col-span-3">
            <section className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Overview</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Appointments" value={data.stats.total_appointments} icon="bi bi-calendar-check" />
                <StatCard title="Patients Today" value={data.stats.patients_today} icon="bi bi-person" />
                <StatCard title="Prescriptions Issued" value={data.stats.prescriptions_issued} icon="bi bi-prescription" />
              </div>
            </section>
            <section className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Upcoming Appointments</h5>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcoming_appointments.map(apt => (
                    <tr key={apt.id} className="odd:bg-gray-50">
                      <td className="p-3">{apt.patient_name}</td>
                      <td className="p-3">{apt.date}</td>
                      <td className="p-3">{apt.time}</td>
                      <td className="p-3">
                        <a href={`/doctor_view_patient/${apt.patient_id}`} className="text-blue-600 hover:underline">View Patient</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Recent Medical Records</h5>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_records.map(record => (
                    <tr key={record.id} className="odd:bg-gray-50">
                      <td className="p-3">{record.patient_name}</td>
                      <td className="p-3">{record.record_type}</td>
                      <td className="p-3">{record.record_date}</td>
                      <td className="p-3">{record.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;