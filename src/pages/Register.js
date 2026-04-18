import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully");
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="authWrap">
      <div className="authCard">
        <h2>Register</h2>

        <div className="field">
          <label>Name</label>
          <input name="name" onChange={handleChange} />
        </div>

        <div className="field">
          <label>Email</label>
          <input name="email" onChange={handleChange} />
        </div>

        <div className="field">
          <label>Password</label>
          <input type="password" name="password" onChange={handleChange} />
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" onChange={handleChange} />
        </div>

        <button className="btn btn--primary w100" onClick={handleSubmit}>
          Register
        </button>
      </div>
    </div>
  );
}
