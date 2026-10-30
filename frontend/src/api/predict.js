import API from "./api";

/**
 * Predict CT risk for a new patient (not saved in database)
 */
export async function fetchRiskFromBackend(patientData) {
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
}

/**
 * Predict CT risk for an existing patient by ID
 * Uses trained XGBoost model for prediction
 */
export async function predictPatientRisk(patientId) {
  const response = await API.get(`/predict/patient/${patientId}`);
  return response.data;
}

/**
 * Check if the ML model is loaded and ready
 */
export async function checkModelHealth() {
  const response = await API.get("/predict/health");
  return response.data;
}
