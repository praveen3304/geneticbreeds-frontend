import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "../components/AdminNav";

const colors = {
  bg: "linear-gradient(180deg, #fff8f8 0%, #ffffff 58%, #fff7f7 100%)",
  primary: "#b11226",
  primaryDark: "#7f0d1c",
  primarySoft: "#fdecef",
  text: "#18212f",
  muted: "#667085",
  border: "#edd6da",
  white: "#ffffff",
  shadow: "0 10px 28px rgba(17, 24, 39, 0.06)",
  shadowSoft: "0 6px 18px rgba(17, 24, 39, 0.05)",
  green: "#047857",
  greenBg: "#ecfdf3",
  amber: "#b45309",
  amberBg: "#fff7e6",
  red: "#be123c",
  redBg: "#fff1f2",
  blue: "#1d4ed8",
  blueBg: "#eff6ff",
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("gb_token");

  const currentYear = new Date().getFullYear();

  const yearOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const monthOptions = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quick, setQuick] = useState("today");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (from || to) {
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      return params.toString();
    }

    if (quick) {
      params.append("quick", quick);
      return params.toString();
    }

    if (year) params.append("year", year);
    if (month) params.append("month", month);

    return params.toString();
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const qs = buildQueryString();
      const url = qs ? `/api/admin/dashboard?${qs}` : "/api/admin/dashboard";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    fetchDashboard();
  };

  const resetFilters = () => {
    setQuick("today");
    setYear("");
    setMonth("");
    setFrom("");
    setTo("");

    setTimeout(() => {
      setLoading(true);

      fetch("/api/admin/dashboard?quick=today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => {
          console.error(err);
          setStats(null);
        })
        .finally(() => setLoading(false));
    }, 0);
  };

  const downloadAdminExcel = async () => {
    try {
      const qs = buildQueryString();
      const url = qs
        ? `/api/admin/download/admin-excel?${qs}`
        : "/api/admin/download/admin-excel";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "admin-report.xlsx";
      link.click();
    } catch (err) {
      console.error("Admin Excel download failed:", err);
    }
  };

  const downloadUsersExcel = async () => {
    try {
      const res = await fetch("/api/admin/download/users-excel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "users-report.xlsx";
      link.click();
    } catch (err) {
      console.error("Users Excel download failed:", err);
    }
  };

  const primaryButton = {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    boxShadow: "0 8px 18px rgba(177,18,38,0.18)",
  };

  const secondaryButton = {
    padding: "10px 16px",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    background: "#fff",
    color: colors.text,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    fontSize: "13px",
    outline: "none",
    background: "#fff",
    color: colors.text,
    boxSizing: "border-box",
  };

  const executiveSummary = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, tone: "blue" },
        { label: "Total Ads", value: stats.totalAds, tone: "red" },
        { label: "Revenue", value: stats.revenue, tone: "green" },
        { label: "Success Payments", value: stats.successfulPayments, tone: "green" },
        { label: "Active Users", value: stats.activeUsers, tone: "blue" },
        { label: "Live Ads", value: stats.liveAds, tone: "green" },
      ]
    : [];

  const growthSnapshot = stats
    ? [
        { label: "Users In Range", value: stats.usersInRange },
        { label: "Ads In Range", value: stats.adsInRange },
        { label: "New Users Today", value: stats.newUsersToday },
        { label: "New Users This Month", value: stats.newUsersThisMonth },
        { label: "Referral Signups", value: stats.referralSignups },
        { label: "Login Count Today", value: stats.loginCountToday },
      ]
    : [];

  const adsHealth = stats
    ? [
        { label: "Pending Ads", value: stats.pendingAds, tone: "amber" },
        { label: "Live Ads", value: stats.liveAds, tone: "green" },
        { label: "Stopped Ads", value: stats.stoppedAds, tone: "amber" },
        { label: "Rejected Ads", value: stats.rejectedAds, tone: "red" },
        { label: "Hidden Ads", value: stats.hiddenAds, tone: "blue" },
        { label: "Sold Ads", value: stats.soldAds, tone: "green" },
      ]
    : [];

  const paymentOverview = stats
    ? [
        { label: "Total Payments", value: stats.totalPayments, tone: "blue" },
        { label: "Success Payments", value: stats.successfulPayments, tone: "green" },
        { label: "Failed Payments", value: stats.failedPayments, tone: "red" },
        { label: "Pending Payments", value: stats.pendingPayments, tone: "amber" },
        { label: "Revenue", value: stats.revenue, tone: "green" },
      ]
    : [];

  const userEngagement = stats
    ? [
        { label: "Active Users", value: stats.activeUsers, tone: "blue" },
        { label: "Login Count", value: stats.loginCount, tone: "blue" },
        { label: "Login Count Today", value: stats.loginCountToday, tone: "green" },
      ]
    : [];

  const referralOverview = stats
    ? [
        { label: "Total Referrals", value: stats.totalReferrals, tone: "blue" },
        { label: "Referral Signups", value: stats.referralSignups, tone: "green" },
      ]
    : [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, padding: "20px" }}>
        <AdminNav />
        <div
          style={{
            maxWidth: "1320px",
            margin: "12px auto 0",
            background: "#fff",
            borderRadius: "18px",
            border: `1px solid ${colors.border}`,
            padding: "24px",
            boxShadow: colors.shadow,
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: colors.muted, fontWeight: 700 }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, padding: "20px" }}>
        <AdminNav />
        <div
          style={{
            maxWidth: "1320px",
            margin: "12px auto 0",
            background: colors.redBg,
            borderRadius: "18px",
            border: "1px solid #fecdd3",
            padding: "24px",
            boxShadow: colors.shadow,
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: colors.red, fontWeight: 700 }}>
            Failed to load dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        padding: "20px",
      }}
    >
      <AdminNav />

      <div style={{ maxWidth: "1320px", margin: "12px auto 0" }}>
        <div
          style={{
            position: "sticky",
            top: "72px",
            zIndex: 20,
            background: `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
            borderRadius: "22px",
            padding: "18px 20px",
            color: "#fff",
            boxShadow: "0 16px 34px rgba(177, 18, 38, 0.18)",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  opacity: 0.84,
                  marginBottom: "6px",
                }}
              >
                Admin Analytics
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "26px",
                  lineHeight: 1.15,
                  fontWeight: 800,
                }}
              >
                Dashboard Overview
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Range: {stats.selectedRange?.label || "all"} · Monitor users, ads,
                referrals, payments, and reports from one executive view.
              </p>
            </div>

            <button onClick={() => navigate("/admin")} style={secondaryButton}>
              Back to Admin List
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow,
            padding: "14px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <Field label="Quick Filter">
              <select
                value={quick}
                onChange={(e) => {
                  setQuick(e.target.value);
                  setYear("");
                  setMonth("");
                  setFrom("");
                  setTo("");
                }}
                style={inputStyle}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="last5years">Last 5 Years</option>
              </select>
            </Field>

            <Field label="Year">
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setQuick("");
                  setFrom("");
                  setTo("");
                }}
                style={inputStyle}
              >
                <option value="">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Month">
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setQuick("");
                  setFrom("");
                  setTo("");
                }}
                style={inputStyle}
              >
                {monthOptions.map((m) => (
                  <option key={m.value || "all"} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="From Date">
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setQuick("");
                  setYear("");
                  setMonth("");
                }}
                style={inputStyle}
              />
            </Field>

            <Field label="To Date">
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setQuick("");
                  setYear("");
                  setMonth("");
                }}
                style={inputStyle}
              />
            </Field>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "14px",
            }}
          >
            <button onClick={applyFilters} style={primaryButton}>
              Apply Filters
            </button>
            <button onClick={resetFilters} style={secondaryButton}>
              Reset Filters
            </button>
          </div>
        </div>

        <DashboardSection
          title="Executive Summary"
          subtitle="Top-level performance indicators for the selected range."
        >
          <MetricGrid items={executiveSummary} />
        </DashboardSection>

        <DashboardSection
          title="Growth Snapshot"
          subtitle="User and platform growth for the selected period."
        >
          <MetricGrid items={growthSnapshot} />
        </DashboardSection>

        <DashboardSection
          title="Ads Health"
          subtitle="Moderation and marketplace status across all listings."
        >
          <MetricGrid items={adsHealth} />
        </DashboardSection>

        <DashboardSection
          title="Payments Overview"
          subtitle="Payment performance and revenue outcomes."
        >
          <MetricGrid items={paymentOverview} />
        </DashboardSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <DashboardSection
            title="User Engagement"
            subtitle="Activity and sign-in behavior."
            noMargin
          >
            <MetricGrid items={userEngagement} minWidth={180} />
          </DashboardSection>

          <DashboardSection
            title="Referrals"
            subtitle="Referral network performance."
            noMargin
          >
            <MetricGrid items={referralOverview} minWidth={180} />
          </DashboardSection>
        </div>

        <DashboardSection
          title="Reporting Actions"
          subtitle="Download reports for audit, analysis, and sharing."
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <ActionCard
              title="Admin Excel Report"
              description="Download the filtered admin report as an Excel file."
              buttonLabel="Download Admin Excel"
              onClick={downloadAdminExcel}
              buttonStyle={primaryButton}
            />
            <ActionCard
              title="Users Excel Report"
              description="Download the latest users report as an Excel file."
              buttonLabel="Download Users Excel"
              onClick={downloadUsersExcel}
              buttonStyle={secondaryButton}
            />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 700,
          color: "#475467",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function DashboardSection({ title, subtitle, children, noMargin = false }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        border: "1px solid #edd6da",
        boxShadow: "0 10px 28px rgba(17, 24, 39, 0.06)",
        padding: "16px",
        marginBottom: noMargin ? 0 : "16px",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#18212f",
            marginBottom: "4px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#667085",
          }}
        >
          {subtitle}
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricGrid({ items, minWidth = 210 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
        gap: "12px",
      }}
    >
      {items.map((item) => (
        <MetricCard
          key={item.label}
          label={item.label}
          value={item.value}
          tone={item.tone}
        />
      ))}
    </div>
  );
}

function MetricCard({ label, value, tone = "default" }) {
  const toneMap = {
    green: {
      color: "#047857",
      bg: "#ecfdf3",
      border: "#a7f3d0",
    },
    amber: {
      color: "#b45309",
      bg: "#fff7e6",
      border: "#f3d19c",
    },
    red: {
      color: "#be123c",
      bg: "#fff1f2",
      border: "#fecdd3",
    },
    blue: {
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    default: {
      color: "#7f0d1c",
      bg: "#fff8f8",
      border: "#edd6da",
    },
  };

  const meta = toneMap[tone] || toneMap.default;

  return (
    <div
      style={{
        background: meta.bg,
        borderRadius: "16px",
        border: `1px solid ${meta.border}`,
        padding: "16px",
        minHeight: "92px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#667085",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: meta.color,
          lineHeight: 1.1,
        }}
      >
        {value || 0}
      </div>
    </div>
  );
}

function ActionCard({ title, description, buttonLabel, onClick, buttonStyle }) {
  return (
    <div
      style={{
        flex: "1 1 320px",
        background: "#fcfcfd",
        border: "1px solid #edf0f3",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 800,
          color: "#18212f",
          marginBottom: "6px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#667085",
          lineHeight: 1.6,
          marginBottom: "14px",
        }}
      >
        {description}
      </div>
      <button onClick={onClick} style={buttonStyle}>
        {buttonLabel}
      </button>
    </div>
  );
}
