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
//         console.log('API Response:', res); // Log the full response
//         setData(res);
//         console.log('Updated State:', data); // Log the state after update
//       } catch (err) {
//         console.error('Error fetching data:', err); // Log any errors
//         setError(err.message || 'Failed to fetch dashboard data');
//       }
//     };
//     fetchData();
//   }, []);

//   // Stats cards data with gradient colors
//   const stats = [
//     { 
//       title: "Total Check-ins", 
//       value: data.pending_checkins, 
//       color: "from-purple-500 to-indigo-600",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       )
//     },
//     { 
//       title: "Pending Appointments", 
//       value: data.scheduled_today, 
//       color: "from-cyan-500 to-blue-600",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//         </svg>
//       )
//     },
//     { 
//       title: "Payments Today", 
//       value: data.todays_collections, 
//       color: "from-emerald-500 to-teal-600",
//       icon: (
//         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
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
//       <Navbar isDashboard={true} userName="Front Office" userType="front_office" />
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-20 px-4">
//         {error && (
//           <div className="container mx-auto">
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
//               {error}
//             </div>
//           </div>
//         )}
        
//         <div className="container mx-auto flex flex-col lg:flex-row gap-6">
//           {/* Sidebar - Updated Design */}
//           <div className="lg:w-1/4">
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//               <div className="bg-gradient-to-r from-slate-800 to-gray-900 text-white p-6">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h2 className="font-bold text-lg">Front Office</h2>
//                     <p className="text-gray-300 text-sm">Dashboard</p>
//                   </div>
//                 </div>
//               </div>
//               <ul className="divide-y divide-gray-100">
//                 <li>
//                   <a 
//                     href="/front_office_checkins" 
//                     className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
//                   >
//                     <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </div>
//                     Check-ins
//                   </a>
//                 </li>
//                 <li>
//                   <a 
//                     href="/front_office_appointments" 
//                     className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
//                   >
//                     <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-green-100 text-green-600">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                     </div>
//                     Appointments
//                   </a>
//                 </li>
//                 <li>
//                   <a 
//                     href="/front_office_patient" 
//                     className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
//                   >
//                     <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-purple-100 text-purple-600">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                       </svg>
//                     </div>
//                     Patients
//                   </a>
//                 </li>
//                 <li>
//                   <a 
//                     href="/front_office_payments" 
//                     className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
//                   >
//                     <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-yellow-100 text-yellow-600">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </div>
//                     Payments
//                   </a>
//                 </li>
//                 <li>
//                   <a 
//                     href="/front_office_reports" 
//                     className="w-full text-left p-4 flex items-center transition-all duration-200 hover:bg-gray-50 text-gray-700"
//                   >
//                     <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-red-100 text-red-600">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                     </div>
//                     Reports
//                   </a>
//                 </li>
//               </ul>
//             </div>
//           </div>
          
//           {/* Main Content */}
//           <div className="lg:w-3/4">
//             {/* Stats Overview - New Section */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               {stats.map((stat, index) => (
//                 <div key={index} className={`bg-gradient-to-r ${stat.color} text-white rounded-xl p-4 shadow-sm`}>
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-white text-opacity-80 text-sm">{stat.title}</p>
//                       <p className="text-2xl font-bold mt-1">{stat.value}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
//                       {stat.icon}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             {/* Today's Appointments Section */}
//             <section className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
//                 <h2 className="font-bold text-2xl text-gray-800 mb-4 sm:mb-0">Today's Appointments</h2>
//                 <button 
//                   onClick={() => navigate('/front_office_appointments')} 
//                   className="bg-gradient-to-r from-slate-700 to-gray-800 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm flex items-center"
//                 >
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                   </svg>
//                   View All
//                 </button>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gradient-to-r from-slate-700 to-gray-800 text-white">
//                       <th className="p-4 text-left rounded-tl-lg">Patient</th>
//                       <th className="p-4 text-left">Doctor</th>
//                       <th className="p-4 text-left">Date</th> {/* Updated header */}
//                       <th className="p-4 text-left">Time</th>
//                       <th className="p-4 text-left rounded-tr-lg">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data.today_appointments?.map((apt, index) => (
//                       <tr 
//                         key={apt.id} 
//                         className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b border-gray-100`}
//                       >
//                         <td className="p-4 font-medium text-gray-800">{apt.patient_name}</td>
//                         <td className="p-4 text-gray-700">{apt.doctor}</td>
//                         <td className="p-4 text-gray-700">{apt.date}</td> {/* Display date */}
//                         <td className="p-4 text-gray-700">{apt.time}</td>
//                         <td className="p-4">
//                           {getStatusBadge(apt.status)}
//                         </td>
//                       </tr>
//                     ))}
//                     {(!data.today_appointments || data.today_appointments.length === 0) && (
//                       <tr>
//                         <td colSpan="5" className="p-4 text-center text-gray-500">
//                           No appointments scheduled for today
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </section>
            
