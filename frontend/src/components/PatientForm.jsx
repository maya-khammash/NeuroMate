import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictRiskWithTimeline } from "../services/api";
import DigitalTwinTimeline from "./DigitalTwinTimeline";
import "../styles/patientForm.css";

function PatientForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    mechanism: "",
    history: "",
    timeSinceInjury: "",
    gcs: "",
    tbiSeverity: "",
    vomiting: "",
    seizure: "",
    loc: "",
    amnesia: "",
    headache: "",
    pupil: "",
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const payload = {
        age: Number(formData.age),
        sex: formData.sex,
        mechanism: formData.mechanism,
        history: formData.history || null,
        timeSinceInjury: Number(formData.timeSinceInjury),
        gcs: Number(formData.gcs),
        tbiSeverity: formData.tbiSeverity,
        vomiting: Number(formData.vomiting),
        seizure: formData.seizure,
        loc: Number(formData.loc),
        amnesia: Number(formData.amnesia),
        headache: Number(formData.headache),
        pupil: formData.pupil,
      };
  
      console.log("SENDING PAYLOAD:", payload);
  
      const result = await predictRiskWithTimeline(payload);
      console.log("BACKEND RESULT:", result);

      setPredictionResult(result);
      setShowTimeline(true);
  
      localStorage.setItem(
        "patientData",
        JSON.stringify({
          ...payload,
          risk_score: result.risk_score,
          risk_level: result.risk_level,
        })
      );
  
      // Don't navigate immediately - show the timeline first
      // navigate("/doctor");
    } catch (error) {
      console.error("PREDICTION ERROR:", error.response?.data || error);
      alert("Prediction failed");
    }
  };
  

  return (
    <div className="patient-container">
      <h1>Clinical Patient Data Entry</h1>
      <p className="subtitle">Enter neurological assessment parameters</p>

      <form className="patient-form" onSubmit={handleSubmit}>
        {/* SECTION 1 */}
        <div className="section-title">Demographics & Injury</div>

        <div className="form-group">
          <label>Age</label>
          <input name="age" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Sex</label>
          <select name="sex" onChange={handleChange}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <div className="form-group">
          <label>Injury Mechanism</label>
          <select name="mechanism" onChange={handleChange}>
            <option value="">Select</option>
            <option>Fall</option>
            <option>Motor Vehicle Accident</option>
            <option>Assault</option>
            <option>Sports Injury</option>
          </select>
        </div>

        <div className="form-group">
          <label>Time Since Injury (hrs)</label>
          <input name="timeSinceInjury" onChange={handleChange} />
        </div>

        {/* SECTION 2 */}
        <div className="section-title">Neurological Status</div>

        <div className="form-group">
          <label>GCS</label>
          <input name="gcs" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>TBI Severity</label>
          <select name="tbiSeverity" onChange={handleChange}>
            <option value="">Select</option>
            <option>Mild</option>
            <option>Moderate</option>
            <option>Severe</option>
          </select>
        </div>

        <div className="form-group">
          <label>Loss of Consciousness (min)</label>
          <input name="loc" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Amnesia (min)</label>
          <input name="amnesia" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Pupil Response</label>
          <select name="pupil" onChange={handleChange}>
            <option value="">Select</option>
            <option>Normal</option>
            <option>Sluggish</option>
            <option>Non-reactive</option>
          </select>
        </div>

        {/* SECTION 3 */}
        <div className="section-title">Associated Symptoms</div>

        <div className="form-group">
          <label>Vomiting Episodes</label>
          <input name="vomiting" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Seizure</label>
          <select name="seizure" onChange={handleChange}>
            <option value="">Select</option>
            <option>None</option>
            <option>Focal</option>
            <option>Generalized</option>
          </select>
        </div>

        <div className="form-group">
          <label>Headache (1–10)</label>
          <input name="headache" onChange={handleChange} />
        </div>

        <button className="predict-btn" type="submit">
          Run Clinical Assessment
        </button>
      </form>

      {showTimeline && predictionResult && (
        <DigitalTwinTimeline patientData={{
          age: Number(formData.age),
          sex: formData.sex,
          mechanism: formData.mechanism,
          history: formData.history || null,
          timeSinceInjury: Number(formData.timeSinceInjury),
          gcs: Number(formData.gcs),
          tbiSeverity: formData.tbiSeverity,
          vomiting: Number(formData.vomiting),
          seizure: formData.seizure,
          loc: Number(formData.loc),
          amnesia: Number(formData.amnesia),
          headache: Number(formData.headache),
          pupil: formData.pupil,
        }} />
      )}
    </div>
  );
}

export default PatientForm;
