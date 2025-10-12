import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeAppointments, cancelAppointment } from '../services/api';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';

import Breadcrumb from '../components/Breadcrumb';

const FrontOfficeAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getFrontOfficeAppointments();
      setAppointments(res.appointments);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancelLoading(appointmentId);
      await cancelAppointment(appointmentId);
      
      // Update the appointment status locally without removing the row
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'Cancelled' }
            : apt
        )
      );
      
      // Also update the selected appointment if it's the one being cancelled
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: 'Cancelled' }));
      }
      
      alert('Appointment cancelled successfully');
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium border';
    const statusClass = statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return baseClasses + ' ' + statusClass;
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
      full: date.toLocaleString("en-GB")
    };
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    return appointment.status === 'Scheduled' || appointment.status === 'Pending';
  };

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="container mx-auto px-4 py-8">
           <Breadcrumb>
         </Breadcrumb>
         <ScrollToTop>  </ScrollToTop>
         


         
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Appointments</h1>
            <p className="text-slate-600">Manage and view all patient appointments</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{appointments.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {appointments.filter(apt => apt.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {appointments.filter(apt => apt.status === 'Pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 text-xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Cancelled</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {appointments.filter(apt => apt.status === 'Cancelled').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">❌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Table Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">All Appointments</h2>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-600 text-lg mr-2">⚠</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => setError('')}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-slate-600 font-medium">Loading appointments...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.length > 0 ? (
                      appointments.map(apt => (
                        <tr 
                          key={apt.id} 
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 text-sm font-medium">
                                  {(apt.first_name?.[0] || '') + (apt.last_name?.[0] || '')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {apt.first_name} {apt.last_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-700">{apt.doctor_name}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-600">
                              {formatDateTime(apt.slot_time).date}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-600 font-medium">
                              {formatDateTime(apt.slot_time).time}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={getStatusBadge(apt.status)}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {/* View Button - Always visible */}
                              <button
                                onClick={() => handleViewAppointment(apt)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                              >
                                <span className="mr-1">👁️</span>
                                View
                              </button>
                              
                              {/* Cancel Button - Always visible but conditionally disabled */}
                              {/* Cancel Button - Always visible but conditionally disabled */}
<button
  onClick={() => handleCancelAppointment(apt.id)}
  disabled={!canCancelAppointment(apt) || cancelLoading === apt.id}
  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
    canCancelAppointment(apt) 
      ? 'bg-red-500 hover:bg-red-600 text-white' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  } ${
    cancelLoading === apt.id ? 'bg-red-300' : ''
  }`}
>
  {cancelLoading === apt.id ? (
    <>
      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
      Cancelling...
    </>
  ) : (
    <>
      <span className="mr-1">❌</span>
      Cancel {/* ALWAYS SHOW "Cancel" */}
    </>
  )}
</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl mb-4">📅</span>
                            <p className="text-slate-500 text-lg font-medium mb-2">No appointments found</p>
                            <p className="text-slate-400">There are no appointments scheduled yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Patient Information */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <span className="mr-2">👤</span>
                    Patient Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-slate-600">Name</label>
                      <p className="font-medium text-slate-800">
                        {selectedAppointment.first_name} {selectedAppointment.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <span className="mr-2">👨‍⚕️</span>
                    Doctor Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-slate-600">Doctor</label>
                      <p className="font-medium text-slate-800">{selectedAppointment.doctor_name}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <span className="mr-2">📅</span>
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Date</label>
                      <p className="font-medium text-slate-800">
                        {formatDateTime(selectedAppointment.slot_time).date}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Time</label>
                      <p className="font-medium text-slate-800">
                        {formatDateTime(selectedAppointment.slot_time).time}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Status</label>
                      <div className="mt-1">
                        <span className={getStatusBadge(selectedAppointment.status)}>
                          {selectedAppointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Close
                </button>
                
                {/* Cancel button - always visible but conditionally disabled */}
                <button
                  onClick={() => {
                    if (canCancelAppointment(selectedAppointment)) {
                      handleCancelAppointment(selectedAppointment.id);
                      setShowDetailsModal(false);
                    }
                  }}
                  disabled={!canCancelAppointment(selectedAppointment) || cancelLoading === selectedAppointment.id}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                    canCancelAppointment(selectedAppointment) 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } ${
                    cancelLoading === selectedAppointment.id ? 'bg-red-300' : ''
                  }`}
                >
                  {cancelLoading === selectedAppointment.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">❌</span>
                      {selectedAppointment.status === 'Cancelled' ? 'Already Cancelled' : 'Cancel Appointment'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FrontOfficeAppointments;