//             {/* Recent Registrations Section */}
//             {/* Recent Registrations Section */}
// <section className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
//   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
//     <h2 className="font-bold text-2xl text-gray-800 mb-4 sm:mb-0">Recent Registrations</h2>
//     <div className="flex space-x-3">
//       <button 
//         onClick={() => navigate('/front_office_register')} 
//         className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm flex items-center"
//       >
//         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//         </svg>
//         New Registration
//       </button>
//       <button 
//         onClick={() => navigate('/front_office_patient')} 
//         className="bg-gradient-to-r from-slate-700 to-gray-800 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm flex items-center"
//       >
//         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//         </svg>
//         View All
//       </button>
//     </div>
//   </div>
//   <div className="overflow-x-auto">
//     <table className="w-full border-collapse">
//       <thead>
//         <tr className="bg-gradient-to-r from-slate-700 to-gray-800 text-white">
//           <th className="p-4 text-left rounded-tl-lg">Patient</th>
//           <th className="p-4 text-left">Phone</th>
//           <th className="p-4 text-left">Registration Date</th>
//           <th className="p-4 text-left rounded-tr-lg">Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.recent_registrations?.map((reg, index) => (
//           <tr 
//             key={reg.phone} 
//             className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 border-b border-gray-100`}
//           >
//             <td className="p-4 font-medium text-gray-800">{reg.name}</td>
//             <td className="p-4 text-gray-700">{reg.phone}</td>
//             <td className="p-4 text-gray-700">{reg.registration_date}</td>
//             <td className="p-4">
//               {getStatusBadge(reg.status)}
//             </td>
//           </tr>
//         ))}
//         {(!data.recent_registrations || data.recent_registrations.length === 0) && (
//           <tr>
//             <td colSpan="4" className="p-4 text-center text-gray-500">
//               No recent registrations
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// </section>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FrontOfficeDashboard;

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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getFrontOfficeDashboardData } from '../services/api';
import FrontOfficeSidebar from '../components/FrontOfficeSidebar.jsx';
import { Menu, LogOut, UserPlus, Users } from 'lucide-react';

