import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [method, setMethod] = useState(""); // "email" or "phone"
  const [step, setStep] = useState(1); // 1=choose method, 2=enter contact, 3=enter otp+password
  const [timer, setTimer] = useState(0);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
    setError("");
    setSuccess("");
  };

  const sendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint =
        method === "phone"
          ? `${API_BASE_URL}/api/auth/forgot-password-phone`
          : `${API_BASE_URL}/api/auth/forgot-password`;

      const body =
        method === "phone"
          ? { phone: form.phone }
          : { email: form.email };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setSuccess(data.message || "OTP sent successfully");
      setStep(3);
      setTimer(60);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setTimer(0);
    await sendOtp();
  };

  const resetPassword = async () => {
    setError("");
    setSuccess("");

    if (!form.otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (!form.newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: method,
          email: form.email,
          phone: form.phone,
          otp: form.otp,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password reset failed");
        return;
      }

      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={badgeStyle}>GENETIC BREEDS</div>
        <h2 style={titleStyle}>Reset Password</h2>
        <p style={subtitleStyle}>
          {step === 1 && "Choose how you want to receive your OTP"}
          {step === 2 && (method === "email" ? "Enter your registered email" : "Enter your registered phone number")}
          {step === 3 && "Enter the OTP and your new password"}
        </p>

        {error && <div style={errorStyle}>⚠ {error}</div>}
        {success && <div style={successStyle}>✓ {success}</div>}

        {/* Step 1 - Choose method */}
        {step === 1 && (
          <div style={methodGridStyle}>
            <button
              type="button"
              onClick={() => handleMethodSelect("email")}
              style={methodCardStyle}
            >
              <div style={methodIconStyle}>📧</div>
              <div style={methodTitleStyle}>Email OTP</div>
              <div style={methodDescStyle}>Receive OTP on your registered email address</div>
            </button>

            <button
              type="button"
              onClick={() => handleMethodSelect("phone")}
              style={methodCardStyle}
            >
              <div style={methodIconStyle}>📱</div>
              <div style={methodTitleStyle}>Phone OTP</div>
              <div style={methodDescStyle}>Receive OTP via SMS on your registered mobile number</div>
            </button>
          </div>
        )}

        {/* Step 2 - Enter contact */}
        {step === 2 && (
          <div style={formStyle}>
            {method === "email" ? (
              <input
                type="email"
                placeholder="Enter your registered email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <input
                type="tel"
                placeholder="Enter your registered phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={inputStyle}
              />
            )}

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              style={primaryBtnStyle}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setSuccess(""); }}
              style={secondaryBtnStyle}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3 - Enter OTP and new password */}
        {step === 3 && (
          <div style={formStyle}>
            <div style={otpInfoStyle}>
              OTP sent to your {method === "phone" ? "phone" : "email"}
              {method === "email" ? `: ${form.email}` : `: ${form.phone}`}
            </div>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              style={inputStyle}
              maxLength={6}
            />

            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              style={inputStyle}
            />

            <button
              type="button"
              onClick={resetPassword}
              disabled={loading}
              style={primaryBtnStyle}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {timer > 0 ? (
              <div style={timerStyle}>Resend OTP in {timer}s</div>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                disabled={loading}
                style={secondaryBtnStyle}
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        <div style={loginLinkStyle}>
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={linkBtnStyle}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at top, rgba(254,242,242,0.9), #fff 55%)",
  padding: "20px",
};

const cardStyle = {
  width: "min(480px, 100%)",
  background: "#fff",
  border: "1px solid #fee2e2",
  borderRadius: "24px",
  padding: "32px 28px",
  boxShadow: "0 24px 60px rgba(15,23,42,0.1)",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "5px 12px",
  background: "#fff1f2",
  color: "#991b1b",
  border: "1px solid #fecdd3",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "0.8px",
  marginBottom: "12px",
};

const titleStyle = {
  margin: "0 0 8px",
  fontSize: "26px",
  fontWeight: "900",
  color: "#111827",
};

const subtitleStyle = {
  margin: "0 0 20px",
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: 1.6,
};

const errorStyle = {
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "16px",
};

const successStyle = {
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#166534",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "16px",
};

const methodGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
  marginBottom: "16px",
};

const methodCardStyle = {
  background: "#fff",
  border: "1px solid #fee2e2",
  borderRadius: "16px",
  padding: "20px 14px",
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(15,23,42,0.05)",
};

const methodIconStyle = {
  fontSize: "32px",
  marginBottom: "10px",
};

const methodTitleStyle = {
  fontSize: "15px",
  fontWeight: "900",
  color: "#111827",
  marginBottom: "6px",
};

const methodDescStyle = {
  fontSize: "12px",
  color: "#6b7280",
  lineHeight: 1.5,
};

const formStyle = {
  display: "grid",
  gap: "12px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #fca5a5",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

const primaryBtnStyle = {
  width: "100%",
  padding: "13px",
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(185,28,28,0.25)",
};

const secondaryBtnStyle = {
  width: "100%",
  padding: "12px",
  background: "#fff",
  color: "#991b1b",
  border: "1px solid #fca5a5",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

const otpInfoStyle = {
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#991b1b",
  fontWeight: "700",
};

const timerStyle = {
  textAlign: "center",
  fontSize: "13px",
  color: "#92400e",
  fontWeight: "700",
  padding: "8px",
};

const loginLinkStyle = {
  marginTop: "20px",
  textAlign: "center",
  fontSize: "13px",
  color: "#6b7280",
};

const linkBtnStyle = {
  background: "none",
  border: "none",
  color: "#b91c1c",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "13px",
};
