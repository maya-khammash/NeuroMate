import API from "../services/api";

/**
 * NEW API v2 - Predictions
 * Use these endpoints for new development
 */

// Predict CT risk for patient data (not saved)
export const predictCTRisk = async (patientData) => {
  const response = await API.post("/api/v1/predictions/ct-risk", patientData);
  return response.data;
};

// Predict CT risk with digital twin timeline
export const predictCTRiskWithTimeline = async (patientData) => {
  const response = await API.post("/api/v1/predictions/ct-risk/digital-twin", patientData);
  return response.data;
};

// Predict coma outcome
export const predictComaOutcome = async (patientData) => {
  const response = await API.post("/api/v1/predictions/coma-outcome", patientData);
  return response.data;
};

// Predict CT risk for existing patient
export const predictExistingPatientCTRisk = async (patientId) => {
  const response = await API.get(`/api/v1/predictions/patient/${patientId}/ct-risk`);
  return response.data;
};

// Predict digital twin for existing patient
export const predictExistingPatientDigitalTwin = async (patientId) => {
  const response = await API.get(`/api/v1/predictions/patient/${patientId}/digital-twin`);
  return response.data;
};

// Check model health
export const getModelHealth = async () => {
  const response = await API.get("/api/v1/predictions/models/health");
  return response.data;
};

/**
 * Legacy API endpoints - for backward compatibility
 */

// Legacy: Predict risk
export const fetchRiskFromBackend = async (patientData) => {
  const response = await fetch("http://127.0.0.1:8000/predict/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      age: Number(patientData.age),
      sex: patientData.sex,
      mechanism: patientData.mechanism,
      history: patientData.history || null,
      timeSinceInjury: Number(patientData.timeSinceInjury),
      gcs: Number(patientData.gcs),
      tbiSeverity: patientData.tbiSeverity,
      vomiting: Number(patientData.vomiting),
      seizure: patientData.seizure,
      loc: Number(patientData.loc),
      amnesia: Number(patientData.amnesia),
      headache: Number(patientData.headache),
      pupil: patientData.pupil,
    }),
  });

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return await response.json();
};

// Legacy: Predict patient risk
export const predictPatientRisk = async (patientId) => {
  const response = await API.get(`/predict/patient/${patientId}`);
  return response.data;
};

// Legacy: Check model health
export const checkModelHealth = async () => {
  const response = await API.get("/predict/health");
  return response.data;
};

// Legacy: Predict risk (services/api.js)
export const predictRisk = async (patientData) => {
  const response = await API.post("/predict", patientData);
  return response.data;
};

// Legacy: Predict risk with timeline (services/api.js)
export const predictRiskWithTimeline = async (patientData) => {
  const response = await API.post("/predict/digital-twin", patientData);
  return response.data;
};
