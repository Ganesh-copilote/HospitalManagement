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

// api.js - Update login function
export const login = async (data) => {
  debugger;
  try {
    let res;
    if (data.family_id) {
      res = await api.post('/api/login', { family_id: data.family_id });
    } else if (data.identifier && data.password) {
      res = await api.post('/api/login', {
        identifier: data.identifier,
        password: data.password
      });
    } else {
      throw new Error('Invalid login data');
    }
    return res.data; // Return the full response data including user_type
  } catch (error) {
    throw handleError(error);
  }
};

export const register = async (data) => {
  try {
    const res = await api.post('/api/register', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};
// Add to your api.js file
export const frontOfficeRegister = async (data) => {
  try {
    console.log('🔄 Frontend: Calling POST /api/front_office_register with data:', data);
    const response = await api.post('/api/front_office_register', data);
    console.log('✅ Frontend: Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Registration API call failed:', error);
    throw handleError(error);
  }
};



// src/services/api.js - Add new login functions
// export const loginWithUID = async (data) => {
//   try {
//     const res = await api.post('/api/login_with_uid', data);
//     return res.data;
//   } catch (error) {
//     throw handleError(error);
//   }
// };

// export const loginWithCredentials = async (data) => {
//   try {
//     const res = await api.post('/api/login_with_credentials', data);
//     return res.data;
//   } catch (error) {
//     throw handleError(error);
//   }
// };

// Keep other existing exports unchanged

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
    debugger
    const res = await api.get('/api/patient_dashboard');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const addFamilyMember = async (data) => {
  try {
    const res = await api.post('/api/add_family_member', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};


// api.js - Add these functions

// GET - Get family member details
export const getFamilyMember = async (id) => {
  debugger
  try {
    console.log(`🔄 Frontend: Calling GET /api/family_member/${id}`);
    const response = await api.get(`/api/family_member/${id}`);
    console.log('✅ Frontend: Family member data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Get family member API call failed:', error);
    throw handleError(error);
  }
};

// POST - Update family member
export const editFamilyMember = async (id, data) => {
  debugger
  try {
    console.log(`🔄 Frontend: Calling POST /api/edit_family_member/${id}`, data);
    const response = await api.post(`/api/edit_family_member/${id}`, data);
    console.log('✅ Frontend: Edit family member response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Edit family member API call failed:', error);
    throw handleError(error);
  }
};
export const deleteFamilyMember = async (id) => {
  try {
    console.log(`🔄 Deleting family member with ID: ${id}`);
    const res = await api.delete(`/api/delete_family_member/${id}`);
    console.log('✅ Delete response:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Delete family member API call failed:', error);
    throw handleError(error);
  }
};
export const getBookAppointmentData = async () => {
  try {
    console.log('🔄 Frontend: Calling GET /api/book_appointment...');
    const response = await api.get('/api/book_appointment');
    console.log('✅ Frontend: GET response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: GET API call failed:', error);
    throw handleError(error);
  }
};

export const bookAppointment = async (data) => {
  try {
    console.log('🔄 Frontend: Calling POST /api/book_appointment with data:', data);
    const response = await api.post('/api/book_appointment', data);
    console.log('✅ Frontend: POST response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: POST API call failed:', error);
    throw handleError(error);
  }
};
export const getAvailableSlots = async (doctorId, date) => {
  debugger
  try {
    console.log(`Fetching available slots for doctorId=${doctorId}, date=${date}`);
    const res = await api.get('http://127.0.0.1:5000/api/available_slots', {
      params: { doctor_id: doctorId, date: date }
    });
    console.log('Available slots response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching available slots:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to load available slots');
  }
};

export const getAppointment = async (id) => {
  try {
    const res = await api.get(`/api/view_appointment/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getRescheduleAppointment = async (appointmentId) => {
  try {
    console.log(`🔄 Frontend: Calling /api/reschedule_appointment/${appointmentId}`);
    const response = await api.get(`/api/reschedule_appointment/${appointmentId}`);
    console.log('✅ Frontend: Reschedule data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Reschedule API call failed:', error);
    throw handleError(error);
  }
};




// export const cancelAppointment = async (id) => {
//   try {
//     const res = await api.get(`/api/cancel_appointment/${id}`);
//     return res.data;
//   } catch (error) {
//     throw handleError(error);
//   }
// };
export const cancelAppointment = async (id) => {
  try {
    console.log(`🔄 Canceling appointment with ID: ${id}`);
    const res = await api.delete(`/api/cancel_appointment/${id}`);
    console.log('✅ Cancel appointment response:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Cancel appointment API call failed:', error);
    throw handleError(error);
  }
};

export const uploadMedicalRecord = async (formData) => {
  debugger
  try {
    const res = await api.post('/api/upload_medical_record', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteMedicalRecord = async (id) => {
  try {
    console.log(`🔄 Deleting medical record with ID: ${id}`);
    const res = await api.delete(`/api/delete_medical_record/${id}`);
    console.log('✅ Delete medical record response:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Delete medical record API call failed:', error);
    throw handleError(error);
  }
};
// Add these new payment functions to your api.js
export const initiatePayment = async (billId) => {
  try {
    console.log(`🔄 Frontend: Initiating payment for bill ${billId}`);
    const response = await api.post(`/api/initiate_payment/${billId}`);
    console.log('✅ Frontend: Initiate payment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Initiate payment API call failed:', error);
    throw handleError(error);
  }
};
export const verifyPayment = async (paymentId, billId) => {
  try {
    console.log(`🔄 Frontend: Verifying payment ${paymentId} for bill ${billId}`);
    const response = await api.post(`/api/verify_payment/${paymentId}`, {
      bill_id: billId
    });
    console.log('✅ Frontend: Verify payment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Verify payment API call failed:', error);
    throw handleError(error);
  }
};

export const payBill = async (billId) => {
  try {
    console.log(`🔄 Frontend: Paying bill ${billId}`);
    const response = await api.post(`/api/pay_bill/${billId}`);
    console.log('✅ Frontend: Pay bill response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Pay bill API call failed:', error);
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
    const res = await api.get('/api/doctor_dashboard');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorAppointments = async () => {
  try {
    debugger
    const res = await api.get('/api/doctor_appointments');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorMedicalRecords = async () => {
  try {
    console.log('🔄 Frontend: Calling GET /api/doctor_medical_records...');
    const response = await api.get('/api/doctor_medical_records');
    console.log('✅ Frontend: Doctor medical records response:', response);
    console.log('✅ Frontend: Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Doctor medical records API call failed:', error);
    throw handleError(error);
  }
};

// View medical record file
export const viewMedicalRecord = async (recordId) => {
  try {
    // This will open the file in a new tab
    window.open(`http://localhost:5000/api/view_medical_record/${recordId}`, '_blank');
    return { success: true };
  } catch (error) {
    console.error('❌ View medical record API call failed:', error);
    throw handleError(error);
  }
};

export const getDoctorPatients = async () => {
  try {
    const res = await api.get('/api/doctor_patients');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorPrescriptions = async () => {
  try {
    const res = await api.get('/api/doctor_prescriptions');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

// export const addPrescription = async (data) => {
//   try {
//     const res = await api.post('/api/doctor_prescriptions', data);
//     return res.data;
//   } catch (error) {
//     throw handleError(error);
//   }
// };

export const getDoctorSchedule = async () => {
  try {
    const res = await api.get('/api/doctor_schedule');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getDoctorPatientFullDetails = async (id) => {
  try {
    const res = await api.get(`/api/doctor_patient_full_details/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const addPrescription = async (data) => {
  try {
    const res = await api.post('/api/doctor_prescriptions', data);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficeDashboardData = async () => {
  try {
    const res = await api.get('/api/front_office_dashboard');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficePatients = async () => {
  try {
    const res = await api.get('/api/front_office_patient');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficeCheckins = async () => {
  try {
    const res = await api.get('/api/front_office_checkins');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const checkInPatient = async (id) => {
  try {
    const res = await api.post(`/api/front_office/checkin_appointment/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Add this to your api.js file
export const checkOutPatient = async (id) => {
  try {
    const res = await api.post(`/api/front_office/checkout_appointment/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};
// Get front office appointments
export const getFrontOfficeAppointments = async () => {
  try {
    const res = await api.get('/api/front_office_appointments');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

// // Cancel appointment
// export const cancelAppointment = async (id) => {
//   try {
//     console.log(`🔄 Canceling appointment with ID: ${id}`);
//     const res = await api.delete(`/api/cancel_appointment/${id}`);
//     console.log('✅ Cancel appointment response:', res.data);
//     return res.data;
//   } catch (error) {
//     console.error('❌ Cancel appointment API call failed:', error);
//     throw handleError(error);
//   }
// };


export const getFrontOfficePayments = async () => {
  try {
    debugger
    const res = await api.get('/api/front_office_payments');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};



export const getFrontOfficeReports = async () => {
  try {
    const res = await api.get('/api/front_office_reports');
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getFrontOfficePatientDetails = async (id) => {
  try {
    const res = await api.get(`/api/front_office_view_patient/${id}`);
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createBill = async (data) => {
  try {
    console.log('🔄 Frontend: Creating bill with data:', data);
    const response = await api.post('/api/front_office/create_bill', data);
    console.log('✅ Frontend: Create bill response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Create bill API call failed:', error);
    throw handleError(error);
  }
};

export const markBillAsPaid = async (billId) => {
  try {
    console.log(`🔄 Frontend: Marking bill ${billId} as paid`);
    const response = await api.post(`/api/front_office/pay_bill/${billId}`);
    console.log('✅ Frontend: Mark bill as paid response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Frontend: Mark bill as paid API call failed:', error);
    throw handleError(error);
  }
};
// Data Provider
// export const dataProvider = {
//   getList: async (resource, params) => {
//     const { page, perPage } = params.pagination;
//     const { field, order } = params.sort;
//     const query = {
//       page,
//       perPage,
//       sort: field,
//       order,
//       filter: JSON.stringify(params.filter || {}),
//     };
//     const url = `/api/admin/${resource}?${new URLSearchParams(query).toString()}`;
//     console.log('Fetching:', url); // Debug URL
//     const response = await api.get(url);
//     console.log('Response:', response.data); // Debug response
//     return { data: response.data.data, total: response.data.total };
//   },
//   getOne: async (resource, params) => {
//     const response = await api.get(`/api/admin/${resource}/${params.id}`);
//     return { data: response.data.data };
//   },
//   create: async (resource, params) => {
//     const response = await api.post(`/api/admin/${resource}`, params.data);
//     return { data: response.data.data };
//   },
//   update: async (resource, params) => {
//     const response = await api.put(`/api/admin/${resource}/${params.id}`, params.data);
//     return { data: response.data.data };
//   },
//   delete: async (resource, params) => {
//     await api.delete(`/api/admin/${resource}/${params.id}`);
//     return { data: params.previousData };
//   },
// };

// // Auth Provider
// export const authProvider = {
//   login: async ({ username, password }) => {
//     const response = await fetch('http://localhost:5000/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ identifier: username, password }),
//       credentials: 'include',
//     });
//     if (response.status < 200 || response.status >= 300) {
//       throw new Error('Login failed');
//     }
//     const data = await response.json();
//     if (data.success) {
//       localStorage.setItem('auth', data.user_type); // Set based on response
//     } else {
//       throw new Error('Login failed or unauthorized');
//     }
//     return Promise.resolve();
//   },
//   logout: () => {
//     localStorage.removeItem('auth');
//     return fetch('http://localhost:5000/logout', { credentials: 'include' }).then(() => Promise.resolve());
//   },
//   checkError: (error) => {
//     if (error.status === 401 || error.status === 403) {
//       localStorage.removeItem('auth');
//       return Promise.reject();
//     }
//     return Promise.resolve();
//   },
//   checkAuth: () => localStorage.getItem('auth') ? Promise.resolve() : Promise.reject(),
//   getPermissions: () => Promise.resolve(),
// };