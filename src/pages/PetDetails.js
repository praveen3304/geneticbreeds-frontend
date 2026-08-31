import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import apiFetch from "../utils/api";
import socket from "../socket";

const QUICK_MESSAGES = [
  "Hi, is this pet still available?",
  "Is the price negotiable?",
  "Can I get your contact number?",
];

export default function PetDetails() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const isMobile = window.innerWidth < 768;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatLoading, setChatLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sellerOnline, setSellerOnline] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("banned_or_wildlife_species");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const messagesEndRef = useRef(null);

  const handleReportSubmit = async () => {
    try {
      setReportSubmitting(true);
      const res = await apiFetch("/api/listing-reports", {
        method: "POST",
        body: JSON.stringify({
          petId: pet._id || pet.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportDetails("");
        }, 1500);
      }
    } catch (err) {
      console.error("Report submit failed:", err);
    } finally {
      setReportSubmitting(false);
    }
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("gb_user") || "null");
    } catch {
      return null;
    }
  };
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id || "";
  const petOwnerId =
    typeof pet?.userId === "object" ? pet?.userId?._id : pet?.userId;
  const isOwner = Boolean(
    currentUserId && petOwnerId && String(currentUserId) === String(petOwnerId)
  );

  const formatChatMessage = (msg) => {
    const senderId = msg?.senderId?._id || msg?.senderId || "";
    const isMe = String(senderId) === String(currentUserId);
    return {
      id: msg._id,
      sender: isMe ? "me" : "seller",
      text: msg.text || "",
      time: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
    };
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/ads/${id}`);
        const data = await res.json();

        if (res.ok) {
          setPet(data.ad);
          if (data.ad?.images?.length > 0) {
            setSelectedImage(data.ad.images[0]);
          }
        } else {
          setPet(null);
        }
      } catch (err) {
        console.error(err);
        setPet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  useEffect(() => {
    if (pet) initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet]);

  useEffect(() => {
    if (!chatId) return;
    const handleNewMessage = (data) => {
      if (String(data.chatId) === String(chatId)) {
        setMessages((prev) => [...prev, formatChatMessage(data.message)]);
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const initChat = async () => {
    if (!pet) return;
    try {
      setChatLoading(true);
      const startRes = await apiFetch("/api/chat/start", { method: "POST", body: JSON.stringify({ adId: pet._id || pet.id }) });
      const startData = await startRes.json();
      const cid = startData.chat?._id;
      if (!cid) { setChatLoading(false); return; }
      setChatId(cid);
      const msgRes = await apiFetch(`/api/chat/${cid}/messages`);
      const msgData = await msgRes.json();
      const loadedMessages = Array.isArray(msgData.messages) ? msgData.messages : [];
      setMessages(loadedMessages.map(formatChatMessage));
      await apiFetch(`/api/chat/${cid}/read`, { method: "POST" });
      socket.emit("joinChat", cid);
    } catch (err) {
      console.error("initChat failed:", err);
    } finally {
      setChatLoading(false);
    }
  };
  const handleSend = async () => {
    if (!message.trim() || !chatId || sending) return;
    try {
      setSending(true);
      const res = await apiFetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Failed to send message");
        return;
      }
      const newMsg = formatChatMessage(data.message);
      setMessages((prev) => [...prev, newMsg]);
      socket.emit("sendMessage", { chatId, message: data.message });
      setMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleOpenChat = async () => {
    try {
      const token = localStorage.getItem("gb_token");
      const res = await fetch("https://genetic-breeds-backend.onrender.com/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adId: pet._id || pet.id }),
      });
      const data = await res.json();
      if (data.chat?._id) navigate(`/chat/${data.chat._id}`);
      else navigate("/chats");
    } catch {
      navigate("/chats");
    }
  };

  const handleQuickMessage = (text) => {
    setMessage(text);
  };

  if (loading) {
    return <div style={{ padding: "100px 20px" }}>Loading...</div>;
  }

  if (!pet) {
    return (
      <div style={{ padding: "100px 20px" }}>
        <h1>Pet not found</h1>
      </div>
    );
  }

  const images =
    pet.images && pet.images.length > 0
      ? pet.images
      : ["https://placehold.co/600x400"];

  const sellerUserCode =
    pet?.userId?.userCode ||
    pet?.userId?.userCodeNumber ||
    (typeof pet.userId === "string" ? pet.userId : "");

  const sellerName =
    typeof pet.userId === "object" && pet.userId?.name
      ? pet.userId.name
      : pet.ownerName || "Seller";

  return (
    <div
      style={{
        height: "calc(100vh - 74px)",
        background: "#f7f7f9",
        padding: "88px 14px 14px",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "92px",
          right: "24px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #b3122a, #7a0016)",
            color: "#fff",
            fontWeight: "900",
            fontSize: "22px",
            lineHeight: 1,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          ←
        </button>
      </div>

      <div
        style={{
          maxWidth: "1320px",
          height: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
          gap: isMobile ? "12px" : "16px",
          alignItems: "stretch",
          padding: isMobile ? "0 8px 16px" : "0",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: isMobile ? "10px" : "16px",
            display: "grid",
            gridTemplateRows: isMobile ? "220px auto" : "235px auto",
            gap: "12px",
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "82px 1fr",
              gap: "10px",
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflowY: "auto",
                paddingRight: "2px",
              }}
            >
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    border:
                      selectedImage === img
                        ? "2px solid #eb5d5d"
                        : "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "0",
                    background: "#fff",
                    cursor: "pointer",
                    width: "68px",
                    height: "68px",
                    overflow: "hidden",
                    flexShrink: 0,
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

            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "14px",
                background: "#f3f4f6",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
              }}
            >
              <img
                src={selectedImage || images[0]}
                alt={pet.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>

          <div
            style={{
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "inline-block",
                width: "fit-content",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "#f2e7ff",
                color: "#7b3fc7",
                fontWeight: "600",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              {pet.category}
            </div>

            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "22px",
                lineHeight: "1.15",
                color: "#1f2559",
              }}
            >
              {pet.title}
            </h1>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#eb5d5d",
                marginBottom: "10px",
              }}
            >
              ₹{Number(pet.price || 0).toLocaleString("en-IN")}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
                gap: "8px 16px",
                fontSize: "14px",
                color: "#333",
                marginBottom: "12px",
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Breed:</strong> {pet.breed}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Age:</strong> {pet.age}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Gender:</strong> {pet.gender}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Location:</strong> {[pet.city, pet.state, pet.country].filter(Boolean).join(", ") || pet.location || "N/A"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Owner:</strong>{" "}
                <Link to={`/seller/${pet.userId?._id || pet.userId}`}>
                  {sellerName}
                </Link>
              </p>
              <p style={{ margin: 0 }}>
                <strong>Seller User ID:</strong> {sellerUserCode}
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  marginTop: "10px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #b3122a",
                  background: "#fff",
                  color: "#b3122a",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Report this listing
              </button>
            </div>
          </div>
        </div>

        {showReportModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "20px",
                width: "90%",
                maxWidth: "420px",
              }}
            >
              {reportSuccess ? (
                <p style={{ margin: 0, fontWeight: "600", color: "#16a34a" }}>
                  Report submitted. Thank you for helping keep the platform safe.
                </p>
              ) : (
                <>
                  <h3 style={{ marginTop: 0 }}>Report this listing</h3>
                  <label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "4px",
                      marginBottom: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <option value="banned_or_wildlife_species">Banned / wildlife species</option>
                    <option value="unlicensed_seller">Unlicensed seller</option>
                    <option value="animal_cruelty_concern">Animal cruelty concern</option>
                    <option value="fake_or_misleading_listing">Fake or misleading listing</option>
                    <option value="other">Other</option>
                  </select>
                  <label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "4px",
                      marginBottom: "14px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setShowReportModal(false)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReportSubmit}
                      disabled={reportSubmitting}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#b3122a",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {reportSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* RIGHT SIDE - desktop only */}
        {!isMobile && (
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #eee",
                background: "linear-gradient(135deg, #b3122a, #7a0016)",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: "700" }}>
                {sellerName}
              </div>
              <div style={{ fontSize: "13px", marginTop: "5px" }}>
                Seller ID: {sellerUserCode || "Not available"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  marginTop: "6px",
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
                    background: sellerOnline ? "#22c55e" : "#9ca3af",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: sellerOnline ? "#bbf7d0" : "#e5e7eb", fontWeight: "600" }}>
                  {sellerOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {!chatLoading && (
              <div
                style={{
                  padding: "8px 10px",
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
                      padding: "6px 10px",
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
                padding: "10px 14px",
                overflowY: "auto",
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {chatLoading && (
                <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", marginTop: "20px" }}>
                  Loading conversation...
                </div>
              )}
              {!chatLoading && messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", marginTop: "20px" }}>
                  Start the conversation with {sellerName}
                </div>
              )}
              {messages.map((msg) => (
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
                  <div style={{ fontSize: "12px", marginTop: "6px", textAlign: "right", opacity: 0.88 }}>
                    {msg.time}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
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
                disabled={!chatId || sending}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder={sending ? "Sending..." : "Type your message..."}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!chatId || sending}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#eb5d5d",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Mobile Chat Button */}
        {isMobile && !isOwner && (
          <div style={{ padding: "16px", position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #eee", zIndex: 100 }}>
            <button
              onClick={handleOpenChat}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #b3122a, #7a0016)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(179,18,42,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              💬 Chat with Seller
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
