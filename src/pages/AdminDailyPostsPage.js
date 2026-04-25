import React, { useEffect, useMemo, useState } from "react";
import AdminNav from "../components/AdminNav";
const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
};

const labelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "4px",
};

const valueStyle = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: 500,
};

const actionBtnStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600,
};

export default function AdminDailyPostsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("gb_token");

  const fetchDailyPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/posts/daily`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id, action) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id + action]: true }));

      await fetch(`${API_BASE_URL}/api/admin/ads/${id}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDailyPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id + action]: false }));
    }
  };

  const handleHide = async (id) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id + "hide"]: true }));

      await fetch(`${API_BASE_URL}/api/admin/ads/${id}/hide`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDailyPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id + "hide"]: false }));
    }
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;

    const keyword = search.toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        pets: (group.pets || []).filter((pet) => {
          const joined = [
            pet.title,
            pet.adCode,
            pet.breed,
            pet.category,
            pet.status,
            pet.city,
            pet.state,
            pet.country,
            pet.ownerName,
            pet.phone,
            pet.publishMethod,
            pet.userId?.name,
            pet.userId?.email,
            pet.userId?.userCode,
            pet.paymentDetails?.paymentId,
            pet.paymentDetails?._id,
            pet.paymentDetails?.gateway,
            pet.paymentDetails?.paymentFor,
            pet.paymentDetails?.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return joined.includes(keyword);
        }),
      }))
      .filter((group) => group.pets.length > 0);
  }, [groups, search]);

  const totalPosts = filteredGroups.reduce(
    (sum, group) => sum + (group.pets?.length || 0),
    0
  );

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <AdminNav />

      <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            ...cardStyle,
            padding: "20px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
              Daily Posts
            </h1>
            <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
              View daily ad submissions with publish and payment details
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#eef2ff",
                color: "#3730a3",
                fontWeight: 700,
              }}
            >
              Total Posts: {totalPosts}
            </div>

            <input
              type="text"
              placeholder="Search title, ad code, user, payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                minWidth: "280px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                outline: "none",
              }}
            />
          </div>
        </div>

        {filteredGroups.length === 0 && (
          <div style={{ ...cardStyle, padding: "20px" }}>
            <p style={{ margin: 0, color: "#6b7280" }}>No posts found</p>
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.date} style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, color: "#111827" }}>{group.date}</h3>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                {group.pets?.length || 0} post(s)
              </span>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {(group.pets || []).map((pet) => {
                const payment = pet.paymentDetails || {};
                const owner = pet.userId || {};
                const featured =
                  pet.isFeatured || pet.featuredUntil ? "Yes" : "No";

                return (
                  <div
                    key={pet._id}
                    style={{
                      ...cardStyle,
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr auto",
                        gap: "16px",
                        alignItems: "start",
                      }}
                    >
                      <img
                        src={pet.images?.[0] || ""}
                        alt="pet"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "14px",
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginBottom: "12px",
                          }}
                        >
                          <div>
                            <h2
                              style={{
                                margin: 0,
                                fontSize: "20px",
                                color: "#111827",
                              }}
                            >
                              {pet.title || "Untitled"}
                            </h2>
                            <div style={{ marginTop: "6px", color: "#6b7280", fontSize: "14px" }}>
                              Ad Code: <strong>{pet.adCode || "N/A"}</strong>
                            </div>
                          </div>

                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: "999px",
                              background:
                                pet.status === "Live"
                                  ? "#dcfce7"
                                  : pet.status === "Pending"
                                  ? "#fef3c7"
                                  : "#f3f4f6",
                              color:
                                pet.status === "Live"
                                  ? "#166534"
                                  : pet.status === "Pending"
                                  ? "#92400e"
                                  : "#374151",
                              fontWeight: 700,
                              fontSize: "13px",
                            }}
                          >
                            {pet.status || "N/A"}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div>
                            <div style={labelStyle}>Breed</div>
                            <div style={valueStyle}>{pet.breed || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>Category</div>
                            <div style={valueStyle}>{pet.category || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>Price</div>
                            <div style={valueStyle}>
                              {pet.price ? `₹${pet.price}` : "N/A"}
                            </div>
                          </div>

                          <div>
                            <div style={labelStyle}>Publish Method</div>
                            <div style={valueStyle}>{pet.publishMethod || "N/A"}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div>
                            <div style={labelStyle}>Owner</div>
                            <div style={valueStyle}>{pet.ownerName || owner.name || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>Phone</div>
                            <div style={valueStyle}>{pet.phone || owner.phone || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>Location</div>
                            <div style={valueStyle}>
                              {[pet.city, pet.state, pet.country].filter(Boolean).join(", ") || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "12px",
                            marginBottom: "12px",
                            padding: "12px",
                            borderRadius: "12px",
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div>
                            <div style={labelStyle}>User Name</div>
                            <div style={valueStyle}>{owner.name || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>User Code</div>
                            <div style={valueStyle}>{owner.userCode || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>Email</div>
                            <div style={valueStyle}>{owner.email || "N/A"}</div>
                          </div>

                          <div>
                            <div style={labelStyle}>Featured</div>
                            <div style={valueStyle}>{featured}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#1d4ed8",
                              marginBottom: "10px",
                            }}
                          >
                            Payment Details
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <div style={labelStyle}>Payment ID</div>
                              <div style={valueStyle}>{payment.paymentId || payment._id || "N/A"}</div>
                            </div>

                            <div>
                              <div style={labelStyle}>Payment For</div>
                              <div style={valueStyle}>{payment.paymentFor || "N/A"}</div>
                            </div>

                            <div>
                              <div style={labelStyle}>Gateway</div>
                              <div style={valueStyle}>{payment.gateway || "N/A"}</div>
                            </div>

                            <div>
                              <div style={labelStyle}>Status</div>
                              <div style={valueStyle}>
                                {payment.status || payment.verificationStatus || "N/A"}
                              </div>
                            </div>

                            <div>
                              <div style={labelStyle}>Amount</div>
                              <div style={valueStyle}>
                                {payment.totalAmount || payment.amount || payment.baseAmount
                                  ? `${payment.currency || "INR"} ${payment.totalAmount || payment.amount || payment.baseAmount}`
                                  : "N/A"}
                              </div>
                            </div>

                            <div>
                              <div style={labelStyle}>Platform Fee</div>
                              <div style={valueStyle}>
                                {payment.platformFee !== undefined && payment.platformFee !== null
                                  ? `${payment.currency || "INR"} ${payment.platformFee}`
                                  : "N/A"}
                              </div>
                            </div>

                            <div>
                              <div style={labelStyle}>Gateway Payment ID</div>
                              <div style={valueStyle}>{payment.gatewayPaymentId || "N/A"}</div>
                            </div>

                            <div>
                              <div style={labelStyle}>Paid At</div>
                              <div style={valueStyle}>
                                {payment.paidAt
                                  ? new Date(payment.paidAt).toLocaleString()
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {pet.isFeatured || pet.featuredUntil ? (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "12px",
                              borderRadius: "12px",
                              background: "#fefce8",
                              border: "1px solid #fde68a",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                color: "#a16207",
                                marginBottom: "8px",
                              }}
                            >
                              Boost Details
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "12px",
                              }}
                            >
                              <div>
                                <div style={labelStyle}>Is Featured</div>
                                <div style={valueStyle}>{pet.isFeatured ? "Yes" : "No"}</div>
                              </div>

                              <div>
                                <div style={labelStyle}>Featured Until</div>
                                <div style={valueStyle}>
                                  {pet.featuredUntil
                                    ? new Date(pet.featuredUntil).toLocaleString()
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          minWidth: "120px",
                        }}
                      >
                        <button
                          onClick={() => handleAction(pet._id, "reject")}
                          disabled={!!actionLoading[pet._id + "reject"]}
                          style={{
                            ...actionBtnStyle,
                            background: "#fee2e2",
                            color: "#b91c1c",
                          }}
                        >
                          {actionLoading[pet._id + "reject"] ? "Rejecting..." : "Reject"}
                        </button>

                        <button
                          onClick={() => handleAction(pet._id, "stop")}
                          disabled={!!actionLoading[pet._id + "stop"]}
                          style={{
                            ...actionBtnStyle,
                            background: "#fef3c7",
                            color: "#92400e",
                          }}
                        >
                          {actionLoading[pet._id + "stop"] ? "Stopping..." : "Stop"}
                        </button>

                        <button
                          onClick={() => handleHide(pet._id)}
                          disabled={!!actionLoading[pet._id + "hide"]}
                          style={{
                            ...actionBtnStyle,
                            background: "#e5e7eb",
                            color: "#374151",
                          }}
                        >
                          {actionLoading[pet._id + "hide"] ? "Hiding..." : "Hide"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
