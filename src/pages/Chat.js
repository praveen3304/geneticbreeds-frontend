import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const QUICK_MESSAGES = [
  "Hi, is this pet still available?",
  "Can you share more details about this pet?",
  "Is the price negotiable?",
  "Is the vaccination completed?",
  "What is the exact location?",
  "Can I get your contact number or WhatsApp number?",
];

const USER_STATUS_KEY = "gb_user_status";
const REPORTED_USERS_KEY = "gb_reported_users";

function readUserStatus() {
  try {
    return JSON.parse(localStorage.getItem(USER_STATUS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeUserStatus(data) {
  localStorage.setItem(USER_STATUS_KEY, JSON.stringify(data));
}

function readReportedUsers() {
  try {
    return JSON.parse(localStorage.getItem(REPORTED_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeReportedUsers(data) {
  localStorage.setItem(REPORTED_USERS_KEY, JSON.stringify(data));
}

function formatLastSeen(ts) {
  if (!ts) return "Last seen recently";

  const date = new Date(ts);
  const now = new Date();

  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return `Last seen today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return `Last seen on ${date.toLocaleDateString("en-IN")} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getAdInactiveReason(ad) {
  const status = String(ad?.status || "").trim().toLowerCase();

  if (status === "sold") return "This pet is sold. Chat is now read-only.";
  if (status === "removed") return "This ad was removed. Chat is now read-only.";
  if (status === "expired") return "This ad has expired. Chat is now read-only.";
  if (status === "hidden") return "This ad is hidden. Chat is now read-only.";
  if (status === "rejected") return "This ad was rejected. Chat is now read-only.";

  return "";
}

function getMemberSince(seller, ad) {
  const candidate = seller?.createdAt || ad?.ownerCreatedAt || ad?.createdAt || null;

  if (!candidate) return "Not available";

  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function getSellerAdsCount(seller, ad) {
  const possible =
    seller?.totalAds ||
    seller?.adsCount ||
    ad?.sellerAdsCount ||
    ad?.ownerAdsCount ||
    null;

  if (possible === null || possible === undefined || possible === "") {
    return "Not available";
  }

  return possible;
}

function getResponseTime(seller, ad) {
  return seller?.responseTime || ad?.sellerResponseTime || "~1 hour";
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("gb_user") || "null");
  } catch {
    return null;
  }
}

export default function Chat() {
  const { id } = useParams(); // chatId now

  const [chat, setChat] = useState(null);
  const [ad, setAd] = useState(null);
  const [seller, setSeller] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sellerStatus, setSellerStatus] = useState({
    online: true,
    lastSeen: null,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("gb_token") || "";

  const currentUserId = currentUser?._id || currentUser?.id || "";

  const loadChat = async () => {
    try {
      setLoading(true);

      const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/chat/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Load chat error:", data?.error || data);
        setChat(null);
        setAd(null);
        setMessages([]);
        return;
      }

      const loadedChat = data.chat || null;
      const loadedMessages = Array.isArray(data.messages) ? data.messages : [];

      setChat(loadedChat);
      setAd(loadedChat?.adId || null);
      setSeller(loadedChat?.sellerId || null);
      setBuyer(loadedChat?.buyerId || null);
      setMessages(loadedMessages);

      const imgs =
        Array.isArray(loadedChat?.adId?.images) && loadedChat.adId.images.length > 0
          ? loadedChat.adId.images
          : ["https://placehold.co/600x400?text=No+Image"];

      setSelectedImage(imgs[0]);

      const sellerCode =
        loadedChat?.sellerId?.userCode ||
        loadedChat?.sellerId?.userCodeNumber ||
        (typeof loadedChat?.sellerId === "string" ? loadedChat.sellerId : "");

      if (sellerCode) {
        const statusMap = readUserStatus();

        if (!statusMap[sellerCode]) {
          statusMap[sellerCode] = {
            online: true,
            lastSeen: null,
          };
          writeUserStatus(statusMap);
        }

        setSellerStatus(statusMap[sellerCode]);
      }

      const buyerBlocked = Boolean(loadedChat?.isBlockedByBuyer);
      const sellerBlocked = Boolean(loadedChat?.isBlockedBySeller);

      if (String(loadedChat?.buyerId?._id || loadedChat?.buyerId) === String(currentUserId)) {
        setIsBlocked(buyerBlocked);
      } else {
        setIsBlocked(sellerBlocked);
      }

      await fetch(`https://genetic-breeds-backend.onrender.com/api/chat/${id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Load chat failed:", err);
      setChat(null);
      setAd(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (!token || !id) return;
    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const sellerUserCode =
    seller?.userCode ||
    seller?.userCodeNumber ||
    (typeof seller === "string" ? seller : "");

  const sellerName = seller?.name || ad?.ownerName || "Seller";
  const sellerObjectId = seller?._id || seller?.id || "";

  useEffect(() => {
    if (!sellerUserCode) return;

    const statusMap = readUserStatus();
    statusMap[sellerUserCode] = {
      online: true,
      lastSeen: statusMap[sellerUserCode]?.lastSeen || null,
    };
    writeUserStatus(statusMap);
    setSellerStatus(statusMap[sellerUserCode]);

    const interval = setInterval(() => {
      const latest = readUserStatus();
      if (latest[sellerUserCode]) {
        setSellerStatus(latest[sellerUserCode]);
      }
    }, 3000);

    const handleBeforeUnload = () => {
      const latest = readUserStatus();
      latest[sellerUserCode] = {
        online: false,
        lastSeen: Date.now(),
      };
      writeUserStatus(latest);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      const latest = readUserStatus();
      latest[sellerUserCode] = {
        online: false,
        lastSeen: Date.now(),
      };
      writeUserStatus(latest);
    };
  }, [sellerUserCode]);

  const images = useMemo(() => {
    if (ad?.images?.length) return ad.images;
    return ["https://placehold.co/600x400?text=No+Image"];
  }, [ad]);

  const inactiveReason = useMemo(() => getAdInactiveReason(ad), [ad]);
  const isAdInactive = Boolean(inactiveReason);
  const isChatDisabled = isBlocked || isAdInactive || sending;

  const sellerMiniProfile = useMemo(() => {
    return {
      memberSince: getMemberSince(seller, ad),
      totalAds: getSellerAdsCount(seller, ad),
      responseTime: getResponseTime(seller, ad),
    };
  }, [seller, ad]);

  const formatMessage = (msg) => {
    const senderId = msg?.senderId?._id || msg?.senderId || "";
    const isMe = String(senderId) === String(currentUserId);

    return {
      id: msg._id,
      sender: isMe ? "me" : "seller",
      text: msg.text || "",
      time: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      status: msg.status || "sent",
    };
  };

  const handleSend = async () => {
    if (isChatDisabled) return;
    if (!message.trim()) return;

    try {
      setSending(true);

      const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/chat/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to send message");
        return;
      }

      const newMsg = formatMessage(data.message);
      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
      loadChat();
    } catch (err) {
      console.error("Send message failed:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleQuickMessage = (text) => {
    if (isChatDisabled) return;
    setMessage(text);
  };

  const handleBlockUser = async () => {
    try {
      const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/chat/${id}/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to block user");
        return;
      }

      setIsBlocked(true);
      setShowBlockConfirm(false);
      setIsMenuOpen(false);
      setMessage("");
      loadChat();
    } catch (err) {
      console.error("Block failed:", err);
      alert("Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    try {
      const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/chat/${id}/unblock`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to unblock user");
        return;
      }

      setIsBlocked(false);
      setIsMenuOpen(false);
      loadChat();
    } catch (err) {
      console.error("Unblock failed:", err);
      alert("Failed to unblock user");
    }
  };

  const handleReportSubmit = () => {
    if (!sellerUserCode) return;

    const existingReports = readReportedUsers();
    const nextReports = [
      {
        userId: sellerUserCode,
        sellerName,
        adId: ad?._id || ad?.id || "",
        petTitle: ad?.title || ad?.breed || "Pet Ad",
        reason: reportReason,
        timestamp: Date.now(),
      },
      ...existingReports,
    ];

    writeReportedUsers(nextReports);
    setReportSubmitted(true);

    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportReason("Spam");
    }, 1200);

    setIsMenuOpen(false);
  };

  const renderTicks = (msg) => {
    if (msg.sender !== "me") return null;

    if (msg.status === "sent") {
      return <span style={{ marginLeft: "4px" }}>✓</span>;
    }

    if (msg.status === "delivered") {
      return <span style={{ marginLeft: "4px" }}>✓✓</span>;
    }

    if (msg.status === "read") {
      return (
        <span style={{ marginLeft: "4px", color: "#22c55e", fontWeight: "700" }}>
          ✓✓
        </span>
      );
    }

    return null;
  };

  const renderedMessages = messages.map(formatMessage);

  if (loading) {
    return <div style={{ padding: "100px 20px" }}>Loading chat...</div>;
  }

  if (!chat || !ad) {
    return (
      <div style={{ padding: "100px 20px" }}>
        <h1>Chat not found</h1>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f7fb",
          padding: "94px 16px 22px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1380px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "22px",
              boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
              overflow: "hidden",
              border: "1px solid #ececec",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #7a0016, #b3122a)",
                color: "#fff",
                padding: "16px 18px",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: "700" }}>
                CHAT WITH SELLER
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>
                {sellerName}
              </div>
              <div style={{ fontSize: "13px", marginTop: "6px", opacity: 0.92 }}>
                Seller ID: {sellerUserCode || "Not available"}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: sellerStatus.online ? "#22c55e" : "#9ca3af",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    color: sellerStatus.online ? "#bbf7d0" : "#e5e7eb",
                    fontWeight: "700",
                  }}
                >
                  {sellerStatus.online ? "Online" : formatLastSeen(sellerStatus.lastSeen)}
                </span>
              </div>

              {ad.status === "Sold" && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fde68a",
                  }}
                >
                  ⚠ This pet is sold
                </div>
              )}

              {ad.status === "Removed" && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fecaca",
                  }}
                >
                  ⚠ This ad was removed
                </div>
              )}

              {String(ad.status || "").trim().toLowerCase() === "expired" && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fde68a",
                  }}
                >
                  ⚠ This ad has expired
                </div>
              )}

              {String(ad.status || "").trim().toLowerCase() === "hidden" && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fed7aa",
                  }}
                >
                  ⚠ This ad is hidden
                </div>
              )}

              {String(ad.status || "").trim().toLowerCase() === "rejected" && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fecaca",
                  }}
                >
                  ⚠ This ad was rejected
                </div>
              )}

              {isBlocked && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#e5e7eb",
                  }}
                >
                  ⛔ You blocked this user
                </div>
              )}
            </div>

            <div style={{ padding: "16px" }}>
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  borderRadius: "16px",
                  background: "#f3f4f6",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={selectedImage}
                  alt={ad.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              {images.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      style={{
                        border:
                          selectedImage === img
                            ? "2px solid #b3122a"
                            : "1px solid #ddd",
                        borderRadius: "10px",
                        padding: 0,
                        background: "#fff",
                        cursor: "pointer",
                        width: "62px",
                        height: "62px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Pet ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "inline-block",
                  padding: "5px 10px",
                  borderRadius: "999px",
                  background: "#fdf2f8",
                  color: "#9d174d",
                  fontWeight: "700",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                {ad.category || "Other"}
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "28px",
                  color: "#1f2559",
                  lineHeight: "1.15",
                }}
              >
                {ad.title || ad.breed || "Pet Ad"}
              </h2>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#b3122a",
                  marginBottom: "12px",
                }}
              >
                ₹{Number(ad.price || 0).toLocaleString("en-IN")}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 14px",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Breed:</strong> {ad.breed || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Age:</strong> {ad.age || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Gender:</strong> {ad.gender || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Location:</strong> {ad.city || ad.location || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Owner:</strong> {sellerName}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Seller User ID:</strong> {sellerUserCode || "-"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Status:</strong> {ad.status || "Live"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Posted On:</strong>{" "}
                  {ad.createdAt
                    ? new Date(ad.createdAt).toLocaleDateString("en-IN")
                    : "-"}
                </p>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#fff8f8",
                  border: "1px solid #f4d4d4",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#9f1239",
                    letterSpacing: "0.4px",
                    marginBottom: "10px",
                  }}
                >
                  SELLER MINI PROFILE
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 14px",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>User ID:</strong> {sellerUserCode || "-"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Member since:</strong> {sellerMiniProfile.memberSince}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Total ads:</strong> {sellerMiniProfile.totalAds}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Response time:</strong> {sellerMiniProfile.responseTime}
                  </p>
                  <p style={{ margin: 0, gridColumn: "1 / -1" }}>
                    <strong>Status:</strong>{" "}
                    {sellerStatus.online ? "Online" : formatLastSeen(sellerStatus.lastSeen)}
                  </p>
                </div>

                <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Link
                    to={sellerObjectId ? `/seller/${sellerObjectId}` : "#"}
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e5caca",
                      background: "#fff",
                      color: "#7a0016",
                      fontWeight: "700",
                      fontSize: "13px",
                      textDecoration: "none",
                    }}
                  >
                    View Profile
                  </Link>

                  {!isBlocked ? (
                    <button
                      type="button"
                      onClick={() => setShowBlockConfirm(true)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #fecaca",
                        background: "#fff",
                        color: "#b91c1c",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Block User
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnblockUser}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        color: "#111827",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Unblock User
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <Link
                  to={`/pet/${ad?._id || ad?.id}`}
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #7a0016, #b3122a)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  View Full Ad
                </Link>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "22px",
              boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
              border: "1px solid #ececec",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "760px",
              position: "relative",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #7a0016, #b3122a)",
                color: "#fff",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                position: "relative",
              }}
            >
              <div>
                <div style={{ fontSize: "24px", fontWeight: "800" }}>
                  Chat with Seller
                </div>
                <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.92 }}>
                  Seller ID: {sellerUserCode || "Not available"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: sellerStatus.online ? "#22c55e" : "#9ca3af",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      color: sellerStatus.online ? "#bbf7d0" : "#e5e7eb",
                      fontWeight: "700",
                    }}
                  >
                    {sellerStatus.online ? "Online" : formatLastSeen(sellerStatus.lastSeen)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      border: "none",
                      background: "rgba(255,255,255,0.14)",
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    ⋮
                  </button>

                  {isMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50px",
                        right: 0,
                        width: "220px",
                        background: "#fff",
                        borderRadius: "14px",
                        boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
                        border: "1px solid #eee",
                        overflow: "hidden",
                        zIndex: 20,
                      }}
                    >
                      {!isBlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowBlockConfirm(true);
                            setIsMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "14px 16px",
                            border: "none",
                            background: "#fff",
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#b91c1c",
                            cursor: "pointer",
                          }}
                        >
                          Block User
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleUnblockUser}
                          style={{
                            width: "100%",
                            padding: "14px 16px",
                            border: "none",
                            background: "#fff",
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#111827",
                            cursor: "pointer",
                          }}
                        >
                          Unblock User
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowReportModal(true);
                          setIsMenuOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: "none",
                          borderTop: "1px solid #f3f4f6",
                          background: "#fff",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#7a0016",
                          cursor: "pointer",
                        }}
                      >
                        Report User
                      </button>

                      <Link
                        to={sellerObjectId ? `/seller/${sellerObjectId}` : "#"}
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          borderTop: "1px solid #f3f4f6",
                          background: "#fff",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#374151",
                          cursor: "pointer",
                          textDecoration: "none",
                          display: "block",
                          boxSizing: "border-box",
                        }}
                      >
                        View Seller Profile
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/chats"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.14)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  ← Back
                </Link>
              </div>
            </div>

            {(isBlocked || isAdInactive) && (
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #f1d5d5",
                  background: "#fff1f2",
                  color: "#9f1239",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {isBlocked
                  ? "You blocked this user. Chat is disabled until you unblock them."
                  : inactiveReason}
              </div>
            )}

            {!isBlocked && !isAdInactive && (
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #eee",
                  background: "#fff8f8",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  flexShrink: 0,
                }}
              >
                {QUICK_MESSAGES.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMessage(item)}
                    style={{
                      border: "1px solid #f5b5b5",
                      background: "#fff",
                      color: "#991b1b",
                      borderRadius: "999px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                flex: 1,
                minHeight: 0,
                padding: "14px",
                overflowY: "auto",
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {renderedMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                    maxWidth: "74%",
                    background: msg.sender === "me" ? "#eb5d5d" : "#fff",
                    color: msg.sender === "me" ? "#fff" : "#111827",
                    padding: "11px 13px",
                    borderRadius: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontSize: "14px", lineHeight: "1.45" }}>
                    {msg.text}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "6px",
                      textAlign: "right",
                      opacity: 0.88,
                    }}
                  >
                    {msg.time}
                    {renderTicks(msg)}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #eee",
                padding: "12px",
                display: "flex",
                gap: "8px",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                value={message}
                disabled={isChatDisabled}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder={
                  isBlocked
                    ? "You blocked this user"
                    : isAdInactive
                    ? "This chat is read-only"
                    : sending
                    ? "Sending..."
                    : "Type your message..."
                }
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  fontSize: "14px",
                  background: isChatDisabled ? "#f3f4f6" : "#fff",
                  cursor: isChatDisabled ? "not-allowed" : "text",
                }}
              />

              <button
                onClick={handleSend}
                disabled={isChatDisabled}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "10px",
                  background: isChatDisabled
                    ? "#d1d5db"
                    : "linear-gradient(135deg, #7a0016, #b3122a)",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: isChatDisabled ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBlockConfirm && (
        <div
          onClick={() => setShowBlockConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              borderRadius: "20px",
              padding: "22px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#111827" }}>
              Block User
            </div>
            <p style={{ margin: "10px 0 0", color: "#4b5563", lineHeight: 1.6 }}>
              You are about to block <strong>{sellerName}</strong>. You will not be able
              to send messages in this chat until you unblock this user.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBlockUser}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#b91c1c",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div
          onClick={() => {
            setShowReportModal(false);
            setReportSubmitted(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#fff",
              borderRadius: "20px",
              padding: "22px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#111827" }}>
              Report User
            </div>
            <p style={{ margin: "10px 0 16px", color: "#4b5563", lineHeight: 1.6 }}>
              Select a reason for reporting <strong>{sellerName}</strong>.
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              {["Spam", "Scam", "Abusive", "Fake listing", "Other"].map((reason) => (
                <label
                  key={reason}
                  style={{
                    border: reportReason === reason ? "2px solid #b3122a" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                  />
                  <span style={{ fontWeight: "600", color: "#111827" }}>{reason}</span>
                </label>
              ))}
            </div>

            {reportSubmitted && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "#ecfdf5",
                  color: "#166534",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                Report submitted successfully.
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setReportSubmitted(false);
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReportSubmit}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #7a0016, #b3122a)",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
