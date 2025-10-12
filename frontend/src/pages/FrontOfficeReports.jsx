import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeReports, getFrontOfficeAppointments, getFrontOfficePayments } from '../services/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
const FrontOfficeReports = () => {
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedMonth, setSelectedMonth] = useState('');
  const [generating, setGenerating] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, appointmentsRes, paymentsRes] = await Promise.all([
        getFrontOfficeReports(),
        getFrontOfficeAppointments(),
        getFrontOfficePayments()
      ]);
      
      setReports(reportsRes.reports || []);
      setAppointments(appointmentsRes.appointments || []);
      setPayments(paymentsRes.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate real-time statistics from appointments and payments
  const calculateStats = () => {
    const today = new Date().toDateString();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newPatientsThisWeek = appointments.filter(apt => {
      const aptDate = new Date(apt.slot_time);
      return aptDate >= oneWeekAgo && aptDate <= new Date();
    }).reduce((unique, apt) => {
      const patientId = `${apt.first_name}-${apt.last_name}`;
      if (!unique.has(patientId)) {
        unique.set(patientId, apt);
      }
      return unique;
    }, new Map()).size;

    const totalPatientsToday = appointments.filter(apt => {
      const aptDate = new Date(apt.slot_time).toDateString();
      return aptDate === today;
    }).length;

    const pendingCheckins = appointments.filter(apt => 
      apt.status === 'Scheduled' || apt.status === 'Pending'
    ).length;

    return {
      newPatients: newPatientsThisWeek,
      totalPatientsToday,
      pendingCheckins
    };
  };

  const statsData = calculateStats();

  const generateAppointmentReport = () => {
    if (!dateRange.from || !dateRange.to) {
      alert('Please select date range');
      return;
    }

    setGenerating('appointment');
    
    // Simulate API call delay
    setTimeout(() => {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.slot_time);
        return aptDate >= fromDate && aptDate <= toDate;
      });

      // Calculate report data
      const totalAppointments = filteredAppointments.length;
      const completedAppointments = filteredAppointments.filter(apt => apt.status === 'Completed').length;
      const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'Cancelled').length;
      const scheduledAppointments = filteredAppointments.filter(apt => apt.status === 'Scheduled').length;

      // Group by doctor
      const doctorStats = filteredAppointments.reduce((acc, apt) => {
        if (!acc[apt.doctor_name]) {
          acc[apt.doctor_name] = 0;
        }
        acc[apt.doctor_name]++;
        return acc;
      }, {});

      // Create report object
      const report = {
        id: Date.now(),
        type: 'Appointment Report',
        date: new Date().toLocaleDateString(),
        period: `${dateRange.from} to ${dateRange.to}`,
        description: `Appointment analysis from ${dateRange.from} to ${dateRange.to}`,
        data: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          scheduledAppointments,
          completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
          doctorStats,
          appointments: filteredAppointments
        },
        generatedAt: new Date().toISOString()
      };

      // Add to reports list
      setReports(prev => [report, ...prev]);
      setGenerating('');
      
      // Download as JSON (you can change this to CSV or PDF)
      downloadReport(report, 'appointment-report');
    }, 1500);
  };

  const generateFinancialReport = () => {
    if (!selectedMonth) {
      alert('Please select a month');
      return;
    }

    setGenerating('financial');
    
    setTimeout(() => {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Filter payments for selected month
      const monthlyPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || payment.created_at);
        return paymentDate >= startDate && paymentDate <= endDate;
      });

      // Calculate financial data
      const totalRevenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalTransactions = monthlyPayments.length;
      const pendingPayments = payments.filter(p => p.status === 'Pending').length;
      
      // Group by payment method
      const paymentMethodStats = monthlyPayments.reduce((acc, payment) => {
        const method = payment.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 };
        }
        acc[method].count++;
        acc[method].amount += payment.amount || 0;
        return acc;
      }, {});

      const report = {
        id: Date.now() + 1,
        type: 'Financial Report',
        date: new Date().toLocaleDateString(),
        period: `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        description: `Financial report for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        data: {
          totalRevenue,
          totalTransactions,
          pendingPayments,
          paymentMethodStats,
          payments: monthlyPayments,
          averageTransaction: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : 0
        },
        generatedAt: new Date().toISOString()
      };

      setReports(prev => [report, ...prev]);
      setGenerating('');
      
      downloadReport(report, 'financial-report');
    }, 1500);
  };

  const downloadReport = (report, filename) => {
    // Create and download JSON file
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${filename}-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewReport = (report) => {
    // You can implement a modal to view report details
    console.log('View report:', report);
    alert(`Report Details:\nType: ${report.type}\nPeriod: ${report.period}\nTotal Records: ${report.data.totalAppointments || report.data.totalTransactions}`);
  };

  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    
    return months;
  };

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4 min-h-screen bg-gray-50">
        
         <Breadcrumb>
         </Breadcrumb>
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate real-time reports based on appointments and financial data</p>
        </div>

        {/* Real-time Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">New Patients This Week</p>
                <p className="text-2xl font-bold text-gray-800">{statsData.newPatients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Appointments Today</p>
                <p className="text-2xl font-bold text-gray-800">{statsData.totalPatientsToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Pending Check-ins</p>
                <p className="text-2xl font-bold text-gray-800">{statsData.pendingCheckins}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Appointment Reports */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment Reports</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={generateAppointmentReport}
                disabled={generating === 'appointment'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {generating === 'appointment' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📊</span>
                    Generate Appointment Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Financial Reports */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Financial Reports</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">--- Select Month ---</option>
                  {getMonthOptions().map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateFinancialReport}
                disabled={generating === 'financial'}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {generating === 'financial' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💰</span>
                    Generate Financial Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Reports Section */}
        <div className="bg-white rounded-2xl shadow-xl w-full overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Generated Reports</h2>
            <p className="text-gray-600 mt-1">Real-time reports based on current data</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : reports.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated On</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              report.type === 'Appointment Report' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {report.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{report.period}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{report.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {report.type === 'Appointment Report' ? (
                              <>
                                Total: {report.data.totalAppointments} | 
                                Completed: {report.data.completedAppointments} | 
                                Rate: {report.data.completionRate}%
                              </>
                            ) : (
                              <>
                                Revenue: ${report.data.totalRevenue} | 
                                Transactions: {report.data.totalTransactions}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewReport(report)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <span className="mr-1">👁️</span>
                              View
                            </button>
                            <button
                              onClick={() => downloadReport(report, report.type.toLowerCase().replace(' ', '-'))}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                              <span className="mr-1">📥</span>
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Generate your first report using the tools above. Reports are created in real-time from current appointment and payment data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontOfficeReports;