import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPatient, addComaPatient } from "../api/doctor";
import { predictRiskWithTimeline } from "../services/api";
import Layout from "../components/Layout";
import DigitalTwinTimeline from "../components/DigitalTwinTimeline";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  InputAdornment,
  Fade,
  Alert,
  Snackbar,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Person as PersonIcon,
  Cake as AgeIcon,
  Wc as GenderIcon,
  LocalHospital as InjuryIcon,
  History as HistoryIcon,
  Timer as TimeIcon,
  Psychology as BrainIcon,
  Warning as SeverityIcon,
  Sick as VomitIcon,
  FlashOn as SeizureIcon,
  RemoveRedEye as PupilIcon,
  Headphones as HeadacheIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Science as AIIcon,
  Hotel as ComaIcon,
  MonitorHeart as VitalsIcon,
  Thermostat as TempIcon,
  Favorite as HeartIcon,
} from "@mui/icons-material";

export default function AddPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [prediction, setPrediction] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [patientType, setPatientType] = useState("ct");

  // CT Scan form
  const [form, setForm] = useState({
    name: "",
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

  // Coma form
  const [comaForm, setComaForm] = useState({
    name: "",
    age: "",
    cause_of_coma: "",
    gcs_total: "",
    gcs_motor: "",
    left_pupil_reactivity: "",
    oxygen_saturation: "",
    map: "",
    heart_rate: "",
    sedation_level: "",
    head_midline: true,
    temperature_c: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleComaChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setComaForm({
      ...comaForm,
      [e.target.name]: value,
    });
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high": return "#ef4444";
      case "moderate": return "#f59e0b";
      case "low": return "#22c55e";
      case "stable": return "#22c55e";
      case "moderately stable": return "#f59e0b";
      case "unstable": return "#ef4444";
      default: return "#64748b";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (patientType === "ct") {
        // CT Scan patient flow
        const patientData = {
          age: Number(form.age),
          sex: form.sex,
          mechanism: form.mechanism,
          history: form.history || null,
          timeSinceInjury: Number(form.timeSinceInjury),
          gcs: Number(form.gcs),
          tbiSeverity: form.tbiSeverity,
          vomiting: Number(form.vomiting),
          seizure: form.seizure,
          loc: Number(form.loc),
          amnesia: Number(form.amnesia),
          headache: Number(form.headache),
          pupil: form.pupil,
        };

        const predictionResult = await predictRiskWithTimeline(patientData);
        setPrediction({ ...predictionResult, patientType: "ct" });

        await addPatient({
          ...form,
          age: Number(form.age),
          timeSinceInjury: Number(form.timeSinceInjury),
          gcs: Number(form.gcs),
          vomiting: Number(form.vomiting),
          loc: Number(form.loc),
          amnesia: Number(form.amnesia),
          headache: Number(form.headache),
        });
      } else {
        // Coma patient flow
        const comaData = {
          name: comaForm.name,
          age: Number(comaForm.age),
          cause_of_coma: comaForm.cause_of_coma,
          gcs_total: Number(comaForm.gcs_total),
          gcs_motor: Number(comaForm.gcs_motor),
          left_pupil_reactivity: comaForm.left_pupil_reactivity,
          oxygen_saturation: Number(comaForm.oxygen_saturation),
          map: Number(comaForm.map),
          heart_rate: Number(comaForm.heart_rate),
          sedation_level: Number(comaForm.sedation_level),
          head_midline: comaForm.head_midline,
          temperature_c: Number(comaForm.temperature_c),
        };

        const response = await addComaPatient(comaData);
        setPrediction({ ...response.prediction, patientType: "coma", patientName: comaForm.name });
      }

      setDialogOpen(true);
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to add patient. Please try again.";
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Handle validation errors
          errorMessage = err.response.data.detail
            .map(error => `${error.loc?.join('.')} - ${error.msg}`)
            .join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    navigate("/dashboard");
  };

  const SectionHeader = ({ icon, title, color = "#00d4aa" }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: 4 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          background: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, { sx: { color: color, fontSize: 22 } })}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Layout>
      <Fade in timeout={500}>
        <Box>
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
              Add New Patient
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
              Select assessment type and enter patient information
            </Typography>

            {/* Patient Type Selector */}
            <ToggleButtonGroup
              value={patientType}
              exclusive
              onChange={(e, newType) => newType && setPatientType(newType)}
              sx={{
                background: "rgba(17, 24, 39, 0.5)",
                borderRadius: 2,
                "& .MuiToggleButton-root": {
                  px: 4,
                  py: 1.5,
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "text.secondary",
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
                    color: "#fff",
                    "&:hover": {
                      background: "linear-gradient(135deg, #00b894 0%, #0284c7 100%)",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="ct">
                <BrainIcon sx={{ mr: 1 }} />
                CT Scan Risk
              </ToggleButton>
              <ToggleButton value="coma">
                <ComaIcon sx={{ mr: 1 }} />
                Coma Assessment
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Card
            sx={{
              background: "rgba(17, 24, 39, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <form onSubmit={handleSubmit}>
                {patientType === "ct" ? (
                  <>
                    {/* CT SCAN FORM */}
                    {/* Basic Information */}
                    <SectionHeader icon={<PersonIcon />} title="Basic Information" />
                    <Divider sx={{ mb: 3, borderColor: "rgba(0, 212, 170, 0.2)" }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Patient Name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Age"
                          name="age"
                          value={form.age}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AgeIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          select
                          label="Sex"
                          name="sex"
                          value={form.sex}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <GenderIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    {/* Injury Details */}
                    <SectionHeader icon={<InjuryIcon />} title="Injury Details" color="#f59e0b" />
                    <Divider sx={{ mb: 3, borderColor: "rgba(245, 158, 11, 0.2)" }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mechanism of Injury"
                          name="mechanism"
                          value={form.mechanism}
                          onChange={handleChange}
                          placeholder="e.g., Fall, Motor vehicle accident"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <InjuryIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Medical History"
                          name="history"
                          value={form.history}
                          onChange={handleChange}
                          placeholder="Previous conditions, medications"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HistoryIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Time Since Injury"
                          name="timeSinceInjury"
                          value={form.timeSinceInjury}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TimeIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Neurological Assessment */}
                    <SectionHeader icon={<BrainIcon />} title="Neurological Assessment" color="#a855f7" />
                    <Divider sx={{ mb: 3, borderColor: "rgba(168, 85, 247, 0.2)" }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="GCS Score"
                          name="gcs"
                          value={form.gcs}
                          onChange={handleChange}
                          placeholder="3-15"
                          helperText="Glasgow Coma Scale (3-15)"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BrainIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="TBI Severity"
                          name="tbiSeverity"
                          value={form.tbiSeverity}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SeverityIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="Mild">Mild</MenuItem>
                          <MenuItem value="Moderate">Moderate</MenuItem>
                          <MenuItem value="Severe">Severe</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Vomiting Episodes"
                          name="vomiting"
                          value={form.vomiting}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VomitIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Seizure Type"
                          name="seizure"
                          value={form.seizure}
                          onChange={handleChange}
                          placeholder="None, Focal, Generalized"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SeizureIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Loss of Consciousness"
                          name="loc"
                          value={form.loc}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BrainIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">min</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Amnesia Duration"
                          name="amnesia"
                          value={form.amnesia}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HistoryIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">min</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Headache Severity"
                          name="headache"
                          value={form.headache}
                          onChange={handleChange}
                          placeholder="1-10"
                          helperText="Scale of 1-10"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HeadacheIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Pupil Response"
                          name="pupil"
                          value={form.pupil}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PupilIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="Normal">Normal</MenuItem>
                          <MenuItem value="Sluggish">Sluggish</MenuItem>
                          <MenuItem value="Fixed">Fixed</MenuItem>
                          <MenuItem value="Unequal">Unequal</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 2, mt: 5, flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        type="submit"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
                          boxShadow: "0 8px 25px rgba(0, 212, 170, 0.3)",
                        }}
                      >
                        {loading ? "Saving..." : "Save Patient"}
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<BackIcon />}
                        onClick={() => navigate("/dashboard")}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderColor: "rgba(255,255,255,0.2)",
                          "&:hover": {
                            borderColor: "rgba(255,255,255,0.4)",
                            background: "rgba(255,255,255,0.05)",
                          },
                        }}
                      >
                        Back to Dashboard
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    {/* COMA ASSESSMENT FORM */}
                    {/* Basic Information */}
                    <SectionHeader icon={<PersonIcon />} title="Patient Information" />
                    <Divider sx={{ mb: 3, borderColor: "rgba(0, 212, 170, 0.2)" }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Patient Name"
                          name="name"
                          value={comaForm.name}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Age"
                          name="age"
                          value={comaForm.age}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AgeIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          select
                          label="Cause of Coma"
                          name="cause_of_coma"
                          value={comaForm.cause_of_coma}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ComaIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="TBI">TBI (Traumatic Brain Injury)</MenuItem>
                          <MenuItem value="Stroke">Stroke</MenuItem>
                          <MenuItem value="Metabolic">Metabolic</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    {/* Neurological Assessment */}
                    <SectionHeader icon={<BrainIcon />} title="Neurological Assessment" color="#a855f7" />
                    <Divider sx={{ mb: 3, borderColor: "rgba(168, 85, 247, 0.2)" }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="GCS Total"
                          name="gcs_total"
                          value={comaForm.gcs_total}
                          onChange={handleComaChange}
                          required
                          placeholder="3-15"
                          helperText="Glasgow Coma Scale Total (3-15)"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BrainIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="GCS Motor"
                          name="gcs_motor"
                          value={comaForm.gcs_motor}
                          onChange={handleComaChange}
                          required
                          placeholder="1-6"
                          helperText="Motor response (1-6)"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BrainIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Left Pupil Reactivity"
                          name="left_pupil_reactivity"
                          value={comaForm.left_pupil_reactivity}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PupilIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="None">None (Fixed)</MenuItem>
                          <MenuItem value="Sluggish">Sluggish</MenuItem>
                          <MenuItem value="Brisk">Brisk</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Sedation Level"
                          name="sedation_level"
                          value={comaForm.sedation_level}
                          onChange={handleComaChange}
                          required
                          placeholder="0-10"
                          helperText="0 = No sedation, 10 = Deep sedation"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ComaIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Head Midline"
                          name="head_midline"
                          value={comaForm.head_midline}
                          onChange={handleComaChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BrainIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value={true}>Yes (Normal)</MenuItem>
                          <MenuItem value={false}>No (Deviated)</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    {/* Vital Signs */}
                    <SectionHeader icon={<VitalsIcon />} title="Vital Signs" color="#f59e0b" />
                    <Divider sx={{ mb: 3, borderColor: "rgba(245, 158, 11, 0.2)" }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Oxygen Saturation"
                          name="oxygen_saturation"
                          value={comaForm.oxygen_saturation}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VitalsIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="MAP (Mean Arterial Pressure)"
                          name="map"
                          value={comaForm.map}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VitalsIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Heart Rate"
                          name="heart_rate"
                          value={comaForm.heart_rate}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HeartIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Temperature"
                          name="temperature_c"
                          value={comaForm.temperature_c}
                          onChange={handleComaChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TempIcon sx={{ color: "text.secondary" }} />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 2, mt: 5, flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        type="submit"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                          boxShadow: "0 8px 25px rgba(168, 85, 247, 0.3)",
                        }}
                      >
                        {loading ? "Analyzing..." : "Save & Analyze Coma"}
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<BackIcon />}
                        onClick={() => navigate("/dashboard")}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderColor: "rgba(255,255,255,0.2)",
                          "&:hover": {
                            borderColor: "rgba(255,255,255,0.4)",
                            background: "rgba(255,255,255,0.05)",
                          },
                        }}
                      >
                        Back to Dashboard
                      </Button>
                    </Box>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Prediction Result Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
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
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: prediction?.patientType === "coma" ? "rgba(168, 85, 247, 0.2)" : (prediction ? `${getRiskColor(prediction.risk_level)}20` : "rgba(168, 85, 247, 0.2)"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              animation: "pulse 2s infinite",
            }}
          >
            {prediction?.patientType === "coma" ? (
              <ComaIcon sx={{ fontSize: 40, color: "#a855f7" }} />
            ) : (
              <AIIcon sx={{ fontSize: 40, color: prediction ? getRiskColor(prediction.risk_level) : "#a855f7" }} />
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {prediction?.patientType === "coma" ? "Coma Assessment Result" : "AI Prediction Result"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Patient: {prediction?.patientType === "coma" ? comaForm.name : form.name} | {prediction?.model_type || "XGBoost"} Model
          </Typography>
        </DialogTitle>

        <DialogContent>
          {prediction && prediction.patientType === "ct" && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              {/* CT Risk Score */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: "5rem",
                    color: getRiskColor(prediction.risk_level),
                    textShadow: `0 0 30px ${getRiskColor(prediction.risk_level)}50`
                  }}
                >
                  {prediction.risk_score}%
                </Typography>
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                  CT Risk Score
                </Typography>
              </Box>

              {/* Risk Level Chip */}
              <Chip
                label={prediction.risk_level}
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  px: 4,
                  py: 3,
                  background: `${getRiskColor(prediction.risk_level)}20`,
                  color: getRiskColor(prediction.risk_level),
                  border: `2px solid ${getRiskColor(prediction.risk_level)}`,
                  mb: 4,
                }}
              />

              {/* CT Recommendation */}
              <Box
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: prediction.needs_ct_within_24h
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(34, 197, 94, 0.15)",
                  border: `2px solid ${prediction.needs_ct_within_24h ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.4)"}`,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: prediction.needs_ct_within_24h ? "#ef4444" : "#22c55e",
                    mb: 2,
                  }}
                >
                  {prediction.needs_ct_within_24h ? "⚠️ CT Scan Recommended" : "✓ CT Scan Not Urgent"}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {prediction.needs_ct_within_24h
                    ? "Based on clinical indicators, a CT scan within 24 hours is strongly recommended for this patient."
                    : "Based on clinical indicators, an immediate CT scan may not be necessary. Continue monitoring the patient."}
                </Typography>
              </Box>

              {/* Confidence */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Model Confidence: <strong>{prediction.confidence}%</strong>
                </Typography>
              </Box>
            </Box>
          )}

          {prediction && prediction.patientType === "coma" && (
            <Box sx={{ py: 3 }}>
              <Grid container spacing={3}>
                {/* Conscious State */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: "rgba(168, 85, 247, 0.1)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: "#a855f7", fontWeight: 600 }}>
                      Condition Over Time
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#a855f7",
                        my: 2,
                      }}
                    >
                      {prediction.conscious_state?.prediction || "N/A"}
                    </Typography>
                    <Chip
                      label={`${prediction.conscious_state?.confidence || 0}% confidence`}
                      size="small"
                      sx={{
                        background: "rgba(168, 85, 247, 0.2)",
                        color: "#a855f7",
                      }}
                    />
                  </Box>
                </Grid>

                {/* Deterioration Risk */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `${getRiskColor(prediction.deterioration_risk?.level)}15`,
                      border: `1px solid ${getRiskColor(prediction.deterioration_risk?.level)}50`,
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: getRiskColor(prediction.deterioration_risk?.level), fontWeight: 600 }}>
                      Deterioration Risk
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        color: getRiskColor(prediction.deterioration_risk?.level),
                        my: 2,
                      }}
                    >
                      {prediction.deterioration_risk?.score || 0}%
                    </Typography>
                    <Chip
                      label={prediction.deterioration_risk?.level || "Unknown"}
                      sx={{
                        background: `${getRiskColor(prediction.deterioration_risk?.level)}20`,
                        color: getRiskColor(prediction.deterioration_risk?.level),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Stability Score */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `${getRiskColor(prediction.stability_score?.level)}15`,
                      border: `1px solid ${getRiskColor(prediction.stability_score?.level)}50`,
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: getRiskColor(prediction.stability_score?.level), fontWeight: 600 }}>
                      Stability Score
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        color: getRiskColor(prediction.stability_score?.level),
                        my: 2,
                      }}
                    >
                      {prediction.stability_score?.score || 0}%
                    </Typography>
                    <Chip
                      label={prediction.stability_score?.level || "Unknown"}
                      sx={{
                        background: `${getRiskColor(prediction.stability_score?.level)}20`,
                        color: getRiskColor(prediction.stability_score?.level),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Summary */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(17, 24, 39, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Assessment Summary
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                  The AI model has analyzed the patient's coma indicators.
                  {prediction.deterioration_risk?.level === "High" && " ⚠️ High deterioration risk detected - close monitoring recommended."}
                  {prediction.stability_score?.level === "Unstable" && " ⚠️ Patient condition is unstable - immediate attention required."}
                  {prediction.stability_score?.level === "Stable" && " ✓ Patient shows stable vital signs."}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 4, gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleDialogClose}
            sx={{
              px: 5,
              py: 1.5,
              background: prediction?.patientType === "coma"
                ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                : "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
              fontWeight: 600,
              "&:hover": {
                background: prediction?.patientType === "coma"
                  ? "linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)"
                  : "linear-gradient(135deg, #00b894 0%, #0284c7 100%)",
              }
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Digital Twin Timeline - Show after dialog closes */}
      {showTimeline && prediction && (
        <DigitalTwinTimeline patientData={{
          age: Number(form.age),
          sex: form.sex,
          mechanism: form.mechanism,
          history: form.history || null,
          timeSinceInjury: Number(form.timeSinceInjury),
          gcs: Number(form.gcs),
          tbiSeverity: form.tbiSeverity,
          vomiting: Number(form.vomiting),
          seizure: form.seizure,
          loc: Number(form.loc),
          amnesia: Number(form.amnesia),
          headache: Number(form.headache),
          pupil: form.pupil,
        }} />
      )}
    </Layout>
  );
}
