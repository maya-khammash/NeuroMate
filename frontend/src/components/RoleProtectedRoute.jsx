import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❌ مش مسجّل دخول
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ مسجّل دخول لكن الدور غير مسموح
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  // ✅ مسموح
  return children;
}
