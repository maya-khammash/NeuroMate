import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

const Brain3DTest = ({ riskLevel, size = 200 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testFileAccess = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/models/brain_3d.glb');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('File size:', blob.size, 'bytes');
        alert('✅ File accessible! Size: ' + blob.size + ' bytes');
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      p: 2,
      border: '2px solid orange',
      borderRadius: 2,
      background: 'rgba(255,165,0,0.1)'
    }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        Brain Model Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testFileAccess}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test File Access'}
      </Button>
      
      {error && (
        <Typography variant="body2" sx={{ color: 'red', textAlign: 'center' }}>
          Error: {error}
        </Typography>
      )}
      
      <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
        Risk Level: {riskLevel || 'None'}
      </Typography>
      
      <Box sx={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: riskLevel === 'high' ? '#ff4444' : 
                   riskLevel === 'moderate' ? '#ff8800' : 
                   riskLevel === 'low' ? '#ffcc00' : '#6b9dff',
        mt: 2
      }} />
    </Box>
  );
};

export default Brain3DTest;
