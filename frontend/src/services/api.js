import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Flask backend
  withCredentials: true,            // important for session cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleError = (error) => {
  return error.response?.data?.error || 'An error occurred';
};

export const login = async (data) => {
  try {
    const res = await api.post('/login', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const register = async (data) => {
  try {
    const res = await api.post('/register', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const logout = async () => {
  try {
    const res = await api.get('/logout');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getPatientDashboardData = async () => {
  try {
    const res = await api.get('/patient_dashboard');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const addFamilyMember = async (data) => {
  try {
    const res = await api.post('/add_family_member', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const editFamilyMember = async (id, data) => {
  try {
    const res = await api.post(`/edit_family_member/${id}`, data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteFamilyMember = async (id) => {
  try {
    const res = await api.get(`/delete_family_member/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getBookAppointmentData = async () => {
  try {
    const res = await api.get('/book_appointment');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const bookAppointment = async (data) => {
  try {
    const res = await api.post('/book_appointment', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getAppointment = async (id) => {
  try {
    const res = await api.get(`/view_appointment/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const cancelAppointment = async (id) => {
  try {
    const res = await api.get(`/cancel_appointment/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const uploadMedicalRecord = async (formData) => {
  try {
    const res = await api.post('/upload_medical_record', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const payBill = async (id) => {
  try {
    const res = await api.get(`/pay_bill/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getPatientDetails = async (id) => {
  try {
    const res = await api.get(`/view_patient_details/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorDashboardData = async () => {
  try {
    const res = await api.get('/doctor_dashboard');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorAppointments = async () => {
  try {
    const res = await api.get('/doctor_appointments');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorMedicalRecords = async () => {
  try {
    const res = await api.get('/doctor_medical_records');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorPatients = async () => {
  try {
    const res = await api.get('/doctor_patients');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorPrescriptions = async () => {
  try {
    const res = await api.get('/doctor_prescriptions');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const addPrescription = async (data) => {
  try {
    const res = await api.post('/doctor_prescriptions', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorSchedule = async () => {
  try {
    const res = await api.get('/doctor_schedule');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorPatientDetails = async (id) => {
  try {
    const res = await api.get(`/doctor_view_patient/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficeDashboardData = async () => {
  try {
    const res = await api.get('/front_office_dashboard');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficePatients = async () => {
  try {
    const res = await api.get('/front_office_patient');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficeCheckins = async () => {
  try {
    const res = await api.get('/front_office_checkins');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const checkInPatient = async (id) => {
  try {
    const res = await api.post(`/front_office_checkins/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficeAppointments = async () => {
  try {
    const res = await api.get('/front_office_appointments');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficePayments = async () => {
  try {
    const res = await api.get('/front_office_payments');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficeReports = async () => {
  try {
    const res = await api.get('/front_office_reports');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficePatientDetails = async (id) => {
  try {
    const res = await api.get(`/front_office_view_patient/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};