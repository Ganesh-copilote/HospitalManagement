import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorMedicalRecords } from '../services/api';
import Navbar from '../components/Navbar';

const DoctorMedicalRecords = () => {
  const [data, setData] = useState({
    doctor: {},
    medical_records: [],
    current_time: ''
  });
  const [error, setError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        console.log('🔄 Fetching doctor medical records...');
        const res = await getDoctorMedicalRecords();
        console.log('✅ API Response:', res);

        if (res.medical_records) {
          setData({
            doctor: res.doctor || {},
            medical_records: res.medical_records,
            current_time: res.current_time || ''
          });
        } else if (res.records) {
          setData({
            doctor: res.doctor || {},
            medical_records: res.records,
            current_time: res.current_time || ''
          });
        } else {
          setData({
            doctor: {},
            medical_records: [],
            current_time: ''
          });
        }
      } catch (err) {
        console.error('❌ Error fetching medical records:', err);
        setError(err.message || 'Failed to load medical records');
      }
    };
    fetchRecords();
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  return (
    <>
      <Navbar isDashboard={true} userType="doctor" />
      <div className="container mx-auto pt-20 px-6">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <button
                  onClick={() => handleBreadcrumbClick('/doctor_dashboard')}
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li className="text-blue-600 font-medium">Medical Records</li>
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-2xl shadow-xl max-w-7xl w-full mx-auto p-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-700 tracking-wide">
            Medical Records
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
              {error}
            </div>
          )}

          {data.medical_records && data.medical_records.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-lg">
              No medical records found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full border-collapse text-sm md:text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                    <th className="p-4 text-left font-semibold">Patient</th>
                    <th className="p-4 text-left font-semibold">Type</th>
                    <th className="p-4 text-left font-semibold">Date</th>
                    <th className="p-4 text-left font-semibold">Description</th>
                    <th className="p-4 text-left font-semibold">File</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medical_records &&
                    data.medical_records.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50`}
                      >
                        <td className="p-4 text-gray-700">
                          {record.first_name} {record.last_name}
                        </td>
                        <td className="p-4 text-gray-600 capitalize">
                          {record.record_type}
                        </td>
                        <td className="p-4 text-gray-600">{record.record_date}</td>
                        <td className="p-4 text-gray-600">{record.description}</td>
                        <td className="p-4">
                          {record.file_path && (
                            <a
  href={`http://localhost:5000/api/view_medical_record/${record.id}`}
  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
  target="_blank"
  rel="noopener noreferrer"
>
  View File
</a>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
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

export default DoctorMedicalRecords;