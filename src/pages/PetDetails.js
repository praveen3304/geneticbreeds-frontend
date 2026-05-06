import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";

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
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "seller",
      text: "Hello, thanks for your interest.",
      time: "10:20 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Is this pet still available?",
      time: "10:21 AM",
    },
  ]);

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

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleOpenChat = async () => {
    try {
      const token = localStorage.getItem("gb_token");
      const res = await fetch("https://genetic-breeds-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adId: pet._id || pet.id }),
      });
      const data = await res.json();
      if (data._id) navigate(`/chat/${data._id}`);
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
        <Link to="/browse">
          <button
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #b3122a, #7a0016)",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            ← Back
          </button>
        </Link>
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
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - desktop only */}
        {!isMobile && (<div
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
              Chat with Seller
            </div>
            <div style={{ fontSize: "13px", marginTop: "5px" }}>
              Seller ID: {sellerUserCode}
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
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#bbf7d0", fontWeight: "600" }}>
                Online
              </span>
            </div>
          </div>

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
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  background: msg.sender === "me" ? "#eb5d5d" : "#fff",
                  color: msg.sender === "me" ? "#fff" : "#111827",
                  padding: "10px 12px",
                  borderRadius: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                  {msg.text}
                </div>
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "11px",
                    opacity: 0.75,
                    textAlign: "right",
                  }}
                >
                  {msg.time}
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
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type your message..."
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
      </div>

      {/* Mobile Chat Button */}
      {isMobile && (
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
  );
}
