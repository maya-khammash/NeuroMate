import API from "./api";

// Get all cases
export const getStudentCases = async () => {
  const res = await API.get("/student/cases");
  return res.data;
};

// Get single case
export const getStudentCaseById = async (id) => {
  const res = await API.get(`/student/case/${id}`);
  return res.data;
};
