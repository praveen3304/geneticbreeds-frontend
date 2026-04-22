import React from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={pageStyle}>

      {/* ── Hero ── */}
      <div style={heroStyle}>
        <div style={heroContentStyle}>
          <div style={heroBadgeStyle}>🐾 OUR STORY</div>
          <h1 style={heroTitleStyle}>About Genetic Breeds</h1>
          <p style={heroSubStyle}>
            India's most trusted pet marketplace — connecting responsible breeders,
            verified sellers, and loving pet families across the world.
          </p>
          <div style={heroStatsRowStyle}>
            {[
            ].map(({ value, label }) => (
              <div key={label} style={heroStatCardStyle}>
                <div style={heroStatValueStyle}>{value}</div>
                <div style={heroStatLabelStyle}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <div style={sectionStyle}>
        <div style={sectionInnerStyle}>
          <div style={sectionBadgeStyle}>OUR MISSION</div>
          <h2 style={sectionTitleStyle}>Why We Built Genetic Breeds</h2>
          <p style={sectionDescStyle}>
            We built Genetic Breeds because we saw a broken system — unverified sellers,
            unhealthy pets, and buyers with no way to trust who they were dealing with.
            We wanted to change that.
          </p>
          <div style={missionGridStyle}>
            {[
              {
                icon: "🛡️",
                title: "Trust & Safety First",
                desc: "Every seller goes through our licence verification process. We promote only responsible, ethical breeders and pet sellers.",
              },
              {
                icon: "🌍",
                title: "Global Reach, Local Roots",
                desc: "From Tamil Nadu to the UK, our platform connects pet lovers across borders while respecting local animal welfare laws.",
              },
              {
                icon: "🐕",
                title: "Animal Welfare at Heart",
                desc: "We strictly prohibit banned breeds and illegal wildlife trade. Every listing on our platform must comply with animal protection laws.",
              },
              {
                icon: "💬",
                title: "Direct Connections",
                desc: "No middlemen. Buyers and sellers connect directly through our secure chat system — transparent, fast, and safe.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={missionCardStyle}>
                <div style={missionIconStyle}>{icon}</div>
                <h3 style={missionCardTitleStyle}>{title}</h3>
                <p style={missionCardDescStyle}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What We Offer ── */}
      <div style={{ ...sectionStyle, background: "#fff7f7" }}>
        <div style={sectionInnerStyle}>
          <div style={sectionBadgeStyle}>PLATFORM FEATURES</div>
          <h2 style={sectionTitleStyle}>What Genetic Breeds Offers</h2>
          <div style={featuresGridStyle}>
            {[
              { icon: "✅", title: "Verified Seller Badges", desc: "Sellers with valid breeder or pet shop licences get trust badges — so buyers know exactly who they're dealing with." },
              { icon: "📸", title: "Photo Listings", desc: "High-quality pet photos, detailed breed information, age, price, and location — everything a buyer needs in one place." },
              { icon: "🔔", title: "Real-Time Notifications", desc: "Get instant alerts for new messages, listing updates, licence approvals, and platform announcements." },
              { icon: "💳", title: "Flexible Membership Plans", desc: "From free listings to premium memberships — we have plans for casual sellers and professional breeders alike." },
              { icon: "🚀", title: "Boost Your Listings", desc: "Get higher visibility for your pet listings with our boost feature — reach more buyers faster." },
              { icon: "🔒", title: "Secure & Private", desc: "Your data is protected. We use industry-standard encryption and never sell your personal information." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={featureCardStyle}>
                <div style={featureIconStyle}>{icon}</div>
                <h3 style={featureCardTitleStyle}>{title}</h3>
                <p style={featureCardDescStyle}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Values ── */}
      <div style={sectionStyle}>
        <div style={sectionInnerStyle}>
          <div style={sectionBadgeStyle}>OUR VALUES</div>
          <h2 style={sectionTitleStyle}>What We Stand For</h2>
          <div style={valuesRowStyle}>
            {[
              { icon: "⚖️", title: "Legal Compliance", desc: "We enforce strict compliance with animal welfare laws across all countries. Banned breeds and illegal wildlife are never permitted on our platform." },
              { icon: "❤️", title: "Animal Welfare", desc: "Every animal deserves a safe, loving home. We actively work to prevent cruelty and irresponsible breeding on our platform." },
              { icon: "🤝", title: "Community Trust", desc: "Our review system, verified badges, and transparent seller profiles help build a community where trust is the foundation of every transaction." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={valueCardStyle}>
                <div style={valueIconStyle}>{icon}</div>
                <h3 style={valueCardTitleStyle}>{title}</h3>
                <p style={valueCardDescStyle}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legal Notice ── */}
      <div style={legalBannerStyle}>
        <div style={sectionInnerStyle}>
          <div style={legalBannerInnerStyle}>
            <div style={legalBannerIconStyle}>🚫</div>
            <div>
              <div style={legalBannerTitleStyle}>Our Commitment to Legal & Ethical Trading</div>
              <div style={legalBannerDescStyle}>
                Genetic Breeds strictly prohibits the listing, sale, or promotion of any
                animal breed or species that is banned, restricted, or protected under
                applicable laws in any country or region. We comply with the Prevention
                of Cruelty to Animals Act, Wildlife Protection Act, Dog Breeding &amp;
                Marketing Rules, and CITES regulations. Any violation results in
                immediate account suspension and reporting to relevant authorities.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact CTA ── */}
      <div style={{ ...sectionStyle, background: "#fff7f7" }}>
        <div style={{ ...sectionInnerStyle, textAlign: "center" }}>
          <div style={sectionBadgeStyle}>GET IN TOUCH</div>
          <h2 style={sectionTitleStyle}>Have Questions?</h2>
          <p style={sectionDescStyle}>
            We'd love to hear from you. Whether you're a buyer, seller, or just curious —
            our team is here to help.
          </p>
          <div style={ctaRowStyle}>
            <a href="mailto:geneticbreeds@gmail.com" style={ctaEmailStyle}>
              📧 geneticbreeds@gmail.com
            </a>
            <button onClick={() => navigate("/contact")} style={ctaBtnStyle}>
              Contact Us
            </button>
            <button onClick={() => navigate("/browse")} style={ctaSecondaryBtnStyle}>
              Browse Pets
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div style={footerNoteStyle}>
        <p style={footerNoteTextStyle}>
          © 2026 Genetic Breeds Pet Marketplace. All rights reserved. &nbsp;|&nbsp;
          <span
            onClick={() => navigate("/terms")}
            style={footerLinkStyle}
          >
            Terms & Conditions
          </span>
          &nbsp;|&nbsp;
          <span
            onClick={() => navigate("/privacy")}
            style={footerLinkStyle}
          >
            Privacy Policy
          </span>
          &nbsp;|&nbsp;
          <span
            onClick={() => navigate("/disclaimer")}
            style={footerLinkStyle}
          >
            Disclaimer
          </span>
        </p>
      </div>

    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pageStyle = {
  minHeight: "100vh",
  background: "#fff",
  fontFamily: "sans-serif",
};

const heroStyle = {
  background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 55%, #dc2626 100%)",
  padding: "70px 24px 60px",
  textAlign: "center",
};

const heroContentStyle = {
  maxWidth: "900px",
  margin: "0 auto",
};

const heroBadgeStyle = {
  display: "inline-block",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: "999px",
  padding: "6px 16px",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1px",
  color: "#fff",
  marginBottom: "18px",
};

const heroTitleStyle = {
  margin: 0,
  fontSize: "clamp(28px, 5vw, 52px)",
  fontWeight: "900",
  color: "#fff",
  lineHeight: 1.1,
};

const heroSubStyle = {
  margin: "18px auto 0",
  fontSize: "17px",
  color: "rgba(255,255,255,0.88)",
  lineHeight: 1.7,
  maxWidth: "680px",
};

const heroStatsRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
  marginTop: "36px",
  flexWrap: "wrap",
};

const heroStatCardStyle = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "16px",
  padding: "16px 24px",
  minWidth: "120px",
  backdropFilter: "blur(8px)",
};

const heroStatValueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#fff",
};

const heroStatLabelStyle = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.75)",
  fontWeight: "700",
  marginTop: "4px",
};

const sectionStyle = {
  padding: "64px 24px",
  background: "#fff",
};

const sectionInnerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const sectionBadgeStyle = {
  display: "inline-block",
  background: "#fff1f2",
  color: "#991b1b",
  border: "1px solid #fecdd3",
  borderRadius: "999px",
  padding: "5px 14px",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "0.5px",
  marginBottom: "14px",
};

const sectionTitleStyle = {
  margin: "0 0 16px",
  fontSize: "clamp(24px, 4vw, 36px)",
  fontWeight: "900",
  color: "#111827",
};

const sectionDescStyle = {
  fontSize: "16px",
  color: "#4b5563",
  lineHeight: 1.8,
  maxWidth: "700px",
  marginBottom: "40px",
};

const missionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: "20px",
  marginTop: "16px",
};

const missionCardStyle = {
  background: "#fff",
  border: "1px solid #fee2e2",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
};

const missionIconStyle = {
  fontSize: "32px",
  marginBottom: "14px",
};

const missionCardTitleStyle = {
  margin: "0 0 10px",
  fontSize: "17px",
  fontWeight: "900",
  color: "#111827",
};

const missionCardDescStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: 1.7,
};

const featuresGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "16px",
};

const featureCardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
};

const featureIconStyle = {
  fontSize: "28px",
  marginBottom: "12px",
};

const featureCardTitleStyle = {
  margin: "0 0 8px",
  fontSize: "16px",
  fontWeight: "900",
  color: "#111827",
};

const featureCardDescStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: 1.7,
};

const valuesRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px",
  marginTop: "16px",
};

const valueCardStyle = {
  background: "linear-gradient(135deg, #fff1f2 0%, #fff 100%)",
  border: "1px solid #fecdd3",
  borderRadius: "18px",
  padding: "28px",
};

const valueIconStyle = {
  fontSize: "32px",
  marginBottom: "14px",
};

const valueCardTitleStyle = {
  margin: "0 0 10px",
  fontSize: "18px",
  fontWeight: "900",
  color: "#991b1b",
};

const valueCardDescStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: 1.8,
};

const legalBannerStyle = {
  background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
  padding: "48px 24px",
};

const legalBannerInnerStyle = {
  display: "flex",
  gap: "20px",
  alignItems: "flex-start",
};

const legalBannerIconStyle = {
  fontSize: "40px",
  flexShrink: 0,
};

const legalBannerTitleStyle = {
  fontSize: "20px",
  fontWeight: "900",
  color: "#fff",
  marginBottom: "10px",
};

const legalBannerDescStyle = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.85)",
  lineHeight: 1.8,
};

const ctaRowStyle = {
  display: "flex",
  gap: "14px",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: "8px",
};

const ctaEmailStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 22px",
  borderRadius: "14px",
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  color: "#991b1b",
  fontWeight: "800",
  fontSize: "14px",
  textDecoration: "none",
};

const ctaBtnStyle = {
  padding: "13px 28px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  border: "none",
  fontWeight: "900",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(185,28,28,0.25)",
};

const ctaSecondaryBtnStyle = {
  ...ctaBtnStyle,
  background: "#fff",
  color: "#991b1b",
  border: "1px solid #fecdd3",
  boxShadow: "none",
};

const footerNoteStyle = {
  background: "#111827",
  padding: "20px 24px",
  textAlign: "center",
};

const footerNoteTextStyle = {
  margin: 0,
  fontSize: "13px",
  color: "#9ca3af",
};

const footerLinkStyle = {
  color: "#fca5a5",
  cursor: "pointer",
  fontWeight: "700",
};
