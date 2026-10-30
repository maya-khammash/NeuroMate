import API from "../services/api";

/**
 * NEW API v2 - Patients
 * Use these endpoints for new development
 */

// Get all patients with role-based access
export const getPatients = async (params = {}) => {
  const {
    page = 1,
    per_page = 20,
    patient_type,
    in_queue
  } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString()
  });
  
  if (patient_type) queryParams.append('patient_type', patient_type);
  if (in_queue !== undefined) queryParams.append('in_queue', in_queue.toString());
  
  const response = await API.get(`/api/v1/patients?${queryParams}`);
  return response.data;
};

// Get single patient by ID
export const getPatient = async (patientId) => {
  const response = await API.get(`/api/v1/patients/${patientId}`);
  return response.data;
};

// Create CT patient
export const createCTPatient = async (patientData) => {
  const response = await API.post("/api/v1/patients/ct", patientData);
  return response.data;
};

// Create Coma patient
export const createComaPatient = async (patientData) => {
  const response = await API.post("/api/v1/patients/coma", patientData);
  return response.data;
};

// Update patient queue status
export const updatePatientQueue = async (patientId, inQueue) => {
  const response = await API.patch(`/api/v1/patients/${patientId}/queue`, {
    in_queue: inQueue
  });
  return response.data;
};

// Delete patient
export const deletePatient = async (patientId) => {
  const response = await API.delete(`/api/v1/patients/${patientId}`);
  return response.data;
};

/**
 * Legacy API endpoints - for backward compatibility
 * These will be deprecated in future versions
 */

// Legacy: Get doctor patients
export const getDoctorPatients = async () => {
  const response = await API.get("/doctor/patients");
  return response.data;
};

// Legacy: Get patient by ID (doctor endpoint)
export const getPatientById = async (id) => {
  const response = await API.get(`/doctor/patient/${id}`);
  return response.data;
};

// Legacy: Add patient
export const addPatient = async (patientData) => {
  const response = await API.post("/doctor/patient", patientData);
  return response.data;
};

// Legacy: Add coma patient
export const addComaPatient = async (patientData) => {
  const response = await API.post("/doctor/patient/coma", patientData);
  return response.data;
};

// Legacy: Delete patient (doctor endpoint)
export const deletePatientLegacy = async (patientId) => {
  const response = await API.delete(`/doctor/patient/${patientId}`);
  return response.data;
};

// Legacy: Update queue (doctor endpoint)
export const updatePatientQueueLegacy = async (patientId, queueData) => {
  const response = await API.patch(`/doctor/patient/${patientId}/queue`, queueData);
  return response.data;
};
