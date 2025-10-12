import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorDashboardData } from '../services/api';
import Navbar from '../components/Navbar';

const DoctorDashboard = () => {
  debugger
  const [data, setData] = useState({
    profile: {}, 
    upcoming_appointments: [], 
    recent_records: [], 
    stats: { 
      total_appointments: 22, 
      patients_today: 0, 
      prescriptions_issued: 0,
      pending_tasks: 0
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

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <Navbar isDashboard={true} userName={data.profile.name || 'Doctor'} userType="doctor" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section - Exact match with first image */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-600 text-lg">
                Welcome back, <span className="font-semibold text-blue-600">Dr. {data.profile.name || 'Doctor'}</span>
              </p>
              <p className="text-gray-500 text-sm mt-2 sm:mt-0">{currentDate}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Exact structure as first image */}
            <div className="w-full lg:w-80 flex-shrink-0">
              {/* Profile Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Profile</h3>
                <div className="space-y-3">
                  <a href="/doctor_appointments" className="block p-3 hover:bg-blue-50 rounded-lg transition-colors text-gray-700">
                    Appointments
                  </a>
                  <a href="/doctor_patients" className="block p-3 hover:bg-blue-50 rounded-lg transition-colors text-gray-700">
                    Patients
                  </a>
                  <a href="/doctor_medical_records" className="block p-3 hover:bg-blue-50 rounded-lg transition-colors text-gray-700">
                    Medical Records
                  </a>
                  <a href="/doctor_prescriptions" className="block p-3 hover:bg-blue-50 rounded-lg transition-colors text-gray-700">
                    Prescriptions
                  </a>
                  <a href="/doctor_schedule" className="block p-3 hover:bg-blue-50 rounded-lg transition-colors text-gray-700">
                    Schedule
                  </a>
                </div>
              </div>

              {/* Stats Section - Matching first image structure */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.stats.total_appointments}</div>
                    <div className="text-sm text-gray-600">Total Appointments</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.stats.patients_today}</div>
                    <div className="text-sm text-gray-600">Patients Today</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{data.stats.prescriptions_issued}</div>
                    <div className="text-sm text-gray-600">Prescriptions</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area - Exact structure as first image */}
            <div className="flex-1">
              {/* Metrics Grid - Matching first image layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Appointments Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Total Appointments</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{data.stats.total_appointments}</div>
                  <div className="flex items-center text-sm text-green-600">
                    <span>25% ↑</span>
                  </div>
                </div>

                {/* Patients Today Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Patients Today</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{data.stats.patients_today}</div>
                  <div className="flex items-center text-sm text-green-600">
                    <span>18% ↑</span>
                  </div>
                </div>

                {/* Prescriptions Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Prescriptions</h3>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{data.stats.prescriptions_issued}</div>
                  <div className="flex items-center text-sm text-green-600">
                    <span>32% ↑</span>
                  </div>
                </div>

                {/* Pending Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Pending Tasks</h3>
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{data.stats.pending_tasks}</div>
                  <div className="flex items-center text-sm text-red-600">
                    <span>0% ↓</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Upcoming Appointments - Matching first image style */}
                <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl text-gray-800">Upcoming Appointments</h2>
                    <a href="/doctor_appointments" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View All
                    </a>
                  </div>
                  
                  {data.upcoming_appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="text-lg font-medium text-gray-600">No upcoming appointments</p>
                      <p className="text-gray-500 mt-1">All appointments are completed for now</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.upcoming_appointments.map((apt) => (
                        <div key={apt.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">Dr. {apt.patient_name}</h3>
                            <span className="text-sm text-gray-500">{apt.date}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">Consultation</p>
                          <p className="text-gray-500 text-sm mb-3">{apt.date} at {apt.time}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Scheduled</span>
                            <a 
                              href={`/doctor_view_patient/${apt.patient_id}`} 
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                
                {/* Recent Medical Records - Matching first image style */}
                <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl text-gray-800">Recent Medical Records</h2>
                    <a href="/doctor_medical_records" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View All
                    </a>
                  </div>
                  
                  <div className="space-y-4">
                    {data.recent_records.map((record) => (
                      <div key={record.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{record.patient_name}</h3>
                          <span className="text-sm text-gray-500">{record.record_date}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {record.description || 'No description'}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 capitalize">{record.record_type}</span>
                          <span className="text-sm text-blue-600 font-medium">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Recent Activity Section */}
              <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-8">
                <h2 className="font-bold text-xl text-gray-800 mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {data.recent_records.slice(0, 3).map((record, index) => (
                    <div key={`activity-${record.id}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-800">
                          Medical record added for <span className="font-medium">{record.patient_name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.record_type} - {record.record_date}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{record.record_date}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;