import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    padding: "9px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "13px",
    color: isActive(path) ? "#fff" : "#7f0d1c",
    background: isActive(path)
      ? "linear-gradient(135deg, #7f0d1c, #b11226)"
      : "#fdecef",
    border: "1px solid #edd6da",
    transition: "all 0.2s ease",
    boxShadow: isActive(path)
      ? "0 6px 14px rgba(177,18,38,0.25)"
      : "none",
  });

  return (
    <div
      style={{
        marginBottom: "16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        paddingBottom: "10px",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          gap: "10px",
          flexWrap: "wrap",
          background: "linear-gradient(135deg, #7f0d1c, #b11226)",
          padding: "12px 16px",
          borderRadius: "14px",
          color: "#fff",
          boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>Admin Panel</h2>

        <button
          onClick={() => window.history.back()}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          ← Back
        </button>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link to="/admin" style={linkStyle("/admin")}>
          Admin List
        </Link>

        <Link to="/admin/dashboard" style={linkStyle("/admin/dashboard")}>
          Dashboard
        </Link>

        <Link to="/admin/daily-posts" style={linkStyle("/admin/daily-posts")}>
          Daily Posts
        </Link>

        <Link to="/admin/referrals" style={linkStyle("/admin/referrals")}>
          Referrals
        </Link>

        <Link to="/admin/users" style={linkStyle("/admin/users")}>
          Users
        </Link>

        <Link to="/admin/licences" style={linkStyle("/admin/licences")}>
          Licences
        </Link>
      </div>
    </div>
  );
}
