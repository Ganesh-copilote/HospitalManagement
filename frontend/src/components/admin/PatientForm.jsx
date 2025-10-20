// src/components/admin/PatientForm.jsx
import React, { useState, useEffect } from 'react';

const PatientForm = ({ patient, onSave, onCancel, isDark }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    aadhar: '',
    prev_problem: '',
    curr_problem: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when patient data changes
  useEffect(() => {
    console.log('🔄 PatientForm: Patient data changed', patient);
    
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        middle_name: patient.middle_name || '',
        age: patient.age || '',
        gender: patient.gender || '',
        email: patient.email || '',
        phone: patient.phone || '',
        address: patient.address || '',
        aadhar: patient.aadhar || '',
        prev_problem: patient.prev_problem || '',
        curr_problem: patient.curr_problem || ''
      });
      console.log('✅ PatientForm: Form data populated with patient data');
    } else {
      // Reset form for new patient
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        age: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        aadhar: '',
        prev_problem: '',
        curr_problem: ''
      });
      console.log('✅ PatientForm: Form reset for new patient');
    }
    setErrors({});
  }, [patient]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (formData.aadhar && !/^\d{12}$/.test(formData.aadhar)) newErrors.aadhar = 'Aadhar must be 12 digits';
    if (formData.age && (formData.age < 0 || formData.age > 150)) newErrors.age = 'Age must be between 0 and 150';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 PatientForm: Form submitted', formData);
    
    if (!validateForm()) {
      console.log('❌ PatientForm: Form validation failed', errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      console.log('✅ PatientForm: Form saved successfully');
    } catch (error) {
      console.error('❌ PatientForm: Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ PatientForm: Field ${name} changed to:`, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  console.log('🎯 PatientForm: Rendering with patient:', patient);
  console.log('🎯 PatientForm: Current form data:', formData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            required
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.first_name ? 'border-red-500' : 
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            required
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.last_name ? 'border-red-500' : 
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
        </div>

        {/* Middle Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Middle Name
          </label>
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Age */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="0"
            max="150"
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.age ? 'border-red-500' : 
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.phone ? 'border-red-500' : 
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.email ? 'border-red-500' : 
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Aadhar */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Aadhar Number
          </label>
          <input
            type="text"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            placeholder="12-digit Aadhar number"
            maxLength="12"
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.aadhar ? 'border-red-500' : 
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.aadhar && <p className="mt-1 text-sm text-red-500">{errors.aadhar}</p>}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Previous Medical Problem */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Previous Medical Problem
          </label>
          <textarea
            name="prev_problem"
            value={formData.prev_problem}
            onChange={handleChange}
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Current Medical Problem */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Medical Problem
          </label>
          <textarea
            name="curr_problem"
            value={formData.curr_problem}
            onChange={handleChange}
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } transition-colors duration-200 disabled:opacity-50`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {patient ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;