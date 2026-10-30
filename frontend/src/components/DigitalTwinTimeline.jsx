import React, { useState, useEffect } from "react";
import { predictRiskWithTimeline } from "../services/api";
import "../styles/digitalTwinTimeline.css";

function DigitalTwinTimeline({ patientData }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (patientData) {
      fetchTimelineData();
    }
  }, [patientData]);

  const fetchTimelineData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictRiskWithTimeline(patientData);
      setTimelineData(result);
      setCurrentTime(0);
    } catch (err) {
      console.error("Digital twin error:", err);
      setError("Failed to load digital twin simulation");
    } finally {
      setLoading(false);
    }
  };

  const addHours = (hours) => {
    if (!timelineData?.timeline) return;
    
    const newTime = currentTime + hours;
    const maxTime = 24; // Maximum time in hours
    
    if (newTime <= maxTime) {
      setCurrentTime(newTime);
    }
  };

  const getCurrentRisk = () => {
    if (!timelineData?.timeline) return null;
    
    // Find the closest time point in the timeline
    const timePoints = Object.keys(timelineData.timeline);
    let closestTime = "0h";
    let minDiff = Infinity;
    
    timePoints.forEach(timePoint => {
      const hours = parseInt(timePoint.replace('h', ''));
      const diff = Math.abs(hours - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestTime = timePoint;
      }
    });
    
    return timelineData.timeline[closestTime];
  };

  const currentRisk = getCurrentRisk();

  if (loading) {
    return (
      <div className="digital-twin-container">
        <div className="loading">Loading digital twin simulation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="digital-twin-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div className="digital-twin-container">
        <div className="no-data">No patient data provided</div>
      </div>
    );
  }

  return (
    <div className="digital-twin-container">
      <h3>Digital Twin Simulation</h3>
      
      <div className="timeline-display">
        <div className="current-time">
          <span className="time-label">Current Time:</span>
          <span className="time-value">{currentTime}h</span>
        </div>
        
        <div className="current-risk">
          <span className="risk-label">Risk at {currentTime}h:</span>
          <span className={`risk-value ${timelineData.risk_level?.toLowerCase()}`}>
            {currentRisk?.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="time-controls">
        <button 
          className="time-btn add-6h"
          onClick={() => addHours(6)}
          disabled={currentTime >= 24}
        >
          +6 Hours
        </button>
        <button 
          className="time-btn add-12h"
          onClick={() => addHours(12)}
          disabled={currentTime >= 24}
        >
          +12 Hours
        </button>
        <button 
          className="time-btn reset"
          onClick={() => setCurrentTime(0)}
        >
          Reset
        </button>
      </div>

      <div className="timeline-chart">
        <h4>Risk Progression Timeline</h4>
        <div className="timeline-points">
          {Object.entries(timelineData.timeline).map(([time, risk]) => (
            <div 
              key={time}
              className={`timeline-point ${currentTime >= parseInt(time.replace('h', '')) ? 'active' : ''}`}
            >
              <div className="point-time">{time}</div>
              <div className="point-risk">{risk.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="model-info">
        <small>Model: {timelineData.model_type} | Confidence: {timelineData.confidence}%</small>
        {timelineData.digital_twin_enabled && (
          <small className="digital-twin-badge">Digital Twin Enabled</small>
        )}
      </div>
    </div>
  );
}

export default DigitalTwinTimeline;
