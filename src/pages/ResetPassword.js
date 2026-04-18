import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [timer, setTimer] = useState(0);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {

    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [timer]);

  const sendOtp = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setSuccess("OTP sent to your email");
      setStep(2);
      setTimer(60);

    } catch (err) {
      setError("Server error");
    }

  };

  const resetPassword = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password reset failed");
        return;
      }

      setSuccess("Password reset successful");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError("Server error");
    }

  };

  return (

    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center"
    }}>

      <div style={{
        width: "400px",
        padding: "30px",
        background: "#fff",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>

        <h2>Reset Password</h2>

        {error && <p style={{color:"red"}}>{error}</p>}
        {success && <p style={{color:"green"}}>{success}</p>}

        {step === 1 && (

          <form onSubmit={sendOtp}>

            <input
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              style={{width:"100%",padding:"10px",marginBottom:"10px"}}
            />

            <button style={{width:"100%",padding:"10px"}}>
              Send OTP
            </button>

          </form>

        )}

        {step === 2 && (

          <form onSubmit={resetPassword}>

            <input
              placeholder="Enter OTP"
              value={form.otp}
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
              required
              style={{width:"100%",padding:"10px",marginBottom:"10px"}}
            />

            {timer > 0 ? (
              <p>Resend OTP in {timer}s</p>
            ) : (
              <button type="button" onClick={sendOtp}>
                Resend OTP
              </button>
            )}

            <input
              type="password"
              placeholder="New Password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              required
              style={{width:"100%",padding:"10px",marginBottom:"10px"}}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
              style={{width:"100%",padding:"10px",marginBottom:"10px"}}
            />

            <button style={{width:"100%",padding:"10px"}}>
              Reset Password
            </button>

          </form>

        )}

      </div>

    </div>

  );

}
