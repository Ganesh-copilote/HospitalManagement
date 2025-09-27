import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeDashboardData } from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

const FrontOfficeDashboard = () => {
  const [data, setData] = useState({
    stats: { total_checkins: 0, pending_appointments: 0, payments_today: 0 }, recent_checkins: [], recent_appointments: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFrontOfficeDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userName="Front Office" userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="bg-blue-500 text-white p-4 rounded-t-lg">
                <h5 className="font-bold">Front Office Dashboard</h5>
              </div>
              <ul className="divide-y divide-gray-200">
                <li><a href="/front_office_checkins" className="block p-4 hover:bg-gray-100">Check-ins</a></li>
                <li><a href="/front_office_appointments" className="block p-4 hover:bg-gray-100">Appointments</a></li>
                <li><a href="/front_office_patients" className="block p-4 hover:bg-gray-100">Patients</a></li>
                <li><a href="/front_office_payments" className="block p-4 hover:bg-gray-100">Payments</a></li>
                <li><a href="/front_office_reports" className="block p-4 hover:bg-gray-100">Reports</a></li>
              </ul>
            </div>
          </div>
          <div className="col-span-3">
            <section className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Overview</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Check-ins" value={data.stats.total_checkins} icon="bi bi-check-circle" />
                <StatCard title="Pending Appointments" value={data.stats.pending_appointments} icon="bi bi-calendar" />
                <StatCard title="Payments Today" value={data.stats.payments_today} icon="bi bi-currency-dollar" />
              </div>
            </section>
            <section className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Recent Check-ins</h5>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_checkins.map(checkin => (
                    <tr key={checkin.id} className="odd:bg-gray-50">
                      <td className="p-3">{checkin.patient_name}</td>
                      <td className="p-3">{checkin.date}</td>
                      <td className="p-3">{checkin.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h5 className="font-bold text-lg mb-4">Recent Appointments</h5>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Doctor</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_appointments.map(apt => (
                    <tr key={apt.id} className="odd:bg-gray-50">
                      <td className="p-3">{apt.patient_name}</td>
                      <td className="p-3">{apt.doctor_name}</td>
                      <td className="p-3">{apt.date}</td>
                      <td className="p-3">{apt.time}</td>
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

export default FrontOfficeDashboard;