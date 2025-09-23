cd /Users/ramadass/Downloads/GeneticBreeds_FullProject_READY/frontend/src/pages
nano LoginPage.js/// src/pages/LoginPage.js
import React from "react";
import bgImage from "../assets/bg.png"; // background image

function LoginPage() {
  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center"
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Login</h2>
        <form>
          <input
            type="text"
            placeholder="Email"
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

