import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/bg.png";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          borderRadius: "24px",
          padding: "50px 40px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "#fff1f2",
            color: "#b91c1c",
            fontWeight: "800",
            fontSize: "12px",
            marginBottom: "16px",
            border: "1px solid #fecdd3",
            letterSpacing: "0.5px",
          }}
        >
          VERIFIED PET MARKETPLACE
        </div>

        <h1
          style={{
            fontSize: "48px",
            margin: "0 0 12px",
            color: "#111827",
            fontWeight: "900",
            letterSpacing: "1px",
          }}
        >
          Genetic Breeds
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#374151",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          Connect with verified pet sellers across the world — from loyal dogs
          to playful cats.
        </p>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "30px",
            lineHeight: "1.6",
            maxWidth: "650px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Genetic Breeds is a trusted platform where verified breeders and pet
          sellers connect with responsible buyers. Post pets, explore listings,
          chat with sellers, and find your perfect companion safely and
          responsibly.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/post"
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "800",
              boxShadow: "0 10px 25px rgba(220,38,38,0.25)",
            }}
          >
            Post Your Pet
          </Link>

          <Link
            to="/browse"
            style={{
              background: "#111827",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "800",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            Browse Pets
          </Link>

          <Link
            to="/login"
            style={{
              background: "#fff",
              color: "#111827",
              padding: "14px 22px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "800",
              border: "1px solid #e5e7eb",
            }}
          >
            Login
          </Link>

          <Link
            to="/admin"
            style={{
              background: "#f3f4f6",
              color: "#111827",
              padding: "14px 22px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "800",
            }}
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
