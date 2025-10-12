import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeDashboardData } from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

const FrontOfficeDashboard = () => {
  const [data, setData] = useState({
    front_office: {},
    scheduled_today: 0,
    pending_checkins: 0,
    total_patients_today: 0,
    todays_collections: 0,
    pending_payments: 0,
    insurance_claims: 0,
    today_appointments: [],
    recent_registrations: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const res = await getFrontOfficeDashboardData();
        console.log('API Response:', res); // Log the full response
        setData(res);
        console.log('Updated State:', data); // Log the state after update
      } catch (err) {
        console.error('Error fetching data:', err); // Log any errors
        setError(err.message || 'Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, []);

  // Stats cards data with gradient colors
  const stats = [
    { 
      title: "Total Check-ins", 
      value: data.pending_checkins, 
      color: "from-purple-500 to-indigo-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: "Pending Appointments", 
      value: data.scheduled_today, 
      color: "from-cyan-500 to-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      title: "Payments Today", 
      value: data.todays_collections, 
      color: "from-emerald-500 to-teal-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const getStatusBadge = (status) => {
    let badgeClass = '';
    switch(status?.toLowerCase()) {
      case 'active':
      case 'scheduled':
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case 'completed':
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case 'pending':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'cancelled':
        badgeClass = 'bg-red-100 text-red-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Navbar isDashboard={true} userName="Front Office" userType="front_office" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-20 px-4">
        {error && (
          <div className="container mx-auto">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
              {error}
            </div>
          </div>
        )}
        
        <div className="container mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Updated Design */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-slate-800 to-gray-900 text-white p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Front Office</h2>
                    <p className="text-gray-300 text-sm">Dashboard</p>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-gray-100">
                <li>
                  <a 
                    href="/front_office_checkins" 
                    className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Check-ins
                  </a>
                </li>
                <li>
                  <a 
                    href="/front_office_appointments" 
                    className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-green-100 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Appointments
                  </a>
                </li>
                <li>
                  <a 
                    href="/front_office_patient" 
                    className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-purple-100 text-purple-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Patients
                  </a>
                </li>
                <li>
                  <a 
                    href="/front_office_payments" 
                    className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-yellow-100 text-yellow-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Payments
                  </a>
                </li>
                <li>
                  <a 
                    href="/front_office_reports" 
                    className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-red-100 text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Reports
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Stats Overview - New Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className={`bg-gradient-to-r ${stat.color} text-white rounded-xl p-4 shadow-sm`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white text-opacity-80 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Today's Appointments Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="font-bold text-2xl text-gray-800 mb-4 sm:mb-0">Today's Appointments</h2>
                <button 
                  onClick={() => navigate('/front_office_appointments')} 
                  className="bg-gradient-to-r from-slate-700 to-gray-800 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-700 to-gray-800 text-white">
                      <th className="p-4 text-left rounded-tl-lg">Patient</th>
                      <th className="p-4 text-left">Doctor</th>
                      <th className="p-4 text-left">Date</th> {/* Updated header */}
                      <th className="p-4 text-left">Time</th>
                      <th className="p-4 text-left rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.today_appointments?.map((apt, index) => (
                      <tr 
                        key={apt.id} 
                        className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b border-gray-100`}
                      >
                        <td className="p-4 font-medium text-gray-800">{apt.patient_name}</td>
                        <td className="p-4 text-gray-700">{apt.doctor}</td>
                        <td className="p-4 text-gray-700">{apt.date}</td> {/* Display date */}
                        <td className="p-4 text-gray-700">{apt.time}</td>
                        <td className="p-4">
                          {getStatusBadge(apt.status)}
                        </td>
                      </tr>
                    ))}
                    {(!data.today_appointments || data.today_appointments.length === 0) && (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-500">
                          No appointments scheduled for today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* Recent Registrations Section */}
            {/* Recent Registrations Section */}
<section className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <h2 className="font-bold text-2xl text-gray-800 mb-4 sm:mb-0">Recent Registrations</h2>
    <div className="flex space-x-3">
      <button 
        onClick={() => navigate('/front_office_register')} 
        className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Registration
      </button>
      <button 
        onClick={() => navigate('/front_office_patient')} 
        className="bg-gradient-to-r from-slate-700 to-gray-800 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        View All
      </button>
    </div>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-slate-700 to-gray-800 text-white">
          <th className="p-4 text-left rounded-tl-lg">Patient</th>
          <th className="p-4 text-left">Phone</th>
          <th className="p-4 text-left">Registration Date</th>
          <th className="p-4 text-left rounded-tr-lg">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.recent_registrations?.map((reg, index) => (
          <tr 
            key={reg.phone} 
            className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b border-gray-100`}
          >
            <td className="p-4 font-medium text-gray-800">{reg.name}</td>
            <td className="p-4 text-gray-700">{reg.phone}</td>
            <td className="p-4 text-gray-700">{reg.registration_date}</td>
            <td className="p-4">
              {getStatusBadge(reg.status)}
            </td>
          </tr>
        ))}
        {(!data.recent_registrations || data.recent_registrations.length === 0) && (
          <tr>
            <td colSpan="4" className="p-4 text-center text-gray-500">
              No recent registrations
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontOfficeDashboard;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getFrontOfficeDashboardData } from '../services/api';
// import Navbar from '../components/Navbar';
// import StatCard from '../components/StatCard';

// const FrontOfficeDashboard = () => {
//   const [data, setData] = useState({
//     front_office: {},
//     scheduled_today: 0,
//     pending_checkins: 0,
//     total_patients_today: 0,
//     todays_collections: 0,
//     pending_payments: 0,
//     insurance_claims: 0,
//     today_appointments: [],
//     recent_registrations: []
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         console.log('Fetching data...');
//         const res = await getFrontOfficeDashboardData();
//         console.log('API Response:', res);
//         setData(res);
//         console.log('Updated State:', data);
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError(err.message || 'Failed to fetch dashboard data');
//       }
//     };
//     fetchData();
//   }, []);

//   // Updated stats cards with new theme
//   const stats = [
//     { 
//       title: "Total Check-ins", 
//       value: data.pending_checkins, 
//       color: "from-blue-500 to-blue-600",
//       bgColor: "bg-blue-50",
//       icon: (
//         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
//           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         </div>
//       )
//     },
//     { 
//       title: "Pending Appointments", 
//       value: data.scheduled_today, 
//       color: "from-green-500 to-green-600",
//       bgColor: "bg-green-50",
//       icon: (
//         <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
//           <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//         </div>
//       )
//     },
//     { 
//       title: "Payments Today", 
//       value: `$${data.todays_collections}`, 
//       color: "from-purple-500 to-purple-600",
//       bgColor: "bg-purple-50",
//       icon: (
//         <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
//           <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         </div>
//       )
//     }
//   ];

//   const getStatusBadge = (status) => {
//     let badgeClass = '';
//     switch(status?.toLowerCase()) {
//       case 'active':
//       case 'scheduled':
//         badgeClass = 'bg-blue-100 text-blue-800';
//         break;
//       case 'completed':
//         badgeClass = 'bg-green-100 text-green-800';
//         break;
//       case 'pending':
//         badgeClass = 'bg-yellow-100 text-yellow-800';
//         break;
//       case 'cancelled':
//         badgeClass = 'bg-red-100 text-red-800';
//         break;
//       default:
//         badgeClass = 'bg-gray-100 text-gray-800';
//     }
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
//         {status}
//       </span>
//     );
//   };

//   return (
//     <>
//       <Navbar isDashboard={true} userName="Alexandro" userType="front_office" />
//       <div className="min-h-screen bg-gray-50 pt-20">
//         {/* Header Section */}
//         <div className="bg-white border-b border-gray-200">
//           <div className="container mx-auto px-6 py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Welcome back, Alexandro</h1>
//             <p className="text-gray-600 mt-1">There is the latest update for the last 7 days. Check now</p>
//           </div>
//         </div>

//         <div className="container mx-auto px-6 py-6">
//           {error && (
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
//               {error}
//             </div>
//           )}
          
//           <div className="flex flex-col lg:flex-row gap-6">
//             {/* Sidebar - Updated to match first image style */}
//             <div className="lg:w-1/4">
//               <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="p-6 border-b border-gray-200">
//                   <h2 className="font-semibold text-lg text-gray-900">Overview</h2>
//                 </div>
//                 <ul className="divide-y divide-gray-100">
//                   <li>
//                     <a 
//                       href="/front_office_checkins" 
//                       className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
//                     >
//                       <div className="w-6 h-6 rounded flex items-center justify-center mr-3 text-gray-500">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       Check-ins
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="/front_office_appointments" 
//                       className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
//                     >
//                       <div className="w-6 h-6 rounded flex items-center justify-center mr-3 text-gray-500">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                       </div>
//                       Appointments
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="/front_office_patient" 
//                       className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
//                     >
//                       <div className="w-6 h-6 rounded flex items-center justify-center mr-3 text-gray-500">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                       </div>
//                       Patients
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="/front_office_payments" 
//                       className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
//                     >
//                       <div className="w-6 h-6 rounded flex items-center justify-center mr-3 text-gray-500">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       Payments
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="/front_office_reports" 
//                       className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
//                     >
//                       <div className="w-6 h-6 rounded flex items-center justify-center mr-3 text-gray-500">
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                       </div>
//                       Reports
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//             </div>
            
//             {/* Main Content */}
//             <div className="lg:w-3/4">
//               {/* Stats Overview - Updated to match first image */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                 {stats.map((stat, index) => (
//                   <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
//                         <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
//                         <p className="text-gray-500 text-xs mt-1">
//                           {stat.title === "Total Check-ins" && "Data obtained for the last 7 days"}
//                           {stat.title === "Pending Appointments" && "Increase in data by 500 inpatients"}
//                           {stat.title === "Payments Today" && "Visitor data obtained for the last 7 days"}
//                         </p>
//                       </div>
//                       {stat.icon}
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               {/* Today's Appointments Section */}
//               <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//                 <div className="p-6 border-b border-gray-200">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//                     <h2 className="font-semibold text-lg text-gray-900">Today's Appointments</h2>
//                     <button 
//                       onClick={() => navigate('/front_office_appointments')} 
//                       className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center text-sm mt-2 sm:mt-0"
//                     >
//                       View All
//                     </button>
//                   </div>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gray-50 border-b border-gray-200">
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Patient</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Doctor</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Date</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Time</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {data.today_appointments?.map((apt, index) => (
//                         <tr 
//                           key={apt.id} 
//                           className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 border-b border-gray-100`}
//                         >
//                           <td className="p-4 font-medium text-gray-900">{apt.patient_name}</td>
//                           <td className="p-4 text-gray-700">{apt.doctor}</td>
//                           <td className="p-4 text-gray-700">{apt.date}</td>
//                           <td className="p-4 text-gray-700">{apt.time}</td>
//                           <td className="p-4">
//                             {getStatusBadge(apt.status)}
//                           </td>
//                         </tr>
//                       ))}
//                       {(!data.today_appointments || data.today_appointments.length === 0) && (
//                         <tr>
//                           <td colSpan="5" className="p-4 text-center text-gray-500">
//                             No appointments scheduled for today
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
              
//               {/* Recent Registrations Section */}
//               <section className="bg-white rounded-lg shadow-sm border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//                     <h2 className="font-semibold text-lg text-gray-900">Recent Registrations</h2>
//                     <div className="flex space-x-2 mt-2 sm:mt-0">
//                       <button 
//                         onClick={() => navigate('/front_office_register')} 
//                         className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center text-sm"
//                       >
//                         New Registration
//                       </button>
//                       <button 
//                         onClick={() => navigate('/front_office_patient')} 
//                         className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center text-sm"
//                       >
//                         View All
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="bg-gray-50 border-b border-gray-200">
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Patient</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Phone</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Registration Date</th>
//                         <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {data.recent_registrations?.map((reg, index) => (
//                         <tr 
//                           key={reg.phone} 
//                           className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 border-b border-gray-100`}
//                         >
//                           <td className="p-4 font-medium text-gray-900">{reg.name}</td>
//                           <td className="p-4 text-gray-700">{reg.phone}</td>
//                           <td className="p-4 text-gray-700">{reg.registration_date}</td>
//                           <td className="p-4">
//                             {getStatusBadge(reg.status)}
//                           </td>
//                         </tr>
//                       ))}
//                       {(!data.recent_registrations || data.recent_registrations.length === 0) && (
//                         <tr>
//                           <td colSpan="4" className="p-4 text-center text-gray-500">
//                             No recent registrations
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FrontOfficeDashboard;