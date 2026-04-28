import React from "react";
import logo from "../assets/new-logo.png";

export default function Landing({ onLogin, onRegister }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      padding: "20px",
      boxSizing: "border-box",
      position: "relative",
    }}>

      {/* Subtle background glow */}
      <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:"700px", height:"500px", background:"radial-gradient(ellipse, rgba(185,28,28,0.06) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      {/* Main content */}
      <div style={{ position:"relative", zIndex:5, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", width:"100%", maxWidth:"700px" }}>

        {/* Top Tagline */}
        <p style={{
          margin: "0 0 12px 0",
          fontSize: "clamp(11px, 2.5vw, 15px)",
          fontWeight: "700",
          letterSpacing: "2px",
          textTransform: "uppercase",
          background: "linear-gradient(135deg, #b91c1c 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "Georgia, serif",
        }}>
          The World's Most Trusted Pet Marketplace.
        </p>

        {/* Logo */}
        <img
          src={logo}
          alt="Genetic Breeds"
          style={{
            width: "min(480px, 90vw)",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0 12px 32px rgba(185,28,28,0.15)) contrast(1.04) saturate(1.1)",
            
            marginBottom: "4px",
          }}
        />

        <style>{`

          .gb-login-btn {
            padding: 11px 26px;
            border-radius: 50px;
            border: 1.5px solid rgba(185,28,28,0.3);
            background: transparent;
            color: #b91c1c;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: sans-serif;
          }
          .gb-login-btn:hover { background: rgba(185,28,28,0.05); }
          .gb-register-btn {
            padding: 11px 26px;
            border-radius: 50px;
            border: none;
            background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 20px rgba(185,28,28,0.3);
            font-family: sans-serif;
          }
          .gb-register-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(185,28,28,0.4); }
        `}</style>

        {/* Tagline */}
        <p style={{
          margin: "4px 0 0",
          fontSize: "clamp(13px, 3vw, 17px)",
          fontWeight: "600",
          color: "#6b7280",
          lineHeight: 1.6,
          maxWidth: "500px",
          fontFamily: "sans-serif",
        }}>
          Connecting Pet Lovers with Verified Breeders for Rare, Exotic & Purebred Animals Across the Globe.
        </p>

        {/* Divider */}
        <div style={{ width:"48px", height:"2px", background:"linear-gradient(90deg, transparent, #b91c1c, transparent)", borderRadius:"999px", margin:"14px auto" }} />

        {/* CTA Buttons */}
        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap", marginBottom:"16px" }}>
          <button className="gb-login-btn" onClick={onLogin}>Login</button>
          <button className="gb-register-btn" onClick={onRegister}>Register →</button>
        </div>

        {/* Pills */}
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:"8px" }}>
          {["✦ Verified Sellers", "✦ Trusted Listings", "✦ Global Reach"].map(function(label, i) {
            return React.createElement("div", {
              key: i,
              style: {
                padding: "7px 16px",
                borderRadius: "14px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontSize: "12px",
                fontWeight: "700",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontFamily: "sans-serif",
              }
            }, label);
          })}
        </div>

      </div>
    </div>
  );
}
