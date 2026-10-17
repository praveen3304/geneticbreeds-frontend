import React, { useCallback, useEffect, useState } from "react";
import AdminNav from "../components/AdminNav";

const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

const boxStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
};

const rowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  fontSize: "14px",
  marginBottom: "6px",
};

const labelStyle = { color: "#6b7280", minWidth: "90px" };

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
  if (item.paymentFor === "membership") {
    return `Membership: ${item.planName || "plan"}`;
  }
  if (item.paymentFor === "boost") return "Ad boost";
  return item.paymentFor || "Payment";
};

function PaymentCard({ item, adInfo, busy, onApprove, onReject }) {
  const canAct = item.status === "verification_pending";

  return (
    <div style={boxStyle}>
      <div style={{ fontWeight: "800", fontSize: "16px", marginBottom: "8px" }}>
        {item.currency} {item.amount} - {describePayment(item)}
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>UTR</span>
        <strong>{item.utr || "not submitted"}</strong>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>User</span>
        <span>
          {item.user?.name || "Unknown"} ({item.user?.email || "no email"})
        </span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Reference</span>
        <span>{item.reference}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Status</span>
        <span>
          {item.status} / {item.verificationStatus}
        </span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Created</span>
        <span>{formatDate(item.createdAt)}</span>
      </div>
      {adInfo ? (
        <div style={rowStyle}>
          <span style={labelStyle}>Ad</span>
          <span>
            {adInfo.title || "Untitled"} ({adInfo.status || "no status"})
          </span>
        </div>
      ) : null}

      {canAct ? (
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(item)}
            style={buttonStyle("#15803d", busy)}
          >
            {busy ? "Working..." : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(item)}
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

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/payments/admin/upi/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const approve = async (item) => {
    const ok = window.confirm(
      `Approve ${item.currency} ${item.amount} from ${item.user?.name || "this user"}?\n\n` +
        `Only approve if you can see UTR ${item.utr} for this exact amount in your bank account.`
    );
    if (!ok) return;
    setBusyId(item.paymentId);
    await callAction("approve", { paymentId: item.paymentId }, `Approved UTR ${item.utr}`);
  };

  const reject = async (item) => {
    const reason = window.prompt(
      "Reason for rejecting (the user is not shown this):",
      "No matching credit in bank"
    );
    if (reason === null) return;
    setBusyId(item.paymentId);
    await callAction(
      "reject",
      { paymentId: item.paymentId, reason },
      `Rejected UTR ${item.utr}`
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <AdminNav />
      <h1>UPI Payments</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        Approve a payment only after you can see the same UTR and the same amount in your bank
        account.
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
          style={buttonStyle("#7a0016", searching)}
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
            onApprove={approve}
            onReject={reject}
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
            adInfo={null}
            busy={busyId === item.paymentId}
            onApprove={approve}
            onReject={reject}
          />
        ))
      )}
    </div>
  );
}
