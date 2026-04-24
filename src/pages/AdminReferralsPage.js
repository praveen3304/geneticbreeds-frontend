import React, { useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";
const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

export default function AdminReferralsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("gb_token");

  const fetchReferrals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/referrals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading referrals...</div>;
  if (!data) return <div style={{ padding: 20 }}>Failed to load referrals</div>;

  return (
    <div style={{ padding: 20 }}>
      <AdminNav />
      <h1>Referrals</h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <Card label="Total Referrals" value={data.summary?.totalReferrals} />
        <Card label="Referral Signups" value={data.summary?.referralSignups} />
        <Card label="Rewards Granted" value={data.summary?.rewardsGranted} />
      </div>

      {/* Top Referrers */}
      <div style={{ marginTop: "30px", marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "12px" }}>Top Referrers</h2>

        {!data.topReferrers?.length ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            No top referrers found
          </div>
        ) : (
          data.topReferrers.map((r, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "10px",
                background: "#fff",
              }}
            >
              <strong>{r.name || "User"}</strong>
              <div>User Code: {r.userCode || "-"}</div>
              <div>Phone: {r.phone || "-"}</div>
              <div>Total Referrals: {r.totalReferrals || 0}</div>
            </div>
          ))
        )}
      </div>

      {/* Referral History */}
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ marginBottom: "12px" }}>Referral History</h2>

        {!data.items?.length ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            No referral history found
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {data.items.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div>
                  <strong>Referrer:</strong> {item.referrer?.name || "-"}
                </div>
                <div>
                  <strong>Referrer Code:</strong> {item.referrer?.userCode || "-"}
                </div>
                <div>
                  <strong>Referrer Phone:</strong> {item.referrer?.phone || "-"}
                </div>

                <div style={{ marginTop: "8px" }}>
                  <strong>Referee:</strong> {item.referee?.name || "-"}
                </div>
                <div>
                  <strong>Referee Code:</strong> {item.referee?.userCode || "-"}
                </div>
                <div>
                  <strong>Referee Phone:</strong> {item.referee?.phone || "-"}
                </div>

                <div style={{ marginTop: "8px" }}>
                  <strong>Referral Code Used:</strong> {item.referralCodeUsed || "-"}
                </div>
                <div>
                  <strong>Credit Granted:</strong> {item.creditGranted ? "Yes" : "No"}
                </div>
                <div>
                  <strong>First Login At:</strong>{" "}
                  {item.firstLoginAt
                    ? new Date(item.firstLoginAt).toLocaleString()
                    : "-"}
                </div>
                <div>
                  <strong>Credit Granted At:</strong>{" "}
                  {item.creditGrantedAt
                    ? new Date(item.creditGrantedAt).toLocaleString()
                    : "-"}
                </div>
                <div>
                  <strong>Credit Expires At:</strong>{" "}
                  {item.creditExpiresAt
                    ? new Date(item.creditExpiresAt).toLocaleString()
                    : "-"}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #ddd",
      }}
    >
      <p style={{ margin: 0, color: "#777" }}>{label}</p>
      <h2 style={{ margin: "10px 0 0 0" }}>{value || 0}</h2>
    </div>
  );
}
