import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentCaseById } from "../api/student";
import Layout from "../components/Layout";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Fade,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Psychology as BrainIcon,
  LocalHospital as InjuryIcon,
  Timer as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  MenuBook as CaseIcon,
  MedicalServices as CTIcon,
  MonitorHeart as ComaIcon,
  Favorite as HeartIcon,
  Speed as SpeedIcon,
  Thermostat as TempIcon,
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

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await getStudentCaseById(id);
        setCaseData(data);
      } catch (err) {
        console.error(err);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ maxWidth: 800 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Layout>
    );
  }

  if (!caseData) return null;

  const getPatientTypeConfig = (patientType) => {
    if (patientType === 'coma') {
      return {
        icon: <ComaIcon />,
        label: 'Coma Patient',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      };
    } else {
      return {
        icon: <CTIcon />,
        label: 'CT Scan Patient',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.15)',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      };
    }
  };

  const patientType = getPatientTypeConfig(caseData.patient_type);
  const severity = getSeverityConfig(caseData.tbiSeverity, caseData.gcs);

  const InfoItem = ({ label, value, icon, color = "text.primary" }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          background: "rgba(168, 85, 247, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, { sx: { color: "#a855f7", fontSize: "18px" } })}
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
              Case Study Details
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {caseData.patient_type?.toLowerCase() === 'coma' ? 'Coma Patient Case' : 'CT Scan TBI Case'} #{id} - Educational Review
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Case Overview Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "20px",
                      background: patientType.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      boxShadow: `0 15px 40px ${patientType.color}40`,
                    }}
                  >
                    {React.cloneElement(patientType.icon, { sx: { fontSize: "40px", color: "white" } })}
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Case #{caseData.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    {caseData.patient_type?.toLowerCase() === 'coma' ? 'Coma Patient Study' : 'CT Scan TBI Study'}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={patientType.icon}
                      label={patientType.label}
                      size="small"
                      sx={{
                        background: patientType.bg,
                        color: patientType.color,
                        border: `1px solid ${patientType.color}40`,
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: patientType.color },
                      }}
                    />
                    <Chip
                      label={`${caseData.age || 'Unknown'} years`}
                      size="small"
                      sx={{
                        background: "rgba(0, 212, 170, 0.15)",
                        color: "#00d4aa",
                      }}
                    />
                    <Chip
                      label={caseData.sex || "Unknown"}
                      size="small"
                      sx={{
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#a855f7",
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* GCS Score */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                      {caseData.patient_type?.toLowerCase() === 'coma' ? 'GCS Total' : 'GCS Score'}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: severity?.color || patientType.color }}>
                      {caseData.patient_type?.toLowerCase() === 'coma' ? 
                       (caseData.gcs_total || caseData.gcs || 'N/A') : 
                       (caseData.gcs || 'N/A')}
                      <Typography component="span" variant="h6" sx={{ color: "text.secondary" }}>
                        /15
                      </Typography>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={((caseData.patient_type?.toLowerCase() === 'coma' ? 
                             (caseData.gcs_total || caseData.gcs || 0) : 
                             (caseData.gcs || 0)) / 15) * 100}
                      sx={{
                        mt: 1,
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.1)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${patientType.color} 0%, ${patientType.color}80 100%)`,
                        },
                      }}
                    />
                  </Box>

                  {/* Only render severity chip if severity is properly defined */}
                  {severity && severity.icon && severity.bg && severity.color && (
                    <Chip
                      icon={severity.icon}
                      label={caseData.tbiSeverity || severity.label || "Unknown"}
                      sx={{
                        background: severity.bg,
                        color: severity.color,
                        border: `1px solid ${severity.color}40`,
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: severity.color },
                      }}
                    />
                  )}
                  
                  {/* Patient Type Badge */}
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={patientType.icon}
                      label={patientType.label}
                      sx={{
                        background: patientType.bg,
                        color: patientType.color,
                        border: `1px solid ${patientType.color}40`,
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: patientType.color },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Case Information */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Case Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <InfoItem
                        label="Patient Age"
                        value={caseData.age ? `${caseData.age} years` : "N/A"}
                        icon={<PersonIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoItem
                        label="Patient Sex"
                        value={caseData.sex || "Unknown"}
                        icon={<PersonIcon />}
                      />
                    </Grid>
                    
                    {caseData.patient_type?.toLowerCase() === 'ct' ? (
                      <>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Mechanism of Injury"
                            value={caseData.mechanism || "N/A"}
                            icon={<InjuryIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Time Since Injury"
                            value={caseData.timeSinceInjury ? `${caseData.timeSinceInjury} hours` : "N/A"}
                            icon={<TimeIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Vomiting"
                            value={caseData.vomiting ? `Yes (${caseData.vomiting})` : "No"}
                            icon={<InjuryIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Seizure"
                            value={caseData.seizure || "No"}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Loss of Consciousness"
                            value={caseData.loc ? `${caseData.loc} min` : "No"}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Amnesia"
                            value={caseData.amnesia ? `${caseData.amnesia} min` : "No"}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Headache"
                            value={caseData.headache ? `Yes (${caseData.headache})` : "No"}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Pupil Response"
                            value={caseData.pupil || "N/A"}
                            icon={<BrainIcon />}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Cause of Coma"
                            value={caseData.cause_of_coma || "N/A"}
                            icon={<BrainIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="GCS Motor Response"
                            value={caseData.gcs_motor || "N/A"}
                            icon={<BrainIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Left Pupil Reactivity"
                            value={caseData.left_pupil_reactivity || "N/A"}
                            icon={<BrainIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Heart Rate"
                            value={caseData.heart_rate ? `${caseData.heart_rate} bpm` : "N/A"}
                            icon={<HeartIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Oxygen Saturation"
                            value={caseData.oxygen_saturation ? `${caseData.oxygen_saturation}%` : "N/A"}
                            icon={<SpeedIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Mean Arterial Pressure"
                            value={caseData.map_pressure ? `${caseData.map_pressure} mmHg` : "N/A"}
                            icon={<HeartIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Sedation Level"
                            value={caseData.sedation_level || "N/A"}
                            icon={<BrainIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Temperature"
                            value={caseData.temperature_c ? `${caseData.temperature_c}°C` : "N/A"}
                            icon={<TempIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <InfoItem
                            label="Head Midline"
                            value={caseData.head_midline ? "Yes" : "No"}
                            icon={<BrainIcon />}
                            color={patientType.color}
                          />
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12} md={6}>
                      <InfoItem
                        label="TBI Severity"
                        value={caseData.tbiSeverity || "N/A"}
                        icon={<BrainIcon />}
                        color={severity?.color || patientType.color}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoItem
                        label="GCS Score"
                        value={caseData.patient_type?.toLowerCase() === 'coma' ? 
                               `${caseData.gcs_total || caseData.gcs || 'N/A'}/15` : 
                               `${caseData.gcs || 'N/A'}/15`}
                        icon={<BrainIcon />}
                      />
                    </Grid>
                  </Grid>

                  {/* Learning Notes */}
                  <Box sx={{ mt: 3, p: 2, background: `${patientType.color}15`, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: patientType.color, fontWeight: 600, mb: 1 }}>
                      Learning Points
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {caseData.patient_type?.toLowerCase() === 'coma' ? (
                        <>
                          This case demonstrates a {severity?.label?.toLowerCase() || 'unknown'} coma patient with GCS of {caseData.gcs_total || caseData.gcs || 'N/A'}.
                          {caseData.gcs_total && caseData.gcs_total <= 8 && " Severe coma requires intensive monitoring and neurological assessment."}
                          {caseData.gcs_total && caseData.gcs_total > 8 && caseData.gcs_total <= 12 && " Moderate coma patients need careful observation for changes in consciousness."}
                          {caseData.gcs_total && caseData.gcs_total > 12 && " Mild coma patients should be monitored for improvement or deterioration."}
                          {caseData.cause_of_coma && ` Primary cause: ${caseData.cause_of_coma}.`}
                        </>
                      ) : (
                        <>
                          This case demonstrates a {severity?.label?.toLowerCase() || 'unknown'} TBI with GCS of {caseData.gcs || 'N/A'}.
                          {caseData.gcs && caseData.gcs <= 8 && " Severe TBI requires immediate intervention and close monitoring."}
                          {caseData.gcs && caseData.gcs > 8 && caseData.gcs <= 12 && " Moderate TBI patients need careful observation for deterioration."}
                          {caseData.gcs && caseData.gcs > 12 && " Mild TBI patients should be monitored for delayed symptoms."}
                          {caseData.mechanism && ` Mechanism: ${caseData.mechanism}.`}
                        </>
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
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
              Back to Cases
            </Button>
          </Box>
        </Box>
      </Fade>
    </Layout>
  );
}
