// src/pages/Medical.jsx
import { useState, useEffect } from 'react';
import { FileText, Pill, Calendar, User, Search, Plus, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/admin/Navbar';
import AdminModal from '../components/AdminModal';
import Sidebar from '../components/admin/sidebar';
import StatCard from '../components/admin/StatCard';
import ChartCard from '../components/admin/ChartCard';
import { 
  getAdminMedicalRecords, 
  getAdminPrescriptions,
  addUser,
  updateUser,
  deleteUser,
  getAdminPatientData,
  getAdminDoctordata,
  uploadMedicalRecord,
  viewMedicalRecord  // Make sure this is imported
} from '../services/api';

const Medical = () => {
  const [activeTab, setActiveTab] = useState('medical');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchMedicalData();
    fetchPatientsAndDoctors();
  }, []);

  const fetchMedicalData = async () => {
    debugger
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both medical records and prescriptions
      const [medicalResponse, prescriptionsResponse] = await Promise.all([
        getAdminMedicalRecords(),
        getAdminPrescriptions()
      ]);

      console.log("Medical Records Data:", medicalResponse);
      console.log("Prescriptions Data:", prescriptionsResponse);
      
      setMedicalRecords(medicalResponse.medical_records || []);
      setPrescriptions(prescriptionsResponse.prescriptions || []);
      
      setStats({
        totalRecords: medicalResponse.medical_records?.length || 0,
        totalPrescriptions: prescriptionsResponse.prescriptions?.length || 0,
        activeTreatments: medicalResponse.medical_records?.filter(record => 
          record.record_type === 'Treatment'
        )?.length || 0,
        completedTreatments: prescriptionsResponse.prescriptions?.length || 0
      });
      
    } catch (error) {
      console.error("Error fetching medical data:", error);
      setError("Failed to load medical data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsAndDoctors = async () => {
    debugger
    try {
      console.log('🔄 Fetching patients and doctors data...');
      
      const [patientsResponse, doctorsResponse] = await Promise.all([
        getAdminPatientData(),
        getAdminDoctordata()
      ]);

      console.log('✅ Patients data:', patientsResponse);
      console.log('✅ Doctors data:', doctorsResponse);

      if (patientsResponse.success && patientsResponse.family_members) {
        const transformedPatients = patientsResponse.family_members.map(patient => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          first_name: patient.first_name,
          last_name: patient.last_name
        }));
        setPatients(transformedPatients);
      }

      if (doctorsResponse.success && doctorsResponse.Doctors) {
        const transformedDoctors = doctorsResponse.Doctors.map(doctor => ({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty
        }));
        setDoctors(transformedDoctors);
      }

    } catch (err) {
      console.error('❌ Error fetching patients and doctors:', err);
    }
  };

  useEffect(() => {
    debugger
    const data = activeTab === 'medical' ? medicalRecords : prescriptions;
    const filtered = data.filter(item =>
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, medicalRecords, prescriptions, activeTab]);

  // Add debugging for modal state
  useEffect(() => {
    console.log('🔍 Medical.jsx Debug:');
    console.log('   showModal:', showModal);
    console.log('   editingItem:', editingItem);
    console.log('   activeTab:', activeTab);
  }, [showModal, editingItem, activeTab]);

  // Handle View Medical Record File
  const handleViewFile = async (record) => {
    debugger
    try {
      console.log('👁️ Viewing medical record file:', record);
      console.log('Record ID:', record.id);
      console.log('File path:', record.file_path);
      
      if (!record.file_path) {
        alert('No file attached to this medical record');
        return;
      }

      // Use your existing viewMedicalRecord API function
      await viewMedicalRecord(record.id);
      
    } catch (error) {
      console.error('❌ Error viewing medical record file:', error);
      alert('Error opening medical record file. Please try again.');
    }
  };

  const handleEdit = (item) => {
    console.log('🔄 Edit button clicked for:', item);
    console.log('   Setting editingItem:', item);
    console.log('   Setting showModal to true');
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    console.log('🗑️ Delete button clicked for ID:', itemId);
    console.log('   activeTab:', activeTab);
    
    if (window.confirm(`Are you sure you want to delete this ${activeTab === 'medical' ? 'medical record' : 'prescription'}?`)) {
      try {
        const userType = activeTab === 'medical' ? 'medical_record' : 'prescription';
        console.log(`🔄 Deleting ${userType} with ID: ${itemId}`);
        
        const result = await deleteUser(userType, itemId);
        if (result.success) {
          console.log('✅ Delete successful, refreshing data...');
          await fetchMedicalData();
        } else {
          throw new Error(result.error || `Failed to delete ${userType}`);
        }
      } catch (err) {
        console.error(`❌ Error deleting:`, err);
        setError(`Failed to delete ${activeTab === 'medical' ? 'medical record' : 'prescription'}`);
      }
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      console.log('🔄 handleSaveItem called with:', { 
        editingItem, 
        activeTab, 
        itemData 
      });
      
      const userType = activeTab === 'medical' ? 'medical_record' : 'prescription';
      
      if (editingItem) {
        console.log(`🔄 Updating ${userType} ${editingItem.id}`);
        const result = await updateUser(userType, editingItem.id, itemData);
        console.log('✅ Update result:', result);
        
        if (result.success) {
          await fetchMedicalData();
          setShowModal(false);
          setEditingItem(null);
          console.log(`${userType} updated successfully`);
        } else {
          throw new Error(result.error || `Failed to update ${userType}`);
        }
      } else {
        console.log(`🔄 Adding new ${userType}`);
        const result = await addUser(userType, itemData);
        console.log('✅ Add result:', result);
        
        if (result.success) {
          await fetchMedicalData();
          setShowModal(false);
          console.log(`${userType} added successfully`);
        } else {
          throw new Error(result.error || `Failed to add ${userType}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error saving ${activeTab === 'medical' ? 'medical record' : 'prescription'}:`, err);
      setError(err.message || `Failed to save ${activeTab === 'medical' ? 'medical record' : 'prescription'}`);
    }
  };

  const handleAddNew = () => {
    console.log('➕ Add new button clicked - activeTab:', activeTab);
    console.log('   Setting editingItem to null');
    console.log('   Setting showModal to true');
    setEditingItem(null);
    setShowModal(true);
  };

  const refreshData = () => {
    fetchMedicalData();
  };

  const getMedicalStats = () => {
    const recordTypeCounts = {};
    medicalRecords.forEach(record => {
      const recordType = record.record_type || 'Unknown';
      recordTypeCounts[recordType] = (recordTypeCounts[recordType] || 0) + 1;
    });
    
    return Object.entries(recordTypeCounts).map(([recordType, count]) => ({
      recordType,
      count
    }));
  };

  // Medical Record Form Component with File Upload
  const MedicalRecordForm = ({ record, onSave, onCancel, isDark }) => {
    debugger
    const [formData, setFormData] = useState({
      patient_id: '',
      record_type: '',
      record_date: '',
      description: '',
      file_path: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFilePath, setUploadedFilePath] = useState('');

    useEffect(() => {
      debugger
      console.log('🔄 MedicalRecordForm: Record data changed', record);
      
      if (record) {
        setFormData({
          patient_id: record.patient_id?.toString() || '',
          record_type: record.record_type || '',
          record_date: record.date || '',
          description: record.description || '',
          file_path: record.file_path || ''
        });
        setUploadedFilePath(record.file_path || '');
      } else {
        setFormData({
          patient_id: '',
          record_type: '',
          record_date: '',
          description: '',
          file_path: ''
        });
        setUploadedFilePath('');
      }
      setSelectedFile(null);
    }, [record]);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      if (file) {
        console.log('📁 File selected:', file.name, file.type, file.size);
        
        // Validate file type
        const allowedTypes = [
          'application/pdf', 
          'image/jpeg', 
          'image/png', 
          'image/jpg',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid file type (PDF, JPEG, PNG, DOC, DOCX)');
          e.target.value = '';
          setSelectedFile(null);
          return;
        }
        
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          alert('File size must be less than 5MB');
          e.target.value = '';
          setSelectedFile(null);
          return;
        }
      }
    };

    const uploadFile = async (file, patientId) => {
      try {
        console.log('🔄 Starting file upload...');
        
        const uploadFormData = new FormData();
        uploadFormData.append('member_id', patientId);
        uploadFormData.append('record_type', formData.record_type);
        uploadFormData.append('record_date', formData.record_date);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('record_file', file);

        // Log FormData contents
        for (let [key, value] of uploadFormData.entries()) {
          console.log(`📤 Upload FormData - ${key}:`, value);
        }

        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 90) {
            clearInterval(progressInterval);
          }
        }, 100);

        // Make the actual upload request
        const response = await uploadMedicalRecord(uploadFormData);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.success) {
          console.log('✅ File uploaded successfully:', response);
          return response.file_path || `/uploads/medical_record_${Date.now()}_${file.name}`;
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw error;
      }
    };

    const handleSubmit = async (e) => {
      debugger
      e.preventDefault();
      console.log('📤 MedicalRecordForm: Form submitted', formData);
      
      // Validate form
      if (!formData.patient_id || !formData.record_type || !formData.record_date || !formData.description) {
        alert('Please fill in all required fields');
        return;
      }
      
      setIsSubmitting(true);
      setUploadProgress(0);
      
      try {
        let filePath = uploadedFilePath || formData.file_path;
        
        // Upload file if selected
        if (selectedFile) {
          console.log('🔄 Uploading file...');
          filePath = await uploadFile(selectedFile, formData.patient_id);
          setUploadedFilePath(filePath);
        }
        
        // Prepare data for API - for admin unified API
        const submitData = {
          patient_id: parseInt(formData.patient_id),
          record_type: formData.record_type,
          record_date: formData.record_date,
          description: formData.description,
          file_path: filePath
        };
        
        console.log('📤 Prepared data for API:', submitData);
        
        await onSave(submitData);
        console.log('✅ MedicalRecordForm: Form saved successfully');
        
        // Reset form
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadedFilePath('');
        
      } catch (error) {
        console.error('❌ MedicalRecordForm: Error in form submission:', error);
        alert('Error saving medical record. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const removeFile = () => {
      setSelectedFile(null);
      setUploadedFilePath('');
      setFormData(prev => ({ ...prev, file_path: '' }));
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    };

    const viewFile = () => {
      if (uploadedFilePath || formData.file_path) {
        // Use the existing viewMedicalRecord API if we have a record ID
        if (record && record.id) {
          viewMedicalRecord(record.id);
        } else {
          // For new records that haven't been saved yet, open the file directly
          const filePath = uploadedFilePath || formData.file_path;
          const fileUrl = `http://localhost:5000${filePath.replace(/\\/g, '/')}`;
          window.open(fileUrl, '_blank');
        }
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Patient Dropdown */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Patient *
            </label>
            <select
              name="patient_id"
              required
              value={formData.patient_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Record Type *
            </label>
            <select
              name="record_type"
              required
              value={formData.record_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Record Type</option>
              <option value="Consultation">Consultation</option>
              <option value="Treatment">Treatment</option>
              <option value="Lab Report">Lab Report</option>
              <option value="Diagnosis">Diagnosis</option>
              <option value="Prescription">Prescription</option>
              <option value="Surgery">Surgery</option>
              <option value="Follow-up">Follow-up</option>
              <option value="X-Ray">X-Ray</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="Blood Test">Blood Test</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="ECG">ECG</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Record Date *
            </label>
            <input
              type="date"
              name="record_date"
              required
              value={formData.record_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter medical record description, diagnosis, treatment details..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Upload Medical Document
            </label>
            
            {/* File Upload Area */}
            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDark 
                ? 'border-gray-600 bg-gray-700 hover:border-gray-500' 
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer block ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    PDF, JPG, PNG, DOC, DOCX up to 5MB
                  </span>
                </div>
              </label>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Uploading...</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{uploadProgress}%</span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-600' : ''}`}>
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Uploaded File Display */}
            {(uploadedFilePath || (formData.file_path && !selectedFile)) && (
              <div className={`mt-3 p-3 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-green-700'}`}>
                      File uploaded successfully
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={viewFile}
                      className={`text-sm px-3 py-1 rounded ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      } transition-colors`}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={removeFile}
                      className={`text-sm px-3 py-1 rounded ${
                        isDark 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      } transition-colors`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-green-600'}`}>
                  {uploadedFilePath || formData.file_path}
                </p>
              </div>
            )}

            {/* Selected File (not uploaded yet) */}
            {selectedFile && !uploadedFilePath && (
              <div className={`mt-3 p-3 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className={`text-sm px-3 py-1 rounded ${
                      isDark 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    } transition-colors`}
                  >
                    Remove
                  </button>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Ready to upload
                </p>
              </div>
            )}
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
            {record ? 'Update Medical Record' : 'Create Medical Record'}
          </button>
        </div>
      </form>
    );
  };

  // Prescription Form Component
  const PrescriptionForm = ({ prescription, onSave, onCancel, isDark }) => {
    const [formData, setFormData] = useState({
      patient_id: '',
      doctor_id: '',
      prescription_date: '',
      medication: '',
      dosage: '',
      instructions: '',
      frequency: '',
      duration: '',
      notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      console.log('🔄 PrescriptionForm: Prescription data changed', prescription);
      
      if (prescription) {
        setFormData({
          patient_id: prescription.patient_id?.toString() || '',
          doctor_id: prescription.doctor_id?.toString() || '',
          prescription_date: prescription.date || '',
          medication: prescription.medication || '',
          dosage: prescription.dosage || '',
          instructions: prescription.instructions || '',
          frequency: prescription.frequency || '',
          duration: prescription.duration || '',
          notes: prescription.notes || ''
        });
      } else {
        setFormData({
          patient_id: '',
          doctor_id: '',
          prescription_date: '',
          medication: '',
          dosage: '',
          instructions: '',
          frequency: '',
          duration: '',
          notes: ''
        });
      }
    }, [prescription]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('📤 PrescriptionForm: Form submitted', formData);
      
      // Validate form
      if (!formData.patient_id || !formData.doctor_id || !formData.prescription_date || !formData.medication) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Prepare data for API
      const submitData = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        prescription_date: formData.prescription_date,
        medication: formData.medication,
        dosage: formData.dosage,
        instructions: formData.instructions,
        frequency: formData.frequency,
        duration: formData.duration,
        notes: formData.notes
      };
      
      console.log('📤 Prepared data for API:', submitData);
      
      setIsSubmitting(true);
      try {
        await onSave(submitData);
        console.log('✅ PrescriptionForm: Form saved successfully');
      } catch (error) {
        console.error('❌ PrescriptionForm: Error in form submission:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Dropdown */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Patient *
            </label>
            <select
              name="patient_id"
              required
              value={formData.patient_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.id})
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Dropdown */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Doctor *
            </label>
            <select
              name="doctor_id"
              required
              value={formData.doctor_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Prescription Date *
            </label>
            <input
              type="date"
              name="prescription_date"
              required
              value={formData.prescription_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Medication *
            </label>
            <input
              type="text"
              name="medication"
              required
              value={formData.medication}
              onChange={handleChange}
              placeholder="Enter medication name..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Dosage
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="e.g., 500mg, 1 tablet..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Frequency
            </label>
            <input
              type="text"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="e.g., Once daily, Twice daily..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 7 days, 2 weeks..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              placeholder="Enter administration instructions..."
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Additional notes..."
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
            {prescription ? 'Update Prescription' : 'Create Prescription'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/medical"
          onNavigate={() => {}}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isDark={isDark}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Medical & Prescriptions</h1>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage medical records and prescription data
                </p>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshData}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors duration-200`}
                >
                  <span>Refresh</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add New</span>
                </motion.button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Medical Records"
                value={stats.totalRecords}
                icon={FileText}
                trend={{ value: 8, isPositive: true }}
                color="gradient-emerald"
                isDark={isDark}
              />
              <StatCard
                title="Prescriptions"
                value={stats.totalPrescriptions}
                icon={Pill}
                trend={{ value: 12, isPositive: true }}
                color="gradient-blue"
                isDark={isDark}
              />
              <StatCard
                title="Active Treatments"
                value={stats.activeTreatments}
                icon={User}
                trend={{ value: 3, isPositive: false }}
                color="gradient-purple"
                isDark={isDark}
              />
              <StatCard
                title="Completed"
                value={stats.completedTreatments}
                icon={Calendar}
                trend={{ value: 5, isPositive: true }}
                color="gradient-orange"
                isDark={isDark}
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              {['medical', 'prescriptions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-t-lg font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? isDark
                        ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                        : 'bg-white text-gray-900 border-b-2 border-blue-500 shadow-sm'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'medical' ? 'Medical Records' : 'Prescriptions'}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
              {/* Search and Filters */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={`flex-1 relative ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-2 flex items-center transition-colors duration-200`}>
                    <Search size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab === 'medical' ? 'medical records' : 'prescriptions'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`bg-transparent outline-none px-2 flex-1 ${
                        isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      } transition-colors duration-200`}
                    >
                      <Filter size={18} />
                      <span>Filters</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading {activeTab}...</p>
                </div>
              )}

              {/* Data Display */}
              {!loading && (
                <div className="p-6">
                  {activeTab === 'medical' ? (
                    <div className="space-y-4">
                      {filteredData.length > 0 ? (
                        filteredData.map((record, index) => (
                          <motion.div
                            key={`medical-record-${record.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                            } shadow-sm`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {record.patient_name}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {record.record_type} • {record.date}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                {/* View File Button */}
                                {record.file_path && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleViewFile(record)}
                                    className={`p-2 rounded ${
                                      isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-100 hover:bg-green-200'
                                    } transition-colors duration-200`}
                                    title="View File"
                                  >
                                    <Eye size={16} className={isDark ? 'text-white' : 'text-green-600'} />
                                  </motion.button>
                                )}
                                
                                {/* Edit Button */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(record)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                                  } transition-colors duration-200`}
                                  title="Edit Record"
                                >
                                  <Edit size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </motion.button>
                                
                                {/* Delete Button */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(record.id)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                                  } transition-colors duration-200`}
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                                </motion.button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Record Type:</strong>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{record.record_type}</p>
                              </div>
                              <div>
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Date:</strong>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{record.date}</p>
                              </div>
                              <div className="md:col-span-2">
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Description:</strong>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{record.description}</p>
                              </div>
                              {record.file_path && (
                                <div className="md:col-span-2">
                                  <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>File:</strong>
                                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                    <button 
                                      onClick={() => handleViewFile(record)}
                                      className="text-blue-500 hover:text-blue-700 underline cursor-pointer text-left"
                                    >
                                      {record.file_path.split('\\').pop() || record.file_path.split('/').pop()}
                                    </button>
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <FileText size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No medical records found</p>
                          <p className="mt-2">
                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first medical record to get started'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredData.length > 0 ? (
                        filteredData.map((prescription, index) => (
                          <motion.div
                            key={prescription.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                            } shadow-sm`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {prescription.patient_name}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Prescribed by: {prescription.doctor_name} • {prescription.date}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(prescription)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
                                  } transition-colors duration-200`}
                                >
                                  <Edit size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(prescription.id)}
                                  className={`p-2 rounded ${
                                    isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'
                                  } transition-colors duration-200`}
                                >
                                  <Trash2 size={16} className={isDark ? 'text-white' : 'text-red-600'} />
                                </motion.button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Medication:</strong>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{prescription.medication}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Dosage:</strong>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{prescription.dosage}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Frequency:</strong>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{prescription.frequency}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Duration:</strong>
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{prescription.duration}</span>
                              </div>
                              {prescription.instructions && (
                                <div className="text-sm">
                                  <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Instructions:</strong>
                                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{prescription.instructions}</p>
                                </div>
                              )}
                              {prescription.notes && (
                                <div className="text-sm">
                                  <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Notes:</strong>
                                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{prescription.notes}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Pill size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No prescriptions found</p>
                          <p className="mt-2">
                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first prescription to get started'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Charts Section */}
            {!loading && activeTab === 'medical' && medicalRecords.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <ChartCard 
                  title="Medical Records by Type" 
                  type="bar" 
                  data={getMedicalStats()}
                  dataKey="count"
                  isDark={isDark}
                />
                <ChartCard 
                  title="Records Timeline" 
                  type="line" 
                  data={[]}
                  dataKey="records"
                  isDark={isDark}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => {
          console.log('🔒 Modal close triggered');
          setShowModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? `Edit ${activeTab === 'medical' ? 'Medical Record' : 'Prescription'}` : `Add New ${activeTab === 'medical' ? 'Medical Record' : 'Prescription'}`}
        isDark={isDark}
        key={editingItem ? `edit-${editingItem.id}` : 'add-new'}
      >
        {activeTab === 'medical' ? (
          <MedicalRecordForm
            record={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              console.log('❌ Form cancel triggered');
              setShowModal(false);
              setEditingItem(null);
            }}
            isDark={isDark}
            key={editingItem ? `medical-form-${editingItem.id}` : 'medical-form-new'}
          />
        ) : (
          <PrescriptionForm
            prescription={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              console.log('❌ Form cancel triggered');
              setShowModal(false);
              setEditingItem(null);
            }}
            isDark={isDark}
            key={editingItem ? `prescription-form-${editingItem.id}` : 'prescription-form-new'}
          />
        )}
      </AdminModal>
    </div>
  );
};

export default Medical;