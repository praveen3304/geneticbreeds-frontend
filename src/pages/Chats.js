import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://genetic-breeds-backend.onrender.com/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setChats(data.chats || []);
      } else {
        console.error(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "100px 20px" }}>
        <h2>Loading chats...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        padding: "94px 20px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "34px",
                color: "#1f2559",
              }}
            >
              Chats
            </h1>
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              View all your conversations with sellers in one place.
            </p>
          </div>

          <Link
            to="/browse"
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7a0016, #b3122a)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: "0 8px 18px rgba(122,0,22,0.18)",
            }}
          >
            Browse Pets
          </Link>
        </div>

        {chats.length === 0 && (
          <div
            style={{
              background: "#fff",
              padding: "42px 24px",
              borderRadius: "18px",
              textAlign: "center",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              border: "1px solid #ececec",
            }}
          >
            <div style={{ fontSize: "46px", marginBottom: "12px" }}>💬</div>
            <h3 style={{ margin: "0 0 8px", color: "#111827" }}>
              No chats yet
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
              Start a conversation from any pet details page and it will appear here.
            </p>
          </div>
        )}

        {chats.map((chat) => {
          const ad = chat.adId || {};
          const seller = chat.sellerId || {};
          const buyer = chat.buyerId || {};

          const currentUserId = localStorage.getItem("userId");

          const isBuyer = String(buyer._id) === String(currentUserId);
          const otherUser = isBuyer ? seller : buyer;

          const unread =
            isBuyer ? chat.buyerUnreadCount : chat.sellerUnreadCount;

          return (
            <div
              key={chat._id}
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "14px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                border: "1px solid #ececec",
              }}
            >
              <img
                src={
                  ad.images && ad.images.length > 0
                    ? ad.images[0]
                    : "https://placehold.co/600x400"
                }
                alt={ad.title}
                style={{
                  width: "78px",
                  height: "78px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  flexShrink: 0,
                  background: "#f3f4f6",
                }}
              />

              <Link
                to={`/chat/${chat._id}`}
                style={{
                  flex: 1,
                  textDecoration: "none",
                  color: "#111827",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "4px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      lineHeight: "1.2",
                    }}
                  >
                    {ad.title || "Pet Ad"}
                  </h3>
                </div>

                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Chat with: {otherUser?.name || "User"}
                </p>

                <p
                  style={{
                    margin: 0,
                    color: unread > 0 ? "#111827" : "#6b7280",
                    fontSize: "13px",
                    fontWeight: unread > 0 ? "700" : "500",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {chat.lastMessage || "Start conversation"}
                </p>
              </Link>

              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                {unread > 0 && (
                  <div
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "3px 9px",
                      fontSize: "12px",
                      fontWeight: "700",
                      minWidth: "24px",
                      textAlign: "center",
                    }}
                  >
                    {unread}
                  </div>
                )}

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  {chat.lastMessageAt
                    ? new Date(chat.lastMessageAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
