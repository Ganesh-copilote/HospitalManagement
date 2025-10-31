import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPatientDashboardData, 
  uploadMedicalRecord, 
  deleteFamilyMember, 
  cancelAppointment, 
  initiatePayment, 
  verifyPayment,
  viewMedicalRecord,
  deleteMedicalRecord 
} from '../services/api';
import PatientSidebar from '../components/PatientSidebar';
import Modal from '../components/Modal';
import { Menu, LogOut, Calendar, Users, FileText, CreditCard, Pill, BarChart3, Settings, LayoutDashboard, User } from 'lucide-react';

const PatientDashboard = () => {
  const [data, setData] = useState({
    profile: {}, 
    family_members: [], 
    appointments: [], 
    medical_records: [], 
    prescriptions: [], 
    bills: [], 
    family_id: ''
  });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/patient_dashboard');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [formData, setFormData] = useState({ 
    member_id: '', 
    record_type: '', 
    record_date: new Date().toISOString().split('T')[0], 
    description: '', 
    record_file: null 
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Generate dynamic health metrics based on actual data
  const generateHealthMetrics = () => {
    const baseMetrics = {
      bloodPressure: [120, 118, 122, 119, 121, 117, 119],
      heartRate: [72, 75, 70, 68, 73, 71, 69],
      weight: [68, 67.5, 67.8, 67.2, 66.9, 67.1, 66.8],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };

    // Modify based on actual appointments and records
    if (data.appointments.length > 0) {
      baseMetrics.bloodPressure = baseMetrics.bloodPressure.map(val => 
        val + (Math.random() * 4 - 2)
      );
    }

    return baseMetrics;
  };

  const healthMetrics = generateHealthMetrics();

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    const uploadData = new FormData();
    uploadData.append('member_id', formData.member_id);
    uploadData.append('record_type', formData.record_type);
    uploadData.append('record_date', formData.record_date);
    uploadData.append('description', formData.description);
    
    if (formData.record_file) {
      uploadData.append('record_file', formData.record_file);
    }

    try {
      await uploadMedicalRecord(uploadData);
      setShowModal(false);
      const res = await getPatientDashboardData();
      setData(res);
      setFormData({ 
        member_id: '', 
        record_type: '', 
        record_date: new Date().toISOString().split('T')[0], 
        description: '', 
        record_file: null 
      });
    } catch (err) {
      setError(err.message || 'Failed to upload medical record');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      try {
        await deleteFamilyMember(id);
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(id);
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleViewRecord = async (recordId) => {
    try {
      await viewMedicalRecord(recordId);
    } catch (err) {
      setError('Failed to view medical record: ' + (err.message || 'File not found'));
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        await deleteMedicalRecord(recordId);
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to delete medical record');
      }
    }
  };

  const handlePayBill = async (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
    setPaymentStep('details');
    setPaymentData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: ''
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setPaymentStep('processing');
      
      setTimeout(async () => {
        try {
          const paymentResult = await initiatePayment(selectedBill.id);
          
          if (paymentResult.success) {
            const verifyResult = await verifyPayment(paymentResult.payment_id, selectedBill.id);
            
            if (verifyResult.success) {
              setPaymentStep('success');
              setTimeout(async () => {
                const res = await getPatientDashboardData();
                setData(res);
                setShowPaymentModal(false);
              }, 2000);
            } else {
              setPaymentStep('failed');
              setError(verifyResult.error || 'Payment verification failed. Please try again.');
            }
          } else {
            setPaymentStep('failed');
            setError(paymentResult.error || 'Payment initiation failed.');
          }
        } catch (err) {
          setPaymentStep('failed');
          setError(err.message || 'Payment processing failed.');
        }
      }, 3000);
      
    } catch (err) {
      setPaymentStep('failed');
      setError(err.message || 'Payment failed. Please try again.');
    }
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    } 
    else if (name === 'expiryDate') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    }
    else if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '');
      setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    }
    else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePrintPrescription = (prescription) => {
    const printWindow = window.open('', '_blank');
    const printableContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.first_name} ${prescription.last_name}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .clinic-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .clinic-address { font-size: 14px; color: #666; }
          .prescription-title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; color: #2563eb; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; font-size: 16px; color: #2563eb; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .patient-info, .doctor-info { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .info-item { flex: 1; }
          .info-label { font-weight: bold; color: #666; font-size: 14px; }
          .info-value { font-size: 15px; }
          .medication-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .medication-table th { background-color: #2563eb; color: white; padding: 10px; text-align: left; font-size: 14px; }
          .medication-table td { padding: 10px; border: 1px solid #e5e7eb; font-size: 14px; }
          .instructions, .notes { background-color: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; margin: 15px 0; }
          .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #666; font-size: 14px; }
          .signature { margin-top: 50px; text-align: right; }
          .doctor-signature { border-top: 1px solid #333; display: inline-block; padding-top: 5px; margin-top: 40px; }
          @media print { body { margin: 0; padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">MediCare Clinic</div>
          <div class="clinic-address">123 Health Street, Medical City, MC 12345 | Phone: (555) 123-4567</div>
        </div>
        
        <div class="prescription-title">MEDICAL PRESCRIPTION</div>
        
        <div class="patient-info">
          <div class="info-item">
            <div class="info-label">Patient Name:</div>
            <div class="info-value">${prescription.first_name} ${prescription.last_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date:</div>
            <div class="info-value">${prescription.prescription_date ? new Date(prescription.prescription_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</div>
          </div>
        </div>
        
        <div class="doctor-info">
          <div class="info-item">
            <div class="info-label">Prescribing Doctor:</div>
            <div class="info-value">Dr. ${prescription.doctor_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Specialty:</div>
            <div class="info-value">${prescription.specialty || 'General Physician'}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PRESCRIBED MEDICATION</div>
          <table class="medication-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${prescription.medication}</td>
                <td>${prescription.dosage}</td>
                <td>${prescription.frequency || 'As directed'}</td>
                <td>${prescription.duration || 'Until finished'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        ${prescription.instructions ? `
        <div class="section">
          <div class="section-title">SPECIAL INSTRUCTIONS</div>
          <div class="instructions">
            ${prescription.instructions}
          </div>
        </div>
        ` : ''}
        
        ${prescription.notes ? `
        <div class="section">
          <div class="section-title">ADDITIONAL NOTES</div>
          <div class="notes">
            ${prescription.notes}
          </div>
        </div>
        ` : ''}
        
        <div class="signature">
          <div class="doctor-signature">
            <strong>Dr. ${prescription.doctor_name}</strong><br>
            Medical License No: ${'ML' + Math.random().toString(36).substr(2, 6).toUpperCase()}
          </div>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated prescription. No signature is required.</p>
          <p>For emergency, contact: (555) 123-EMER | Printed on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Prescription</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close Window</button>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // Stats for dashboard
  const stats = [
    { 
      title: 'Total Appointments', 
      value: data.appointments.length, 
      color: 'from-purple-500 to-indigo-600',
      icon: Calendar,
      description: 'All time appointments'
    },
    { 
      title: 'Family Members', 
      value: data.family_members.length, 
      color: 'from-cyan-500 to-blue-600',
      icon: Users,
      description: 'Family members registered'
    },
    { 
      title: 'Medical Records', 
      value: data.medical_records.length, 
      color: 'from-emerald-500 to-teal-600',
      icon: FileText,
      description: 'Total medical records'
    },
    { 
      title: 'Pending Bills', 
      value: data.bills.filter(bill => bill.status === 'Pending').length, 
      color: 'from-amber-500 to-orange-600',
      icon: CreditCard,
      description: 'Bills awaiting payment'
    }
  ];

  const getStatusBadge = (status) => {
    let badgeClass = '';
    switch(status) {
      case 'Scheduled':
        badgeClass = 'bg-blue-100 text-blue-800 border border-blue-200';
        break;
      case 'Completed':
        badgeClass = 'bg-green-100 text-green-800 border border-green-200';
        break;
      case 'Pending':
        badgeClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800 border border-gray-200';
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {status}
      </span>
    );
  };

  // Dashboard Section
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.title} className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-teal-500 transition-colors duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-2 text-teal-600">
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${isDark ? 'bg-teal-900' : 'bg-teal-100'}`}>
                  <IconComponent size={24} className="text-teal-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Metrics Chart */}
        {/* <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Health Metrics</h3>
          <div className="h-64">
            {/* <div className="flex items-end justify-between h-48 space-x-2 mb-4">
              {healthMetrics.bloodPressure.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{healthMetrics.labels[index]}</div>
                  <div className="flex items-end space-x-1 w-full justify-center">
                    <div 
                      className="bg-purple-500 rounded-t w-3 transition-all duration-300 hover:opacity-80"
                      style={{ height: `${(value - 110) * 2}px` }}
                      title={`BP: ${value}`}
                    ></div>
                    <div 
                      className="bg-cyan-500 rounded-t w-3 transition-all duration-300 hover:opacity-80"
                      style={{ height: `${healthMetrics.heartRate[index] * 2}px` }}
                      title={`HR: ${healthMetrics.heartRate[index]}`}
                    ></div>
                    <div 
                      className="bg-emerald-500 rounded-t w-3 transition-all duration-300 hover:opacity-80"
                      style={{ height: `${(healthMetrics.weight[index] - 65) * 10}px` }}
                      title={`Weight: ${healthMetrics.weight[index]}kg`}
                    ></div>
                  </div>
                </div>
              ))}
            </div> */}
            {/* <div className="flex justify-center space-x-6 text-xs">
              <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span>Blood Pressure</span>
              </div>
              <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="w-3 h-3 bg-cyan-500 rounded mr-2"></div>
                <span>Heart Rate</span>
              </div>
              <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                <span>Weight (kg)</span>
              </div>
            </div> 
          </div>
        </div> */}
        
        {/* Upcoming Appointments */}
        <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Upcoming Appointments</h3>
            <button 
  onClick={() => setActiveSection('appointments')}
  className={`text-sm font-medium ${
    isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'
  }`}
>
  View All
</button>
          </div>
          <div className="space-y-4">
            {data.appointments.filter(apt => apt.status === 'Scheduled').slice(0, 3).map((apt) => (
              <div key={apt.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'
              }`}>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Dr. {apt.doctor_name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {apt.first_name} {apt.last_name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {apt.slot_time}
                  </p>
                </div>
                <button 
                  onClick={() => navigate(`/view_appointment/${apt.id}`)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                      : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  View
                </button>
              </div>
            ))}
            
            {data.appointments.filter(apt => apt.status === 'Scheduled').length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No upcoming appointments</p>
                <button 
                  onClick={() => navigate('/book_appointment')}
                  className={`mt-2 text-sm font-medium ${
                    isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'
                  }`}
                >
                  Book your first appointment
                </button>
              </div>
            )}
          </div>
        </div>
  {/* Recent Bills */}

        <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Recent Bills</h3>
          <div className="space-y-3">
            {data.bills.slice(0, 4).map((bill) => (
              <div key={bill.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Bill #{bill.id}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{bill.bill_date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>₹{parseFloat(bill.amount || 0).toLocaleString('en-IN')}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(bill.status)}
                    {bill.status === 'Pending' ? (
                      <button 
                        onClick={() => handlePayBill(bill)} 
                        className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                          isDark 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        Pay
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewBill(bill)} 
                        className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                          isDark 
                            ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {data.bills.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No bills found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Recent Appointments</h3>
            <button 
              onClick={() => navigate('/book_appointment')} 
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              Book New
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Member</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Doctor</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments.slice(0, 5).map((apt, index) => (
                  <tr key={apt.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                    <td className="py-3 text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                        {apt.first_name} {apt.last_name}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                        {apt.doctor_name}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                        {apt.slot_time}
                      </span>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(apt.status)}
                    </td>
                  </tr>
                ))}
                {data.appointments.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      
        
      </div>
    </div>
  );

  // Profile Section
  const renderProfile = () => (
    <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Profile Information</h2>
        <button 
          onClick={() => navigate(`/edit_family_member/${data.profile.id}`)} 
          className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isDark 
              ? 'bg-teal-600 hover:bg-teal-700 text-white' 
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          Edit Profile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.first_name} {data.profile.last_name}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.email}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.phone}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Age</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.age}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gender</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.gender}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Aadhar</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.aadhar}</p>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Address</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.address}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Previous Medical Problems</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.prev_problem}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Medical Problems</label>
            <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.profile.curr_problem}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Appointments Section
  const renderAppointments = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Appointments</h2>
          <button 
            onClick={() => navigate('/book_appointment')} 
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isDark 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            Book Appointment
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Member</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Doctor</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((apt, index) => (
                <tr key={apt.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {apt.first_name} {apt.last_name}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {apt.doctor_name}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {apt.slot_time}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(apt.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      <a 
                        href={`/view_appointment/${apt.id}`} 
                        className={`text-sm font-medium ${
                          isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'
                        } transition-colors duration-200`}
                      >
                        View
                      </a>
                      {apt.status === 'Scheduled' && (
                        <>
                          <a 
                            href={`/reschedule_appointment/${apt.id}`} 
                            className={`text-sm font-medium ${
                              isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'
                            } transition-colors duration-200`}
                          >
                            Reschedule
                          </a>
                          <button 
                            onClick={() => handleCancelAppointment(apt.id)} 
                            className={`text-sm font-medium ${
                              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                            } transition-colors duration-200`}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data.appointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Medical Records Section
  const renderMedicalRecords = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Medical Records</h2>
          <button 
            onClick={() => setShowModal(true)} 
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isDark 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            Upload Record
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Member</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.medical_records.map((record, index) => (
                <tr key={record.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {record.first_name} {record.last_name}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>
                      {record.record_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {record.record_date}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {record.description}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      {record.file_path && (
                        <button 
                          onClick={() => handleViewRecord(record.id)} 
                          className={`text-sm font-medium ${
                            isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'
                          } transition-colors duration-200`}
                        >
                          View
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteRecord(record.id)} 
                        className={`text-sm font-medium ${
                          isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                        } transition-colors duration-200`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.medical_records.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No medical records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Prescriptions Section
  const renderPrescriptions = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Prescriptions</h2>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {data.prescriptions.length} prescription(s) found
          </div>
        </div>
        
        {data.prescriptions.length > 0 ? (
          <div className="space-y-6">
            {data.prescriptions.map((prescription, index) => (
              <div key={prescription.id || index} className={`border rounded-xl p-6 hover:shadow-md transition-shadow duration-200 ${
                isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                {/* Header with Doctor Info and Date */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Dr. {prescription.doctor_name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {prescription.specialty || 'General Physician'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {prescription.prescription_date ? 
                        new Date(prescription.prescription_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'Date not available'
                      }
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    }`}>
                      Active
                    </span>
                  </div>
                </div>

                {/* Medication Details */}
                <div className="mb-4">
                  <h4 className={`font-medium mb-3 flex items-center ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className="text-blue-500 mr-2">💊</span>
                    Medication Details
                  </h4>
                  <div className={`rounded-lg p-4 ${
                    isDark ? 'bg-blue-900' : 'bg-blue-50'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>Medication</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prescription.medication}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>Dosage</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>Frequency</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prescription.frequency || 'As directed'}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>Duration</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prescription.duration || 'Until finished'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescription.instructions && (
                    <div>
                      <h4 className={`font-medium mb-2 flex items-center ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <span className="text-green-500 mr-2">📝</span>
                        Instructions
                      </h4>
                      <p className={`text-sm rounded-lg p-3 ${
                        isDark ? 'bg-green-900 text-gray-300' : 'bg-green-50 text-gray-700'
                      }`}>
                        {prescription.instructions}
                      </p>
                    </div>
                  )}
                  
                  {prescription.notes && (
                    <div>
                      <h4 className={`font-medium mb-2 flex items-center ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <span className="text-purple-500 mr-2">📋</span>
                        Additional Notes
                      </h4>
                      <p className={`text-sm rounded-lg p-3 ${
                        isDark ? 'bg-purple-900 text-gray-300' : 'bg-purple-50 text-gray-700'
                      }`}>
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Patient Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Prescribed for: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {prescription.first_name} {prescription.last_name}
                    </span>
                  </p>
                </div>

                {/* Print Button */}
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handlePrintPrescription(prescription)}
                    className={`py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 ${
                      isDark 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print Prescription</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💊</div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>No Prescriptions Yet</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your prescriptions will appear here after your doctor visits.
            </p>
            <button 
              onClick={() => navigate('/book_appointment')} 
              className={`py-2 px-6 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              Book an Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Family Members Section
  const renderFamilyMembers = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Family Members</h2>
          <button 
            onClick={() => navigate('/add_family_member')} 
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isDark 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            Add Family Member
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.family_members.map((member) => (
            <div key={member.id} className={`rounded-xl p-6 border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{member.first_name} {member.last_name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{member.age} years, {member.gender}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  isDark ? 'bg-teal-600' : 'bg-gradient-to-r from-teal-500 to-blue-500'
                }`}>
                  {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate(`/edit_family_member/${member.id}`)} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {data.family_members.length === 0 && (
            <div className="md:col-span-3 text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No family members added yet</p>
              <button 
                onClick={() => navigate('/add_family_member')} 
                className={`font-medium ${
                  isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'
                }`}
              >
                Add your first family member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Billing Section
  const renderBilling = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>Billing & Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bill ID</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Patient</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.bills.map((bill, index) => (
                <tr key={bill.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="p-4 text-sm font-medium">
                    <span className={isDark ? 'text-white' : 'text-gray-800'}>
                      #{bill.id}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">
                    <span className={isDark ? 'text-white' : 'text-gray-800'}>
                      {bill.first_name} {bill.last_name}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold">
                    <span className={isDark ? 'text-white' : 'text-gray-800'}>
                      ₹{parseFloat(bill.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(bill.status)}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {bill.bill_date}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {bill.description || 'Consultation Fee'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleViewBill(bill)} 
                        className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                          isDark 
                            ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        View
                      </button>
                      {bill.status === 'Pending' ? (
                        <button 
                          onClick={() => handlePayBill(bill)} 
                          className={`py-1 px-3 rounded text-sm font-medium transition-colors ${
                            isDark 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button 
                          className={`py-1 px-3 rounded text-sm font-medium ${
                            isDark 
                              ? 'bg-gray-600 text-gray-400 cursor-default' 
                              : 'bg-gray-400 text-white cursor-default'
                          }`}
                          disabled
                        >
                          Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data.bills.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No bills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Reports Section
  const renderReports = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>Health Reports & Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6">
            <h3 className="font-semibold mb-4">Appointment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Appointments:</span>
                <span className="font-bold">{data.appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled:</span>
                <span className="font-bold">{data.appointments.filter(a => a.status === 'Scheduled').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-bold">{data.appointments.filter(a => a.status === 'Completed').length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6">
            <h3 className="font-semibold mb-4">Medical Records Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Records:</span>
                <span className="font-bold">{data.medical_records.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Family Members:</span>
                <span className="font-bold">{data.family_members.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Records:</span>
                <span className="font-bold">{data.medical_records.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Section
  const renderSettings = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 transition-colors duration-300`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>Account Settings</h2>
        <div className="space-y-6">
          <div className={`rounded-xl p-6 border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Family Information</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Family ID</p>
                <p className={`font-mono font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.family_id}</p>
              </div>
              <button className={`py-2 px-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}>
                Copy ID
              </button>
            </div>
          </div>
          
          <div className={`rounded-xl p-6 border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" defaultChecked />
                <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Appointment Reminders</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" defaultChecked />
                <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bill Payment Notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Health Tips & Updates</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="flex">
          <PatientSidebar 
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  currentPath={currentPath}
  onNavigate={handleNavigate}
  isDark={isDark}
  onThemeToggle={() => setIsDark(!isDark)}
  familyId={data.family_id}
  patientName={data.profile.first_name}
  activeSection={activeSection}
  onSectionChange={setActiveSection}
/>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="flex">
        {/* Patient Sidebar */}
        <PatientSidebar 
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  currentPath={currentPath}
  onNavigate={handleNavigate}
  isDark={isDark}
  onThemeToggle={() => setIsDark(!isDark)}
  familyId={data.family_id}
  patientName={data.profile.first_name}
  activeSection={activeSection}
  onSectionChange={setActiveSection} // Add this line
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
                  {activeSection === 'dashboard' ? 'Patient Dashboard' : 
                   activeSection === 'profile' ? 'Profile' :
                   activeSection === 'appointments' ? 'Appointments' :
                   activeSection === 'medical' ? 'Medical Records' :
                   activeSection === 'prescriptions' ? 'Prescriptions' : 
                   activeSection === 'family' ? 'Family Members' :
                   activeSection === 'billing' ? 'Billing' :
                   activeSection === 'reports' ? 'Reports' : 'Settings'}
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
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-500 text-red-700'
              }`}>
                {error}
              </div>
            )}
            
            {/* Welcome Section for Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="mb-8">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-lg">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Welcome back, {data.profile.first_name || 'Patient'}!
                      </h1>
                      <p className="text-teal-100 opacity-90">
                        Here's your health overview and recent activities.
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
            )}

            {/* Dynamic Content */}
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'appointments' && renderAppointments()}
            {activeSection === 'medical' && renderMedicalRecords()}
            {activeSection === 'prescriptions' && renderPrescriptions()}
            {activeSection === 'family' && renderFamilyMembers()}
            {activeSection === 'billing' && renderBilling()}
            {activeSection === 'reports' && renderReports()}
            {activeSection === 'settings' && renderSettings()}
          </main>
        </div>
      </div>

      {/* Upload Medical Record Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto border border-gray-200 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Medical Record</h3>
          <form onSubmit={handleUploadSubmit}>
            <div className="mb-4">
              <select 
                name="member_id" 
                onChange={handleUploadChange} 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                required
                value={formData.member_id}
              >
                <option value="">Select Family Member</option>
                {data.family_members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <input 
                name="record_type" 
                onChange={handleUploadChange} 
                placeholder="Record Type" 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white" 
                required 
                value={formData.record_type}
              />
            </div>
            
            <div className="mb-4">
              <input 
                name="record_date" 
                type="date" 
                value={formData.record_date} 
                onChange={handleUploadChange} 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white" 
                required 
              />
            </div>
            
            <div className="mb-4">
              <textarea 
                name="description" 
                onChange={handleUploadChange} 
                placeholder="Description" 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white" 
                rows="3"
                value={formData.description}
              />
            </div>
            
            <div className="mb-6">
              <input 
                name="record_file" 
                type="file" 
                onChange={handleUploadChange} 
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white" 
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-sm"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Bill Details Modal */}
      <Modal show={showBillModal} onClose={() => setShowBillModal(false)}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto border border-gray-200 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Bill Details</h3>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Bill ID</p>
                  <p className="font-medium text-gray-800">{selectedBill.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className="font-medium text-gray-800">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedBill.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedBill.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Amount</p>
                <p className="font-medium text-gray-800 text-lg">₹{parseFloat(selectedBill.amount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Date</p>
                <p className="font-medium text-gray-800">{selectedBill.bill_date}</p>
              </div>
              {selectedBill.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="font-medium text-gray-800">{selectedBill.description}</p>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowBillModal(false)} 
                  className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Close
                </button>
                {selectedBill.status === 'Pending' && (
                  <button 
                    onClick={() => {
                      handlePayBill(selectedBill);
                      setShowBillModal(false);
                    }}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onClose={() => {
        if (paymentStep !== 'processing') {
          setShowPaymentModal(false);
        }
      }}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto border border-gray-200 shadow-lg">
          {paymentStep === 'details' && (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h3>
              {selectedBill && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Bill Amount:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{parseFloat(selectedBill.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Bill ID:</span>
                    <span className="font-medium">#{selectedBill.id}</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="nameOnCard"
                      value={paymentData.nameOnCard}
                      onChange={handlePaymentInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentInputChange}
                      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handlePaymentInputChange}
                        className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handlePaymentInputChange}
                        className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowPaymentModal(false)}
                    className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Pay ₹{selectedBill ? parseFloat(selectedBill.amount || 0).toLocaleString('en-IN') : '0'}
                  </button>
                </div>
              </form>
              
              {/* Demo card info */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 text-center">
                  <strong>Demo:</strong> Use any card details for testing
                </p>
              </div>
            </>
          )}
          
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}
          
          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
              <p className="text-sm text-gray-500">Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          )}
          
          {paymentStep === 'failed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">We couldn't process your payment. Please try again.</p>
              <button 
                onClick={() => setPaymentStep('details')}
                className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PatientDashboard;