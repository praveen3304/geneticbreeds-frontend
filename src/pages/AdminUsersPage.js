import React, { useEffect, useMemo, useState } from "react";
import AdminNav from "../components/AdminNav";

const pageBg = "#f8fafc";
const cardBg = "#ffffff";
const border = "#e5e7eb";
const text = "#111827";
const subText = "#6b7280";
const primary = "#b80d2a";
const primarySoft = "#fde8ec";
const dangerSoft = "#fee2e2";
const warningSoft = "#fef3c7";
const successSoft = "#dcfce7";

export default function AdminUsersPage() {
  const token = localStorage.getItem("gb_token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportSummary, setReportSummary] = useState(null);

  const [searchUserId, setSearchUserId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchedUserLoading, setSearchedUserLoading] = useState(false);
  const [searchedUserError, setSearchedUserError] = useState("");

  const [reportReason, setReportReason] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [blackMark, setBlackMark] = useState(false);
  const [suspendUserFlag, setSuspendUserFlag] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const [listSearch, setListSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportSummary = async () => {
    try {
      const res = await fetch("/api/admin/users/reports/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReportSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchReportSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchUserId.trim()) return;

    try {
      setSearchedUserLoading(true);
      setSearchedUserError("");

      const res = await fetch(`/api/admin/users/${searchUserId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setSearchedUserError("User not found");
        setSearchedUser(null);
        return;
      }

      setSearchedUser(data);
    } catch (err) {
      console.error(err);
      setSearchedUserError("Error searching user");
      setSearchedUser(null);
    } finally {
      setSearchedUserLoading(false);
    }
  };

  const handleReportUser = async () => {
    if (!searchedUser?.user?._id) return;

    try {
      setReportLoading(true);

      await fetch(`/api/admin/users/${searchedUser.user._id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reportReason,
          notes: reportNotes,
          blackMark,
          suspend: suspendUserFlag,
        }),
      });

      alert("User updated");

      setReportReason("");
      setReportNotes("");
      setBlackMark(false);
      setSuspendUserFlag(false);

      handleSearch();
      fetchReportSummary();
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    } finally {
      setReportLoading(false);
    }
  };

  const handleExport = () => {
    if (!searchedUser?.user) return;

    const dataStr = JSON.stringify(searchedUser, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${searchedUser.user.userCode || "user"}_details.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    const keyword = listSearch.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((u) => {
      const joined = [
        u.name,
        u.userCode,
        u.email,
        u.phone,
        u.country,
        u.city,
        u.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return joined.includes(keyword);
    });
  }, [users, listSearch]);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading users...</p>;
  }

  const user = searchedUser?.user;
  const stats = searchedUser?.stats || {};
  const ads = searchedUser?.ads || [];

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <AdminNav />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
        <div style={heroCard}>
          <div>
            <h1 style={{ margin: 0, fontSize: "38px", color: text }}>
              Users Management
            </h1>
            <p style={{ margin: "10px 0 0", color: subText, fontSize: "15px" }}>
              Search users, review account details, monitor ads, and take admin action from one place.
            </p>
          </div>
          <div style={heroBadge}>
            Total Users: {users.length}
          </div>
        </div>

        {reportSummary && (
          <div style={statsGrid}>
            <StatCard label="Total Reports" value={reportSummary.totalReports} tone="default" />
            <StatCard label="Black Marked Users" value={reportSummary.blackMarkedUsers} tone="danger" />
            <StatCard label="Suspended Users" value={reportSummary.suspendedUsers} tone="warning" />
            <StatCard label="Reports This Month" value={reportSummary.reportsThisMonth} tone="default" />
            <StatCard label="Total Users" value={users.length} tone="success" />
          </div>
        )}

        <div style={card}>
          <div style={searchHeader}>
            <div>
              <div style={sectionTitle}>Search User Details</div>
              <div style={sectionSubTitle}>
                Search by User Code or Mongo User ID
              </div>
            </div>
            <div style={searchBarWrap}>
              <input
                type="text"
                placeholder="Enter User Code or User ID"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                style={searchInput}
              />
              <button onClick={handleSearch} style={primaryButton} disabled={searchedUserLoading}>
                {searchedUserLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {searchedUserError ? (
            <div style={errorBox}>{searchedUserError}</div>
          ) : null}
        </div>

        {user && (
          <div style={{ marginTop: "20px" }}>
            <div style={detailGrid}>
              <div style={{ ...card, padding: "24px" }}>
                <div style={userHeader}>
                  <div>
                    <div style={avatarCircle}>
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: text, fontSize: "28px" }}>
                      {user.name || "Unnamed User"}
                    </h2>
                    <div style={userMetaRow}>
                      <Pill text={user.role || "user"} />
                      {user.isSuspended ? <Pill text="Suspended" tone="danger" /> : null}
                      {user.userCode ? <Pill text={user.userCode} tone="soft" /> : null}
                    </div>
                  </div>

                  <button onClick={handleExport} style={secondaryButton}>
                    Export User Data
                  </button>
                </div>

                <div style={infoGrid}>
                  <InfoBox label="User Code" value={user.userCode || "N/A"} />
                  <InfoBox label="Email" value={user.email || "N/A"} />
                  <InfoBox label="Phone" value={user.phone || "N/A"} />
                  <InfoBox label="Country" value={user.country || "N/A"} />
                  <InfoBox label="State" value={user.state || "N/A"} />
                  <InfoBox label="City" value={user.city || "N/A"} />
                  <InfoBox label="Role" value={user.role || "user"} />
                  <InfoBox label="Joined" value={formatDate(user.createdAt)} />
                </div>
              </div>

              <div style={{ ...card, padding: "24px" }}>
                <div style={sectionTitle}>Admin Actions</div>
                <div style={sectionSubTitle}>
                  Black mark or suspend the selected user only when required.
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={fieldLabel}>Reason</label>
                  <input
                    type="text"
                    placeholder="Enter reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={fieldInput}
                  />
                </div>

                <div style={{ marginTop: "14px" }}>
                  <label style={fieldLabel}>Admin Notes</label>
                  <textarea
                    placeholder="Write internal notes"
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    style={textarea}
                    rows={5}
                  />
                </div>

                <div style={checkboxRow}>
                  <label style={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={blackMark}
                      onChange={(e) => setBlackMark(e.target.checked)}
                    />
                    <span>Black Mark</span>
                  </label>

                  <label style={checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={suspendUserFlag}
                      onChange={(e) => setSuspendUserFlag(e.target.checked)}
                    />
                    <span>Suspend User</span>
                  </label>
                </div>

                <button
                  onClick={handleReportUser}
                  disabled={reportLoading}
                  style={{ ...primaryButton, marginTop: "18px", width: "100%" }}
                >
                  {reportLoading ? "Applying..." : "Apply Action"}
                </button>
              </div>
            </div>

            <div style={{ ...card, marginTop: "20px", padding: "24px" }}>
              <div style={sectionTitle}>Ad Statistics</div>
              <div style={statsGrid}>
                <StatCard label="Total Ads" value={stats.totalAds || 0} tone="default" />
                <StatCard label="Live Ads" value={stats.liveAds || 0} tone="success" />
                <StatCard label="Pending Ads" value={stats.pendingAds || 0} tone="warning" />
                <StatCard label="Rejected Ads" value={stats.rejectedAds || 0} tone="danger" />
                <StatCard label="Sold Ads" value={stats.soldAds || 0} tone="default" />
                <StatCard label="Stopped Ads" value={stats.stoppedAds || 0} tone="default" />
              </div>
            </div>

            <div style={{ ...card, marginTop: "20px", padding: "24px" }}>
              <div style={listHeader}>
                <div>
                  <div style={sectionTitle}>User Ads</div>
                  <div style={sectionSubTitle}>
                    Full list of ads posted by this user
                  </div>
                </div>
                <div style={adsCountBadge}>
                  {ads.length} ad(s)
                </div>
              </div>

              {ads.length === 0 ? (
                <div style={emptyState}>No ads found for this user.</div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {ads.map((ad) => (
                    <div key={ad.adId || ad._id} style={adRow}>
                      <div style={{ flex: 1 }}>
                        <div style={adTitle}>{ad.title || "Untitled Ad"}</div>
                        <div style={adMeta}>
                          <span>Breed: {ad.breed || "N/A"}</span>
                          <span>Status: {ad.status || "N/A"}</span>
                          <span>Price: ₹{ad.price || 0}</span>
                          <span>Posted: {formatDate(ad.postedDate)}</span>
                        </div>
                      </div>
                      <div>
                        <Pill text={ad.status || "N/A"} tone={statusTone(ad.status)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ ...card, marginTop: "20px", padding: "24px" }}>
          <div style={listHeader}>
            <div>
              <div style={sectionTitle}>All Users</div>
              <div style={sectionSubTitle}>
                Quick view of all user accounts
              </div>
            </div>

            <input
              type="text"
              placeholder="Filter users..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              style={{ ...searchInput, width: "280px" }}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div style={emptyState}>No users found.</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredUsers.map((u) => (
                <div key={u._id} style={userListRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "18px", color: text }}>
                      {u.name || "Unnamed User"}
                    </div>
                    <div style={adMeta}>
                      <span>User Code: {u.userCode || "N/A"}</span>
                      <span>Email: {u.email || "N/A"}</span>
                      <span>Phone: {u.phone || "N/A"}</span>
                      <span>Role: {u.role || "user"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSearchUserId(u.userCode || u._id);
                      setTimeout(() => {
                        const idToSearch = u.userCode || u._id;
                        if (idToSearch) {
                          fetch(`/api/admin/users/${idToSearch}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                            .then(({ ok, data }) => {
                              if (!ok) {
                                setSearchedUserError("User not found");
                                setSearchedUser(null);
                                return;
                              }
                              setSearchedUser(data);
                              setSearchedUserError("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            })
                            .catch((err) => {
                              console.error(err);
                              setSearchedUserError("Error searching user");
                            });
                        }
                      }, 0);
                    }}
                    style={secondaryButton}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }) {
  const toneMap = {
    default: { bg: "#ffffff", borderColor: border, valueColor: text },
    danger: { bg: dangerSoft, borderColor: "#fecaca", valueColor: "#b91c1c" },
    warning: { bg: warningSoft, borderColor: "#fde68a", valueColor: "#92400e" },
    success: { bg: successSoft, borderColor: "#bbf7d0", valueColor: "#166534" },
  };

  const activeTone = toneMap[tone] || toneMap.default;

  return (
    <div
      style={{
        background: activeTone.bg,
        border: `1px solid ${activeTone.borderColor}`,
        borderRadius: "18px",
        padding: "18px",
      }}
    >
      <div style={{ color: subText, fontSize: "14px", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "34px", fontWeight: 800, color: activeTone.valueColor }}>
        {value || 0}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: `1px solid ${border}`,
        borderRadius: "14px",
        padding: "14px",
      }}
    >
      <div style={{ fontSize: "13px", color: subText, marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "15px", color: text, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function Pill({ text, tone = "default" }) {
  const tones = {
    default: { bg: "#f3f4f6", color: "#374151" },
    danger: { bg: "#fee2e2", color: "#b91c1c" },
    warning: { bg: "#fef3c7", color: "#92400e" },
    success: { bg: "#dcfce7", color: "#166534" },
    soft: { bg: primarySoft, color: primary },
  };

  const active = tones[tone] || tones.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 700,
        background: active.bg,
        color: active.color,
      }}
    >
      {text}
    </span>
  );
}

function statusTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "live") return "success";
  if (normalized === "rejected") return "danger";
  if (normalized === "pending") return "warning";
  return "default";
}

function formatDate(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
}

const heroCard = {
  background: `linear-gradient(135deg, ${primarySoft} 0%, #ffffff 100%)`,
  border: `1px solid ${border}`,
  borderRadius: "24px",
  padding: "28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "20px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  flexWrap: "wrap",
};

const heroBadge = {
  background: primary,
  color: "#fff",
  padding: "14px 18px",
  borderRadius: "16px",
  fontWeight: 700,
  fontSize: "15px",
};

const card = {
  background: cardBg,
  border: `1px solid ${border}`,
  borderRadius: "22px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const searchHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  padding: "24px",
};

const searchBarWrap = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const searchInput = {
  width: "340px",
  maxWidth: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: `1px solid ${border}`,
  outline: "none",
  fontSize: "14px",
  background: "#fff",
};

const primaryButton = {
  background: primary,
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton = {
  background: "#fff",
  color: primary,
  border: `1px solid ${primary}`,
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

const errorBox = {
  margin: "0 24px 24px",
  background: dangerSoft,
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: "14px",
  padding: "14px 16px",
  fontWeight: 600,
};

const detailGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "20px",
};

const userHeader = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  marginBottom: "22px",
  flexWrap: "wrap",
};

const avatarCircle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: primarySoft,
  color: primary,
  fontWeight: 800,
  fontSize: "28px",
};

const userMetaRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
};

const sectionTitle = {
  fontSize: "22px",
  fontWeight: 800,
  color: text,
};

const sectionSubTitle = {
  color: subText,
  fontSize: "14px",
  marginTop: "6px",
};

const fieldLabel = {
  display: "block",
  marginBottom: "7px",
  fontSize: "14px",
  color: text,
  fontWeight: 600,
};

const fieldInput = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "12px",
  border: `1px solid ${border}`,
  outline: "none",
  fontSize: "14px",
};

const textarea = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "12px",
  border: `1px solid ${border}`,
  outline: "none",
  resize: "vertical",
  fontSize: "14px",
};

const checkboxRow = {
  display: "flex",
  gap: "18px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 600,
  color: text,
};

const listHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginBottom: "18px",
  flexWrap: "wrap",
};

const adsCountBadge = {
  background: primarySoft,
  color: primary,
  padding: "10px 14px",
  borderRadius: "14px",
  fontWeight: 700,
};

const adRow = {
  border: `1px solid ${border}`,
  borderRadius: "16px",
  padding: "16px",
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
};

const adTitle = {
  fontSize: "18px",
  fontWeight: 700,
  color: text,
  marginBottom: "8px",
};

const adMeta = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  color: subText,
  fontSize: "14px",
};

const userListRow = {
  border: `1px solid ${border}`,
  borderRadius: "16px",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  background: "#fff",
};

const emptyState = {
  border: `1px dashed ${border}`,
  borderRadius: "16px",
  padding: "24px",
  textAlign: "center",
  color: subText,
  background: "#fafafa",
};
