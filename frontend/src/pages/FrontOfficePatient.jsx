import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficePatients } from '../services/api';
import Navbar from '../components/Navbar';
import FrontOfficeLayout from '../components/FrontOfficeLayout';
import Breadcrumb from '../components/Breadcrumb';
import ScrollToTop from '../components/ScrollToTop';

const FrontOfficePatient = () => {
  debugger
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    debugger
    
    const fetchPatients = async () => {
      try {
        const res = await getFrontOfficePatients();
        setPatients(res.patients);
      } catch (err) {
        setError(err);
      }
    };
    fetchPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    (`${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb>
         </Breadcrumb>
          <ScrollToTop>  </ScrollToTop>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
            <p className="text-gray-600 mt-2">Manage and view all patient records</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">{patients.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-medium">Average Age</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {patients.length > 0 
                  ? Math.round(patients.reduce((sum, p) => sum + parseInt(p.age), 0) / patients.length)
                  : 0
                }
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <h3 className="text-gray-500 text-sm font-medium">Male Patients</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {patients.filter(p => p.gender.toLowerCase() === 'male').length}
              </p>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Card Header with Search */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Patient Records</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Showing {filteredPatients.length} of {patients.length} patients
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Patient Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient, index) => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {patient.first_name[0]}{patient.last_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {patient.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {patient.age} years
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.gender.toLowerCase() === 'male' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td className="p-4">
                        <a 
                          href={`/front_office_view_patient/${patient.id}`}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search term' : 'Get started by adding a new patient'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontOfficePatient;