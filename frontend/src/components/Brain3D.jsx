import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import { Box, Typography, CircularProgress } from '@mui/material';
import * as THREE from 'three';

// Brain mesh component
function BrainMesh({ riskColor }) {
  const meshRef = useRef();
  const { scene } = useGLTF('/models/brain_3d.glb');
  
  useEffect(() => {
    if (scene && meshRef.current) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.color.set(riskColor);
          child.material.emissive = new THREE.Color(riskColor);
          child.material.emissiveIntensity = 0.1;
          child.material.metalness = 0.3;
          child.material.roughness = 0.4;
        }
      });
    }
  }, [scene, riskColor]);

  return (
    <group ref={meshRef}>
      <primitive object={scene} scale={[5.5, 5.5, 5.5]} />
    </group>
  );
}

const Brain3D = ({ riskLevel, size = 200 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRiskColor = () => {
    switch (riskLevel?.toLowerCase()) {
      case "high": return "#cc6666";  // Toned down red
      case "moderate": return "#cc9900";  // Toned down orange
      case "low": return "#66aa66";      // Toned down green
      default: return "#6b9dff";
    }
  };

  const riskColor = getRiskColor();

  useEffect(() => {
    // Preload the model
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        width: size,
        height: size,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        background: 'rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Brain Model
        </Typography>
        <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', px: 2 }}>
          3D model loading failed
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
          Please refresh to try again
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      width: size,
      height: size,
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 2,
      background: 'rgba(0,0,0,0.1)'
    }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        3D Brain Model
      </Typography>
      
      <Box sx={{ 
        width: size + 50, 
        height: size + 50, 
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)'
      }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            height: '100%' 
          }}>
            <CircularProgress size={40} sx={{ color: riskColor, mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading 3D Brain...
            </Typography>
          </Box>
        ) : (
          <Canvas
            shadows
            camera={{ position: [0, 0, 8], fov: 60 }}
            style={{ width: '100%', height: '100%' }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
            
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.8} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.4} color={riskColor} />
            
            <Suspense fallback={null}>
              <BrainMesh riskColor={riskColor} />
            </Suspense>
            
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={15}
              autoRotate={true}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        )}
      </Box>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
        Risk: {riskLevel || 'Unknown'}
      </Typography>
    </Box>
  );
};

export default Brain3D;
