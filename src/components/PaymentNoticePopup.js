import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://genetic-breeds-backend.onrender.com";
const POLL_MS = 60000;

const ANIMATION_CSS = `
@keyframes gbNoticeFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gbNoticeRise {
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes gbNoticePop {
  0% { transform: scale(0.5); }
  60% { transform: scale(1.14); }
  100% { transform: scale(1); }
}
`;

function NoticeIcon({ approved }) {
  const colors = approved
    ? { from: "#22c55e", to: "#15803d", glow: "rgba(34,197,94,0.35)" }
    : { from: "#ef4444", to: "#b91c1c", glow: "rgba(239,68,68,0.35)" };

  return (
    <div
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        boxShadow: `0 10px 28px ${colors.glow}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        animation: "gbNoticePop 0.5s ease-out both",
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {approved ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export default function PaymentNoticePopup({ token }) {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const seen = useRef(new Set());

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.notifications) ? data.notifications : [];
      const fresh = list.filter(
        (n) =>
          !n.isRead &&
          String(n.type || "").startsWith("payment_") &&
          !seen.current.has(String(n._id))
      );
      if (fresh.length > 0) {
        fresh.forEach((n) => seen.current.add(String(n._id)));
        setQueue((prev) => [...prev, ...fresh]);
      }
    } catch (error) {
      // The popup is a convenience only; ignore network problems quietly
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setQueue([]);
      return undefined;
    }

    load();
    const timer = setInterval(load, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", load);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", load);
    };
  }, [token, load]);

  const current = queue.length > 0 ? queue[0] : null;

  const close = useCallback(() => {
    if (!current) return;
    const id = current._id;
    setQueue((prev) => prev.slice(1));
    fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [current, token]);

  useEffect(() => {
    if (!current) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, close]);

  if (!current) return null;

  const approved = current.type === "payment_approved";
  const accent = approved ? "#15803d" : "#b91c1c";
  const primaryLabel = approved
    ? current.link === "/plans"
      ? "View plans"
      : "View my ads"
    : "Contact us";

  const goPrimary = () => {
    const target = approved ? current.link || "/my-ads" : "/contact";
    close();
    navigate(target);
  };

  let when = "";
  try {
    when = current.createdAt ? new Date(current.createdAt).toLocaleString("en-IN") : "";
  } catch (error) {
    when = "";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.title || "Payment update"}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(17,24,39,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "gbNoticeFade 0.25s ease-out both",
      }}
    >
      <style>{ANIMATION_CSS}</style>
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "22px",
          overflow: "hidden",
          boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          animation: "gbNoticeRise 0.35s ease-out both",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ height: "6px", background: `linear-gradient(90deg, ${accent}, ${approved ? "#4ade80" : "#f87171"})` }} />
        <div style={{ padding: "26px 24px 22px", textAlign: "center" }}>
          <NoticeIcon approved={approved} />
          <h3 style={{ margin: "16px 0 8px", fontSize: "20px", color: "#111827" }}>
            {current.title || (approved ? "Payment approved" : "Payment could not be verified")}
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#374151" }}>{current.message}</p>

          {when ? (
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#9ca3af" }}>{when}</div>
          ) : null}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={close}
              style={{
                flex: "1",
                padding: "12px",
                borderRadius: "12px",
                border: "1.5px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={goPrimary}
              style={{
                flex: "1.4",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: `linear-gradient(135deg, ${accent}, ${approved ? "#166534" : "#7f1d1d"})`,
                color: "#fff",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: `0 8px 20px ${approved ? "rgba(21,128,61,0.3)" : "rgba(185,28,28,0.3)"}`,
              }}
            >
              {primaryLabel}
            </button>
          </div>

          {queue.length > 1 ? (
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#9ca3af" }}>
              1 of {queue.length} updates
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
