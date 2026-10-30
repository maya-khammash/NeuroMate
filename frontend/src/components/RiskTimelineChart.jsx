import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';

const RiskTimelineChart = ({ timelineData, riskLevel }) => {
  // Convert timeline object to array format for chart
  const chartData = Object.entries(timelineData || {}).map(([time, risk]) => ({
    time: time,
    risk: Math.round(risk),
  }));

  // Calculate current risk from timeline data instead of using prop
  const getCurrentRiskFromTimeline = () => {
    if (!timelineData || Object.keys(timelineData).length === 0) return 'moderate';
    
    // Get the latest risk value (24h)
    const latestRisk = timelineData['24h'] || 50;
    
    if (latestRisk >= 70) return 'high';
    if (latestRisk >= 40) return 'moderate';
    return 'low';
  };

  const currentRiskLevel = getCurrentRiskFromTimeline();

  // Get line color based on calculated risk level from timeline
  const getLineColor = () => {
    switch (currentRiskLevel?.toLowerCase()) {
      case 'high': return '#cc6666';
      case 'moderate': return '#cc9900';
      case 'low': return '#66aa66';
      default: return '#6b9dff';
    }
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const color = payload.risk >= 50 ? '#cc6666' : payload.risk >= 30 ? '#cc9900' : '#66aa66';
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  if (!timelineData || Object.keys(timelineData).length === 0) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Risk Timeline
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 250,
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
              Loading risk timeline...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          Risk Timeline (24 Hours)
        </Typography>
        
        <Box sx={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
              />
              <XAxis 
                dataKey="time"
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                label={{ 
                  value: 'Risk %', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'rgba(255,255,255,0.7)' }
                }}
                domain={[0, 100]}
              />
              
              {/* Critical risk threshold line */}
              <ReferenceLine 
                y={50} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: "Critical", position: "topRight", fill: "#ef4444" }}
              />
              
              <Line
                type="monotone"
                dataKey="risk"
                stroke={getLineColor()}
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: getLineColor() }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Risk progression over 24-hour period
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#66aa66' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Low</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#cc9900' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Moderate</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#cc6666' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>High</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RiskTimelineChart;
