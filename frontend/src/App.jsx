import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Admin from "./pages/Admin";
import AddPatient from "./pages/AddPatient";
import PatientDetails from "./pages/PatientDetails";
import CaseDetails from "./pages/CaseDetails";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Doctor only */}
          <Route
            path="/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["doctor"]}>
                <Dashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/add-patient"
            element={
              <RoleProtectedRoute allowedRoles={["doctor"]}>
                <AddPatient />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/patients/:id"
            element={
              <RoleProtectedRoute allowedRoles={["doctor"]}>
                <PatientDetails />
              </RoleProtectedRoute>
            }
          />

          {/* Student only */}
          <Route
            path="/cases"
            element={
              <RoleProtectedRoute allowedRoles={["student"]}>
                <Cases />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/cases/:id"
            element={
              <RoleProtectedRoute allowedRoles={["student"]}>
                <CaseDetails />
              </RoleProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <Admin />
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
