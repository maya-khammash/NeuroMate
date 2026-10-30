import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorPatients, deletePatient, updatePatientQueue } from "../api/doctor";
import Layout from "../components/Layout";

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
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  LocalHospital as HospitalIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Scanner as CTIcon,
  Hotel as ComaIcon,
} from "@mui/icons-material";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, patient: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeletePatient = async () => {
    if (!deleteDialog.patient) return;

    try {
      await deletePatient(deleteDialog.patient.id);
      setPatients(patients.filter(p => p.id !== deleteDialog.patient.id));
      setDeleteDialog({ open: false, patient: null });
      setSnackbar({
        open: true,
        message: "Patient deleted successfully",
        severity: "success"
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to delete patient",
        severity: "error"
      });
    }
  };

  const handleMarkDone = async (patientId) => {
    try {
      await updatePatientQueue(patientId, { in_queue: false });
      setPatients(patients.map(p =>
        p.id === patientId ? { ...p, in_queue: false } : p
      ));
      setSnackbar({
        open: true,
        message: "Patient marked as done and removed from queue",
        severity: "success"
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to update patient status",
        severity: "error"
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getRiskColor = (riskScore) => {
    if (!riskScore) return "transparent";
    if (riskScore >= 0.7) return "rgba(239, 68, 68, 0.2)";
    if (riskScore >= 0.4) return "rgba(245, 158, 11, 0.2)";
    return "rgba(0, 212, 170, 0.2)";
  };

  const getRiskTextColor = (riskScore) => {
    if (!riskScore) return "text.secondary";
    if (riskScore >= 0.7) return "#ef4444";
    if (riskScore >= 0.4) return "#f59e0b";
    return "#00d4aa";
  };

  const getRiskIcon = (riskScore) => {
    if (!riskScore) return null;
    if (riskScore >= 0.7) return <ErrorIcon />;
    if (riskScore >= 0.4) return <WarningIcon />;
    return <CheckIcon />;
  };

  const getRiskLabel = (riskScore) => {
    if (!riskScore) return "No Risk Data";
    if (riskScore >= 0.7) return "High Risk";
    if (riskScore >= 0.4) return "Moderate Risk";
    return "Low Risk";
  };

  const formatRiskScore = (score) => {
    if (!score) return "N/A";
    // If score is already a percentage (> 1), don't multiply
    if (score > 1) return `${score.toFixed(1)}%`;
    return `${(score * 100).toFixed(1)}%`;
  };

  // Get coma status color
  const getComaStatusColor = (level) => {
    if (!level) return { bg: "rgba(100, 116, 139, 0.2)", text: "#64748b" };
    const l = level.toLowerCase();
    if (l === "high" || l === "unstable") return { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" };
    if (l === "moderate" || l === "moderately stable") return { bg: "rgba(245, 158, 11, 0.2)", text: "#f59e0b" };
    return { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" };
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getDoctorPatients();
        // Sort patients by risk score (highest first) and assign priority numbers
        const sortedPatients = data
          .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
          .map((patient, index) => ({
            ...patient,
            priority: index + 1,
            in_queue: patient.in_queue !== false // Default to true if not set
          }));
        setPatients(sortedPatients);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        // Don't automatically logout, show error message instead
        setSnackbar({
          open: true,
          message: "Failed to load patients. Please try refreshing the page.",
          severity: "error"
        });
        // Only logout if it's specifically an authentication error
        if (err.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const statsCards = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: <PersonIcon />,
      color: "#00d4aa",
      gradient: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
    },
    {
      title: "CT Patients",
      value: patients.filter(p => p.patient_type !== "coma").length,
      icon: <CTIcon />,
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    },
    {
      title: "Coma Patients",
      value: patients.filter(p => p.patient_type === "coma").length,
      icon: <ComaIcon />,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    },
  ];

  // Filter patients based on active tab
  const ctPatients = [...patients]
    .filter(p => p.patient_type !== "coma")
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .map((patient, index) => ({ ...patient, priority: index + 1 }));
  
  const comaPatients = [...patients]
    .filter(p => p.patient_type === "coma")
    .sort((a, b) => (b.deterioration_risk || 0) - (a.deterioration_risk || 0))
    .map((patient, index) => ({ ...patient, priority: index + 1 }));
  
  const displayedPatients = activeTab === 0 ? ctPatients : activeTab === 1 ? comaPatients : patients;

  return (
    <Layout>
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
          Doctor Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Manage your patients and track their progress
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={4} key={stat.title}>
            <Fade in timeout={400 + index * 200}>
              <Card
                sx={{
                  background: "rgba(17, 24, 39, 0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    border: `1px solid ${stat.color}40`,
                    boxShadow: `0 20px 40px ${stat.color}20`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                        {loading ? <Skeleton width={60} /> : stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: stat.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 8px 20px ${stat.color}40`,
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { color: "white" } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Action Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate("/add-patient")}
          sx={{
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
            boxShadow: "0 8px 25px rgba(0, 212, 170, 0.3)",
          }}
        >
          Add New Patient
        </Button>
      </Box>

      {/* Patient Type Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              minHeight: 48,
            },
            "& .MuiTab-root.Mui-selected": {
              color: activeTab === 0 ? "#0ea5e9" : activeTab === 1 ? "#a855f7" : "#00d4aa",
            },
            "& .MuiTabs-indicator": {
              background: activeTab === 0 ? "#0ea5e9" : activeTab === 1 ? "#a855f7" : "#00d4aa",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab 
            icon={<CTIcon />} 
            label="CT Scan Patients" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<ComaIcon />} 
            label="Coma Patients" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<PersonIcon />} 
            label="All Patients" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* Patients Grid */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
          {activeTab === 0 ? "CT Scan Patients" : activeTab === 1 ? "Coma Patients" : "All Patients"} 
          {activeTab !== 2 && ` (${displayedPatients.length})`}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {activeTab === 0 
            ? "Patients requiring CT scan risk assessment. Ranked by risk score."
            : activeTab === 1 
              ? "Patients requiring coma assessment. Ranked by deterioration risk."
              : activeTab === 2 
                ? "Student cases for learning and training purposes."
                : "All patients ranked by priority."
          }
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : displayedPatients.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center" }}>
          <HospitalIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            {activeTab === 0 ? "No CT patients found" : activeTab === 1 ? "No coma patients found" : "No patients found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            {activeTab === 0 
              ? "Start by adding your first CT patient"
              : activeTab === 1 
                ? "Start by adding your first coma patient"
                : "Start by adding your first patient"
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/add-patient")}
          >
            Add Patient
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {displayedPatients.map((patient, index) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      border: "1px solid rgba(0, 212, 170, 0.4)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      {/* Priority Number */}
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: patient.in_queue === false
                            ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                            : patient.patient_type === "coma"
                              ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                              : "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          color: "white",
                          fontSize: "1.2rem",
                          boxShadow: patient.in_queue === false
                            ? "0 4px 12px rgba(34, 197, 94, 0.4)"
                            : patient.patient_type === "coma"
                              ? "0 4px 12px rgba(168, 85, 247, 0.4)"
                              : "0 4px 12px rgba(0, 212, 170, 0.4)",
                        }}
                      >
                        {patient.priority}
                      </Box>

                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          background: patient.patient_type === "coma"
                            ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                            : patient.sex?.toLowerCase() === "female"
                              ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                              : "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                          boxShadow: patient.patient_type === "coma"
                            ? "0 8px 20px rgba(168, 85, 247, 0.3)"
                            : patient.sex?.toLowerCase() === "female"
                              ? "0 8px 20px rgba(236, 72, 153, 0.3)"
                              : "0 8px 20px rgba(14, 165, 233, 0.3)",
                        }}
                      >
                        {patient.patient_type === "coma" ? <ComaIcon /> : patient.sex?.toLowerCase() === "female" ? <FemaleIcon /> : <MaleIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {patient.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          ID: #{patient.id} {patient.in_queue === false && "• Completed"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Patient Type Badge */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={patient.patient_type === "coma" ? <ComaIcon /> : <CTIcon />}
                        label={patient.patient_type === "coma" ? "Coma Assessment" : "CT Scan Risk"}
                        size="small"
                        sx={{
                          background: patient.patient_type === "coma"
                            ? "rgba(168, 85, 247, 0.15)"
                            : "rgba(14, 165, 233, 0.15)",
                          color: patient.patient_type === "coma" ? "#a855f7" : "#0ea5e9",
                          fontWeight: 600,
                          "& .MuiChip-icon": {
                            color: patient.patient_type === "coma" ? "#a855f7" : "#0ea5e9",
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                      <Chip
                        label={`${patient.age} years`}
                        size="small"
                        sx={{
                          background: "rgba(0, 212, 170, 0.15)",
                          color: "#00d4aa",
                          fontWeight: 500,
                        }}
                      />
                      {patient.patient_type !== "coma" && (
                        <Chip
                          label={patient.sex || "Unknown"}
                          size="small"
                          sx={{
                            background: "rgba(168, 85, 247, 0.15)",
                            color: "#a855f7",
                            fontWeight: 500,
                          }}
                        />
                      )}
                      {patient.patient_type === "coma" && patient.cause_of_coma && (
                        <Chip
                          label={patient.cause_of_coma}
                          size="small"
                          sx={{
                            background: "rgba(168, 85, 247, 0.15)",
                            color: "#a855f7",
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </Box>

                    {/* Prediction Results - CT */}
                    {patient.patient_type !== "coma" && patient.risk_score && (
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        background: getRiskColor(patient.risk_score),
                        border: `1px solid ${getRiskTextColor(patient.risk_score)}30`,
                        mb: 2
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          {getRiskIcon(patient.risk_score)}
                          <Typography variant="subtitle2" sx={{ color: getRiskTextColor(patient.risk_score), fontWeight: 700 }}>
                            CT Risk: {formatRiskScore(patient.risk_score)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {patient.needs_ct ? "⚠️ CT Scan Recommended" : "✓ CT Not Urgent"}
                        </Typography>
                      </Box>
                    )}

                    {/* Prediction Results - Coma */}
                    {patient.patient_type === "coma" && (
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(168, 85, 247, 0.1)",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        mb: 2
                      }}>
                        <Typography variant="subtitle2" sx={{ color: "#a855f7", fontWeight: 700, mb: 1 }}>
                          {patient.conscious_state || "Coma Assessment"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {patient.deterioration_risk != null && (
                            <Chip
                              label={`Risk: ${patient.deterioration_risk?.toFixed?.(1) || patient.deterioration_risk}%`}
                              size="small"
                              sx={{
                                background: getComaStatusColor(patient.deterioration_level).bg,
                                color: getComaStatusColor(patient.deterioration_level).text,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                          {patient.stability_score != null && (
                            <Chip
                              label={`Stability: ${patient.stability_score?.toFixed?.(1) || patient.stability_score}%`}
                              size="small"
                              sx={{
                                background: getComaStatusColor(patient.stability_level).bg,
                                color: getComaStatusColor(patient.stability_level).text,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tooltip title="View Details">
                        <IconButton
                          sx={{
                            background: "rgba(0, 212, 170, 0.1)",
                            "&:hover": {
                              background: "rgba(0, 212, 170, 0.2)",
                            },
                            mr: 1,
                          }}
                        >
                          <ViewIcon sx={{ color: "#00d4aa" }} />
                        </IconButton>
                      </Tooltip>

                      {patient.in_queue !== false && (
                        <Tooltip title="Mark as Done">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkDone(patient.id);
                            }}
                            sx={{
                              background: "rgba(34, 197, 94, 0.1)",
                              "&:hover": {
                                background: "rgba(34, 197, 94, 0.2)",
                              },
                              mr: 1,
                            }}
                          >
                            <DoneIcon sx={{ color: "#22c55e" }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete Patient">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ open: true, patient });
                          }}
                          sx={{
                            background: "rgba(239, 68, 68, 0.1)",
                            "&:hover": {
                              background: "rgba(239, 68, 68, 0.2)",
                            },
                          }}
                        >
                          <DeleteIcon sx={{ color: "#ef4444" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, patient: null })}
        PaperProps={{
          sx: {
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Are you sure you want to delete patient{" "}
            <strong style={{ color: "#ef4444" }}>{deleteDialog.patient?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog({ open: false, patient: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePatient}
            sx={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
