import logo from "../assets/new-logo.png";
import React, { useEffect, useState } from "react";

export default function Landing({ onLogin, onRegister }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.body.classList.add("landing-page");
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => {
      document.body.classList.remove("landing-page");
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden" }}>
      <div style={{ flex: 1, background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 24px" : "60px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", fontSize: "220px", opacity: 0.04, bottom: "-30px", left: "-20px", userSelect: "none" }}>🐾</div>
        <p style={{ margin: "0 0 20px", fontSize: isMobile ? "13px" : "16px", fontWeight: "850", letterSpacing: "2px", textTransform: "uppercase", background: "linear-gradient(135deg, #b91c1c 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "Georgia, serif", textAlign: "center" }}>The World's Most Trusted Pet Marketplace.</p>
        
        <img src={logo} alt="Genetic Breeds" style={{ width: "min(360px, 70vw)", height: "auto", marginBottom: "8px", filter: "drop-shadow(0 12px 32px rgba(185,28,28,0.15)) contrast(1.04) saturate(1.1)" }} />
        <p style={{ color: "#383847", fontSize: isMobile ? "13px" : "15px", fontWeight: "600", textAlign: "center", lineHeight: 1.7, maxWidth: "380px", fontFamily: "serif", margin: "0 0 28px" }}>Connecting Pet Lovers with Verified Breeders for Rare, Exotic & Purebreed Animals Across the Globe.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {["✦ Verified Sellers", "✦ Trusted Listings", "✦ Global Reach"].map((label, i) => (
            <div key={i} style={{ padding: "6px 14px", borderRadius: "999px", background: "#ffffff", border: "1px solid #e5e7eb", color: "#D9A757", fontSize: "12px", fontWeight: "700", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>{label}</div>
          ))}
        </div>
      </div>
      {!isMobile && <div style={{ width: "1px", background: "#e5e7eb", flexShrink: 0 }} />}
      <div style={{ flex: isMobile ? "unset" : "0 0 420px", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 24px" : "60px 48px" }}>
        <div style={{ width: "100%", maxWidth: "340px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: "800", color: "#111827" }}>Welcome Back 👋</h2>
          <p style={{ margin: "0 0 36px", fontSize: "14px", color: "#6b7280" }}>Sign in to your account or create a new one.</p>
          <button onClick={onLogin} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1.5px solid #b91c1c", background: "transparent", color: "#b91c1c", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "12px" }}>Login</button>
          <button onClick={onRegister} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #7a0016 0%, #b3122a 100%)", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 6px 20px rgba(179,18,42,0.3)" }}>Create Account →</button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "28px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>trusted by breeders worldwide</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[{ icon: "🔒", label: "Secure & Safe" }, { icon: "✅", label: "Verified Sellers" }, { icon: "🌍", label: "Global Reach" }, { icon: "🐾", label: "All Breeds" }].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
