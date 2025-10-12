import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeCheckins, checkInPatient, checkOutPatient } from '../services/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
const FrontOfficeCheckins = () => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getFrontOfficeCheckins();
      if (res.success) {
        setCheckins(res.checkins || []);
      } else {
        setError(res.error || 'Failed to fetch check-ins');
      }
    } catch (err) {
      setError('Failed to fetch check-ins. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (id) => {
    try {
      setError('');
      const result = await checkInPatient(id);
      if (result.success) {
        await fetchCheckins();
        setSelectedPatientId(''); // Reset dropdown after check-in
        alert('Patient checked in successfully!');
      } else {
        setError(result.error || 'Failed to check in patient');
      }
    } catch (err) {
      setError('Failed to check in patient. Please try again.');
    }
  };

  const handleCheckout = async (id) => {
    try {
      setError('');
      const result = await checkOutPatient(id);
      if (result.success) {
        await fetchCheckins();
        alert('Patient checked out successfully!');
      } else {
        setError(result.error || 'Failed to check out patient');
      }
    } catch (err) {
      setError('Failed to check out patient. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked In':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Checked In</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Completed</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Scheduled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4 min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
     
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button
                onClick={() => navigate('/front_office_dashboard')}
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
              <span className="text-gray-700 text-sm font-medium">Check-ins</span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Patient Check-ins</h1>
          <p className="text-gray-600 mt-2">Manage patient arrivals and departures</p>
        </div>

        {/* Check-in Dropdown Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Check In Patient</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="patientSelect" className="block text-sm font-medium text-gray-700">
              Select Patient to Check In
            </label>
            <select
              id="patientSelect"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select a patient...</option>
              {checkins
                .filter(checkin => ['Scheduled', 'Pending'].includes(checkin.status))
                .map(checkin => (
                  <option key={checkin.id} value={checkin.id}>
                    {checkin.patient_name} - {checkin.time} with Dr. {checkin.doctor_name}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={() => selectedPatientId && handleCheckin(selectedPatientId)}
            disabled={!selectedPatientId}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Check In Selected Patient
          </button>
        </div>

        {/* All Patients Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Patients</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : checkins.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checkins.map(checkin => (
                    <tr key={checkin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">{checkin.patient_name}</span>
                          {checkin.phone && <span className="text-sm text-gray-500">{checkin.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{checkin.doctor_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{checkin.time}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(checkin.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {checkin.status === 'Scheduled' || checkin.status === 'Pending' ? (
                            <button
                              onClick={() => handleCheckin(checkin.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Check In
                            </button>
                          ) : checkin.status === 'Checked In' ? (
                            <button
                              onClick={() => handleCheckout(checkin.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Check Out
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">No Action</span>
                          )}
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
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Check back later or ensure appointments are scheduled for today.
              </p>
            </div>
          )}
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/front_office_dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default FrontOfficeCheckins;