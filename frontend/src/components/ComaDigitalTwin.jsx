import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ViewInAr as ViewInArIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Patient3DModel from './Patient3DModel';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`coma-tabpanel-${index}`}
      aria-labelledby={`coma-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ComaDigitalTwin = ({ patientId, patientName, patientAge, patientSex }) => {
  const [tabValue, setTabValue] = useState(0);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentComaLevel, setCurrentComaLevel] = useState('conscious');
  
  // Data states
  const [digitalTwinData, setDigitalTwinData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [riskFactors, setRiskFactors] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Form states
  const [assessmentForm, setAssessmentForm] = useState({
    eye_response: 4,
    verbal_response: 5,
    motor_response: 6,
    left_pupil_size: 4.0,
    right_pupil_size: 4.0,
    left_pupil_reactivity: 'brisk',
    right_pupil_reactivity: 'brisk',
    heart_rate: 80,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    oxygen_saturation: 98,
    respiratory_rate: 16,
    temperature: 36.5,
    brain_stem_reflexes: 'present',
    seizures_present: false,
    ventilation_required: false,
    intracranial_pressure: 15,
    notes: ''
  });

  // Fetch digital twin data
  const fetchDigitalTwinData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/coma/digital-twin/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch digital twin data');
      }

      const data = await response.json();
      setDigitalTwinData(data);
      setAssessments(data.latest_assessment ? [data.latest_assessment] : []);
      setTimeline(data.timeline || []);
      setRiskFactors(data.risk_factors);
      
      // Update coma level based on latest assessment
      if (data.latest_assessment && data.latest_assessment.gcs_total) {
        const gcs = data.latest_assessment.gcs_total;
        let level = 'conscious';
        if (gcs <= 8) level = 'moderate_coma';
        else if (gcs <= 10) level = 'mild_coma';
        else if (gcs <= 12) level = 'vegetative';
        else if (gcs <= 14) level = 'minimally_conscious';
        setCurrentComaLevel(level);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get AI prediction
  const getPrediction = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/coma/prediction/${patientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create coma assessment
  const createAssessment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/coma/assessment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          ...assessmentForm,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }

      await fetchDigitalTwinData();
      setAssessmentOpen(false);
      setAssessmentForm({
        eye_response: 4,
        verbal_response: 5,
        motor_response: 6,
        left_pupil_size: 4.0,
        right_pupil_size: 4.0,
        left_pupil_reactivity: 'brisk',
        right_pupil_reactivity: 'brisk',
        heart_rate: 80,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        oxygen_saturation: 98,
        respiratory_rate: 16,
        temperature: 36.5,
        brain_stem_reflexes: 'present',
        seizures_present: false,
        ventilation_required: false,
        intracranial_pressure: 15,
        notes: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchDigitalTwinData();
    }
  }, [patientId]);

  const getGCSColor = (gcs) => {
    if (gcs >= 13) return '#4caf50'; // Green
    if (gcs >= 9) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getConsciousnessColor = (level) => {
    const colors = {
      conscious: '#4caf50',
      minimally_conscious: '#8bc34a',
      vegetative: '#ff9800',
      mild_coma: '#ff5722',
      moderate_coma: '#f44336',
      deep_coma: '#d32f2f'
    };
    return colors[level] || '#9e9e9e';
  };

  const getRiskColor = (risk) => {
    if (risk <= 0.3) return '#4caf50';
    if (risk <= 0.6) return '#ff9800';
    return '#f44336';
  };

  if (loading && !digitalTwinData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Coma Digital Twin
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Patient: {patientName} ({patientAge} years, {patientSex})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => setAssessmentOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)',
            }}
          >
            New Assessment
          </Button>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={getPrediction}
            disabled={loading}
          >
            Get Prediction
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Tab label="Overview" icon={<AssessmentIcon />} />
          <Tab label="3D Model" icon={<ViewInArIcon />} />
          <Tab label="Timeline" icon={<TimelineIcon />} />
          <Tab label="Predictions" icon={<TrendingUpIcon />} />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Latest Assessment */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Latest Assessment
                  </Typography>
                  {assessments.length > 0 ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Glasgow Coma Scale
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: getGCSColor(assessments[0].gcs_total) }}>
                          {assessments[0].gcs_total}
                          <Typography component="span" variant="h6" sx={{ color: 'text.secondary' }}>
                            /15
                          </Typography>
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(assessments[0].gcs_total / 15) * 100}
                          sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${getGCSColor(assessments[0].gcs_total)} 0%, ${getGCSColor(assessments[0].gcs_total)}80 100%)`,
                            },
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Eye Response
                          </Typography>
                          <Typography variant="h6">
                            {assessments[0].eye_response}/4
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Verbal Response
                          </Typography>
                          <Typography variant="h6">
                            {assessments[0].verbal_response}/5
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Motor Response
                          </Typography>
                          <Typography variant="h6">
                            {assessments[0].motor_response}/6
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Pupil Size
                          </Typography>
                          <Typography variant="h6">
                            L: {assessments[0].left_pupil_size}mm R: {assessments[0].right_pupil_size}mm
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No assessments available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Risk Factors */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Risk Assessment
                  </Typography>
                  {riskFactors ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Injury Severity
                        </Typography>
                        <Chip
                          label={riskFactors.injury_severity}
                          sx={{
                            background: riskFactors.injury_severity === 'severe' ? '#ffebee' : '#e8f5e8',
                            color: riskFactors.injury_severity === 'severe' ? '#c62828' : '#2e7d32',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Complications
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {riskFactors.cerebral_edema && (
                              <Chip label="Cerebral Edema" size="small" color="warning" />
                            )}
                            {riskFactors.hemorrhage && (
                              <Chip label="Hemorrhage" size="small" color="error" />
                            )}
                            {riskFactors.ischemia && (
                              <Chip label="Ischemia" size="small" color="warning" />
                            )}
                            {riskFactors.hydrocephalus && (
                              <Chip label="Hydrocephalus" size="small" color="info" />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            ICU Stay
                          </Typography>
                          <Typography variant="h6">
                            {riskFactors.icu_stay_duration || 0} days
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Ventilation
                          </Typography>
                          <Typography variant="h6">
                            {riskFactors.ventilation_duration || 0} days
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No risk factors available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 3D Model Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      3D Patient Visualization
                    </Typography>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Coma Level</InputLabel>
                      <Select
                        value={currentComaLevel}
                        onChange={(e) => setCurrentComaLevel(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="conscious">Conscious</MenuItem>
                        <MenuItem value="minimally_conscious">Minimally Conscious</MenuItem>
                        <MenuItem value="vegetative">Vegetative</MenuItem>
                        <MenuItem value="mild_coma">Mild Coma</MenuItem>
                        <MenuItem value="moderate_coma">Moderate Coma</MenuItem>
                        <MenuItem value="deep_coma">Deep Coma</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Patient3DModel 
                    patientSex={patientSex?.toLowerCase() || 'male'}
                    showBrain={false}
                    comaLevel={currentComaLevel}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<PersonIcon />}
                      label={`Model: ${patientSex?.toLowerCase() === 'male' ? 'Male' : 'Female'}`}
                      variant="outlined"
                    />
                    <Chip 
                      icon={<PsychologyIcon />}
                      label={`Status: ${currentComaLevel.replace('_', ' ')}`}
                      color={currentComaLevel === 'conscious' ? 'success' : 'warning'}
                    />
                    {/* Debug chip - remove later */}
                    <Chip 
                      label={`Debug: sex="${patientSex}"`}
                      size="small"
                      color="default"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Consciousness Timeline
              </Typography>
              {timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour_since_injury" 
                      label={{ value: 'Hours Since Injury', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'GCS Score', angle: -90, position: 'insideLeft' }}
                      domain={[0, 15]}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="gcs_score"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.3}
                      name="GCS Score"
                    />
                    <Area
                      type="monotone"
                      dataKey="recovery_probability"
                      stroke="#00d4aa"
                      fill="#00d4aa"
                      fillOpacity={0.3}
                      name="Recovery Probability"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No timeline data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Predictions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {prediction && (
              <>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Recovery Prediction
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Recovery Probability
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: getRiskColor(1 - prediction.recovery_probability) }}>
                          {(prediction.recovery_probability * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.recovery_probability * 100}
                          sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${getRiskColor(1 - prediction.recovery_probability)} 0%, ${getRiskColor(1 - prediction.recovery_probability)}80 100%)`,
                            },
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Predicted GCS (24h)
                          </Typography>
                          <Typography variant="h6">
                            {prediction.predicted_gcs_24h}/15
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Predicted GCS (72h)
                          </Typography>
                          <Typography variant="h6">
                            {prediction.predicted_gcs_72h}/15
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Time to Consciousness
                          </Typography>
                          <Typography variant="h6">
                            {prediction.time_to_consciousness_hours} hours
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Risk Assessment
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Mortality Risk
                          </Typography>
                          <Typography variant="h6" sx={{ color: getRiskColor(prediction.mortality_risk) }}>
                            {(prediction.mortality_risk * 100).toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            Complication Risks
                          </Typography>
                          {Object.entries(prediction.complication_risk).map(([complication, risk]) => (
                            <Box key={complication} sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {complication.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                <Typography variant="body2">
                                  {(risk * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={risk * 100}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  background: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: getRiskColor(risk),
                                  },
                                }}
                              />
                            </Box>
                          ))}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
            {!prediction && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Click "Get Prediction" to generate AI-based predictions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Assessment Dialog */}
      <Dialog open={assessmentOpen} onClose={() => setAssessmentOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Coma Assessment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Eye Response (1-4)</InputLabel>
                <Select
                  value={assessmentForm.eye_response}
                  onChange={(e) => setAssessmentForm({...assessmentForm, eye_response: parseInt(e.target.value)})}
                >
                  <MenuItem value={1}>1 - No response</MenuItem>
                  <MenuItem value={2}>2 - Open to pain</MenuItem>
                  <MenuItem value={3}>3 - Open to command</MenuItem>
                  <MenuItem value={4}>4 - Spontaneous</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Verbal Response (1-5)</InputLabel>
                <Select
                  value={assessmentForm.verbal_response}
                  onChange={(e) => setAssessmentForm({...assessmentForm, verbal_response: parseInt(e.target.value)})}
                >
                  <MenuItem value={1}>1 - No response</MenuItem>
                  <MenuItem value={2}>2 - Incomprehensible sounds</MenuItem>
                  <MenuItem value={3}>3 - Inappropriate words</MenuItem>
                  <MenuItem value={4}>4 - Confused</MenuItem>
                  <MenuItem value={5}>5 - Oriented</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Motor Response (1-6)</InputLabel>
                <Select
                  value={assessmentForm.motor_response}
                  onChange={(e) => setAssessmentForm({...assessmentForm, motor_response: parseInt(e.target.value)})}
                >
                  <MenuItem value={1}>1 - No response</MenuItem>
                  <MenuItem value={2}>2 - Abnormal extension</MenuItem>
                  <MenuItem value={3}>3 - Abnormal flexion</MenuItem>
                  <MenuItem value={4}>4 - Withdrawal to pain</MenuItem>
                  <MenuItem value={5}>5 - Localizes pain</MenuItem>
                  <MenuItem value={6}>6 - Obeys commands</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Left Pupil Size (mm)"
                type="number"
                value={assessmentForm.left_pupil_size}
                onChange={(e) => setAssessmentForm({...assessmentForm, left_pupil_size: parseFloat(e.target.value)})}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Right Pupil Size (mm)"
                type="number"
                value={assessmentForm.right_pupil_size}
                onChange={(e) => setAssessmentForm({...assessmentForm, right_pupil_size: parseFloat(e.target.value)})}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Left Pupil Reactivity</InputLabel>
                <Select
                  value={assessmentForm.left_pupil_reactivity}
                  onChange={(e) => setAssessmentForm({...assessmentForm, left_pupil_reactivity: e.target.value})}
                >
                  <MenuItem value="brisk">Brisk</MenuItem>
                  <MenuItem value="sluggish">Sluggish</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Right Pupil Reactivity</InputLabel>
                <Select
                  value={assessmentForm.right_pupil_reactivity}
                  onChange={(e) => setAssessmentForm({...assessmentForm, right_pupil_reactivity: e.target.value})}
                >
                  <MenuItem value="brisk">Brisk</MenuItem>
                  <MenuItem value="sluggish">Sluggish</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Heart Rate"
                type="number"
                value={assessmentForm.heart_rate}
                onChange={(e) => setAssessmentForm({...assessmentForm, heart_rate: parseInt(e.target.value)})}
                inputProps={{ min: 0, max: 300 }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Systolic BP"
                type="number"
                value={assessmentForm.blood_pressure_systolic}
                onChange={(e) => setAssessmentForm({...assessmentForm, blood_pressure_systolic: parseInt(e.target.value)})}
                inputProps={{ min: 0, max: 300 }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Diastolic BP"
                type="number"
                value={assessmentForm.blood_pressure_diastolic}
                onChange={(e) => setAssessmentForm({...assessmentForm, blood_pressure_diastolic: parseInt(e.target.value)})}
                inputProps={{ min: 0, max: 200 }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="O2 Saturation (%)"
                type="number"
                value={assessmentForm.oxygen_saturation}
                onChange={(e) => setAssessmentForm({...assessmentForm, oxygen_saturation: parseFloat(e.target.value)})}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={assessmentForm.notes}
                onChange={(e) => setAssessmentForm({...assessmentForm, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssessmentOpen(false)}>Cancel</Button>
          <Button 
            onClick={createAssessment} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)',
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Assessment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComaDigitalTwin;