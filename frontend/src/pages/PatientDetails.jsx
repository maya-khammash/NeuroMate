import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientById } from "../api/doctor";
import { predictPatientRisk } from "../api/predict";
import Layout from "../components/Layout";
import Brain3D from "../components/Brain3D";
import DigitalTwinTimeline from "../components/DigitalTwinTimeline";
import RiskTimelineChart from "../components/RiskTimelineChart";

// Import axios for the digital twin endpoint
import API from "../services/api";

// Import chart components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Skeleton,
  LinearProgress,
  CircularProgress,
  Alert,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Psychology as BrainIcon,
  LocalHospital as InjuryIcon,
  Timer as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AutoGraph as PredictIcon,
  Science as AIIcon,
  Hotel as ComaIcon,
} from "@mui/icons-material";

const getSeverityConfig = (severity, gcs) => {
  const severityLower = severity?.toLowerCase() || "";
  if (severityLower.includes("severe") || gcs <= 8) {
    return {
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      icon: <ErrorIcon />,
      label: "Severe",
    };
  } else if (severityLower.includes("moderate") || (gcs > 8 && gcs <= 12)) {
    return {
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      icon: <WarningIcon />,
      label: "Moderate",
    };
  } else {
    return {
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.15)",
      icon: <CheckIcon />,
      label: "Mild",
    };
  }
};

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineData, setTimelineData] = useState(null);

  // What-if scenario state for coma patients
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfValues, setWhatIfValues] = useState({
    oxygen_saturation: 98,
    map_pressure: 85,
    sedation_level: 2,
    head_midline: true,
    temperature_c: 37.0,
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await getPatientById(id);
        setPatient(data);
      } catch (err) {
        console.error(err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  // Initialize what-if values when patient data loads
  useEffect(() => {
    if (patient && patient.patient_type === "coma") {
      setWhatIfValues({
        oxygen_saturation: patient.oxygen_saturation || 98,
        map_pressure: patient.map_pressure || 85,
        sedation_level: patient.sedation_level || 2,
        head_midline: patient.head_midline !== false,
        temperature_c: patient.temperature_c || 37.0,
      });
    }
  }, [patient]);

  // Fetch timeline data automatically for CT patients
  useEffect(() => {
    if (patient && patient.patient_type !== "coma") {
      setPrediction(null); // Clear old prediction data
      fetchTimelineData();
    }
  }, [patient, id]);

  const fetchTimelineData = async () => {
    try {
      // Use the digital twin endpoint to get timeline data
      const response = await API.get(`/predict/patient/${id}/digital-twin`);
      const result = response.data;
      
      if (result.timeline) {
        setTimelineData(result.timeline);
        setPrediction(result); // This will overwrite any old cached prediction
      }
    } catch (err) {
      console.error("Failed to fetch timeline data:", err);
      // Fallback to regular prediction if digital twin fails
      try {
        const fallbackResult = await predictPatientRisk(id);
        if (fallbackResult.timeline) {
          setTimelineData(fallbackResult.timeline);
          setPrediction(fallbackResult);
        }
      } catch (fallbackErr) {
        console.error("Fallback prediction also failed:", fallbackErr);
      }
    }
  };

  const handleWhatIfChange = (param, value) => {
    setWhatIfValues(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const resetWhatIfValues = () => {
    if (patient && patient.patient_type === "coma") {
      setWhatIfValues({
        oxygen_saturation: patient.oxygen_saturation || 98,
        map_pressure: patient.map_pressure || 85,
        sedation_level: patient.sedation_level || 2,
        head_midline: patient.head_midline !== false,
        temperature_c: patient.temperature_c || 37.0,
      });
    }
  };

  // Calculate simulated risk based on what-if values
  const calculateSimulatedRisk = () => {
    if (!patient || patient.patient_type !== "coma") return null;
    
    // Start from neutral baseline instead of patient's current values
    let baseRisk = 50; // Start from middle
    let baseStability = 50; // Start from middle
    
    // Calculate risk modifiers based on what-if values
    let riskModifier = 0;
    let stabilityModifier = 0;
    
    // Oxygen saturation impact
    const oxygen = whatIfValues.oxygen_saturation;
    if (oxygen < 90) riskModifier += 25;
    else if (oxygen < 94) riskModifier += 15;
    else if (oxygen >= 96) riskModifier -= 10;
    else if (oxygen >= 98) riskModifier -= 20;
    
    // MAP pressure impact
    const map = whatIfValues.map_pressure;
    if (map < 65) riskModifier += 20;
    else if (map < 70) riskModifier += 10;
    else if (map >= 80 && map <= 95) riskModifier -= 15;
    else if (map > 95) riskModifier += 5;
    
    // Sedation level impact
    const sedation = whatIfValues.sedation_level;
    if (sedation === 0) riskModifier += 15; // No sedation
    else if (sedation >= 4) riskModifier += 10; // Heavy sedation
    else if (sedation === 2 || sedation === 3) riskModifier -= 10; // Optimal sedation
    
    // Head positioning impact
    if (!whatIfValues.head_midline) riskModifier += 10;
    else riskModifier -= 5;
    
    // Temperature impact
    const temp = whatIfValues.temperature_c;
    if (temp < 36) riskModifier += 15;
    else if (temp > 38.5) riskModifier += 20;
    else if (temp >= 36.5 && temp <= 37.5) riskModifier -= 10;
    
    // Calculate stability modifiers (opposite of risk modifiers)
    stabilityModifier = -riskModifier * 0.8; // Stability moves opposite to risk
    
    // Final calculations with proper bounds
    const finalRisk = Math.max(5, Math.min(95, baseRisk + riskModifier));
    const finalStability = Math.max(5, Math.min(95, baseStability + stabilityModifier));
    
    return {
      deterioration_risk: finalRisk,
      stability_score: finalStability,
    };
  };

  const handlePredict = async () => {
    setPredicting(true);
    setPredictionError(null);
    try {
      const result = await predictPatientRisk(id);
      setPrediction(result);
      setDialogOpen(true);
    } catch (err) {
      console.error(err);
      setPredictionError("Failed to get AI prediction. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high": return "#ef4444";
      case "moderate": return "#f59e0b";
      case "low": return "#22c55e";
      default: return "#64748b";
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ maxWidth: 800 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Layout>
    );
  }

  if (!patient) return null;

  const severity = getSeverityConfig(patient.tbiSeverity, patient.gcs);

  const InfoItem = ({ label, value, icon, color = "text.primary" }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          background: "rgba(0, 212, 170, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, { sx: { color: "#00d4aa", fontSize: 18 } })}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color }}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Layout>
      <Fade in timeout={500}>
        <Box sx={{ maxWidth: 900 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Patient Details
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Complete medical profile for patient #{id}
            </Typography>
          </Box>

          {/* Patient and Brain Side by Side */}
          <Grid container spacing={3} sx={{ mb: 4, display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
            {/* Patient Profile Card - Left */}
            <Grid item xs={3}>
              <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2, textAlign: "center", flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mx: "auto",
                      mb: 1,
                      background: patient.patient_type === "coma"
                        ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                        : patient.sex?.toLowerCase() === "female"
                          ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                          : "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                      boxShadow: patient.patient_type === "coma"
                        ? "0 10px 30px rgba(168, 85, 247, 0.4)"
                        : patient.sex?.toLowerCase() === "female"
                          ? "0 10px 30px rgba(236, 72, 153, 0.4)"
                          : "0 10px 30px rgba(14, 165, 233, 0.4)",
                    }}
                  >
                    {patient.patient_type === "coma" ? (
                      <ComaIcon sx={{ fontSize: 30 }} />
                    ) : patient.sex?.toLowerCase() === "female" ? (
                      <FemaleIcon sx={{ fontSize: 30 }} />
                    ) : (
                      <MaleIcon sx={{ fontSize: 30 }} />
                    )}
                  </Avatar>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {patient.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
                    ID: #{patient.id}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                    <Chip
                      label={`${patient.age}y`}
                      size="small"
                      sx={{
                        background: "rgba(0, 212, 170, 0.15)",
                        color: "#00d4aa",
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                    {patient.patient_type !== "coma" && (
                      <Chip
                        label={patient.sex}
                        size="small"
                        sx={{
                          background: "rgba(168, 85, 247, 0.15)",
                          color: "#a855f7",
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    )}
                  </Box>

                  {/* GCS Score for CT Patients / Conscious State for Coma Patients */}
                  {patient.patient_type === "coma" ? (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                        Conscious State
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#a855f7" }}>
                        {patient.conscious_state || "Assessing..."}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                        GCS Score
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: severity.color }}>
                        {patient.gcs || "N/A"}
                        <Typography component="span" variant="caption" sx={{ color: "text.secondary" }}>
                          /15
                        </Typography>
                      </Typography>
                    </Box>
                  )}

                  {/* Risk Level */}
                  {patient.patient_type === "ct" && (
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                        Risk Level
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: severity.color }}>
                        {patient.risk_level}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Brain 3D - Middle */}
            <Grid item xs={5}>
              <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, textAlign: "center", flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                    3D Brain Visualization
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain3D 
                      riskLevel={patient.patient_type === "coma" ? 
                        (patient.conscious_state === "Conscious" ? "low" : 
                         patient.conscious_state === "Vegetative" ? "moderate" : 
                         patient.conscious_state === "Minimally Conscious" ? "moderate" : 
                         "high") : 
                        patient.risk_level} 
                      size={220} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Patient Status - Right */}
            <Grid item xs={4}>
              <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {patient.patient_type === "coma" ? (
                    // Coma patients: Show patient status
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                        Patient Status
                      </Typography>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Oxygen Saturation
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#22c55e" }}>
                            {patient.oxygen_saturation || "N/A"}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            MAP Pressure
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#3b82f6" }}>
                            {patient.map_pressure || "N/A"} mmHg
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Temperature
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#f59e0b" }}>
                            {patient.temperature_c || "N/A"}°C
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    // CT patients: Risk Timeline Chart
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                        Risk Timeline
                      </Typography>
                      <Box sx={{ height: 250, width: '100%', mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={timelineData ? Object.entries(timelineData).map(([time, risk]) => ({
                              time: time,
                              risk: Math.round(risk),
                            })) : []}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="time" 
                              stroke="rgba(255,255,255,0.5)"
                              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.5)"
                              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                              domain={[0, 100]}
                            />
                            <Line
                              type="monotone"
                              dataKey="risk"
                              stroke={patient.risk_level === 'High' ? '#ef4444' : patient.risk_level === 'Moderate' ? '#f59e0b' : '#22c55e'}
                              strokeWidth={3}
                              dot={{ fill: patient.risk_level === 'High' ? '#ef4444' : patient.risk_level === 'Moderate' ? '#f59e0b' : '#22c55e', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Risk progression over 24-hour period
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Low</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Moderate</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>High</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Medical Information - Full Width */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Medical Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {patient.patient_type === "coma" ? (
                      // Coma Patient Information
                      <>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Cause of Coma"
                            value={patient.cause_of_coma}
                            icon={<ComaIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="GCS Total"
                            value={patient.gcs_total}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Left Pupil Reactivity"
                            value={patient.left_pupil_reactivity}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Oxygen Saturation"
                            value={patient.oxygen_saturation ? `${patient.oxygen_saturation}%` : "N/A"}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Mean Arterial Pressure"
                            value={patient.map_pressure ? `${patient.map_pressure} mmHg` : "N/A"}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Heart Rate"
                            value={patient.heart_rate ? `${patient.heart_rate} bpm` : "N/A"}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Sedation Level"
                            value={patient.sedation_level}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Head Midline Position"
                            value={patient.head_midline ? "Yes" : "No"}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Temperature"
                            value={patient.temperature_c ? `${patient.temperature_c}°C` : "N/A"}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Deterioration Risk"
                            value={patient.deterioration_risk ? `${patient.deterioration_risk.toFixed(1)}%` : "N/A"}
                            icon={<WarningIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Stability Score"
                            value={patient.stability_score ? `${patient.stability_score.toFixed(1)}%` : "N/A"}
                            icon={<CheckIcon />}
                          />
                        </Grid>
                      </>
                    ) : (
                      // CT Patient Information (Original)
                      <>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Mechanism of Injury"
                            value={patient.mechanism}
                            icon={<InjuryIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Time Since Injury"
                            value={patient.timeSinceInjury ? `${patient.timeSinceInjury} hours` : "N/A"}
                            icon={<TimeIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="TBI Severity"
                            value={patient.tbiSeverity}
                            icon={<BrainIcon />}
                            color={severity.color}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Medical History"
                            value={patient.history}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Vomiting Episodes"
                            value={patient.vomiting}
                            icon={<WarningIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Loss of Consciousness"
                            value={patient.loc ? `${patient.loc} min` : "N/A"}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Amnesia Duration"
                            value={patient.amnesia ? `${patient.amnesia} min` : "N/A"}
                            icon={<TimeIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Headache Severity"
                            value={patient.headache ? `${patient.headache}/10` : "N/A"}
                            icon={<WarningIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Pupil Response"
                            value={patient.pupil}
                            icon={<PersonIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoItem
                            label="Seizure"
                            value={patient.seizure}
                            icon={<WarningIcon />}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Coma Patient Outcome Cards */}
            {patient.patient_type === "coma" && (
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  {/* Condition Over Time Chart */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#a855f7" }}>
                          Condition Over Time
                        </Typography>
                        <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Coma condition progression chart
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Deterioration Risk */}
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#a855f7" }}>
                          Deterioration Risk (24h)
                        </Typography>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 700, 
                            color: patient.deterioration_risk > 70 ? "#ef4444" : 
                                   patient.deterioration_risk > 40 ? "#f59e0b" : "#22c55e",
                            mb: 1
                          }}>
                            {patient.deterioration_risk?.toFixed(1) || "N/A"}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {patient.deterioration_risk > 70 ? "High Risk" : 
                             patient.deterioration_risk > 40 ? "Moderate Risk" : "Low Risk"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Stability Score */}
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#a855f7" }}>
                          Stability Score
                        </Typography>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 700, 
                            color: patient.stability_score > 70 ? "#22c55e" : 
                                   patient.stability_score > 40 ? "#f59e0b" : "#ef4444",
                            mb: 1
                          }}>
                            {patient.stability_score?.toFixed(1) || "N/A"}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {patient.stability_score > 70 ? "Stable" : 
                             patient.stability_score > 40 ? "Moderate" : "Unstable"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* What-If Scenario Simulator for Coma Patients */}
          {patient.patient_type === "coma" && (
            <Box sx={{ mb: 4 }}>
              {/* Header */}
              <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#a855f7", mb: 1 }}>
                        What-If Scenario Simulator
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Test different treatment parameters and see their impact
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant={whatIfMode ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setWhatIfMode(!whatIfMode)}
                        sx={{
                          background: whatIfMode ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" : "transparent",
                          borderColor: "#a855f7",
                          color: whatIfMode ? "white" : "#a855f7",
                          "&:hover": {
                            background: whatIfMode ? "linear-gradient(135deg, #9333ea 0%, #5558e3 100%)" : "rgba(168, 85, 247, 0.1)",
                          }
                        }}
                      >
                        {whatIfMode ? "Exit Simulator" : "Start Simulator"}
                      </Button>
                      {whatIfMode && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={resetWhatIfValues}
                          sx={{
                            borderColor: "rgba(255,255,255,0.2)",
                            color: "text.secondary",
                            "&:hover": {
                              borderColor: "#a855f7",
                              color: "#a855f7",
                            }
                          }}
                        >
                          Reset Values
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {whatIfMode && (
                <Fade in timeout={500}>
                  <Grid container spacing={3}>
                    {/* Control Panel */}
                    <Grid item xs={12} lg={7}>
                      <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ p: 3, flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#a855f7", display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#a855f7' }} />
                            Parameter Controls
                          </Typography>
                          
                          <Grid container spacing={3}>
                            {/* Oxygen Level */}
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: whatIfValues.oxygen_saturation < 90 ? '#ef4444' : whatIfValues.oxygen_saturation < 94 ? '#f59e0b' : '#22c55e' }} />
                                    Oxygen Saturation
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
                                    {whatIfValues.oxygen_saturation}%
                                  </Typography>
                                  <Slider
                                    value={whatIfValues.oxygen_saturation}
                                    onChange={(e, value) => handleWhatIfChange('oxygen_saturation', value)}
                                    min={85}
                                    max={100}
                                    step={1}
                                    marks={[
                                      { value: 85, label: '85%' },
                                      { value: 90, label: '90%' },
                                      { value: 95, label: '95%' },
                                      { value: 100, label: '100%' },
                                    ]}
                                    sx={{
                                      '& .MuiSlider-track': {
                                        background: whatIfValues.oxygen_saturation < 90 ? '#ef4444' :
                                                     whatIfValues.oxygen_saturation < 94 ? '#f59e0b' : '#22c55e',
                                      },
                                      '& .MuiSlider-thumb': {
                                        background: whatIfValues.oxygen_saturation < 90 ? '#ef4444' :
                                                   whatIfValues.oxygen_saturation < 94 ? '#f59e0b' : '#22c55e',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ 
                                    color: whatIfValues.oxygen_saturation < 90 ? "#ef4444" :
                                           whatIfValues.oxygen_saturation < 94 ? "#f59e0b" : "#22c55e",
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                  }}>
                                    {whatIfValues.oxygen_saturation < 90 ? "⚠️ Critical" :
                                     whatIfValues.oxygen_saturation < 94 ? "⚠️ Low" : "✓ Normal"}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>

                            {/* Blood Pressure Management */}
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: whatIfValues.map_pressure < 65 ? '#ef4444' : whatIfValues.map_pressure < 70 ? '#f59e0b' : whatIfValues.map_pressure > 95 ? '#f59e0b' : '#22c55e' }} />
                                    MAP Pressure
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
                                    {whatIfValues.map_pressure} mmHg
                                  </Typography>
                                  <Slider
                                    value={whatIfValues.map_pressure}
                                    onChange={(e, value) => handleWhatIfChange('map_pressure', value)}
                                    min={60}
                                    max={100}
                                    step={1}
                                    marks={[
                                      { value: 65, label: '65' },
                                      { value: 80, label: '80' },
                                      { value: 95, label: '95' },
                                    ]}
                                    sx={{
                                      '& .MuiSlider-track': {
                                        background: whatIfValues.map_pressure < 65 ? '#ef4444' :
                                                     whatIfValues.map_pressure < 70 ? '#f59e0b' :
                                                     whatIfValues.map_pressure > 95 ? '#f59e0b' : '#22c55e',
                                      },
                                      '& .MuiSlider-thumb': {
                                        background: whatIfValues.map_pressure < 65 ? '#ef4444' :
                                                   whatIfValues.map_pressure < 70 ? '#f59e0b' :
                                                   whatIfValues.map_pressure > 95 ? '#f59e0b' : '#22c55e',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ 
                                    color: whatIfValues.map_pressure < 65 ? "#ef4444" :
                                           whatIfValues.map_pressure > 95 ? "#f59e0b" : "#22c55e",
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                  }}>
                                    {whatIfValues.map_pressure < 65 ? "⚠️ Hypotension" :
                                     whatIfValues.map_pressure > 95 ? "⚠️ Hypertension" : "✓ Normal"}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>

                            {/* Sedation Level */}
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: whatIfValues.sedation_level === 0 ? '#ef4444' : whatIfValues.sedation_level >= 4 ? '#f59e0b' : '#22c55e' }} />
                                    Sedation Level
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
                                    {whatIfValues.sedation_level === 0 ? "None" :
                                     whatIfValues.sedation_level === 1 ? "Minimal" :
                                     whatIfValues.sedation_level === 2 ? "Light" :
                                     whatIfValues.sedation_level === 3 ? "Moderate" :
                                     whatIfValues.sedation_level === 4 ? "Heavy" : "Deep"}
                                  </Typography>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 1 }}>
                                      Current Level: {whatIfValues.sedation_level}/5
                                    </Typography>
                                    <Slider
                                      value={whatIfValues.sedation_level}
                                      onChange={(e, value) => handleWhatIfChange('sedation_level', value)}
                                      min={0}
                                      max={5}
                                      step={1}
                                      marks={[
                                        { value: 0, label: '0' },
                                        { value: 1, label: '1' },
                                        { value: 2, label: '2' },
                                        { value: 3, label: '3' },
                                        { value: 4, label: '4' },
                                        { value: 5, label: '5' },
                                      ]}
                                      sx={{
                                        '& .MuiSlider-track': {
                                          background: whatIfValues.sedation_level === 0 ? '#ef4444' :
                                                       whatIfValues.sedation_level >= 4 ? '#f59e0b' : '#22c55e',
                                        },
                                        '& .MuiSlider-thumb': {
                                          background: whatIfValues.sedation_level === 0 ? '#ef4444' :
                                                     whatIfValues.sedation_level >= 4 ? '#f59e0b' : '#22c55e',
                                        },
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="caption" sx={{ 
                                      color: whatIfValues.sedation_level === 0 ? "#ef4444" :
                                             whatIfValues.sedation_level >= 4 ? "#f59e0b" : "#22c55e",
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}>
                                      {whatIfValues.sedation_level === 0 ? "⚠️ No Sedation" :
                                       whatIfValues.sedation_level === 1 ? "⚠️ Minimal Sedation" :
                                       whatIfValues.sedation_level === 2 ? "✓ Light Sedation" :
                                       whatIfValues.sedation_level === 3 ? "✓ Moderate Sedation" :
                                       whatIfValues.sedation_level === 4 ? "⚠️ Heavy Sedation" : "⚠️ Deep Sedation"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                      {whatIfValues.sedation_level === 0 ? "Patient may be agitated" :
                                       whatIfValues.sedation_level === 1 ? "Minimal effect on consciousness" :
                                       whatIfValues.sedation_level === 2 ? "Optimal for comfort" :
                                       whatIfValues.sedation_level === 3 ? "Good balance" :
                                       whatIfValues.sedation_level === 4 ? "May suppress breathing" : "Deep sedation risk"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Card>
                            </Grid>

                            {/* Positioning */}
                            <Grid item xs={12} sm={6}>
                              <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: whatIfValues.head_midline ? '#22c55e' : '#f59e0b' }} />
                                    Head Positioning
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
                                    {whatIfValues.head_midline ? "Midline" : "Turned"}
                                  </Typography>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={whatIfValues.head_midline}
                                        onChange={(e) => handleWhatIfChange('head_midline', e.target.checked)}
                                        sx={{
                                          '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#22c55e',
                                          },
                                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-thumb': {
                                            backgroundColor: '#22c55e',
                                          },
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {whatIfValues.head_midline ? "Midline Position" : "Turned Position"}
                                      </Typography>
                                    }
                                  />
                                  <Typography variant="caption" sx={{ 
                                    color: whatIfValues.head_midline ? "#22c55e" : "#f59e0b",
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mt: 1
                                  }}>
                                    {whatIfValues.head_midline ? "✓ Optimal" : "⚠️ Suboptimal"}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>

                            {/* Temperature Control */}
                            <Grid item xs={12}>
                              <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: whatIfValues.temperature_c < 36 ? '#ef4444' : whatIfValues.temperature_c > 38.5 ? '#ef4444' : whatIfValues.temperature_c > 37.5 ? '#f59e0b' : '#22c55e' }} />
                                    Temperature Control
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
                                    {whatIfValues.temperature_c.toFixed(1)}°C
                                  </Typography>
                                  <Slider
                                    value={whatIfValues.temperature_c}
                                    onChange={(e, value) => handleWhatIfChange('temperature_c', value)}
                                    min={35}
                                    max={40}
                                    step={0.1}
                                    marks={[
                                      { value: 36, label: '36°' },
                                      { value: 37, label: '37°' },
                                      { value: 38.5, label: '38.5°' },
                                    ]}
                                    sx={{
                                      '& .MuiSlider-track': {
                                        background: whatIfValues.temperature_c < 36 ? '#ef4444' :
                                                   whatIfValues.temperature_c > 38.5 ? '#ef4444' :
                                                   whatIfValues.temperature_c > 37.5 ? '#f59e0b' : '#22c55e',
                                      },
                                      '& .MuiSlider-thumb': {
                                        background: whatIfValues.temperature_c < 36 ? '#ef4444' :
                                                   whatIfValues.temperature_c > 38.5 ? '#ef4444' :
                                                   whatIfValues.temperature_c > 37.5 ? '#f59e0b' : '#22c55e',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ 
                                    color: whatIfValues.temperature_c < 36 ? "#ef4444" :
                                           whatIfValues.temperature_c > 38.5 ? "#ef4444" : "#22c55e",
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                  }}>
                                    {whatIfValues.temperature_c < 36 ? "⚠️ Hypothermia" :
                                     whatIfValues.temperature_c > 38.5 ? "⚠️ Fever" : "✓ Normal"}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Impact Analysis */}
                    <Grid item xs={12} lg={7}>
                      <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "#a855f7", display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#a855f7' }} />
                            Impact Analysis
                          </Typography>
                          
                          {(() => {
                            const simulated = calculateSimulatedRisk();
                            if (!simulated) return null;
                            
                            const riskChange = simulated.deterioration_risk - (patient.deterioration_risk || 20);
                            const stabilityChange = simulated.stability_score - (patient.stability_score || 70);
                            
                            return (
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Summary Card */}
                                <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                  <Typography variant="body2" sx={{ color: "#a855f7", mb: 2, fontWeight: 600 }}>
                                    Simulation Summary
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Risk Change</Typography>
                                      <Typography variant="h6" sx={{ 
                                        color: riskChange > 0 ? "#ef4444" : riskChange < 0 ? "#22c55e" : "text.primary",
                                        fontWeight: 700 
                                      }}>
                                        {riskChange > 0 ? "+" : ""}{riskChange.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Stability Change</Typography>
                                      <Typography variant="h6" sx={{ 
                                        color: stabilityChange > 0 ? "#22c55e" : stabilityChange < 0 ? "#ef4444" : "text.primary",
                                        fontWeight: 700 
                                      }}>
                                        {stabilityChange > 0 ? "+" : ""}{stabilityChange.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Card>

                                {/* Current vs Simulated */}
                                <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontWeight: 600 }}>
                                    Current vs Simulated Values
                                  </Typography>
                                  
                                  <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                                      Deterioration Risk
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Current:
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 600 }}>
                                        {patient.deterioration_risk?.toFixed(1) || "N/A"}%
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        →
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: "#ef4444", fontWeight: 600 }}>
                                        {simulated.deterioration_risk.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                      <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                                      <Typography variant="caption" sx={{ 
                                        color: riskChange > 0 ? "#ef4444" : riskChange < 0 ? "#22c55e" : "text.secondary",
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        {riskChange > 0 ? "↑ Increased Risk" : riskChange < 0 ? "↓ Decreased Risk" : "→ No Change"}
                                      </Typography>
                                      <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                                    </Box>
                                  </Box>
                                  
                                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                                      Stability Score
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Current:
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 600 }}>
                                        {patient.stability_score?.toFixed(1) || "N/A"}%
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        →
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: "#22c55e", fontWeight: 600 }}>
                                        {simulated.stability_score.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                      <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                                      <Typography variant="caption" sx={{ 
                                        color: stabilityChange > 0 ? "#22c55e" : stabilityChange < 0 ? "#ef4444" : "text.secondary",
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        {stabilityChange > 0 ? "↑ Improved Stability" : stabilityChange < 0 ? "↓ Reduced Stability" : "→ No Change"}
                                      </Typography>
                                      <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                                    </Box>
                                  </Box>
                                </Card>

                                {/* Recommendations */}
                                <Card sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontWeight: 600 }}>
                                    Clinical Recommendations
                                  </Typography>
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    {whatIfValues.oxygen_saturation < 94 && (
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>!</Typography>
                                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                          Increase oxygen saturation to ≥94% to reduce hypoxia risk
                                        </Typography>
                                      </Box>
                                    )}
                                    {whatIfValues.map_pressure < 70 && (
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>!</Typography>
                                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                          Maintain MAP ≥70 mmHg for adequate cerebral perfusion
                                        </Typography>
                                      </Box>
                                    )}
                                    {whatIfValues.sedation_level === 0 && (
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>!</Typography>
                                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                          Consider light sedation (level 2-3) to prevent agitation
                                        </Typography>
                                      </Box>
                                    )}
                                    {!whatIfValues.head_midline && (
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>!</Typography>
                                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                          Position head at midline to optimize venous drainage
                                        </Typography>
                                      </Box>
                                    )}
                                    {(whatIfValues.temperature_c < 36.5 || whatIfValues.temperature_c > 37.5) && (
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>!</Typography>
                                        <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                          Maintain temperature 36.5-37.5°C for optimal metabolism
                                        </Typography>
                                      </Box>
                                    )}
                                    {whatIfValues.oxygen_saturation >= 94 && 
                                     whatIfValues.map_pressure >= 70 && 
                                     whatIfValues.map_pressure <= 95 &&
                                     (whatIfValues.sedation_level === 2 || whatIfValues.sedation_level === 3) &&
                                     whatIfValues.head_midline &&
                                     whatIfValues.temperature_c >= 36.5 && 
                                     whatIfValues.temperature_c <= 37.5 && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: 1, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                        <Typography variant="caption" sx={{ color: "#22c55e", fontWeight: 700 }}>
                                          ✓ Optimal Parameters Achieved
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "#22c55e" }}>
                                          All parameters within therapeutic range
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Card>
                              </Box>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Fade>
              )}
            </Box>
          )}

          {/* Digital Twin Timeline - Bottom */}
          {showTimeline && prediction && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Digital Twin Timeline
              </Typography>
              <DigitalTwinTimeline 
                patientData={{
                  age: patient.age,
                  sex: patient.sex,
                  mechanism: patient.mechanism,
                  history: patient.history,
                  timeSinceInjury: patient.timeSinceInjury,
                  gcs: patient.gcs,
                  tbiSeverity: patient.tbiSeverity,
                  vomiting: patient.vomiting,
                  seizure: patient.seizure,
                  loc: patient.loc,
                  amnesia: patient.amnesia,
                  headache: patient.headache,
                  pupil: patient.pupil,
                }}
                prediction={prediction}
              />
            </Box>
          )}

          {/* Prediction Error Alert */}
          {predictionError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setPredictionError(null)}>
              {predictionError}
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
            {patient.patient_type !== "coma" && (
              <Button
                variant="contained"
                onClick={() => {
                  setPredicting(true);
                  setPredictionError(null);
                  predictPatientRisk(id)
                    .then((data) => {
                      setPrediction(data);
                      setDialogOpen(true);
                    })
                    .catch((err) => {
                      setPredictionError(err.message || "Failed to get prediction");
                    })
                    .finally(() => {
                      setPredicting(false);
                    });
                }}
                disabled={predicting}
                sx={{
                  background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
                }}
              >
                {predicting ? "Analyzing..." : "AI Prediction"}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard")}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "text.secondary",
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Prediction Result Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: prediction ? `${getRiskColor(prediction.risk_level)}20` : "rgba(168, 85, 247, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <AIIcon sx={{ fontSize: 35, color: prediction ? getRiskColor(prediction.risk_level) : "#a855f7" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            AI Prediction Result
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {prediction?.model_type || "XGBoost"} Model Analysis
          </Typography>
        </DialogTitle>

        <DialogContent>
          {prediction && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              {/* Risk Score */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h1" sx={{ fontWeight: 800, color: getRiskColor(prediction.risk_level) }}>
                  {prediction.risk_score}%
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  CT Risk Score
                </Typography>
              </Box>

              {/* Risk Level Chip */}
              <Chip
                label={prediction.risk_level}
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  px: 3,
                  py: 2.5,
                  background: `${getRiskColor(prediction.risk_level)}20`,
                  color: getRiskColor(prediction.risk_level),
                  border: `2px solid ${getRiskColor(prediction.risk_level)}`,
                  mb: 3,
                }}
              />

              {/* CT Recommendation */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: prediction.needs_ct_within_24h
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                  border: `1px solid ${prediction.needs_ct_within_24h ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: prediction.needs_ct_within_24h ? "#ef4444" : "#22c55e",
                    mb: 1,
                  }}
                >
                  {prediction.needs_ct_within_24h ? "⚠️ CT Scan Recommended" : "✓ CT Scan Not Urgent"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {prediction.needs_ct_within_24h
                    ? "Based on clinical indicators, a CT scan within 24 hours is recommended for this patient."
                    : "Based on clinical indicators, an immediate CT scan may not be necessary. Continue monitoring."}
                </Typography>
              </Box>

              {/* Confidence */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Model Confidence: {prediction.confidence}%
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 4, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDialogOpen(false)}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDialogOpen(false);
              setShowTimeline(true);
            }}
            sx={{
              px: 4,
              py: 1.5,
              background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
            }}
          >
            View Timeline
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