const FrontOfficeDashboard = () => {
  debugger
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
  const [chartData, setChartData] = useState([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/front_office_dashboard');
  
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  useEffect(() => {
    debugger
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getFrontOfficeDashboardData();
        setData(res);
        
        generateChartData(res);
        generateAppointmentStatusData(res.today_appointments);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateChartData = (apiData) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();

    const chartData = last7Days.map((day, index) => ({
      name: day,
      checkins: Math.floor(apiData.pending_checkins * (0.8 + Math.random() * 0.4) / 7 * (7 - index)),
      appointments: Math.floor(apiData.scheduled_today * (0.7 + Math.random() * 0.6) / 7 * (7 - index)),
      payments: Math.floor(apiData.todays_collections * (0.6 + Math.random() * 0.8) / 7 * (7 - index))
    }));

    setChartData(chartData);
  };

  const generateAppointmentStatusData = (appointments) => {
    if (!appointments || appointments.length === 0) {
      setAppointmentStatusData([
        { name: 'Scheduled', value: 0 },
        { name: 'Completed', value: 0 },
        { name: 'Cancelled', value: 0 }
      ]);
      return;
    }

    const statusCount = appointments.reduce((acc, appointment) => {
      const status = appointment.status?.toLowerCase() || 'scheduled';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = [
      { name: 'Scheduled', value: statusCount.scheduled || 0 },
      { name: 'Completed', value: statusCount.completed || 0 },
      { name: 'Cancelled', value: statusCount.cancelled || 0 }
    ].filter(item => item.value > 0);

    setAppointmentStatusData(statusData);
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Chart colors
  const BAR_CHART_COLORS = {
    checkins: '#3B82F6',
    appointments: '#10B981',
    payments: '#8B5CF6'
  };

  const PIE_CHART_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'];

  const stats = [
    { 
      title: "Pending Check-ins", 
      value: data.pending_checkins, 
      description: "Awaiting check-in today",
      change: "+12%",
      changeType: "positive",
      color: "from-blue-500 to-blue-600",
      icon: Users
    },
    { 
      title: "Today's Appointments", 
      value: data.scheduled_today, 
      description: "Scheduled for today",
      change: "+5%",
      changeType: "positive",
      color: "from-green-500 to-green-600",
      icon: UserPlus
    },
    //data.todays_collections 
    { 
      title: "Today's Collections", 
      value: `$${data.todays_collections || 0}`, // NEW - uses actual API data
      description: "Total collections today",
      change: "+18%",
      changeType: "positive",
      color: "from-purple-500 to-purple-600",
      icon: Users
    },
    { 
      title: "New Registrations", 
      value: data.total_patients_today || 0,
      description: "Registered today",
      change: "+8%",
      changeType: "positive",
      color: "from-orange-500 to-orange-600",
      icon: UserPlus
    }
  ];

  const getStatusBadge = (status) => {
    let badgeClass = '';
    switch(status?.toLowerCase()) {
      case 'active':
      case 'scheduled':
        badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        break;
      case 'completed':
        badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        break;
      case 'pending':
        badgeClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        break;
      case 'cancelled':
        badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {status}
      </span>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'payments' ? `$${entry.value}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="flex">
          <FrontOfficeSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            isDark={isDark}
            onThemeToggle={() => setIsDark(!isDark)}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="flex">
        {/* Front Office Sidebar */}
        <FrontOfficeSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors duration-300`}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-md ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} lg:hidden transition-colors duration-200`}
                >
                  <Menu size={24} />
                </button>
                <h1 className={`text-xl font-semibold ml-4 lg:ml-0 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Front Office Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200`}
                >
                  {isDark ? '🌙' : '☀'}
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  } transition-colors duration-200`}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
              >
                {error}
              </motion.div>
            )}
            
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="rounded-2xl p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Front Office!</h1>
                    <p className="text-green-100 opacity-90">
                      Manage patient check-ins, appointments, and billing efficiently.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <p className="text-sm font-medium">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    variants={itemVariants}
                    className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-green-500`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold mt-2 text-green-600">
                          {stat.value}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                        <IconComponent size={24} className="text-green-600" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Charts Section */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart - Activity Overview */}
              {/* <motion.div
                variants={itemVariants}
                className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}
              >
                <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Activity Overview (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
                    <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#666"} />
                    <YAxis stroke={isDark ? "#9CA3AF" : "#666"} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="checkins" fill={BAR_CHART_COLORS.checkins} name="Check-ins" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="appointments" fill={BAR_CHART_COLORS.appointments} name="Appointments" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="payments" fill={BAR_CHART_COLORS.payments} name="Payments ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div> */} 

              {/* Pie Chart - Appointment Status */}
              {/* <motion.div
                variants={itemVariants}
                className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}
              >
                <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Appointment Status Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div> */}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Appointments Section */}
              <motion.section
                variants={itemVariants}
                className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Today's Appointments
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {data.today_appointments?.length || 0} scheduled
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  {data.today_appointments?.length > 0 ? (
                    <div className="space-y-4">
                      {data.today_appointments.map((appointment, index) => (
                        <div key={appointment.id || index} 
                             className={`p-4 rounded-lg border ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}>
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isDark ? 'bg-blue-600' : 'bg-blue-100'
                                }`}>
                                  <Users size={20} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </div>
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {appointment.patient_name}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Dr. {appointment.doctor}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(appointment.status)}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Time: <span className={isDark ? 'text-white' : 'text-gray-900'}>{appointment.time}</span>
                                </p>
                              </div>
                              <div>
                                <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Date: <span className={isDark ? 'text-white' : 'text-gray-900'}>{appointment.date}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No appointments for today</p>
                      <p className="mt-2">Scheduled appointments will appear here</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate('/front_office_appointments')}
                    className={`w-full mt-4 py-2 rounded-lg border-2 border-dashed ${
                      isDark 
                        ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                    } transition-colors duration-200`}
                  >
                    View All Appointments
                  </button>
                </div>
              </motion.section>

              {/* Recent Registrations Section */}
              <motion.section
                variants={itemVariants}
                className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300 overflow-hidden`}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Recent Registrations
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        {data.recent_registrations?.length || 0} new
                      </span>
                      <button
                        onClick={() => navigate('/front_office_register')}
                        className={`px-4 py-2 rounded-lg ${
                          isDark 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        } transition-colors duration-200 text-sm font-medium flex items-center space-x-2`}
                      >
                        <UserPlus size={16} />
                        <span>New Registration</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {data.recent_registrations?.length > 0 ? (
                    <div className="space-y-4">
                      {data.recent_registrations.map((patient, index) => (
                        <div key={patient.phone || index} className={`p-4 rounded-lg border ${
                          isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-green-600' : 'bg-green-100'
                              }`}>
                                <UserPlus size={20} className={isDark ? 'text-white' : 'text-green-600'} />
                              </div>
                              <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {patient.name}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {patient.phone} • {patient.email || 'No email'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {patient.registration_date || 'Today'}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
                              }`}>
                                Patient
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No recent registrations</p>
                      <p className="mt-2">New patient registrations will appear here</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate('/front_office_patient')}
                    className={`w-full mt-4 py-2 rounded-lg border-2 border-dashed ${
                      isDark 
                        ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                    } transition-colors duration-200`}
                  >
                    View All Patients
                  </button>
                </div>
              </motion.section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FrontOfficeDashboard;