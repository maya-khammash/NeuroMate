import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function GenderModel({ gender, scale = 1.5 }) {
  const modelRef = useRef();
  
  console.log('GenderModel received gender:', gender); // Debug log
  
  // Load appropriate model based on gender
  const modelPath = gender === 'male' 
    ? '/models/male_base_mesh.glb' 
    : '/models/female_base_mesh.glb';
  
  console.log('Loading model path:', modelPath); // Debug log
  
  const { scene } = useGLTF(modelPath);
  
  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={scale}
      position={[0, -1, 0]}
    />
  );
}

function BrainModel({ scale = 0.5 }) {
  const brainRef = useRef();
  const { scene } = useGLTF('/models/brain_3d.glb');
  
  return (
    <primitive 
      ref={brainRef}
      object={scene} 
      scale={scale}
      position={[0, 0, 0]}
    />
  );
}

const Patient3DModel = ({ patientSex, showBrain = false, comaLevel = 'conscious' }) => {
  console.log('Patient3DModel received patientSex:', patientSex); // Debug log
  
  const getModelColor = (level) => {
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

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <Suspense fallback={null}>
          {showBrain ? (
            <BrainModel />
          ) : (
            <group>
              <GenderModel gender={patientSex} />
              {/* Add coma level indicator */}
              <mesh position={[0, 2, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial 
                  color={getModelColor(comaLevel)} 
                  emissive={getModelColor(comaLevel)}
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
          )}
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
      
      {/* Status Badge */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: getModelColor(comaLevel),
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        {comaLevel.replace('_', ' ')}
      </div>
    </div>
  );
};

export default Patient3DModel;
