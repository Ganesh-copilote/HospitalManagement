import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { register } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', email: '', password: '', age: '', gender: '', aadhar: '', address: '', prev_problem: '', curr_problem: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/login', { state: { message: res.message, family_id: res.family_id } });
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white text-center py-8 px-4 rounded-t-2xl">
          <h2 className="text-3xl font-extrabold mb-2">Patient Registration</h2>
          <p className="text-sm opacity-90">Create your account to manage your family's healthcare needs securely.</p>
        </div>
        <div className="p-8 md:p-12">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 border border-red-200">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative">
                <input 
                  name="first_name" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">First Name *</label>
              </div>
              <div className="relative">
                <input 
                  name="last_name" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Last Name *</label>
              </div>
              <div className="relative">
                <input 
                  name="phone" 
                  type="tel" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Phone Number *</label>
              </div>
              <div className="relative">
                <input 
                  name="email" 
                  type="email" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Email *</label>
              </div>
              <div className="relative">
                <input 
                  name="password" 
                  type="password" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Password *</label>
              </div>
              <div className="relative">
                <input 
                  name="age" 
                  type="number" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Age *</label>
              </div>
              <div className="relative">
                <select 
                  name="gender" 
                  onChange={handleChange} 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white peer" 
                  required
                  value={formData.gender}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs pointer-events-none">Gender *</label>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div className="relative">
                <input 
                  name="aadhar" 
                  onChange={handleChange} 
                  placeholder=" " 
                  className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer" 
                  required 
                />
                <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Aadhar Number *</label>
              </div>
            </div>
            <div className="mb-6 relative">
              <textarea 
                name="address" 
                onChange={handleChange} 
                placeholder=" " 
                rows="3" 
                className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer resize-y" 
                required 
              ></textarea>
              <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Address *</label>
            </div>
            <div className="mb-6 relative">
              <textarea 
                name="prev_problem" 
                onChange={handleChange} 
                placeholder=" " 
                rows="3" 
                className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer resize-y" 
              ></textarea>
              <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Previous Medical Problems</label>
            </div>
            <div className="mb-8 relative">
              <textarea 
                name="curr_problem" 
                onChange={handleChange} 
                placeholder=" " 
                rows="3" 
                className="w-full p-3 pt-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 peer resize-y" 
              ></textarea>
              <label className="absolute left-3 top-2 text-gray-500 text-xs transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:top-2 peer-focus:text-blue-600 peer-focus:text-xs">Current Medical Problems</label>
            </div>
            <div className="text-center">
              <button type="submit" className="bg-blue-600 text-white py-3 px-12 rounded-full font-bold text-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105">
                Register & Generate ID
              </button>
            </div>
          </form>
          <p className="text-center mt-6 text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;