import React from "react";
import { Navigate } from "react-router-dom";

export default function Profile() {
  // Profile page is now handled inside the Navbar drawer
  // So if user tries to open /profile, redirect to home/browse
  return <Navigate to="/browse" replace />;
}
