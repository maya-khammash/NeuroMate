import React, { useEffect, useState } from "react";
import { getStudentCases } from "../api/student";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Fade,
  Skeleton,
  IconButton,
  Tooltip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Psychology as BrainIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  MenuBook as CaseIcon,
  MedicalServices as CTIcon,
  MonitorHeart as ComaIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

const getSeverityConfig = (severity, gcs) => {
  const severityLower = severity?.toLowerCase() || "";
  if (severityLower.includes("severe") || gcs <= 8) {
    return {
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
      icon: <ErrorIcon />,
      label: "Severe",
      progress: 100,
    };
  } else if (severityLower.includes("moderate") || (gcs > 8 && gcs <= 12)) {
    return {
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
      icon: <WarningIcon />,
      label: "Moderate",
      progress: 65,
    };
  } else {
    return {
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.15)",
      icon: <CheckIcon />,
      label: "Mild",
      progress: 30,
    };
  }
};

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getStudentCases();
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const statsCards = [
    {
      title: "Total Cases",
      value: cases.length,
      icon: <CaseIcon />,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    },
    {
      title: "CT Cases",
      value: cases.filter(c => c.patient_type === 'ct').length,
      icon: <CTIcon />,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    },
    {
      title: "Coma Cases",
      value: cases.filter(c => c.patient_type === 'coma').length,
      icon: <ComaIcon />,
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    },
    {
      title: "Severe Cases",
      value: cases.filter(c => c.gcs && c.gcs <= 8).length,
      icon: <ErrorIcon />,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    },
  ];

  const handleFilterChange = (event, newFilter) => {
    setFilter(newFilter);
  };

  const filteredCases = cases.filter(caseItem => {
    if (filter === 'all') return true;
    if (filter === 'ct') return caseItem.patient_type === 'ct';
    if (filter === 'coma') return caseItem.patient_type === 'coma';
    return true;
  });

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
          Case Studies
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Review and learn from TBI case studies - Separated by patient type
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={6} md={3} key={stat.title}>
            <Fade in timeout={400 + index * 150}>
              <Card
                sx={{
                  background: "rgba(17, 24, 39, 0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    border: `1px solid ${stat.color}40`,
                    boxShadow: `0 15px 30px ${stat.color}20`,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                        {loading ? <Skeleton width={40} /> : stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: stat.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 6px 15px ${stat.color}40`,
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { color: "white", fontSize: "20px" } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Filter Tabs */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}>
          Filter by Patient Type
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="all" sx={{ px: 3, py: 1.5 }}>
            <FilterIcon sx={{ mr: 1 }} />
            All Cases ({cases.length})
          </ToggleButton>
          <ToggleButton value="ct" sx={{ px: 3, py: 1.5 }}>
            <CTIcon sx={{ mr: 1 }} />
            CT Patients ({cases.filter(c => c.patient_type === 'ct').length})
          </ToggleButton>
          <ToggleButton value="coma" sx={{ px: 3, py: 1.5 }}>
            <ComaIcon sx={{ mr: 1 }} />
            Coma Patients ({cases.filter(c => c.patient_type === 'coma').length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Cases Grid */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
          {filter === 'all' ? 'All Available Cases' : 
           filter === 'ct' ? 'CT Scan Cases' : 'Coma Patient Cases'}
          <Typography component="span" variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
            ({filteredCases.length} cases)
          </Typography>
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredCases.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center" }}>
          <BrainIcon sx={{ fontSize: "60px", color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            {filter === 'all' ? 'No cases available' : 
             filter === 'ct' ? 'No CT cases available' : 'No coma cases available'}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {filter === 'all' ? 'Check back later for new case studies' : 
             'Try selecting a different filter to see more cases'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredCases.map((caseItem, index) => {
            const severity = getSeverityConfig(caseItem.tbiSeverity, caseItem.gcs);
            const patientType = getPatientTypeConfig(caseItem.patient_type);
            return (
              <Grid item xs={12} md={4} key={caseItem.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: `2px solid ${patientType.color}20`,
                      "&:hover": {
                        transform: "translateY(-6px)",
                        border: `2px solid ${patientType.color}60`,
                        boxShadow: `0 20px 40px ${patientType.color}30`,
                      },
                    }}
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header with Patient Type */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
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
                          icon={severity.icon}
                          label={severity.label}
                          size="small"
                          sx={{
                            background: severity.bg,
                            color: severity.color,
                            border: `1px solid ${severity.color}40`,
                            "& .MuiChip-icon": { color: severity.color },
                          }}
                        />
                      </Box>

                      {/* Case Info */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            background: patientType.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 8px 20px ${patientType.color}40`,
                          }}
                        >
                          {React.cloneElement(patientType.icon, { sx: { color: "white", fontSize: "24px" } })}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            Case #{caseItem.id}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {caseItem.patient_type === 'coma' ? 'Coma Study' : 'CT Scan Study'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Patient Details */}
                      {caseItem.patient_type === 'ct' ? (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              GCS Score
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: severity.color }}>
                              {caseItem.gcs}/15
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(caseItem.gcs / 15) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.1)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${severity.color} 0%, ${severity.color}80 100%)`,
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              GCS Total
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: severity.color }}>
                              {caseItem.gcs_total || caseItem.gcs || 'N/A'}/15
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={((caseItem.gcs_total || caseItem.gcs || 0) / 15) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.1)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${patientType.color} 0%, ${patientType.color}80 100%)`,
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* Additional Info */}
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                        <Chip
                          label={`${caseItem.age} years`}
                          size="small"
                          sx={{
                            background: "rgba(0, 212, 170, 0.15)",
                            color: "#00d4aa",
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={caseItem.sex || "Unknown"}
                          size="small"
                          sx={{
                            background: "rgba(168, 85, 247, 0.15)",
                            color: "#a855f7",
                            fontWeight: 500,
                          }}
                        />
                      </Box>

                      {/* Action */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="View Case Details">
                          <IconButton
                            sx={{
                              background: `${patientType.color}15`,
                              "&:hover": {
                                background: `${patientType.color}25`,
                              },
                            }}
                          >
                            <ViewIcon sx={{ color: patientType.color }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Layout>
  );
}
