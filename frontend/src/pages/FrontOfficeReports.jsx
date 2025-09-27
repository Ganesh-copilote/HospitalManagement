import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficeReports } from '../services/api';
import Navbar from '../components/Navbar';

const FrontOfficeReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getFrontOfficeReports();
        setReports(res.reports);
      } catch (err) {
        setError(err);
      }
    };
    fetchReports();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Reports</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Report Type</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">File</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="odd:bg-gray-50">
                  <td className="p-3">{report.type}</td>
                  <td className="p-3">{report.date}</td>
                  <td className="p-3">{report.description}</td>
                  <td className="p-3">
                    {report.file_path && <a href={report.file_path} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">View</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FrontOfficeReports;