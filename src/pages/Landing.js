import React from "react";
import logo from "../assets/new-logo.png";

export default function Landing() {
  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        minHeight: "calc(100vh - 64px)",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 20px 10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          gap: "0px",
          overflow: "hidden",
          transform: "translateY(-26px)",
        }}
      >
        <img
          src={logo}
          alt="Genetic Breeds"
          style={{
            width: "515px",
            maxWidth: "92%",
            height: "auto",
            display: "block",
            imageRendering: "auto",
            filter:
              "drop-shadow(0 12px 24px rgba(15, 23, 42, 0.08)) contrast(1.04) saturate(1.03)",
            margin: "0 0 -6px 0",
          }}
        />

        <p
style={{
    margin: "-6px 0 0",
    maxWidth: "900px",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: 1.3,
    letterSpacing: "0.3px",
    fontFamily: "Segoe UI, Trebuchet MS, sans-serif",
    background:
      "linear-gradient(180deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 2px 6px rgba(107, 114, 128, 0.15)",
    whiteSpace: "nowrap",
          }}
        >
          Connect with verified pet sellers across the world — from loyal dogs
          to playful cats
        </p>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#111827",
              fontSize: "12px",
              fontWeight: "800",
              boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
              fontFamily: "Segoe UI, Trebuchet MS, sans-serif",
            }}
          >
            Verified Sellers
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#111827",
              fontSize: "12px",
              fontWeight: "800",
              boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
              fontFamily: "Segoe UI, Trebuchet MS, sans-serif",
            }}
          >
            Trusted Listings
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#111827",
              fontSize: "12px",
              fontWeight: "800",
              boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
              fontFamily: "Segoe UI, Trebuchet MS, sans-serif",
            }}
          >
            Global Reach
          </div>
        </div>
      </div>
    </div>
  );
}
