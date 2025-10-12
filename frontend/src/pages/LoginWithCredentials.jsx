// // src/pages/LoginWithCredentials.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { loginWithCredentials } from '../services/api';

// const LoginWithCredentials = () => {
//   const [identifier, setIdentifier] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     if (location.state?.message) {
//       setMessage(location.state.message);
//       setTimeout(() => setMessage(''), 5000);
//     }
//   }, [location]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await loginWithCredentials({ identifier, password });
//       if (res.success) {
//         navigateToDashboard(res.user_type);
//       }
//     } catch (err) {
//       setError(err.message || 'Login failed');
//     }
//   };

//   const navigateToDashboard = (userType) => {
//     if (userType === 'patient') navigate('/patient_dashboard');
//     else if (userType === 'doctor') navigate('/doctor_dashboard');
//     else if (userType === 'front_office') navigate('/front_office_dashboard');
//     else if (userType === 'admin') navigate('/admin/dashboard');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="max-w-4xl w-full flex bg-white shadow-lg rounded-lg overflow-hidden">
//         <div className="hidden md:flex flex-col justify-center w-1/2 bg-blue-50 p-10">
//           <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to HealthCare Portal</h1>
//           <p className="text-gray-600 mb-6">Secure login with your email and password.</p>
//         </div>
//         <div className="w-full md:w-1/2 p-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-6">Login with Email</h2>
//           {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
//           {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-gray-600 mb-1">Email</label>
//               <input
//                 type="email"
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value)}
//                 placeholder="Enter your email"
//                 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-gray-600 mb-1">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
//             >
//               Sign in
//             </button>
//           </form>
//           <div className="mt-4 text-center">
//             <p className="text-sm text-gray-600">
//               Prefer Family ID login? <a href="/login-with-uid" className="text-blue-600 hover:underline">Login with UID</a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginWithCredentials;