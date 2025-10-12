import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorPrescriptions, addPrescription } from '../services/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ 
    member_id: '', 
    medication: '', 
    dosage: '', 
    instructions: '',
    frequency: '',
    duration: '',
    notes: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDoctorPrescriptions();
        setPrescriptions(res.prescriptions || []);
        setPatients(res.patients || []);
      } catch (err) {
        setError(err.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      console.log('🔄 Adding prescription with data:', formData);
      
      // Validate required fields
      if (!formData.member_id || !formData.medication || !formData.dosage) {
        setError('Please fill in all required fields (Patient, Medication, and Dosage)');
        return;
      }

      const result = await addPrescription(formData);
      
      if (result.success) {
        setShowModal(false);
        // Reset form
        setFormData({ 
          member_id: '', 
          medication: '', 
          dosage: '', 
          instructions: '',
          frequency: '',
          duration: '',
          notes: ''
        });
        
        // Refresh prescriptions list
        const res = await getDoctorPrescriptions();
        setPrescriptions(res.prescriptions || []);
        
        alert('✅ Prescription added successfully!');
      } else {
        setError(result.error || 'Failed to add prescription');
      }
    } catch (err) {
      console.error('❌ Error adding prescription:', err);
      setError(err.message || 'Failed to add prescription');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setFormData({ 
      member_id: '', 
      medication: '', 
      dosage: '', 
      instructions: '',
      frequency: '',
      duration: '',
      notes: ''
    });
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  const handlePrintPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    
    // Create print content
    const printContent = generatePrintContent(prescription);
    
    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // printWindow.close(); // Uncomment if you want to auto-close after print
    };
  };

  const generatePrintContent = (prescription) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.first_name} ${prescription.last_name}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .clinic-address {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .prescription-title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .patient-info {
            background: #f8fafc;
            padding: 15px;
            border-left: 4px solid #2563eb;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-weight: bold;
            color: #2563eb;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .medication-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .medication-name {
            font-weight: bold;
            font-size: 18px;
            color: #1e293b;
          }
          .doctor-signature {
            margin-top: 50px;
            text-align: right;
          }
          .signature-line {
            border-top: 1px solid #333;
            width: 300px;
            margin-left: auto;
            margin-top: 60px;
          }
          .doctor-name {
            margin-top: 5px;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">HEALTHCARE CLINIC</div>
          <div class="clinic-address">123 Medical Center Drive, Healthcare City, HC 12345</div>
          <div class="clinic-address">Phone: (555) 123-4567 | Email: info@healthcareclinic.com</div>
        </div>

        <div class="prescription-title">MEDICAL PRESCRIPTION</div>

        <div class="patient-info">
          <strong>Patient:</strong> ${prescription.first_name} ${prescription.last_name}<br>
          <strong>Date:</strong> ${prescription.prescription_date ? new Date(prescription.prescription_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : currentDate}<br>
          <strong>Doctor:</strong> ${prescription.doctor_name || 'Dr. Smith'}
        </div>

        <div class="section">
          <div class="section-title">PRESCRIPTION DETAILS</div>
          <div class="medication-item">
            <div class="medication-name">${prescription.medication}</div>
            <div><strong>Dosage:</strong> ${prescription.dosage}</div>
            ${prescription.frequency ? `<div><strong>Frequency:</strong> ${prescription.frequency}</div>` : ''}
            ${prescription.duration ? `<div><strong>Duration:</strong> ${prescription.duration}</div>` : ''}
          </div>
        </div>

        ${prescription.instructions ? `
        <div class="section">
          <div class="section-title">INSTRUCTIONS</div>
          <div>${prescription.instructions}</div>
        </div>
        ` : ''}

        ${prescription.notes ? `
        <div class="section">
          <div class="section-title">ADDITIONAL NOTES</div>
          <div>${prescription.notes}</div>
        </div>
        ` : ''}

        <div class="doctor-signature">
          <div class="signature-line"></div>
          <div class="doctor-name">${prescription.doctor_name || 'Dr. Smith'}</div>
          <div>Medical License: #ML12345</div>
        </div>

        <div class="footer">
          This is a computer-generated prescription. No signature required.<br>
          Printed on: ${currentDate}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Prescription
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close Window
          </button>
        </div>
      </body>
      </html>
    `;
  };

  // Filter prescriptions based on search and patient filter
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = searchTerm === '' || 
      prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (`${prescription.first_name} ${prescription.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPatient = filterPatient === '' ||
      (`${prescription.first_name} ${prescription.last_name}`.toLowerCase().includes(filterPatient.toLowerCase()));
    
    return matchesSearch && matchesPatient;
  });

  // Group prescriptions by date
  const groupPrescriptionsByDate = (prescriptions) => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const groups = {
      today: [],
      thisWeek: [],
      earlier: []
    };

    prescriptions.forEach(prescription => {
      const prescriptionDate = new Date(prescription.prescription_date);
      
      if (prescriptionDate.toDateString() === today.toDateString()) {
        groups.today.push(prescription);
      } else if (prescriptionDate > lastWeek) {
        groups.thisWeek.push(prescription);
      } else {
        groups.earlier.push(prescription);
      }
    });

    return groups;
  };

  const prescriptionGroups = groupPrescriptionsByDate(filteredPrescriptions);

  // Get medication icon based on type
  const getMedicationIcon = (medication) => {
    const lowerMed = medication?.toLowerCase() || '';
    if (lowerMed.includes('amox') || lowerMed.includes('antibiotic')) {
      return '💊';
    } else if (lowerMed.includes('paracetamol') || lowerMed.includes('dolo')) {
      return '🌡';
    } else if (lowerMed.includes('cetirizine') || lowerMed.includes('allergy')) {
      return '🌸';
    } else {
      return '💊';
    }
  };

  // Get date color based on urgency
  const getDateColor = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'text-green-600 bg-green-50';
    if (diffDays <= 7) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <>
      <Navbar isDashboard={true} userType="doctor" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => navigate('/doctor_dashboard')}
                  className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-700 text-sm font-medium">Prescriptions</span>
              </li>
            </ol>
          </nav>

          {/* Enhanced Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Prescription Management</h1>
                  <p className="text-blue-100 mt-2 text-lg">Manage and create patient prescriptions with ease</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Prescription
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text"
                  placeholder="Search prescriptions or patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <select 
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={`${patient.first_name} ${patient.last_name}`}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-xl mb-8 flex items-center gap-4 shadow-md">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Prescriptions Cards */}
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No prescriptions found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterPatient ? 'Try adjusting your search or filter criteria.' : 'Get started by creating your first prescription for a patient.'}
                </p>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Create Your First Prescription
                </button>
              </div>
            ) : (
              <>
                {/* Today's Prescriptions */}
                {prescriptionGroups.today.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      Today
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {prescriptionGroups.today.map(prescription => (
                        <PrescriptionCard 
                          key={prescription.id} 
                          prescription={prescription} 
                          getMedicationIcon={getMedicationIcon}
                          getDateColor={getDateColor}
                          onView={handleViewPrescription}
                          onPrint={handlePrintPrescription}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* This Week's Prescriptions */}
                {prescriptionGroups.thisWeek.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      This Week
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {prescriptionGroups.thisWeek.map(prescription => (
                        <PrescriptionCard 
                          key={prescription.id} 
                          prescription={prescription} 
                          getMedicationIcon={getMedicationIcon}
                          getDateColor={getDateColor}
                          onView={handleViewPrescription}
                          onPrint={handlePrintPrescription}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Earlier Prescriptions */}
                {prescriptionGroups.earlier.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      Earlier
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {prescriptionGroups.earlier.map(prescription => (
                        <PrescriptionCard 
                          key={prescription.id} 
                          prescription={prescription} 
                          getMedicationIcon={getMedicationIcon}
                          getDateColor={getDateColor}
                          onView={handleViewPrescription}
                          onPrint={handlePrintPrescription}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enhanced Add Prescription Modal */}
        <Modal show={showModal} onClose={handleCloseModal}>
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">New Prescription</h3>
                    <p className="text-gray-600 text-sm">Fill in the details below to create a new prescription</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-150 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Patient <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="member_id" 
                    value={formData.member_id} 
                    onChange={handleChange} 
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medication and Dosage Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Medication <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="medication" 
                      value={formData.medication} 
                      onChange={handleChange} 
                      placeholder="e.g., Amoxicillin, Ibuprofen"
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="dosage" 
                      value={formData.dosage} 
                      onChange={handleChange} 
                      placeholder="e.g., 500mg, 1 tablet"
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50" 
                      required 
                    />
                  </div>
                </div>

                {/* Frequency and Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Frequency</label>
                    <input 
                      name="frequency" 
                      value={formData.frequency} 
                      onChange={handleChange} 
                      placeholder="e.g., Twice daily, Once a week"
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Duration</label>
                    <input 
                      name="duration" 
                      value={formData.duration} 
                      onChange={handleChange} 
                      placeholder="e.g., 7 days, 1 month"
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50" 
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Instructions</label>
                  <textarea 
                    name="instructions" 
                    value={formData.instructions} 
                    onChange={handleChange} 
                    placeholder="Special instructions for the patient..."
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 resize-none"
                    rows="3"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Additional Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    placeholder="Any additional notes or comments..."
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 resize-none"
                    rows="2"
                  />
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-100 bg-white rounded-b-2xl flex-shrink-0">
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition duration-200 min-w-[120px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition duration-200 flex items-center gap-3 min-w-[160px] justify-center shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Add Prescription
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* View Prescription Modal */}
        <Modal show={showViewModal} onClose={() => setShowViewModal(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Prescription Details</h3>
                    <p className="text-gray-600 text-sm">View prescription information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition duration-150 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {selectedPrescription && (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Patient Information */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-bold text-blue-800 text-lg mb-4">Patient Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-blue-700">Name</label>
                          <p className="text-gray-800">{selectedPrescription.first_name} {selectedPrescription.last_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-blue-700">Prescription Date</label>
                          <p className="text-gray-800">
                            {selectedPrescription.prescription_date ? 
                              new Date(selectedPrescription.prescription_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              '-'
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-blue-700">Doctor</label>
                          <p className="text-gray-800">{selectedPrescription.doctor_name || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Medication Details */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="font-bold text-green-800 text-lg mb-4">Medication Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-green-700">Medication</label>
                          <p className="text-gray-800 text-lg font-semibold">{selectedPrescription.medication}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-green-700">Dosage</label>
                          <p className="text-gray-800">{selectedPrescription.dosage}</p>
                        </div>
                        {selectedPrescription.frequency && (
                          <div>
                            <label className="text-sm font-semibold text-green-700">Frequency</label>
                            <p className="text-gray-800">{selectedPrescription.frequency}</p>
                          </div>
                        )}
                        {selectedPrescription.duration && (
                          <div>
                            <label className="text-sm font-semibold text-green-700">Duration</label>
                            <p className="text-gray-800">{selectedPrescription.duration}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Instructions & Notes */}
                  <div className="space-y-6">
                    {selectedPrescription.instructions && (
                      <div className="bg-yellow-50 rounded-xl p-6">
                        <h4 className="font-bold text-yellow-800 text-lg mb-4">Instructions</h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedPrescription.instructions}</p>
                      </div>
                    )}

                    {selectedPrescription.notes && (
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h4 className="font-bold text-purple-800 text-lg mb-4">Additional Notes</h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedPrescription.notes}</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-bold text-gray-800 text-lg mb-4">Actions</h4>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handlePrintPrescription(selectedPrescription)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Prescription
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
};

// Prescription Card Component - EXACTLY THE SAME AS BEFORE
const PrescriptionCard = ({ prescription, getMedicationIcon, getDateColor, onView, onPrint }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">
                {prescription.first_name?.[0]}{prescription.last_name?.[0]}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {prescription.first_name} {prescription.last_name}
              </h3>
              <p className="text-sm text-gray-500">Patient</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDateColor(prescription.prescription_date)}`}>
            {prescription.prescription_date ? 
              new Date(prescription.prescription_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 
              '-'
            }
          </div>
        </div>
        
        {/* Medication Info */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getMedicationIcon(prescription.medication)}</span>
          <div>
            <h4 className="font-bold text-gray-800 text-lg">{prescription.medication}</h4>
            <p className="text-gray-600">{prescription.dosage}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Instructions</label>
            <p className="text-gray-700 mt-1">
              {prescription.instructions || (
                <span className="text-gray-400 italic">No specific instructions</span>
              )}
            </p>
          </div>
          
          {prescription.frequency && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">{prescription.frequency}</span>
              </div>
              {prescription.duration && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{prescription.duration}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with Actions */}
      <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 transition-all duration-300 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => onView(prescription)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View
          </button>
          <button 
            onClick={() => onPrint(prescription)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-green-600 transition duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;