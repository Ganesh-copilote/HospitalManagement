import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import AddFamilyMember from './pages/AddFamilyMember';
import EditFamilyMember from './pages/EditFamilyMember';
import BookAppointment from './pages/BookAppointment';
import RescheduleAppointment from './pages/RescheduleAppointment';
import ViewAppointment from './pages/ViewAppointment';
import ViewPatientDetails from './pages/ViewPatientDetails';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorMedicalRecords from './pages/DoctorMedicalRecords';
import DoctorPatients from './pages/DoctorPatients';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorViewPatient from './pages/DoctorViewPatient';
import FrontOfficeDashboard from './pages/FrontOfficeDashboard';
import FrontOfficePatient from './pages/FrontOfficePatient';
import FrontOfficeCheckins from './pages/FrontOfficeCheckins';
import FrontOfficeAppointments from './pages/FrontOfficeAppointments';
import FrontOfficePayments from './pages/FrontOfficePayments';
import FrontOfficeReports from './pages/FrontOfficeReports';
import FrontOfficeViewPatient from './pages/FrontOfficeViewPatient';
// import LoginWithUID from './pages/LoginWithUID';
// import LoginWithCredentials from './pages/LoginWithCredentials';
// import Landing from './pages/Landing';
// Add this import
import FrontOfficeRegister from './pages/FrontOfficeRegister';
// import AdminDashboard from './pages/ad';
import AdminDashboard from './pages/AdminDashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctor';
import FrontOffice from './pages/FrontOffice';
import Appointments from './pages/Appointments';
import Medical from './pages/Medical';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Prescriptions from './pages/Prescriptions';
import FrontOfficeMedicalRecords from './pages/FrontOfficeMedicalRecords';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/login-with-uid" element={<LoginWithUID />} />
        <Route path="/login-with-credentials" element={<LoginWithCredentials />} />
        <Route path="/" element={<Landing />} /> */}
        <Route path="/patient_dashboard" element={<PatientDashboard />} />
        <Route path="/add_family_member" element={<AddFamilyMember />} />
        <Route path="/edit_family_member/:memberId" element={<EditFamilyMember />} />
        <Route path="/book_appointment" element={<BookAppointment />} />
        <Route path="/reschedule_appointment/:id" element={<RescheduleAppointment />} />
        <Route path="/view_appointment/:id" element={<ViewAppointment />} />
        <Route path="/view_patient_details/:id" element={<ViewPatientDetails />} />
        <Route path="/doctor_dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor_appointments" element={<DoctorAppointments />} />
        <Route path="/doctor_medical_records" element={<DoctorMedicalRecords />} />
        <Route path="/doctor_patients" element={<DoctorPatients />} />
        <Route path="/doctor_prescriptions" element={<DoctorPrescriptions />} />
        <Route path="/doctor_prescriptions/:id" element={<DoctorPrescriptions />} />
        <Route path="/doctor_schedule" element={<DoctorSchedule />} />
        <Route path="/doctor_view_patient/:id" element={<DoctorViewPatient />} />
        <Route path="/front_office_dashboard" element={<FrontOfficeDashboard />} />
        <Route path="/front_office_patient" element={<FrontOfficePatient />} />
        <Route path="/front_office_checkins" element={<FrontOfficeCheckins />} />
        <Route path="/front_office_appointments" element={<FrontOfficeAppointments />} />
        <Route path="/front_office_payments" element={<FrontOfficePayments />} />
        <Route path="/front_office_reports" element={<FrontOfficeReports />} />
        <Route path="/front_office_view_patient/:id" element={<FrontOfficeViewPatient />} />
        
// Add this route to your Routes
        <Route path="/front_office_register" element={<FrontOfficeRegister />} />
        <Route path="/admin_dashboard" element={<AdminDashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/Doctors" element={<Doctors />} />
        <Route path="/front-office" element={<FrontOffice />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/medical" element={<Medical />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/front_office_prescriptions" element={<Prescriptions />} />
        <Route path="/get_all_medical_records" element={<FrontOfficeMedicalRecords/>} />
      </Routes>
    </Router>
  );
}

export default App;
