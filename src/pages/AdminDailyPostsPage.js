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

const matchesStatusTab = (pet, tab) => {
  if (tab === "all") return true;
  const payStatus = pet.paymentDetails && pet.paymentDetails.status;
  const waiting = payStatus === "verification_pending";
  if (tab === "pending") return pet.status === "Pending" || waiting;
  if (tab === "approved") return pet.status === "Live" && !waiting;
  return true;
};

const receivedAt = (payment) => {
  const t = payment.utrSubmittedAt || payment.updatedAt || payment.createdAt;
  return t ? new Date(t).toLocaleString() : "N/A";
};

const csvCell = (value) => {
  const s = value === undefined || value === null ? "" : String(value);
  return '"' + s.replace(/"/g, '""') + '"';
};

// Keeps long numbers (transaction ID, phone) as text in Excel.
const csvText = (value) => {
  const s = value === undefined || value === null ? "" : String(value);
  return s ? '="' + s.replace(/"/g, '""') + '"' : '""';
};

const downloadCsv = (groups) => {
  const header = [
    "Post Date",
    "Ad Code",
    "Title",
    "Breed",
    "Category",
    "Price",
    "Ad Status",
    "Owner",
    "Phone",
    "Email",
    "Payment For",
    "Payment Status",
    "Amount",
    "Transaction ID",
    "Request Received",
    "Paid At",
  ];
  const lines = [header.map(csvCell).join(",")];

  groups.forEach((group) => {
    (group.pets || []).forEach((pet) => {
      const p = pet.paymentDetails || {};
      const u = pet.userId || {};
      const amount = p.totalAmount || p.amount || p.baseAmount;
      lines.push(
        [
          csvCell(group.date),
          csvCell(pet.adCode),
          csvCell(pet.title),
          csvCell(pet.breed),
          csvCell(pet.category),
          csvCell(pet.price),
          csvCell(pet.status),
          csvCell(pet.ownerName || u.name),
          csvText(pet.phone),
          csvCell(u.email),
          csvCell(p.paymentFor),
          csvCell(p.status || p.verificationStatus),
          csvCell(amount ? (p.currency || "INR") + " " + amount : ""),
          csvText(p.txn),
          csvCell(p._id ? receivedAt(p) : ""),
          csvCell(p.paidAt ? new Date(p.paidAt).toLocaleString() : ""),
        ].join(",")
      );
    });
  });

  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "daily-posts-" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Ready-made reasons. The text chosen here is what the customer reads.
const REJECT_REASONS = [
  "We could not find your payment in our bank account.",
  "The amount you paid does not match the amount required.",
  "The transaction ID you entered is not valid.",
  "Your ad could not be approved because it does not meet our listing rules.",
  "Other (see the details below).",
];

const isWaiting = (payment) =>
  payment.status === "verification_pending" && !!payment.txn;

export default function AdminDailyPostsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [rejectDetails, setRejectDetails] = useState("");

  const token = localStorage.getItem("gb_token");
  const isMobile = window.innerWidth < 768;

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

  const callUpi = async (action, body) => {
    const res = await fetch(API_BASE_URL + "/api/payments/admin/upi/" + action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const handleUpiApprove = async (pet) => {
    const payment = pet.paymentDetails || {};
    const ok = window.confirm(
      "Approve this payment?\n\nTransaction ID: " +
        payment.txn +
        "\n\nOnly approve after you have seen this credit in the bank account."
    );
    if (!ok) return;

    try {
      setActionLoading((prev) => ({ ...prev, [pet._id + "approve"]: true }));
      await callUpi("approve", { paymentId: payment._id });
      fetchDailyPosts();
    } catch (err) {
      window.alert(err.message || "Approval failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [pet._id + "approve"]: false }));
    }
  };

  const openReject = (pet) => {
    setRejectReason(REJECT_REASONS[0]);
    setRejectDetails("");
    setRejectDialog(pet);
  };

  const confirmReject = async () => {
    const pet = rejectDialog;
    if (!pet) return;
    const payment = pet.paymentDetails || {};
    const reason =
      rejectReason + (rejectDetails.trim() ? " " + rejectDetails.trim() : "");

    try {
      setActionLoading((prev) => ({ ...prev, [pet._id + "reject"]: true }));
      await callUpi("reject", { paymentId: payment._id, reason });
      setRejectDialog(null);
      fetchDailyPosts();
    } catch (err) {
      window.alert(err.message || "Rejection failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [pet._id + "reject"]: false }));
    }
  };

  const filteredGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    

    return groups
      .map((group) => ({
        ...group,
        pets: (group.pets || []).filter((pet) => {
          if (!matchesStatusTab(pet, statusTab)) return false;
          if (!keyword) return true;
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
            pet.paymentDetails?.txn,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return joined.includes(keyword);
        }),
      }))
      .filter((group) => group.pets.length > 0);
  }, [groups, search, statusTab]);

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

      {rejectDialog && (
        <div
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
            style={{
              ...cardStyle,
              padding: "20px",
              width: "100%",
              maxWidth: "460px",
            }}
          >
            <h3 style={{ margin: "0 0 6px", color: "#111827" }}>Reject payment</h3>
            <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: "13px" }}>
              {rejectDialog.title} - UTR {rejectDialog.paymentDetails?.txn}
            </p>

            <div style={labelStyle}>Reason shown to the user</div>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                fontSize: "14px",
                marginBottom: "10px",
                background: "#fff",
              }}
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div style={labelStyle}>More details (optional, the user sees this too)</div>
            <textarea
              value={rejectDetails}
              onChange={(e) => setRejectDetails(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                fontSize: "14px",
                marginBottom: "14px",
              }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setRejectDialog(null)}
                style={{ ...actionBtnStyle, background: "#e5e7eb", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!!actionLoading[rejectDialog._id + "reject"]}
                style={{ ...actionBtnStyle, background: "#b91c1c", color: "#fff" }}
              >
                {actionLoading[rejectDialog._id + "reject"] ? "Rejecting..." : "Reject payment"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Search title, ad code, user, transaction ID..."
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

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {[
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["all", "All"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusTab(key)}
              style={{
                ...actionBtnStyle,
                background: statusTab === key ? "#1d4ed8" : "#e5e7eb",
                color: statusTab === key ? "#fff" : "#374151",
              }}
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => downloadCsv(filteredGroups)}
            style={{
              ...actionBtnStyle,
              background: "#dcfce7",
              color: "#166534",
              marginLeft: "auto",
            }}
          >
            Download Excel (CSV)
          </button>
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
                        gridTemplateColumns: isMobile ? "1fr" : "120px 1fr auto",
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
                            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
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
                            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
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
                            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
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
                              gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
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
                              <div style={labelStyle}>Transaction ID (UTR)</div>
                              <div style={valueStyle}>{payment.txn || "N/A"}</div>
                            </div>

                            <div>
                              <div style={labelStyle}>Status</div>
                              <div style={valueStyle}>
                                {payment.status || payment.verificationStatus || "N/A"}
                              </div>
                            </div>

                            <div>
                              <div style={labelStyle}>Platform Fee</div>
                              <div style={valueStyle}>
                                {payment.totalAmount || payment.amount || payment.baseAmount
                                  ? `${payment.currency || "INR"} ${payment.totalAmount || payment.amount || payment.baseAmount}`
                                  : "N/A"}
                              </div>
                            </div>

                            <div>
                              <div style={labelStyle}>Request Received</div>
                              <div style={valueStyle}>{receivedAt(payment)}</div>
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
                        {isWaiting(payment) && (
                          <button
                            onClick={() => handleUpiApprove(pet)}
                            disabled={!!actionLoading[pet._id + "approve"]}
                            style={{
                              ...actionBtnStyle,
                              background: "#dcfce7",
                              color: "#166534",
                            }}
                          >
                            {actionLoading[pet._id + "approve"] ? "Approving..." : "Approve"}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            isWaiting(payment)
                              ? openReject(pet)
                              : handleAction(pet._id, "reject")
                          }
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
