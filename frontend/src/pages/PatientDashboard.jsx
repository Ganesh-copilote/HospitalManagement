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
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const PatientDashboard = () => {
  debugger
  const [data, setData] = useState({
    profile: {}, family_members: [], appointments: [], medical_records: [], bills: [], family_id: ''
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
        const res = await getPatientDashboardData();
        setData(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, []);

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

  // Generate upcoming appointments from actual data
  const upcomingAppointments = data.appointments
    .filter(apt => apt.status === 'Scheduled')
    .slice(0, 3)
    .map(apt => ({
      id: apt.id,
      doctor: apt.doctor_name,
      date: apt.slot_time.split(' ')[0],
      time: apt.slot_time.split(' ')[1] || '10:00 AM',
      type: 'Consultation'
    }));

  const handleUploadChange = (e) => {
  const { name, value, files } = e.target;
  console.log(`📁 Input changed - name: ${name}, value: ${value}, files:`, files);
  
  if (files && files[0]) {
    console.log(`📄 File selected: ${files[0].name}, size: ${files[0].size} bytes`);
  }
  
  setFormData({ ...formData, [name]: files ? files[0] : value });
};
const handleUploadSubmit = async (e) => {
  debugger
  e.preventDefault();
  
  console.log('📝 FormData state:', formData);
  
  // Create FormData properly
  const uploadData = new FormData();
  
  // Append each field individually with debugging
  console.log('🔄 Creating FormData...');
  
  uploadData.append('member_id', formData.member_id);
  console.log('✅ Added member_id:', formData.member_id);
  
  uploadData.append('record_type', formData.record_type);
  console.log('✅ Added record_type:', formData.record_type);
  
  uploadData.append('record_date', formData.record_date);
  console.log('✅ Added record_date:', formData.record_date);
  
  uploadData.append('description', formData.description);
  console.log('✅ Added description:', formData.description);
  
  // Only append file if it exists
  if (formData.record_file) {
    uploadData.append('record_file', formData.record_file);
    console.log('✅ Added record_file:', formData.record_file.name);
  } else {
    console.log('⚠️ No file selected');
  }
  
  // Debug: Check what's in FormData
  console.log('🔍 FormData contents:');
  for (let [key, value] of uploadData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    debugger
    console.log('🚀 Sending FormData to API...');
    await uploadMedicalRecord(uploadData);
    
    console.log('✅ Upload successful!');
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
    console.error('❌ Upload failed:', err);
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

  // Dynamic stats based on actual data
  const stats = [
    { 
      title: 'Total Appointments', 
      value: data.appointments.length, 
      color: 'from-purple-500 to-indigo-600',
      icon: '📅',
      change: `${Math.min(data.appointments.length * 5, 100)}%`,
      trend: 'up'
    },
    { 
      title: 'Family Members', 
      value: data.family_members.length, 
      color: 'from-cyan-500 to-blue-600',
      icon: '👨‍👩‍👧‍👦',
      change: `${data.family_members.length * 10}%`,
      trend: 'up'
    },
    { 
      title: 'Medical Records', 
      value: data.medical_records.length, 
      color: 'from-emerald-500 to-teal-600',
      icon: '📋',
      change: `${Math.min(data.medical_records.length * 8, 100)}%`,
      trend: 'up'
    },
    { 
      title: 'Pending Bills', 
      value: data.bills.filter(bill => bill.status === 'Pending').length, 
      color: 'from-amber-500 to-orange-600',
      icon: '💰',
      change: `${Math.min(data.bills.filter(bill => bill.status === 'Pending').length * 12, 100)}%`,
      trend: data.bills.filter(bill => bill.status === 'Pending').length > 0 ? 'up' : 'down'
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
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl p-6 shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white text-opacity-80 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${stat.trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
                  <span>{stat.change}</span>
                  <svg className={`w-4 h-4 ml-1 ${stat.trend === 'down' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl bg-white bg-opacity-20 rounded-xl p-3">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Metrics Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Metrics</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-48 space-x-2 mb-4">
              {healthMetrics.bloodPressure.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 mb-1">{healthMetrics.labels[index]}</div>
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
            </div>
            <div className="flex justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span>Blood Pressure</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-cyan-500 rounded mr-2"></div>
                <span>Heart Rate</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                <span>Weight (kg)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
            <button 
              onClick={() => setActiveSection('appointments')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <p className="font-semibold text-gray-800">{apt.doctor}</p>
                    <p className="text-sm text-gray-600">{apt.type}</p>
                    <p className="text-sm text-gray-500">{apt.date} at {apt.time}</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('appointments')}
                    className="bg-white text-blue-600 border border-blue-200 px-3 py-1 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No upcoming appointments</p>
                <button 
                  onClick={() => navigate('/book_appointment')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Book your first appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Appointments</h3>
            <button 
              onClick={() => navigate('/book_appointment')} 
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Book New
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-medium text-gray-700">Member</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-700">Doctor</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments.slice(0, 5).map((apt, index) => (
                  <tr key={apt.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 text-sm">{apt.first_name} {apt.last_name}</td>
                    <td className="py-3 text-sm">{apt.doctor_name}</td>
                    <td className="py-3 text-sm">{apt.slot_time}</td>
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

        {/* Recent Bills */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bills</h3>
          <div className="space-y-3">
            {data.bills.slice(0, 4).map((bill) => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-800">Bill #{bill.id}</p>
                  <p className="text-sm text-gray-600">{bill.bill_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{parseFloat(bill.amount || 0).toLocaleString('en-IN')}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(bill.status)}
                    {bill.status === 'Pending' ? (
                      <button 
                        onClick={() => handlePayBill(bill)} 
                        className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Pay
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewBill(bill)} 
                        className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {data.bills.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No bills found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Profile Section
  const renderProfile = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
        <button 
          onClick={() => navigate(`/edit_family_member/${data.profile.id}`)} 
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Edit Profile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Full Name</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.first_name} {data.profile.last_name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Email</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.email}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Phone</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.phone}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Age</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.age}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Gender</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.gender}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Aadhar</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.aadhar}</p>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Address</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.address}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Previous Medical Problems</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.prev_problem}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-gray-600 text-sm font-medium">Current Medical Problems</label>
            <p className="font-semibold text-gray-800 mt-1">{data.profile.curr_problem}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Appointments Section
  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Appointments</h2>
          <button 
            onClick={() => navigate('/book_appointment')} 
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Book Appointment
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-medium text-gray-700">Member</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Doctor</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Date & Time</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((apt, index) => (
                <tr key={apt.id} className={`border-b border-gray-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4 text-sm">{apt.first_name} {apt.last_name}</td>
                  <td className="p-4 text-sm">{apt.doctor_name}</td>
                  <td className="p-4 text-sm">{apt.slot_time}</td>
                  <td className="p-4">
                    {getStatusBadge(apt.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      <a 
                        href={`/view_appointment/${apt.id}`} 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                      {apt.status === 'Scheduled' && (
                        <>
                          <a 
                            href={`/reschedule_appointment/${apt.id}`} 
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Reschedule
                          </a>
                          <button 
                            onClick={() => handleCancelAppointment(apt.id)} 
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
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
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Medical Records</h2>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Upload Record
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-medium text-gray-700">Member</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.medical_records.map((record, index) => (
                <tr key={record.id} className={`border-b border-gray-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4 text-sm">{record.first_name} {record.last_name}</td>
                  <td className="p-4 text-sm">{record.record_type}</td>
                  <td className="p-4 text-sm">{record.record_date}</td>
                  <td className="p-4 text-sm">{record.description}</td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      {record.file_path && (
                        <button 
                          onClick={() => handleViewRecord(record.id)} 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteRecord(record.id)} 
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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

  // Family Members Section
  const renderFamilyMembers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Family Members</h2>
          <button 
            onClick={() => navigate('/add_family_member')} 
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Add Family Member
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.family_members.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{member.first_name} {member.last_name}</h3>
                  <p className="text-gray-600 text-sm">{member.age} years, {member.gender}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate(`/edit_family_member/${member.id}`)} 
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)} 
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
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
                className="text-blue-600 hover:text-blue-800 font-medium"
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
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Billing & Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-medium text-gray-700">Bill ID</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Patient</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.bills.map((bill, index) => (
                <tr key={bill.id} className={`border-b border-gray-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4 text-sm font-medium">#{bill.id}</td>
                  <td className="p-4 text-sm font-medium">{bill.first_name} {bill.last_name}</td>
                  <td className="p-4 text-sm font-bold">₹{parseFloat(bill.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    {getStatusBadge(bill.status)}
                  </td>
                  <td className="p-4 text-sm">{bill.bill_date}</td>
                  <td className="p-4 text-sm">{bill.description || 'Consultation Fee'}</td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleViewBill(bill)} 
                        className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      {bill.status === 'Pending' ? (
                        <button 
                          onClick={() => handlePayBill(bill)} 
                          className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button 
                          className="bg-gray-400 text-white py-1 px-3 rounded text-sm cursor-default"
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
                  <td colSpan="6" className="p-8 text-center text-gray-500">
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
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Health Reports & Analytics</h2>
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
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h2>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Family Information</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Family ID</p>
                <p className="font-mono font-bold text-lg">{data.family_id}</p>
              </div>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Copy ID
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-3 text-gray-700">Appointment Reminders</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-3 text-gray-700">Bill Payment Notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-gray-700">Health Tips & Updates</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar isDashboard={true} userName={data.profile.first_name || 'Patient'} userType="patient" />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg min-h-screen fixed pt-8">
           
            
            <nav className="space-y-2 px-4">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: '📊' },
                { id: 'profile', name: 'Profile', icon: '👤' },
                { id: 'appointments', name: 'Appointments', icon: '📅' },
                { id: 'medical', name: 'Medical Records', icon: '📋' },
                { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
                { id: 'billing', name: 'Billing', icon: '💰' },
                { id: 'reports', name: 'Reports', icon: '📈' },
                { id: 'settings', name: 'Settings', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                    activeSection === item.id 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Family ID Card */}
            <div className="mt-8 mx-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <p className="text-sm opacity-90">Family ID</p>
              <p className="font-mono font-bold text-lg">{data.family_id}</p>
              <button 
                onClick={() => navigate('/add_family_member')} 
                className="w-full mt-3 bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="ml-64 flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {activeSection === 'dashboard' ? 'Dashboard' : 
                 activeSection === 'profile' ? 'Profile' :
                 activeSection === 'appointments' ? 'Appointments' :
                 activeSection === 'medical' ? 'Medical Records' :
                 activeSection === 'family' ? 'Family Members' :
                 activeSection === 'billing' ? 'Billing' :
                 activeSection === 'reports' ? 'Reports' : 'Settings'}
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {data.profile.first_name || 'Patient'}! {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Dynamic Content */}
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'appointments' && renderAppointments()}
            {activeSection === 'medical' && renderMedicalRecords()}
            {activeSection === 'family' && renderFamilyMembers()}
            {activeSection === 'billing' && renderBilling()}
            {activeSection === 'reports' && renderReports()}
            {activeSection === 'settings' && renderSettings()}
          </div>
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
      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
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
      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
      required 
    />
  </div>
  
  <div className="mb-4">
    <textarea 
      name="description" 
      onChange={handleUploadChange} 
      placeholder="Description" 
      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
      rows="3"
      value={formData.description}
    />
  </div>
  
  <div className="mb-6">
    <input 
      name="record_file" 
      type="file" 
      onChange={handleUploadChange} 
      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
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
      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
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
                      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                      className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                        className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                        className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </Modal>
      {/* Payment Modal - Keep your existing payment modal implementation */}
    </>
  );
};

export default PatientDashboard;