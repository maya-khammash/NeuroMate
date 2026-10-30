import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Psychology as BrainIcon,
  LocalHospital as HospitalIcon,
  School as StudentIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import MedicalBackground from "../components/MedicalBackground";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await API.post("/auth/signin", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("username", res.data.username);

      if (res.data.role === "doctor") {
        navigate("/dashboard");
      } else if (res.data.role === "student") {
        navigate("/cases");
      } else if (res.data.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setMessage(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    { role: "Doctor", icon: <HospitalIcon />, color: "#00d4aa", desc: "Patient management & diagnosis" },
    { role: "Student", icon: <StudentIcon />, color: "#a855f7", desc: "Case studies & learning" },
    { role: "Admin", icon: <AdminIcon />, color: "#f59e0b", desc: "System administration" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        p: 2,
      }}
    >
      <MedicalBackground />

      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 480,
            width: "100%",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: "rgba(17, 24, 39, 0.85)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 15px 40px rgba(0, 212, 170, 0.4)",
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }}
            >
              <BrainIcon sx={{ fontSize: 45, color: "white" }} />
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              NeuroMate
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: "0.95rem",
              }}
            >
              Clinical Digital Twin for Traumatic Brain Injury
            </Typography>
          </Box>

          {/* Role indicators */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            {roleCards.map((item, index) => (
              <Fade in timeout={600 + index * 200} key={item.role}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      background: `${item.color}25`,
                    },
                  }}
                >
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Typography variant="caption" sx={{ color: item.color, fontWeight: 600 }}>
                    {item.role}
                  </Typography>
                </Box>
              </Fade>
            ))}
          </Box>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {message && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {message}
                </Alert>
              </Fade>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                position: "relative",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Secure access to TBI patient management system
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}
