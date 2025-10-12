import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorSchedule } from '../services/api';
import Navbar from '../components/Navbar';

const DoctorSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getDoctorSchedule();
        
        // Robust data validation
        if (!res || !Array.isArray(res.schedule)) {
          throw new Error('Invalid schedule data received');
        }
        
        setSchedule(res.schedule);
      } catch (err) {
        setError(err.message || 'Failed to fetch schedule. Please try again.');
        setSchedule([]); // Reset schedule on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  // Safe date formatting function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Safe time formatting function
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Available: 'bg-green-100 text-green-800 border-green-200',
      Booked: 'bg-red-100 text-red-800 border-red-200',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    const className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
      statusConfig[status] || statusConfig.Available
    }`;
    
    return (
      <span className={className}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Navbar isDashboard={true} userType="doctor" />
      
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto pt-20 px-4">
          <nav className="py-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <button
                  onClick={() => handleBreadcrumbClick('/doctor_dashboard')}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                >
                  Dashboard
                </button>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-600 font-medium">Schedule</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-auto p-8 mt-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">My Schedule</h2>
            <p className="text-gray-600">View and manage your appointment schedule</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading schedule...</span>
            </div>
          )}

          {/* Schedule Table */}
          {!loading && !error && (
            <>
              {schedule.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule available</h3>
                  <p className="text-gray-600">Your schedule is currently empty. Check back later for updates.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Date
                          </div>
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Time
                          </div>
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {schedule.map((slot, index) => (
                        <tr 
                          key={slot.id || `slot-${index}`} 
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="p-4 text-sm font-medium text-gray-900">
                            {formatDate(slot.slot_time)}
                          </td>
                          <td className="p-4 text-sm text-gray-700">
                            {formatTime(slot.slot_time)}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={slot.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Summary Stats */}
          {!loading && schedule.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{schedule.length}</div>
                <div className="text-sm text-blue-800">Total Slots</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {schedule.filter(slot => slot.status === 'Available').length}
                </div>
                <div className="text-sm text-green-800">Available</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {schedule.filter(slot => slot.status !== 'Available').length}
                </div>
                <div className="text-sm text-gray-800">Booked/Cancelled</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/doctor_dashboard')}
              className="w-full sm:w-auto bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 transition-colors font-medium flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            
            {schedule.length > 0 && (
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Schedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 15l7-7 7 7" 
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default DoctorSchedule;