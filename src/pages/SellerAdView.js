import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiFetch from "../utils/api";

export default function SellerAdView({ adId }) {
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = JSON.parse(localStorage.getItem("gb_user") || "null")?._id;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.add("chat-page");
    return () => document.body.classList.remove("chat-page");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [adRes, chatRes] = await Promise.all([
          fetch(`https://genetic-breeds-backend.onrender.com/api/ads/${adId}`),
          apiFetch("/api/chat"),
        ]);
        const adData = await adRes.json();
        const chatData = await chatRes.json();
        setAd(adData.ad || adData);
        const allChats = Array.isArray(chatData.chats) ? chatData.chats : [];
        const filtered = allChats.filter((c) => {
          const cAdId = c.adId?._id || c.adId;
          return String(cAdId) === String(adId);
        });
        setChats(filtered);
      } catch (err) {
        console.error("SellerAdView load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adId]);

  if (loading) {
    return (
      <div style={{ height: "calc(100dvh - 74px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f9" }}>
        <div style={{ padding: "16px 28px", borderRadius: "14px", background: "linear-gradient(135deg, #b3122a, #7a0016)", color: "#fff", fontWeight: "700" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!ad) {
    return <div style={{ padding: "100px 20px", textAlign: "center" }}>Pet not found.</div>;
  }

  return (
    <div style={{ height: isMobile ? "auto" : "calc(100dvh - 74px)", background: "#f7f7f9", padding: "14px", boxSizing: "border-box", overflow: isMobile ? "visible" : "hidden" }}>
      <div
        style={{
          maxWidth: "1380px",
          height: isMobile ? "auto" : "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "18px",
          alignItems: "stretch",
          overflow: isMobile ? "visible" : "hidden",
        }}
      >
        <div style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ background: "linear-gradient(135deg, #b3122a, #7a0016)", color: "#fff", padding: "18px 16px", fontWeight: "800", fontSize: "20px", flexShrink: 0 }}>
            Pet Details
          </div>
          <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
            <div style={{ width: "100%", height: "215px", borderRadius: "16px", background: "#f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <img
                src={Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : "https://placehold.co/600x400"}
                alt={ad.title}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: "#1f2559" }}>{ad.title || ad.breed || "Pet Ad"}</h2>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#b3122a", marginBottom: "10px" }}>
              {ad.price ? `â‚¹${Number(ad.price).toLocaleString("en-IN")}` : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: "13px", color: "#374151" }}>
              <div><strong>Breed:</strong> {ad.breed || "-"}</div>
              <div><strong>Age:</strong> {ad.age || "-"}</div>
              <div><strong>Gender:</strong> {ad.gender || "-"}</div>
              <div><strong>Location:</strong> {ad.location || ad.city || "-"}</div>
              <div><strong>Status:</strong> {ad.status || "-"}</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ background: "linear-gradient(135deg, #7a0016, #b3122a)", color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>Buyers for this listing</div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ padding: "8px 12px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: "900", fontSize: "18px", cursor: "pointer" }}
            >
              â†
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {chats.length === 0 && (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#888", fontSize: "14px" }}>
                No one has messaged you about this listing yet.
              </div>
            )}
            {chats.map((chat) => {
              const isCurrentUserSeller = String(chat.sellerId?._id || chat.sellerId) === String(currentUserId);
              const otherUser = isCurrentUserSeller ? chat.buyerId : chat.sellerId;
              const unread = Number(chat.unreadCount || 0);
              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", textDecoration: "none", color: "#111827", border: "1px solid #f0f0f0", marginBottom: "8px" }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "999px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#7a0016", flexShrink: 0 }}>
                    {(otherUser?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{otherUser?.name || "User"}</div>
                    <div style={{ fontSize: "13px", color: unread > 0 ? "#111827" : "#6b7280", fontWeight: unread > 0 ? "700" : "500" }}>
                      {chat.lastMessage || "No messages yet"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
