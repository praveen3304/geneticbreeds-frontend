import React, { useEffect, useMemo, useState } from "react";
import AdminNav from "../components/AdminNav";
const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

export default function AdminLicencesPage() {
  const token = localStorage.getItem("gb_token");

  const [licenceUsers, setLicenceUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [licenceFilter, setLicenceFilter] = useState("Pending");
  const [licenceSearch, setLicenceSearch] = useState("");
  const [selectedLicenceUser, setSelectedLicenceUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLicenceUsers = async (status = licenceFilter) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/licences?status=${encodeURIComponent(status)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setLicenceUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchLicenceUsers error:", err);
      setLicenceUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenceUsers("Pending");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLicenceUsers(licenceFilter);
    setSelectedLicenceUser(null);
    setRejectReason("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenceFilter]);

  const filteredLicenceUsers = useMemo(() => {
    const q = licenceSearch.trim().toLowerCase();

    if (!q) return licenceUsers;

    return licenceUsers.filter((user) => {
      return (
        (user.name || "").toLowerCase().includes(q) ||
        (user.email || "").toLowerCase().includes(q) ||
        (user.phone || "").toLowerCase().includes(q) ||
        (user.userCode || "").toLowerCase().includes(q) ||
        (user.licenceNumber || "").toLowerCase().includes(q)
      );
    });
  }, [licenceUsers, licenceSearch]);

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/licences/${userId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to approve licence");
        return;
      }

      alert("Licence approved successfully");
      setSelectedLicenceUser(null);
      setRejectReason("");
      await fetchLicenceUsers(licenceFilter);
    } catch (err) {
      console.error("handleApprove error:", err);
      alert("Failed to approve licence");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    try {
      if (!rejectReason.trim()) {
        alert("Reject reason is required");
        return;
      }

      setActionLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/licences/${userId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to reject licence");
        return;
      }

      alert("Licence rejected successfully");
      setSelectedLicenceUser(null);
      setRejectReason("");
      await fetchLicenceUsers(licenceFilter);
    } catch (err) {
      console.error("handleReject error:", err);
      alert("Failed to reject licence");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = licenceUsers.filter((u) => u.licenceStatus === "Pending").length;
  const approvedCount = licenceUsers.filter((u) => u.licenceStatus === "Approved").length;
  const rejectedCount = licenceUsers.filter((u) => u.licenceStatus === "Rejected").length;
  const noneCount = licenceUsers.filter((u) => u.licenceStatus === "None").length;

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading licences...</p>;
  }

  return (
    <div style={pageStyle}>
      <AdminNav />

      <div style={heroStyle}>
        <div>
          <div style={heroBadgeStyle}>ADMIN LICENCE CONTROL</div>
          <h1 style={heroTitleStyle}>Licence Verification Console</h1>
          <p style={heroTextStyle}>
            Review licence submissions, inspect uploaded documents, approve valid licences,
            or reject with proper admin reason.
          </p>
        </div>
      </div>

      <div style={statsGridStyle}>
        <StatCard label="Pending" value={pendingCount} />
        <StatCard label="Approved" value={approvedCount} />
        <StatCard label="Rejected" value={rejectedCount} />
        <StatCard label="None" value={noneCount} />
        <StatCard label="Visible Records" value={licenceUsers.length} />
      </div>

      <div style={layoutGridStyle}>
        <div style={leftColumnStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionBadgeStyle}>LICENCE QUEUE</div>
                <h2 style={panelTitleStyle}>Review Queue</h2>
                <p style={panelSubTextStyle}>
                  Filter by status and search by user code, email, phone, or licence number.
                </p>
              </div>
            </div>

            <div style={toolbarStyle}>
              <div style={filterTabsStyle}>
                {["Pending", "Approved", "Rejected", "None"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setLicenceFilter(status)}
                    style={licenceFilter === status ? activeTabStyle : tabStyle}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search by name, email, phone, user code, licence number"
                value={licenceSearch}
                onChange={(e) => setLicenceSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>

            {filteredLicenceUsers.length === 0 ? (
              <div style={emptyBoxStyle}>No licence users found for this filter.</div>
            ) : (
              <div style={licenceListStyle}>
                {filteredLicenceUsers.map((user) => (
                  <div
                    key={user._id}
                    style={
                      selectedLicenceUser?._id === user._id
                        ? selectedLicenceCardStyle
                        : licenceCardStyle
                    }
                  >
                    <div style={licenceCardTopStyle}>
                      <div>
                        <div style={userNameStyle}>{user.name}</div>
                        <div style={userMetaStyle}>
                          {user.userCode || "-"} • {user.phone || "-"}
                        </div>
                        <div style={userMetaStyle}>{user.email || "-"}</div>
                      </div>

                      <div style={getStatusPillStyle(user.licenceStatus)}>
                        {user.licenceStatus || "None"}
                      </div>
                    </div>

                    <div style={infoGridStyle}>
                      <InfoItem label="Licence Type" value={user.licenceType || "-"} />
                      <InfoItem label="Licence Number" value={user.licenceNumber || "-"} />
                      <InfoItem label="Authority" value={user.licenceAuthority || "-"} />
                      <InfoItem
                        label="Submitted At"
                        value={
                          user.licenceSubmittedAt
                            ? new Date(user.licenceSubmittedAt).toLocaleString("en-IN")
                            : "-"
                        }
                      />
                    </div>

                    <div style={actionRowStyle}>
                      {user.licenceDocument ? (
                        <a
                          href={user.licenceDocument}
                          target="_blank"
                          rel="noreferrer"
                          style={viewDocBtnStyle}
                        >
                          View Document
                        </a>
                      ) : (
                        <span style={missingDocStyle}>No document</span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedLicenceUser(user);
                          setRejectReason("");
                        }}
                        style={reviewBtnStyle}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={rightColumnStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionBadgeStyle}>SELECTED LICENCE</div>
                <h2 style={panelTitleStyle}>Approval Action Center</h2>
                <p style={panelSubTextStyle}>
                  Open the uploaded document, inspect the details, and take final action.
                </p>
              </div>
            </div>

            {!selectedLicenceUser ? (
              <div style={emptyBoxStyle}>
                Select a licence record from the left side to review it here.
              </div>
            ) : (
              <div style={reviewCardStyle}>
                <div style={reviewTopStyle}>
                  <div>
                    <div style={reviewNameStyle}>{selectedLicenceUser.name}</div>
                    <div style={reviewSubStyle}>
                      {selectedLicenceUser.userCode || "-"} • {selectedLicenceUser.email || "-"}
                    </div>
                    <div style={reviewSubStyle}>{selectedLicenceUser.phone || "-"}</div>
                  </div>

                  <div style={getStatusPillStyle(selectedLicenceUser.licenceStatus)}>
                    {selectedLicenceUser.licenceStatus || "None"}
                  </div>
                </div>

                <div style={infoGridStyle}>
                  <InfoItem
                    label="Licence Type"
                    value={selectedLicenceUser.licenceType || "-"}
                  />
                  <InfoItem
                    label="Licence Number"
                    value={selectedLicenceUser.licenceNumber || "-"}
                  />
                  <InfoItem
                    label="Licence Authority"
                    value={selectedLicenceUser.licenceAuthority || "-"}
                  />
                  <InfoItem
                    label="Submitted At"
                    value={
                      selectedLicenceUser.licenceSubmittedAt
                        ? new Date(selectedLicenceUser.licenceSubmittedAt).toLocaleString("en-IN")
                        : "-"
                    }
                  />
                </div>

                {selectedLicenceUser.licenceDocument ? (
                  <a
                    href={selectedLicenceUser.licenceDocument}
                    target="_blank"
                    rel="noreferrer"
                    style={primaryDocBtnStyle}
                  >
                    Open Uploaded Licence Document
                  </a>
                ) : (
                  <div style={emptyBoxStyle}>No uploaded document available.</div>
                )}

                <textarea
                  placeholder="Enter reject reason (required only when rejecting)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={textareaStyle}
                />

                <div style={reviewActionRowStyle}>
                  <button
                    onClick={() => handleApprove(selectedLicenceUser._id)}
                    style={approveBtnStyle}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Approve Licence"}
                  </button>

                  <button
                    onClick={() => handleReject(selectedLicenceUser._id)}
                    style={rejectBtnStyle}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Reject Licence"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value || 0}</div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={infoItemStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value}</div>
    </div>
  );
}

function getStatusPillStyle(status) {
  if (status === "Approved") return approvedPillStyle;
  if (status === "Pending") return pendingPillStyle;
  if (status === "Rejected") return rejectedPillStyle;
  return neutralPillStyle;
}

const pageStyle = {
  minHeight: "100vh",
  background: "#fff7f7",
  padding: "20px",
};

const heroStyle = {
  background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 55%, #ef4444 100%)",
  color: "#fff",
  borderRadius: "24px",
  padding: "24px",
  marginBottom: "18px",
  boxShadow: "0 14px 34px rgba(127, 29, 29, 0.18)",
};

const heroBadgeStyle = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.14)",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "0.6px",
  marginBottom: "10px",
};

const heroTitleStyle = {
  margin: 0,
  fontSize: "30px",
  fontWeight: "900",
};

const heroTextStyle = {
  margin: "8px 0 0",
  fontSize: "14px",
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.9)",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const statCardStyle = {
  background: "#fff",
  borderRadius: "18px",
  border: "1px solid #fee2e2",
  padding: "16px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

const statLabelStyle = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "800",
  marginBottom: "8px",
};

const statValueStyle = {
  color: "#991b1b",
  fontSize: "28px",
  fontWeight: "900",
};

const layoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "18px",
  alignItems: "start",
};

const leftColumnStyle = {
  display: "grid",
  gap: "18px",
};

const rightColumnStyle = {
  display: "grid",
  gap: "18px",
};

const panelStyle = {
  background: "#fff",
  borderRadius: "22px",
  border: "1px solid #fee2e2",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
  padding: "18px",
};

const panelHeaderStyle = {
  marginBottom: "14px",
};

const sectionBadgeStyle = {
  display: "inline-block",
  background: "#fff1f2",
  color: "#991b1b",
  border: "1px solid #fecdd3",
  borderRadius: "999px",
  padding: "5px 10px",
  fontSize: "10px",
  fontWeight: "900",
  letterSpacing: "0.4px",
  marginBottom: "8px",
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "900",
  color: "#111827",
};

const panelSubTextStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: 1.6,
};

const toolbarStyle = {
  display: "grid",
  gap: "12px",
  marginBottom: "14px",
};

const filterTabsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const tabStyle = {
  padding: "9px 12px",
  borderRadius: "999px",
  border: "1px solid #fecaca",
  background: "#fff5f5",
  color: "#7f1d1d",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer",
};

const activeTabStyle = {
  ...tabStyle,
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  border: "1px solid transparent",
};

const searchInputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: "14px",
  border: "1px solid #fecaca",
  background: "#fff",
  fontSize: "13px",
  boxSizing: "border-box",
};

const emptyBoxStyle = {
  padding: "14px",
  borderRadius: "14px",
  background: "#fff5f5",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
  fontWeight: "700",
  fontSize: "13px",
};

const licenceListStyle = {
  display: "grid",
  gap: "12px",
};

const licenceCardStyle = {
  border: "1px solid #fee2e2",
  borderRadius: "18px",
  padding: "14px",
  background: "#fff",
};

const selectedLicenceCardStyle = {
  ...licenceCardStyle,
  boxShadow: "0 10px 24px rgba(127, 29, 29, 0.12)",
  border: "1px solid #fca5a5",
};

const licenceCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "12px",
};

const userNameStyle = {
  fontSize: "16px",
  fontWeight: "900",
  color: "#111827",
};

const userMetaStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "3px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const infoItemStyle = {
  background: "#fffafa",
  border: "1px solid #fee2e2",
  borderRadius: "14px",
  padding: "10px",
};

const infoLabelStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#6b7280",
  marginBottom: "4px",
};

const infoValueStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#111827",
  wordBreak: "break-word",
};

const actionRowStyle = {
  marginTop: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const viewDocBtnStyle = {
  display: "inline-block",
  padding: "9px 12px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "#fff",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontSize: "12px",
  fontWeight: "800",
};

const reviewBtnStyle = {
  padding: "9px 12px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer",
};

const missingDocStyle = {
  fontSize: "12px",
  color: "#b91c1c",
  fontWeight: "700",
};

const reviewCardStyle = {
  border: "1px solid #fee2e2",
  background: "#fffafa",
  borderRadius: "18px",
  padding: "16px",
};

const reviewTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "14px",
};

const reviewNameStyle = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#111827",
};

const reviewSubStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "4px",
};

const primaryDocBtnStyle = {
  display: "inline-block",
  marginTop: "12px",
  padding: "10px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "#fff",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontSize: "12px",
  fontWeight: "800",
};

const textareaStyle = {
  width: "100%",
  minHeight: "96px",
  padding: "12px",
  marginTop: "12px",
  borderRadius: "14px",
  border: "1px solid #fecaca",
  boxSizing: "border-box",
  fontSize: "13px",
  resize: "vertical",
};

const reviewActionRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const approveBtnStyle = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "none",
  background: "#166534",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer",
};

const rejectBtnStyle = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "none",
  background: "#b91c1c",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "800",
  cursor: "pointer",
};

const approvedPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "800",
  color: "#166534",
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
};

const pendingPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "800",
  color: "#92400e",
  background: "#fef3c7",
  border: "1px solid #fde68a",
};

const rejectedPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "800",
  color: "#991b1b",
  background: "#fee2e2",
  border: "1px solid #fecaca",
};

const neutralPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "800",
  color: "#7f1d1d",
  background: "#fff1f2",
  border: "1px solid #fecdd3",
};
