import React from "react";
import { Box, keyframes } from "@mui/material";

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-20px) rotate(5deg); opacity: 0.8; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.7; }
`;

const drift = keyframes`
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(10px) translateY(-10px); }
  50% { transform: translateX(20px) translateY(0); }
  75% { transform: translateX(10px) translateY(10px); }
  100% { transform: translateX(0) translateY(0); }
`;

const heartbeat = keyframes`
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.05); }
`;

const DNAHelix = ({ style }) => (
  <svg width="40" height="80" viewBox="0 0 40 80" style={style}>
    <defs>
      <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <path
      d="M10 5 Q30 20 10 35 Q-10 50 10 65 Q30 80 10 95"
      stroke="url(#dnaGrad)"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M30 5 Q10 20 30 35 Q50 50 30 65 Q10 80 30 95"
      stroke="url(#dnaGrad)"
      strokeWidth="2"
      fill="none"
    />
    <line x1="10" y1="20" x2="30" y2="20" stroke="url(#dnaGrad)" strokeWidth="1.5" />
    <line x1="10" y1="50" x2="30" y2="50" stroke="url(#dnaGrad)" strokeWidth="1.5" />
  </svg>
);

const NeuronCell = ({ style }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={style}>
    <defs>
      <radialGradient id="neuronGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
      </radialGradient>
    </defs>
    <circle cx="30" cy="30" r="8" fill="url(#neuronGrad)" />
    <line x1="30" y1="22" x2="30" y2="5" stroke="#a855f7" strokeWidth="1.5" opacity="0.5" />
    <line x1="38" y1="30" x2="55" y2="30" stroke="#a855f7" strokeWidth="1.5" opacity="0.5" />
    <line x1="22" y1="30" x2="5" y2="30" stroke="#a855f7" strokeWidth="1.5" opacity="0.5" />
    <line x1="36" y1="24" x2="48" y2="12" stroke="#a855f7" strokeWidth="1.5" opacity="0.5" />
    <line x1="24" y1="36" x2="12" y2="48" stroke="#a855f7" strokeWidth="1.5" opacity="0.5" />
    <circle cx="30" cy="5" r="2" fill="#a855f7" opacity="0.6" />
    <circle cx="55" cy="30" r="2" fill="#a855f7" opacity="0.6" />
    <circle cx="5" cy="30" r="2" fill="#a855f7" opacity="0.6" />
    <circle cx="48" cy="12" r="2" fill="#a855f7" opacity="0.6" />
    <circle cx="12" cy="48" r="2" fill="#a855f7" opacity="0.6" />
  </svg>
);

const HeartbeatLine = ({ style }) => (
  <svg width="200" height="50" viewBox="0 0 200 50" style={style}>
    <path
      d="M0 25 L30 25 L40 25 L50 10 L60 40 L70 5 L80 45 L90 25 L100 25 L200 25"
      stroke="#00d4aa"
      strokeWidth="2"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

const PlusSign = ({ style }) => (
  <svg width="30" height="30" viewBox="0 0 30 30" style={style}>
    <rect x="12" y="2" width="6" height="26" rx="2" fill="#0ea5e9" opacity="0.3" />
    <rect x="2" y="12" width="26" height="6" rx="2" fill="#0ea5e9" opacity="0.3" />
  </svg>
);

const BrainIcon = ({ style }) => (
  <svg width="80" height="80" viewBox="0 0 100 100" style={style}>
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <path
      d="M30 20 C10 20, 10 50, 30 50 C30 70, 50 70, 50 50 C50 70, 70 70, 70 50 C90 50, 90 20, 70 20 C70 5, 50 5, 50 20 C50 5, 30 5, 30 20Z"
      fill="url(#brainGrad)"
      stroke="#a855f7"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

export default function MedicalBackground() {
  const elements = [
    { Component: DNAHelix, top: "10%", left: "5%", animation: float, duration: "8s" },
    { Component: DNAHelix, top: "60%", right: "8%", animation: float, duration: "10s" },
    { Component: NeuronCell, top: "20%", right: "15%", animation: pulse, duration: "4s" },
    { Component: NeuronCell, bottom: "25%", left: "10%", animation: pulse, duration: "5s" },
    { Component: NeuronCell, top: "70%", left: "80%", animation: pulse, duration: "6s" },
    { Component: HeartbeatLine, bottom: "10%", left: "20%", animation: heartbeat, duration: "1.5s" },
    { Component: HeartbeatLine, top: "5%", right: "25%", animation: heartbeat, duration: "1.8s" },
    { Component: PlusSign, top: "40%", left: "3%", animation: drift, duration: "12s" },
    { Component: PlusSign, top: "15%", right: "5%", animation: drift, duration: "15s" },
    { Component: PlusSign, bottom: "30%", right: "3%", animation: drift, duration: "10s" },
    { Component: BrainIcon, top: "45%", right: "5%", animation: float, duration: "9s" },
    { Component: BrainIcon, bottom: "15%", left: "5%", animation: float, duration: "11s" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        background: "linear-gradient(135deg, #0a0f1a 0%, #0d1525 50%, #0a1628 100%)",
      }}
    >
      {/* Gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at 20% 50%, rgba(0, 212, 170, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* Animated elements */}
      {elements.map((el, index) => {
        const { Component, animation, duration, ...position } = el;
        return (
          <Box
            key={index}
            sx={{
              position: "absolute",
              ...position,
              animation: `${animation} ${duration} ease-in-out infinite`,
            }}
          >
            <Component />
          </Box>
        );
      })}

      {/* Grid pattern overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </Box>
  );
}
