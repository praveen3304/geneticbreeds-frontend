import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

export default function AuthModal({ type, onClose, onSuccess }) {
  const navigate = useNavigate();
  const isRegister = type === "register";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    identifier: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    city: "",
    licenceNumber: "",
    breederLicenceNumber: "",
    referralCode: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const headerMeta = useMemo(() => {
    return isRegister
      ? {
          badge: "Register",
          title: "Create Account",
          subtitle: "Compact seller and buyer signup for Genetic Breeds.",
          buttonText: "Create Account",
          footerText: "Fast access to verified marketplace tools.",
        }
      : {
          badge: "Login",
          title: "Welcome Back",
          subtitle: "Login to continue browsing, posting, and chatting.",
          buttonText: "Login",
          footerText: "Secure access to your dashboard.",
        };
  }, [isRegister]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSubmitting(true);

      if (isRegister) {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            country: form.country,
            state: form.state,
            city: form.city,
            licenceNumber: form.licenceNumber,
            breederLicenceNumber: form.breederLicenceNumber,
            referralCode: form.referralCode,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || data.message || "Registration failed.");
          return;
        }

        setSuccess("Registration successful. Please login.");
        setTimeout(() => {
          onClose();
        }, 1200);

        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone: form.identifier,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Login failed.");
        return;
      }

      localStorage.setItem("gb_token", data.token);
      localStorage.setItem("gb_user", JSON.stringify(data.user));

      if (typeof onSuccess === "function") {
        onSuccess({ token: data.token, user: data.user });
        return;
      }

      onClose();
      navigate("/browse");
      window.location.reload();
    } catch (err) {
      console.error("Auth error:", err);
      setError("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dropdownShellStyle}>
        <div style={dropdownWrapStyle} onClick={(e) => e.stopPropagation()}>
          <div style={pointerStyle} />

          <div style={modalCardStyle}>
            <button type="button" onClick={onClose} style={closeButtonStyle}>
              ×
            </button>

            <div style={headerStyle}>
              <div style={badgeStyle}>{headerMeta.badge}</div>
              <h2 style={titleStyle}>{headerMeta.title}</h2>
              <p style={subtitleStyle}>{headerMeta.subtitle}</p>
            </div>

            {error ? <div style={errorBoxStyle}>{error}</div> : null}
            {success ? <div style={successBoxStyle}>{success}</div> : null}

            <form onSubmit={handleSubmit}>
              {!isRegister ? (
                <div style={compactFormStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Email or Mobile Number</label>
                    <input
                      placeholder="Enter email or mobile number"
                      required
                      value={form.identifier}
                      onChange={(e) => updateField("identifier", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Password</label>
                    <div style={passwordWrapStyle}>
                      <input
                        placeholder="Enter password"
                        required
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        style={passwordInputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={eyeButtonStyle}
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  <div style={forgotWrapStyle}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/reset-password");
                      }}
                      style={forgotButtonStyle}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              ) : (
                <div style={registerGridStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      placeholder="Enter full name"
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Mobile Number *</label>
                    <input
                      placeholder="Enter mobile number"
                      required
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Email *</label>
                    <input
                      placeholder="Enter email"
                      required
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Country *</label>
                    <input
                      placeholder="Enter country"
                      required
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>State *</label>
                    <input
                      placeholder="Enter state"
                      required
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>City *</label>
                    <input
                      placeholder="Enter city"
                      required
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Licence Number</label>
                    <input
                      placeholder="Optional"
                      value={form.licenceNumber}
                      onChange={(e) => updateField("licenceNumber", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Breeder Licence Number</label>
                    <input
                      placeholder="Optional"
                      value={form.breederLicenceNumber}
                      onChange={(e) =>
                        updateField("breederLicenceNumber", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Referral Code</label>
                    <input
                      placeholder="Optional"
                      value={form.referralCode}
                      onChange={(e) => updateField("referralCode", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Password *</label>
                    <div style={passwordWrapStyle}>
                      <input
                        placeholder="Create password"
                        required
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        style={passwordInputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={eyeButtonStyle}
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Confirm Password *</label>
                    <div style={passwordWrapStyle}>
                      <input
                        placeholder="Confirm password"
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) =>
                          updateField("confirmPassword", e.target.value)
                        }
                        style={passwordInputStyle}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        style={eyeButtonStyle}
                      >
                        {showConfirmPassword ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting} style={submitButtonStyle}>
                {submitting ? "Please wait..." : headerMeta.buttonText}
              </button>
            </form>

            <div style={footerTextStyle}>{headerMeta.footerText}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.18)", // light dark overlay
  zIndex: 9999,
};

const dropdownShellStyle = {
  position: "absolute",
  top: "74px",
  right: "20px",
  left: "auto",
  display: "block",
};

const dropdownWrapStyle = {
  position: "relative",
  width: "420px",
  maxWidth: "calc(100vw - 32px)",
};

const pointerStyle = {
  position: "absolute",
  top: "-7px",
  right: "34px",
  width: "14px",
  height: "14px",
  background: "#fff7f7",
  transform: "rotate(45deg)",
  borderTop: "1px solid #fecaca",
  borderLeft: "1px solid #fecaca",
  zIndex: 1,
};

const modalCardStyle = {
  position: "relative",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,247,247,0.98) 100%)",
  border: "1px solid #fecaca",
  borderRadius: "20px",
  boxShadow: "0 22px 50px rgba(15, 23, 42, 0.16)",
  padding: "16px",
  maxHeight: "calc(100vh - 96px)",
  overflowY: "auto",
  zIndex: 2,
};

const headerStyle = {
  marginBottom: "10px",
  paddingRight: "38px",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 11px",
  borderRadius: "999px",
  background: "#fff1f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const titleStyle = {
  margin: 0,
  fontSize: "24px",
  lineHeight: 1.05,
  fontWeight: "900",
  color: "#0f172a",
};

const subtitleStyle = {
  margin: "7px 0 0",
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: 1.45,
};

const closeButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  width: "36px",
  height: "36px",
  borderRadius: "12px",
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#b91c1c",
  fontSize: "24px",
  lineHeight: 1,
  cursor: "pointer",
};

const errorBoxStyle = {
  marginBottom: "10px",
  borderRadius: "12px",
  padding: "9px 11px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: "700",
};

const successBoxStyle = {
  marginBottom: "10px",
  borderRadius: "12px",
  padding: "9px 11px",
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#166534",
  fontSize: "12px",
  fontWeight: "700",
};

const compactFormStyle = {
  display: "grid",
  gap: "10px",
};

const registerGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px 12px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  marginBottom: "5px",
  fontSize: "12px",
  fontWeight: "800",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  padding: "0 13px",
  borderRadius: "15px",
  border: "1px solid #fca5a5",
  background: "#fff",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
};

const passwordWrapStyle = {
  position: "relative",
};

const passwordInputStyle = {
  ...inputStyle,
  paddingRight: "42px",
};

const eyeButtonStyle = {
  position: "absolute",
  top: "50%",
  right: "10px",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "16px",
  lineHeight: 1,
};

const forgotWrapStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "-2px",
};

const forgotButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#7c3aed",
  fontSize: "12px",
  fontWeight: "700",
  cursor: "pointer",
  padding: 0,
};

const submitButtonStyle = {
  width: "100%",
  marginTop: "12px",
  height: "44px",
  borderRadius: "15px",
  border: "none",
  background: "linear-gradient(135deg, #c81e1e 0%, #ef4444 100%)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(220, 38, 38, 0.20)",
};

const footerTextStyle = {
  marginTop: "10px",
  textAlign: "center",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "700",
};
