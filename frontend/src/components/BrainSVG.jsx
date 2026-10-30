import React from "react";

function BrainSVG({ level }) {
  const colors = {
    low: "#22c55e",
    moderate: "#f59e0b",
    high: "#ef4444",
  };

  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 200 200"
      fill="none"
    >
      <path
        d="M60 40
           C20 40, 20 100, 60 100
           C60 140, 100 140, 100 100
           C100 140, 140 140, 140 100
           C180 100, 180 40, 140 40
           C140 10, 100 10, 100 40
           C100 10, 60 10, 60 40Z"
        fill={colors[level]}
        opacity="0.85"
      />
    </svg>
  );
}

export default BrainSVG;
