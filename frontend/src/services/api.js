// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const predictRisk = async (patientData) => {
//   const response = await API.post("/predict", patientData);
//   return response.data;
// };
// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000", // رابط الـ backend
// });

// // إضافة التوكن تلقائيًا
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default API;

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// 🔐 Interceptor: يضيف التوكن تلقائيًا
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standard prediction
export const predictRisk = async (patientData) => {
  const response = await API.post("/predict", patientData);
  return response.data;
};

// Digital twin prediction with timeline
export const predictRiskWithTimeline = async (patientData) => {
  const response = await API.post("/predict/digital-twin", patientData);
  return response.data;
};

export default API;
