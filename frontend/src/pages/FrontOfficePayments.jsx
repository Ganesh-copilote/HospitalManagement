import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrontOfficePayments } from '../services/api';
import Navbar from '../components/Navbar';

const FrontOfficePayments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getFrontOfficePayments();
        setPayments(res.payments);
      } catch (err) {
        setError(err);
      }
    };
    fetchPayments();
  }, []);

  return (
    <>
      <Navbar isDashboard={true} userType="front_office" />
      <div className="container mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Payments</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Bill ID</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="odd:bg-gray-50">
                  <td className="p-3">{payment.patient_name}</td>
                  <td className="p-3">{payment.bill_id}</td>
                  <td className="p-3">{payment.amount}</td>
                  <td className="p-3">{payment.status}</td>
                  <td className="p-3">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FrontOfficePayments;