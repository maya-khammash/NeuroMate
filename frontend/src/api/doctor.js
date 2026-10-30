import API from "../services/api";


export const getDoctorPatients = async () => {
  const res = await API.get("/doctor/patients");
  return res.data;
};
export const addPatient = async (patientData) => {
    const token = localStorage.getItem("token");
  
    const res = await API.post(
      "/doctor/patient",
      patientData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    return res.data;
  };

export const addComaPatient = async (patientData) => {
    const token = localStorage.getItem("token");
  
    const res = await API.post(
      "/doctor/patient/coma",
      patientData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    return res.data;
  };
  // Get single patient by id
export const getPatientById = async (id) => {
  const res = await API.get(`/doctor/patient/${id}`);
  return res.data;
};

// Delete patient
export const deletePatient = async (patientId) => {
  const res = await API.delete(`/doctor/patient/${patientId}`);
  return res.data;
};

// Update patient queue status
export const updatePatientQueue = async (patientId, queueData) => {
  const res = await API.patch(`/doctor/patient/${patientId}/queue`, queueData);
  return res.data;
};

  