import API from "../services/api";

/**
 * NEW API v2 - Students
 * Use these endpoints for new development
 */

// Get all cases for students (educational)
export const getStudentCases = async (params = {}) => {
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
  
  const response = await API.get(`/api/v1/patients?${queryParams}`);
  return response.data;
};

// Get single case for students
export const getStudentCaseById = async (caseId) => {
  const response = await API.get(`/api/v1/patients/${caseId}`);
  return response.data;
};

/**
 * Legacy API endpoints - for backward compatibility
 */

// Legacy: Get student cases
export const getStudentCasesLegacy = async () => {
  const response = await API.get("/student/cases");
  return response.data;
};

// Legacy: Get student case by ID
export const getStudentCaseByIdLegacy = async (id) => {
  const response = await API.get(`/student/case/${id}`);
  return response.data;
};
