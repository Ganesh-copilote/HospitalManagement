import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFamilyMember } from '../services/api';
import Navbar from '../components/Navbar';

const AddFamilyMember = () => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', email: '', age: '', gender: '', aadhar: '', address: '', prev_problem: '', curr_problem: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFamilyMember(formData);
      navigate('/patient_dashboard');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <Navbar isDashboard={true} userType="patient" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Add Family Member</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-person"></i></span>
                <input name="first_name" onChange={handleChange} placeholder="First Name *" className="w-full p-3 rounded-r-lg outline-none" required />
              </div>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-person"></i></span>
                <input name="last_name" onChange={handleChange} placeholder="Last Name *" className="w-full p-3 rounded-r-lg outline-none" required />
              </div>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-telephone"></i></span>
                <input name="phone" type="tel" onChange={handleChange} placeholder="Phone Number" className="w-full p-3 rounded-r-lg outline-none" />
              </div>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-envelope"></i></span>
                <input name="email" type="email" onChange={handleChange} placeholder="Email" className="w-full p-3 rounded-r-lg outline-none" />
              </div>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-calendar"></i></span>
                <input name="age" type="number" onChange={handleChange} placeholder="Age *" className="w-full p-3 rounded-r-lg outline-none" required />
              </div>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-gender-ambiguous"></i></span>
                <select name="gender" onChange={handleChange} className="w-full p-3 rounded-r-lg outline-none" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-600">
                <span className="flex items-center px-3 bg-blue-50 text-blue-600 rounded-l-lg border-r border-gray-300"><i className="bi bi-card-text"></i></span>
                <input name="aadhar" onChange={handleChange} placeholder="Aadhar Number" className="w-full p-3 rounded-r-lg outline-none" />
              </div>
            </div>
            <div className="mb-4">
              <textarea name="address" onChange={handleChange} placeholder="Address" className="w-full p-3 rounded-lg border border-gray-300 outline-none" />
            </div>
            <div className="mb-4">
              <textarea name="prev_problem" onChange={handleChange} placeholder="Previous Medical Problems" className="w-full p-3 rounded-lg border border-gray-300 outline-none" />
            </div>
            <div className="mb-4">
              <textarea name="curr_problem" onChange={handleChange} placeholder="Current Medical Problems" className="w-full p-3 rounded-lg border border-gray-300 outline-none" />
            </div>
            <div className="text-center mt-5">
              <button type="submit" className="bg-blue-600 text-white py-3 px-10 rounded-lg font-bold hover:bg-blue-700">Add Member</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddFamilyMember;