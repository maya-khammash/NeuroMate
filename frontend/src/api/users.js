import API from "../services/api";

/**
 * NEW API v2 - Users
 * Use these endpoints for new development
 */

// Get current user info
export const getCurrentUser = async () => {
  const response = await API.get("/api/v1/users/me");
  return response.data;
};

// Get all doctors (admin only)
export const getDoctors = async () => {
  const response = await API.get("/api/v1/users/doctors");
  return response.data;
};

// Get all students (admin only)
export const getStudents = async () => {
  const response = await API.get("/api/v1/users/students");
  return response.data;
};

// Create user (admin only)
export const createUser = async (userData) => {
  const response = await API.post("/api/v1/users/", userData);
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  const response = await API.delete(`/api/v1/users/${userId}`);
  return response.data;
};

// Get patients for specific user
export const getUserPatients = async (userId, params = {}) => {
  const {
    page = 1,
    per_page = 20,
    patient_type
  } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString()
  });
  
  if (patient_type) queryParams.append('patient_type', patient_type);
  
  const response = await API.get(`/api/v1/users/${userId}/patients?${queryParams}`);
  return response.data;
};

/**
 * NEW API v2 - Admin
 * Use these endpoints for new development
 */

// Get admin dashboard
export const getAdminDashboard = async () => {
  const response = await API.get("/api/v1/admin/dashboard");
  return response.data;
};

// Get all users (admin)
export const getAllUsers = async () => {
  const response = await API.get("/api/v1/admin/users");
  return response.data;
};

// Get all patients (admin)
export const getAllPatients = async (params = {}) => {
  const {
    page = 1,
    per_page = 20,
    patient_type
  } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString()
  });
  
  if (patient_type) queryParams.append('patient_type', patient_type);
  
  const response = await API.get(`/api/v1/admin/patients?${queryParams}`);
  return response.data;
};

// Create user (admin endpoint)
export const createUserAdmin = async (userData) => {
  const response = await API.post("/api/v1/admin/users", userData);
  return response.data;
};

// Delete user (admin endpoint)
export const deleteUserAdmin = async (userId) => {
  const response = await API.delete(`/api/v1/admin/users/${userId}`);
  return response.data;
};

// Get system health
export const getSystemHealth = async () => {
  const response = await API.get("/api/v1/admin/system/health");
  return response.data;
};

/**
 * Legacy API endpoints - for backward compatibility
 */

// Legacy: Get all data (admin)
export const getAllData = async () => {
  const response = await API.get("/admin/all-data");
  return response.data;
};

// Legacy: Delete user (admin)
export const deleteUserLegacy = async (userId) => {
  const response = await API.delete(`/admin/user/${userId}`);
  return response.data;
};

// Legacy: Add user (admin)
export const addUser = async (userData) => {
  const response = await API.post("/admin/user", userData);
  return response.data;
};
