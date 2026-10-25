import React, { useCallback, useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";

const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";
const THEME = "#7a0016";
const RUPEE = "\u20B9";

const boxStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
};

const labelStyle = { fontSize: "11px", color: "#6b7280", marginBottom: "2px" };
const valueStyle = { fontSize: "14px", fontWeight: "600", color: "#111827", wordBreak: "break-word" };

const buttonStyle = (bg, disabled) => ({
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: disabled ? "#9ca3af" : bg,
  color: "#fff",
  fontWeight: "700",
  fontSize: "14px",
  cursor: disabled ? "not-allowed" : "pointer",
});

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-IN");
  } catch {
    return "";
  }
};

const describePayment = (item) => {
  const boostNote =
    item.paymentFor !== "boost" && item.boostDays > 0 ? ` + ${item.boostDays}-day boost` : "";

  if (item.paymentFor === "membership") {
    return `Membership: ${item.planName || "plan"}${boostNote}`;
  }
  if (item.paymentFor === "boost") return "Ad boost";
  if (item.paymentFor === "ad") return `Single ad${boostNote}`;
  return item.paymentFor || "Payment";
};

const joinParts = (...parts) => parts.filter(Boolean).join(", ");

function Detail({ label, value }) {
  return (
    <div style={{ minWidth: "120px", flex: "1 1 120px" }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value || "-"}</div>
    </div>
  );
}

function AdBlock({ ad, paymentFor }) {
  if (!ad) {
    return (
      <div
        style={{
          background: "#f9fafb",
          border: "1px dashed #d1d5db",
          borderRadius: "10px",
          padding: "12px",
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "12px",
        }}
      >
        {paymentFor === "membership"
          ? "No ad is attached to this payment (plan purchase only)."
          : "No ad details found for this payment."}
      </div>
    );
  }

  const photo = ad.images && ad.images.length > 0 ? ad.images[0] : "";

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
        marginBottom: "12px",
        padding: "12px",
        background: "#fffdf7",
        border: "1px solid #fde68a",
        borderRadius: "12px",
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={ad.title || "Ad"}
          style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "12px" }}
        />
      ) : (
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "12px",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          No image
        </div>
      )}

      <div style={{ flex: "1 1 260px", minWidth: "0" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: "800", fontSize: "16px" }}>{ad.title || "Untitled"}</div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "999px",
              background: "#fef3c7",
              color: "#92400e",
            }}
          >
            {ad.status || "no status"}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 10px" }}>
          Ad code: <strong>{ad.adCode || "N/A"}</strong>
        </div>

        <div style={{ display: "flex", gap: "10px 16px", flexWrap: "wrap" }}>
          <Detail label="Breed" value={ad.breed} />
          <Detail label="Category" value={ad.category} />
          <Detail label="Gender" value={ad.gender} />
          <Detail label="Age" value={ad.age} />
          <Detail label="Price" value={ad.price ? `${RUPEE}${Number(ad.price).toLocaleString("en-IN")}` : ""} />
          <Detail label="Owner name" value={ad.ownerName} />
          <Detail label="Phone" value={ad.phone} />
          <Detail label="Location" value={joinParts(ad.location, ad.city, ad.state, ad.pincode, ad.country)} />
          <Detail label="Licence" value={ad.licence} />
          <Detail label="Certificate" value={ad.certificate} />
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ item, adInfo, busy, onApprove, onReject }) {
  const canAct = item.status === "verification_pending";

  return (
    <div style={boxStyle}>
      <AdBlock ad={adInfo} paymentFor={item.paymentFor} />

      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "12px",
          padding: "12px",
        }}
      >
        <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "8px" }}>
          Payment: {item.currency} {item.amount} - {describePayment(item)}
        </div>
        <div style={{ display: "flex", gap: "10px 16px", flexWrap: "wrap" }}>
          <Detail label="UTR" value={item.utr || "not submitted"} />
          <Detail label="Reference" value={item.reference} />
          <Detail label="User" value={`${item.user?.name || "Unknown"} (${item.user?.email || "no email"})`} />
          <Detail label="Status" value={`${item.status} / ${item.verificationStatus}`} />
          <Detail label="Created" value={formatDate(item.createdAt)} />
        </div>
      </div>

      {canAct ? (
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(item, adInfo)}
            style={buttonStyle("#15803d", busy)}
          >
            {busy ? "Working..." : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(item, adInfo)}
            style={buttonStyle("#b91c1c", busy)}
          >
            Reject
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "10px", color: "#6b7280", fontSize: "13px" }}>
          This payment is already {item.status}.
        </div>
      )}
    </div>
  );
}

