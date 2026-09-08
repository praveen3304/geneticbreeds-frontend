import React, { useState } from "react";
import cityPetLicensing from "../data/cityPetLicensing";

export default function PetLicensing() {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    const match = cityPetLicensing.find((c) => c.city.toLowerCase() === q);
    setResult(match || null);
    setSearched(true);
    setTab("result");
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px 60px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1f2559", marginBottom: "8px" }}>
        Pet Licensing Info
      </h1>
      <p style={{ color: "#555", marginBottom: "24px" }}>
        Find your city's municipal corporation for pet registration and licensing. For pet
        shops and breeders, registration is handled by your State Animal Welfare Board instead.
      </p>

      <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: "20px" }}>
        <button
          onClick={() => setTab("search")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            color: tab === "search" ? "#b3122a" : "#888",
            borderBottom: tab === "search" ? "3px solid #b3122a" : "3px solid transparent",
          }}
        >
          Search
        </button>
        <button
          onClick={() => setTab("result")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            color: tab === "result" ? "#b3122a" : "#888",
            borderBottom: tab === "result" ? "3px solid #b3122a" : "3px solid transparent",
          }}
        >
          Result
        </button>
      </div>

      {tab === "search" && (
        <div>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
            Enter your city
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="e.g. Chennai"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #b3122a, #7a0016)",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {tab === "result" && (
        <div>
          {!searched && (
            <p style={{ color: "#888" }}>Search for your city first in the Search tab.</p>
          )}
          {searched && result && (
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "#f7f7fb",
                border: "1px solid #eee",
              }}
            >
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>
                {result.state}
              </div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#1f2559", marginBottom: "10px" }}>
                {result.authority}
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #b3122a, #7a0016)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                Visit Official Website
              </a>
            </div>
          )}
          {searched && !result && (
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "#fff7ed",
                border: "1px solid #fde68a",
              }}
            >
              <p style={{ margin: 0, color: "#92400e" }}>
                We don't have a direct link for this city yet. Pet shops and breeders can
                register through their State Animal Welfare Board. We're adding more cities
                over time.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
