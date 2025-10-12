import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorDashboardData } from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

const DoctorDashboard = () => {
  const [data, setData] = useState({
    profile: {}, 
    upcoming_appointments: [], 
    recent_records: [], 
    stats: { 
      total_appointments: 18, 
      patients_today: 4, 
      prescriptions_issued: 0 
    }
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
      
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        {error && (
          <div className="container mx-auto">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
              {error}
            </div>
          </div>
        )}
        
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5">
                  <h2 className="font-bold text-lg">Doctor Dashboard</h2>
                  <p className="text-blue-100 text-sm mt-1">Welcome back, Doctor</p>
                </div>
                <ul className="divide-y divide-gray-100">
                  <li>
                    <a href="/doctor_appointments" className="flex items-center p-4 hover:bg-blue-50 text-gray-700 transition-colors duration-150">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Appointments
                    </a>
                  </li>
                  <li>
                    <a href="/doctor_patients" className="flex items-center p-4 hover:bg-blue-50 text-gray-700 transition-colors duration-150">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                      Patients
                    </a>
                  </li>
                  <li>
                    <a href="/doctor_medical_records" className="flex items-center p-4 hover:bg-blue-50 text-gray-700 transition-colors duration-150">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Medical Records
                    </a>
                  </li>
                  <li>
                    <a href="/doctor_prescriptions" className="flex items-center p-4 hover:bg-blue-50 text-gray-700 transition-colors duration-150">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Prescriptions
                    </a>
                  </li>
                  <li>
                    <a href="/doctor_schedule" className="flex items-center p-4 hover:bg-blue-50 text-gray-700 transition-colors duration-150">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      Schedule
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Stats Overview */}
              <section className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                <h2 className="font-bold text-xl text-gray-800 mb-6">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Appointments</p>
                        <p className="text-2xl font-bold text-gray-800">{data.stats.total_appointments}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Patients Today</p>
                        <p className="text-2xl font-bold text-gray-800">{data.stats.patients_today}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prescriptions Issued</p>
                        <p className="text-2xl font-bold text-gray-800">{data.stats.prescriptions_issued}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl text-gray-800">Upcoming Appointments</h2>
                    <a href="/doctor_appointments" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View All
                    </a>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Patient</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Time</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.upcoming_appointments.map((apt, index) => (
                          <tr key={apt.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                                  {apt.patient_name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-800">{apt.patient_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-gray-600">{apt.date}</td>
                            <td className="py-3 px-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {apt.time}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <a 
                                href={`/doctor_view_patient/${apt.patient_id}`} 
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                              >
                                View
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {data.upcoming_appointments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="mt-2">No upcoming appointments</p>
                    </div>
                  )}
                </section>
                
                {/* Recent Medical Records */}
                <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl text-gray-800">Recent Medical Records</h2>
                    <a href="/doctor_medical_records" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View All
                    </a>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Patient</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recent_records.map((record, index) => (
                          <tr key={record.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium mr-3">
                                  {record.patient_name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-800">{record.patient_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                {record.record_type}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-gray-600">{record.record_date}</td>
                            <td className="py-3 px-2 text-gray-600">
                              {record.description || (
                                <span className="text-gray-400 italic">No description</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {data.recent_records.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="mt-2">No recent medical records</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;