export default function AdminUpiPaymentsPage() {
  const token = localStorage.getItem("gb_token");

  const [utr, setUtr] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("No matching credit in bank");

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/admin/upi/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to load");
      setPending(data.payments || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to load pending payments" });
    } finally {
      setLoadingPending(false);
    }
  }, [token]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const search = async () => {
    setMessage({ type: "", text: "" });
    setSearchResult(null);
    const cleaned = utr.trim();
    if (!/^\d{12}$/.test(cleaned)) {
      setMessage({ type: "error", text: "Enter the 12-digit transaction ID." });
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/payments/admin/upi/search?utr=${encodeURIComponent(cleaned)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Search failed");
      setSearchResult(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Search failed" });
    } finally {
      setSearching(false);
    }
  };

  const callAction = async (path, body, successText) => {
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/admin/upi/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Action failed");
      setMessage({ type: "success", text: successText });
      setSearchResult(null);
      await loadPending();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Action failed" });
    } finally {
      setBusyId("");
    }
  };

  const openApprove = (item, adInfo) => setDialog({ type: "approve", item, adInfo });

  const openReject = (item, adInfo) => {
    setReason("No matching credit in bank");
    setDialog({ type: "reject", item, adInfo });
  };

  const confirmDialog = async () => {
    if (!dialog) return;
    const { type, item } = dialog;
    setDialog(null);
    setBusyId(item.paymentId);
    if (type === "approve") {
      await callAction("approve", { paymentId: item.paymentId }, `Approved UTR ${item.utr}`);
    } else {
      await callAction(
        "reject",
        { paymentId: item.paymentId, reason },
        `Rejected UTR ${item.utr}`
      );
    }
  };

  const dialogItem = dialog ? dialog.item : null;
  const dialogAd = dialog ? dialog.adInfo : null;

  return (
    <div style={{ padding: 20 }}>
      <AdminNav />
      <h1>UPI Payments</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        Review the ad and the payment together. Approve only if the ad is fine to publish and you can
        see the same UTR and the same amount in your bank account.
      </p>

      <div style={{ ...boxStyle, display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={12}
          value={utr}
          onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
          onKeyDown={(e) => {
            if (e.key === "Enter") search();
          }}
          placeholder="Search by 12-digit UTR"
          style={{
            flex: "1",
            minWidth: "220px",
            padding: "10px",
            borderRadius: "8px",
            border: "1.5px solid #d1d5db",
            fontSize: "15px",
          }}
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          style={buttonStyle(THEME, searching)}
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {message.text ? (
        <div
          style={{
            ...boxStyle,
            color: message.type === "error" ? "#b91c1c" : "#15803d",
            borderColor: message.type === "error" ? "#fecaca" : "#bbf7d0",
          }}
        >
          {message.text}
        </div>
      ) : null}

      {searchResult ? (
        <div>
          <h2>Search result</h2>
          <PaymentCard
            item={searchResult.payment}
            adInfo={searchResult.ad}
            busy={busyId === searchResult.payment.paymentId}
            onApprove={openApprove}
            onReject={openReject}
          />
        </div>
      ) : null}

      <h2>Waiting for verification ({pending.length})</h2>
      {loadingPending ? (
        <div>Loading... (the server may take up to a minute to wake up)</div>
      ) : pending.length === 0 ? (
        <div style={boxStyle}>No payments are waiting for verification.</div>
      ) : (
        pending.map((item) => (
          <PaymentCard
            key={item.paymentId}
            item={item}
            adInfo={item.ad || null}
            busy={busyId === item.paymentId}
            onApprove={openApprove}
            onReject={openReject}
          />
        ))
      )}

      {dialog ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>
              {dialog.type === "approve" ? "Approve this payment?" : "Reject this payment?"}
            </h3>
            <p style={{ margin: "0 0 6px", fontSize: "14px" }}>
              <strong>
                {dialogItem.currency} {dialogItem.amount}
              </strong>{" "}
              from {dialogItem.user?.name || "this user"} - {describePayment(dialogItem)}
            </p>
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#6b7280" }}>
              UTR {dialogItem.utr}
              {dialogAd ? ` - Ad: ${dialogAd.title || "Untitled"} (${dialogAd.adCode || "no code"})` : ""}
            </p>

            {dialog.type === "approve" ? (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#92400e",
                  marginBottom: "14px",
                }}
              >
                Approve only if you can see this UTR for exactly this amount in your bank account
                {dialogAd ? ", and the ad details look fine to publish." : "."}
              </div>
            ) : (
              <div style={{ marginBottom: "14px" }}>
                <div style={labelStyle}>Reason (the user is not shown this)</div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1.5px solid #d1d5db",
                    fontSize: "14px",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDialog(null)}
                style={{
                  ...buttonStyle("#6b7280", false),
                  background: "#fff",
                  color: "#374151",
                  border: "1.5px solid #d1d5db",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog}
                style={buttonStyle(dialog.type === "approve" ? "#15803d" : "#b91c1c", false)}
              >
                {dialog.type === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
