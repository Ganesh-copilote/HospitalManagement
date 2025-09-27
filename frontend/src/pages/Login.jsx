import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const [familyId, setFamilyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    debugger;
    e.preventDefault();
    try {
      const res = await login({ family_id: familyId });
      if (res.success) {
        if (res.user_type === 'patient') {
          navigate('/patient_dashboard');
        } else if (res.user_type === 'doctor') {
          navigate('/doctor_dashboard');
        } else if (res.user_type === 'front_office') {
          navigate('/front_office_dashboard');
        } else if (res.user_type === 'admin') {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-6">
          <h2 className="text-2xl font-bold">Login to Your Account</h2>
        </div>
        <div className="p-8">
          {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300">
                  <i className="bi bi-credit-card-2-front"></i>
                </span>
                <input
                  type="text"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  placeholder="Enter your ID"
                  className="w-full p-3 rounded-r-lg outline-none"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Patients: Use your Family ID<br />
                Doctors: Use DOC001, DOC002, DOC003<br />
                Front Office: Use OFC111, OFC112, OFC113
              </p>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;