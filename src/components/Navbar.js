import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const THREADS_KEY = "gb_chat_threads";
const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

function getUnreadCount() {
  try {
    const threads = JSON.parse(localStorage.getItem(THREADS_KEY) || "{}");
    return Object.values(threads).reduce(
      (total, t) => total + (Number(t.unread) || 0),
      0
    );
  } catch {
    return 0;
  }
}

function getIndiaLicenceAuthority(state, city) {
  const cleanState = (state || "").trim();
  const cleanCity = (city || "").trim();

  if (!cleanState) return "";

  const mappedAuthorities = {
    "Tamil Nadu": "Tamil Nadu Animal Husbandry Department",
    Karnataka: "Karnataka Animal Husbandry Department",
    Kerala: "Kerala Animal Husbandry Department",
    Telangana: "Telangana Animal Husbandry Department",
    "Andhra Pradesh": "Andhra Pradesh Animal Husbandry Department",
    Maharashtra: "Maharashtra Animal Husbandry Department",
    Delhi: "Delhi Animal Husbandry Department",
    Gujarat: "Gujarat Animal Husbandry Department",
    Rajasthan: "Rajasthan Animal Husbandry Department",
    "Uttar Pradesh": "Uttar Pradesh Animal Husbandry Department",
    "West Bengal": "West Bengal Animal Husbandry Department",
    Odisha: "Odisha Animal Husbandry Department",
    Punjab: "Punjab Animal Husbandry Department",
    Haryana: "Haryana Animal Husbandry Department",
    Bihar: "Bihar Animal Husbandry Department",
    Jharkhand: "Jharkhand Animal Husbandry Department",
    Assam: "Assam Animal Husbandry Department",
    Chhattisgarh: "Chhattisgarh Animal Husbandry Department",
    Goa: "Goa Animal Husbandry Department",
    "Himachal Pradesh": "Himachal Pradesh Animal Husbandry Department",
    Uttarakhand: "Uttarakhand Animal Husbandry Department",
    Tripura: "Tripura Animal Husbandry Department",
    Meghalaya: "Meghalaya Animal Husbandry Department",
    Manipur: "Manipur Animal Husbandry Department",
    Mizoram: "Mizoram Animal Husbandry Department",
    Nagaland: "Nagaland Animal Husbandry Department",
    Sikkim: "Sikkim Animal Husbandry Department",
    "Madhya Pradesh": "Madhya Pradesh Animal Husbandry Department",
    "Jammu and Kashmir": "Jammu and Kashmir Animal Husbandry Department",
    Ladakh: "Ladakh Animal Husbandry Department",
    Puducherry: "Puducherry Animal Husbandry Department",
    Chandigarh: "Chandigarh Animal Husbandry Department",
    "Andaman and Nicobar Islands":
      "Andaman and Nicobar Animal Husbandry Department",
    "Dadra and Nagar Haveli and Daman and Diu":
      "Dadra and Nagar Haveli and Daman and Diu Animal Husbandry Department",
    Lakshadweep: "Lakshadweep Animal Husbandry Department",
    "Arunachal Pradesh": "Arunachal Pradesh Animal Husbandry Department",
  };

  if (mappedAuthorities[cleanState]) {
    return mappedAuthorities[cleanState];
  }

  return cleanCity
    ? `${cleanState} Animal Husbandry Department`
    : `${cleanState} Animal Husbandry Department`;
}

function normalizeLicenceStatus(statusValue, hasDocument) {
  const normalized = (statusValue || "").toString().trim().toLowerCase();

  if (normalized === "approved") return "approved";
  if (normalized === "pending") return "pending";
  if (normalized === "rejected") return "rejected";
  if (normalized === "none") return hasDocument ? "pending" : "not_uploaded";
  if (normalized === "not uploaded") return "not_uploaded";
  if (normalized === "not_uploaded") return "not_uploaded";

  return hasDocument ? "pending" : "not_uploaded";
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
}

function formatCurrencyValue(amount, currency) {
  const numericAmount = Number(amount || 0);
  const normalizedCurrency = String(currency || "").trim().toUpperCase();

  if (normalizedCurrency === "INR") return `₹${numericAmount}`;
  if (normalizedCurrency === "USD") return `$${numericAmount}`;
  if (normalizedCurrency) return `${normalizedCurrency} ${numericAmount}`;

  return `${numericAmount}`;
}

function formatRelativeTime(dateValue) {
  if (!dateValue) return "Just now";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function getNotificationMeta(notification) {
  const rawType = String(notification?.type || notification?.category || "")
    .trim()
    .toLowerCase();

  if (
    rawType.includes("chat") ||
    rawType.includes("message") ||
    rawType.includes("inbox")
  ) {
    return {
      icon: "💬",
      accent: "#2563eb",
      soft: "#eff6ff",
      border: "#bfdbfe",
    };
  }

  if (
    rawType.includes("review") ||
    rawType.includes("rating") ||
    rawType.includes("seller")
  ) {
    return {
      icon: "⭐",
      accent: "#d97706",
      soft: "#fffbeb",
      border: "#fde68a",
    };
  }

  if (
    rawType.includes("payment") ||
    rawType.includes("membership") ||
    rawType.includes("boost")
  ) {
    return {
      icon: "💳",
      accent: "#7c3aed",
      soft: "#f5f3ff",
      border: "#ddd6fe",
    };
  }

  if (
    rawType.includes("licence") ||
    rawType.includes("license") ||
    rawType.includes("verification") ||
    rawType.includes("approval")
  ) {
    return {
      icon: "🛡️",
      accent: "#059669",
      soft: "#ecfdf5",
      border: "#a7f3d0",
    };
  }

  if (
    rawType.includes("warning") ||
    rawType.includes("report") ||
    rawType.includes("reject")
  ) {
    return {
      icon: "⚠️",
      accent: "#dc2626",
      soft: "#fef2f2",
      border: "#fecaca",
    };
  }

  return {
    icon: "🔔",
    accent: "#b91c1c",
    soft: "#fff1f2",
    border: "#fecdd3",
  };
}

function getNotificationTitle(notification) {
  return (
    notification?.title ||
    notification?.heading ||
    notification?.subject ||
    notification?.type ||
    "New notification"
  );
}

function getNotificationMessage(notification) {
  return (
    notification?.message ||
    notification?.content ||
    notification?.description ||
    notification?.body ||
    "You have a new update."
  );
}

function getNotificationTimestamp(notification) {
  return (
    notification?.createdAt ||
    notification?.updatedAt ||
    notification?.date ||
    notification?.timestamp ||
    null
  );
}

function getNotificationLink(notification) {
  if (notification?.link) return notification.link;
  if (notification?.url) return notification.url;
  if (notification?.path) return notification.path;

  const rawType = String(notification?.type || "").toLowerCase();

  if (rawType.includes("chat") || rawType.includes("message")) return "/chats";
  if (rawType.includes("review") || rawType.includes("rating")) return "/browse";
  if (rawType.includes("membership") || rawType.includes("payment")) return "/my-ads";
  if (rawType.includes("licence") || rawType.includes("license")) return null;

  return null;
}

function getNotificationId(notification) {
  return notification?._id || notification?.id || notification?.notificationId;
}

export default function Navbar({
  isAuthed,
  wishlist = [],
  onLogin,
  onRegister,
  onLogout,
  isAdmin,
}) {
  const navigate = useNavigate();
  const notificationDropdownRef = useRef(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(window.innerWidth < 768 ? "" : "profile");
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [markingAllNotifications, setMarkingAllNotifications] = useState(false);
  const [activeNotificationId, setActiveNotificationId] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState("idle");
  const [paymentRegionOverride, setPaymentRegionOverride] = useState("auto");
  const [savingPaymentMode, setSavingPaymentMode] = useState(false);

  const [licenceType, setLicenceType] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceAuthority, setLicenceAuthority] = useState("");
  const [licenceFile, setLicenceFile] = useState(null);
  const [submittingLicence, setSubmittingLicence] = useState(false);

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetTimer, setResetTimer] = useState(0);
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const token = localStorage.getItem("gb_token");

const normalizedCountry = (user?.country || "").trim().toLowerCase();

const isIndiaUser =
  paymentRegionOverride === "india"
    ? true
    : paymentRegionOverride === "international"
    ? false
    : normalizedCountry === "india";

  const hasUploadedLicenceDocument = !!user?.licenceDocument;

  const autoMappedIndiaAuthority = useMemo(() => {
    if (!isIndiaUser) return "";
    return getIndiaLicenceAuthority(user?.state, user?.city);
  }, [isIndiaUser, user?.state, user?.city]);

  const referralShareText = useMemo(() => {
    const code = user?.referralCode || "";
    return `Join Genetic Breeds using my referral code: ${code}`;
  }, [user]);

  const usedReferralAdsCount = useMemo(() => {
    const credits = Array.isArray(user?.referralCredits)
      ? user.referralCredits
      : [];
    return credits.filter((credit) => credit?.used === true).length;
  }, [user]);

  const availableReferralAdsCount = useMemo(() => {
    const credits = Array.isArray(user?.referralCredits)
      ? user.referralCredits
      : [];
    const now = new Date();

    return credits.filter((credit) => {
      if (!credit || credit.used) return false;
      if (credit.expiresAt && new Date(credit.expiresAt) <= now) return false;
      return true;
    }).length;
  }, [user]);

  const nextReferralExpiry = useMemo(() => {
    const credits = Array.isArray(user?.referralCredits)
      ? user.referralCredits
      : [];
    const now = new Date();

    const nextValidCredit = credits
      .filter((credit) => {
        if (!credit || credit.used) return false;
        if (!credit.expiresAt) return false;
        return new Date(credit.expiresAt) > now;
      })
      .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt))[0];

    return nextValidCredit?.expiresAt || null;
  }, [user]);

  const membershipStatusStyles = useMemo(() => {
    const normalized = String(membership?.status || "")
      .trim()
      .toLowerCase();

    if (normalized === "active") {
      return {
        color: "#166534",
        background: "#dcfce7",
        border: "1px solid #bbf7d0",
      };
    }

    if (normalized === "pending") {
      return {
        color: "#b45309",
        background: "#fef3c7",
        border: "1px solid #fde68a",
      };
    }

    if (normalized === "expired") {
      return {
        color: "#b91c1c",
        background: "#fee2e2",
        border: "1px solid #fecaca",
      };
    }

    if (normalized === "cancelled") {
      return {
        color: "#374151",
        background: "#f3f4f6",
        border: "1px solid #d1d5db",
      };
    }

    return {
      color: "#7f1d1d",
      background: "#fff1f2",
      border: "1px solid #fecdd3",
    };
  }, [membership]);

  const normalizedLicenceStatus = normalizeLicenceStatus(
    user?.licenceStatus,
    hasUploadedLicenceDocument
  );

  const isLicenceLocked =
    normalizedLicenceStatus === "pending" ||
    normalizedLicenceStatus === "approved";

  const isLicenceEditable =
    normalizedLicenceStatus === "not_uploaded" ||
    normalizedLicenceStatus === "rejected";

  const licenceStatusStyles =
    normalizedLicenceStatus === "approved"
      ? {
          color: "#166534",
          background: "#dcfce7",
          border: "1px solid #bbf7d0",
        }
      : normalizedLicenceStatus === "pending"
      ? {
          color: "#b45309",
          background: "#fef3c7",
          border: "1px solid #fde68a",
        }
      : normalizedLicenceStatus === "rejected"
      ? {
          color: "#b91c1c",
          background: "#fee2e2",
          border: "1px solid #fecaca",
        }
      : {
          color: "#7f1d1d",
          background: "#fff1f2",
          border: "1px solid #fecdd3",
        };

  const licenceStatusLabel =
    normalizedLicenceStatus === "approved"
      ? "Approved / Upload Success"
      : normalizedLicenceStatus === "pending"
      ? "Pending"
      : normalizedLicenceStatus === "rejected"
      ? "Rejected"
      : "Not Uploaded";

  const visibleNotifications = useMemo(() => {
    return Array.isArray(notifications) ? notifications.slice(0, 8) : [];
  }, [notifications]);

  const hasNotifications = visibleNotifications.length > 0;

useEffect(() => {
  if (!isAuthed || !token) {
    setUser(null);
    setMembership(null);
    setPaymentRegionOverride("auto");
    return;
  }

  fetchProfile();
  fetchMembership();
}, [isAuthed, token]);

  useEffect(() => {
    const updateUnread = () => {
      setUnreadCount(getUnreadCount());
    };

    updateUnread();
    const interval = setInterval(updateUnread, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAuthed || !token) {
      setNotifications([]);
      setNotificationUnreadCount(0);
      setNotificationsOpen(false);
      return;
    }

    fetchNotifications({ showLoader: true });

    const interval = setInterval(() => {
      fetchNotifications({ silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthed, token]);

  useEffect(() => {
    if (!user) return;

    if (user?.licenceAuthority) {
      setLicenceAuthority(user.licenceAuthority);
      return;
    }

    if (isIndiaUser && autoMappedIndiaAuthority) {
      setLicenceAuthority(autoMappedIndiaAuthority);
      return;
    }

    if (!isIndiaUser) {
      setLicenceAuthority("");
    }
  }, [user, isIndiaUser, autoMappedIndiaAuthority]);

  useEffect(() => {
    if (activeSection !== "settings" || !showChangePasswordForm) return;
    if (resetTimer <= 0) return;

    const interval = setInterval(() => {
      setResetTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSection, showChangePasswordForm, resetTimer]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileError("");

      if (!token) {
        setProfileError("Please login first");
        setUser(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Failed to load profile");
        setUser(null);
        return;
      }

      setUser(data);
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setPaymentRegionOverride(data.paymentRegionOverride || "auto");      
setLicenceType(data.licenceType || "");
      setLicenceNumber(data.licenceNumber || "");
      setLicenceAuthority(
        data.licenceAuthority ||
          ((data.country || "").trim().toLowerCase() === "india"
            ? getIndiaLicenceAuthority(data.state, data.city)
            : "")
      );
      setLicenceFile(null);

      setResetForm((prev) => ({
        ...prev,
        email: data.email || prev.email || "",
      }));

      localStorage.setItem("gb_user", JSON.stringify(data));
    } catch (err) {
      console.error("Drawer profile fetch error:", err);
      setProfileError("Failed to load profile");
      setUser(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchMembership = async () => {
    try {
      setLoadingMembership(true);

      if (!token) {
        setMembership(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/payments/my-credits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setMembership(null);
        return;
      }

      setMembership(data);
    } catch (err) {
      console.error("Membership fetch error:", err);
      setMembership(null);
    } finally {
      setLoadingMembership(false);
    }
  };

  const fetchNotifications = async ({
    silent = false,
    showLoader = false,
  } = {}) => {
    if (!token || !isAuthed) return;

    try {
      if (showLoader && !silent) {
        setLoadingNotifications(true);
      }

      if (!silent) {
        setNotificationsError("");
      }

      const listRes = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const listData = await listRes.json();

      if (!listRes.ok) {
        if (!silent) {
          setNotificationsError(listData.error || "Failed to load notifications");
        }
        return;
      }

      const list = Array.isArray(listData)
        ? listData
        : Array.isArray(listData.notifications)
        ? listData.notifications
        : Array.isArray(listData.data)
        ? listData.data
        : [];

      setNotifications(list);

      const unreadFromList = list.filter(
        (item) => item?.isRead === false || item?.read === false
      ).length;

      try {
        const countRes = await fetch(
          `${API_BASE_URL}/api/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const countData = await countRes.json();

        if (countRes.ok) {
          const unread =
            Number(
              countData?.unreadCount ??
                countData?.count ??
                countData?.unread ??
                unreadFromList
            ) || 0;

          setNotificationUnreadCount(unread);
        } else {
          setNotificationUnreadCount(unreadFromList);
        }
      } catch {
        setNotificationUnreadCount(unreadFromList);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
      if (!silent) {
        setNotificationsError("Failed to load notifications");
      }
    } finally {
      if (showLoader && !silent) {
        setLoadingNotifications(false);
      }
    }
  };

  const updateProfileFields = async () => {
    try {
if (!phone.trim()) {
  toast.error("Phone number is required");
  return;
}

setSavingProfile(true);
setProfileSaveStatus("saving");
toast.loading("Saving changes...", { id: "profile-save" });

const previousEmail = user?.email || "";
const previousPaymentMode = user?.paymentRegionOverride || "auto";
const emailChanged = email !== previousEmail;
const paymentModeChanged = paymentRegionOverride !== previousPaymentMode;

const phoneRes = await fetch(`${API_BASE_URL}/api/auth/update-phone`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ phone }),
});

const phoneData = await phoneRes.json();

if (!phoneRes.ok) {
  toast.error(phoneData.error || "Failed to update phone", {
    id: "profile-save",
  });
  return;
}

if (emailChanged) {
  try {
    const emailRes = await fetch(`${API_BASE_URL}/api/auth/update-email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      toast.error(
        emailData.error || "Phone updated, but email update API is not ready yet",
        { id: "profile-save" }
      );
    }
  } catch (emailErr) {
    console.error("Email update error:", emailErr);
    toast.error("Phone updated. Email update API is not ready yet.", {
      id: "profile-save",
    });
  }
}

const paymentModeRes = await fetch(`${API_BASE_URL}/api/auth/update-payment-mode`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    paymentRegionOverride,
  }),
});

const paymentModeData = await paymentModeRes.json().catch(() => ({}));

if (!paymentModeRes.ok) {
  toast.error(paymentModeData.error || "Failed to update payment mode", {
    id: "profile-save",
  });
  return;
}

await fetchProfile();

setProfileSaveStatus("saved");
setTimeout(() => {
setProfileSaveStatus("idle");
}, 2500);

toast.success(
  paymentModeChanged
    ? "Payment mode updated successfully 🌍"
    : emailChanged
    ? "Profile updated successfully ✅"
    : phoneData.message || "Profile updated successfully ✅",
  { id: "profile-save" }
);

    } catch (err) {
      console.error("Profile update error:", err);
    toast.error("Error updating profile", { id: "profile-save" });
    } finally {
      setSavingProfile(false);
    }
  };

  const submitLicence = async () => {
    try {
      if (!isLicenceEditable) {
        alert("Licence cannot be edited right now");
        return;
      }

      if (!licenceType.trim()) {
        alert("Licence type is required");
        return;
      }

      if (!licenceNumber.trim()) {
        alert("Licence number is required");
        return;
      }

      if (isIndiaUser && !licenceAuthority.trim()) {
        alert("Licence authority is required for India");
        return;
      }

      if (
        !licenceFile &&
        normalizedLicenceStatus !== "rejected" &&
        !user?.licenceDocument
      ) {
        alert("Please upload a licence document");
        return;
      }

      if (normalizedLicenceStatus === "rejected" && !licenceFile) {
        alert("Please re-upload the corrected licence document");
        return;
      }

      setSubmittingLicence(true);

      const formData = new FormData();
      formData.append("licenceType", licenceType);
      formData.append("licenceNumber", licenceNumber);

      if (isIndiaUser) {
        formData.append("licenceAuthority", licenceAuthority);
      }

      if (licenceFile) {
        formData.append("licenceDocument", licenceFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/upload-licence`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit licence");
        return;
      }

      alert(data.message || "Licence submitted successfully");
      await fetchProfile();
      setLicenceFile(null);
    } catch (err) {
      console.error("Licence submit error:", err);
      alert("Failed to submit licence");
    } finally {
      setSubmittingLicence(false);
    }
  };

  const sendOtp = async () => {
    try {
      setResetError("");
      setResetSuccess("");

      if (!resetForm.email.trim()) {
        setResetError("Email is required");
        return;
      }

      setSendingOtp(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetForm.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Failed to send OTP");
        return;
      }

      setResetSuccess("OTP sent to your email");
      setResetStep(2);
      setResetTimer(60);
    } catch (err) {
      console.error("Send OTP error:", err);
      setResetError("Server error");
    } finally {
      setSendingOtp(false);
    }
  };

  const resetPasswordInline = async () => {
    try {
      setResetError("");
      setResetSuccess("");

      if (resetForm.newPassword !== resetForm.confirmPassword) {
        setResetError("Passwords do not match");
        return;
      }

      if (!resetForm.otp.trim()) {
        setResetError("OTP is required");
        return;
      }

      setResettingPassword(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetForm.email,
          otp: resetForm.otp,
          newPassword: resetForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Password reset failed");
        return;
      }

      setResetSuccess("Password reset successful");
      setResetStep(1);
      setResetTimer(0);
      setShowChangePasswordForm(false);
      setResetForm({
        email: user?.email || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Reset password error:", err);
      setResetError("Server error");
    } finally {
      setResettingPassword(false);
    }
  };

  const openInlineChangePassword = () => {
    setShowChangePasswordForm((prev) => !prev);
    setResetError("");
    setResetSuccess("");
    setResetStep(1);
    setResetTimer(0);
    setResetForm({
      email: user?.email || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const copyReferralCode = async () => {
    try {
      const code = user?.referralCode || "";
      if (!code) {
        alert("No referral code found");
        return;
      }

      await navigator.clipboard.writeText(code);
      alert("Referral code copied");
    } catch (err) {
      console.error("Copy referral code error:", err);
      alert("Failed to copy referral code");
    }
  };

  const shareReferral = async () => {
    try {
      if (!user?.referralCode) {
        alert("No referral code found");
        return;
      }

      const shareData = {
        title: "Genetic Breeds Referral",
        text: referralShareText,
        url: window.location.origin,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${referralShareText} - ${window.location.origin}`
        );
        alert("Share not supported on this device. Referral message copied instead.");
      }
    } catch (err) {
      console.error("Share referral error:", err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId || !token) return;

    try {
      setActiveNotificationId(notificationId);

      let success = false;

      const attempts = [
        {
          url: `${API_BASE_URL}/api/notifications/${notificationId}/read`,
          method: "PUT",
        },
        {
          url: `${API_BASE_URL}/api/notifications/${notificationId}/read`,
          method: "PATCH",
        },
        {
          url: `${API_BASE_URL}/api/notifications/read/${notificationId}`,
          method: "PUT",
        },
      ];

      for (const attempt of attempts) {
        try {
          const res = await fetch(attempt.url, {
            method: attempt.method,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            success = true;
            break;
          }
        } catch {
          // try next pattern
        }
      }

      setNotifications((prev) =>
        prev.map((item) => {
          const id = getNotificationId(item);
          if (String(id) !== String(notificationId)) return item;
          return {
            ...item,
            isRead: true,
            read: true,
          };
        })
      );

      setNotificationUnreadCount((prev) => Math.max(0, prev - 1));

      if (!success) {
        await fetchNotifications({ silent: true });
      }
    } catch (err) {
      console.error("Mark notification read error:", err);
      await fetchNotifications({ silent: true });
    } finally {
      setActiveNotificationId("");
    }
  };

  const markAllNotificationsRead = async () => {
    if (!token) return;

    try {
      setMarkingAllNotifications(true);

      let success = false;

      const attempts = [
        {
          url: `${API_BASE_URL}/api/notifications/read-all`,
          method: "PUT",
        },
        {
          url: `${API_BASE_URL}/api/notifications/mark-all-read`,
          method: "PUT",
        },
        {
          url: `${API_BASE_URL}/api/notifications/read-all`,
          method: "PATCH",
        },
      ];

      for (const attempt of attempts) {
        try {
          const res = await fetch(attempt.url, {
            method: attempt.method,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            success = true;
            break;
          }
        } catch {
          // try next pattern
        }
      }

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          read: true,
        }))
      );
      setNotificationUnreadCount(0);

      if (!success) {
        await fetchNotifications({ silent: true });
      }
    } catch (err) {
      console.error("Mark all notifications read error:", err);
      await fetchNotifications({ silent: true });
    } finally {
      setMarkingAllNotifications(false);
    }
  };

  const handleNotificationOpen = async (notification) => {
    const notificationId = getNotificationId(notification);
    const targetLink = getNotificationLink(notification);

    if (
      notificationId &&
      (notification?.isRead === false || notification?.read === false)
    ) {
      await markNotificationAsRead(notificationId);
    }

    setNotificationsOpen(false);

    if (targetLink) {
      navigate(targetLink);
    }
  };

  const toggleNotifications = async () => {
    const nextOpenState = !notificationsOpen;
    setNotificationsOpen(nextOpenState);

    if (nextOpenState) {
      await fetchNotifications({ showLoader: true });
    }
  };

  const logoutCurrentDevice = () => {
    setDrawerOpen(false);
    setNotificationsOpen(false);
    onLogout();
    navigate("/", { replace: true });
  };

  const logoutAllDevices = async () => {
    alert("Logout from all devices UI is ready. Backend API needs to be connected next.");
  };

  const deleteAccount = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!ok) return;

    alert("Delete account UI is ready. Backend API needs to be connected next.");
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div style={navStyle}>
        <div style={navLeftStyle}>
          {isAuthed && (
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(true);
                setActiveSection("profile");
              }}
              style={menuButtonStyle}
              aria-label="Open menu"
            >
              <span style={menuLineStyle} />
              <span style={menuLineStyle} />
              <span style={menuLineStyle} />
            </button>
          )}
        </div>

        <div style={navRightStyle}>
          {!isAuthed ? (
            <>
              <button style={navTextBtnStyle} onClick={onLogin}>
                Login
              </button>

              <button style={navBtnStyle} onClick={onRegister}>
                Register
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/wishlist"
                style={({ isActive }) => (isActive ? activeLinkStyle : navLinkStyle)}
              >
                Wishlist ({wishlist.length})
              </NavLink>

              <NavLink
                to="/browse"
                style={({ isActive }) => (isActive ? activeLinkStyle : navLinkStyle)}
              >
                Home
              </NavLink>

              <NavLink
                to="/chats"
                style={({ isActive }) => (isActive ? activeLinkStyle : navLinkStyle)}
              >
                Chats
                {unreadCount > 0 && (
                  <span style={inlineCountBadgeStyle}>{unreadCount}</span>
                )}
              </NavLink>

              <NavLink
                to="/my-ads"
                style={({ isActive }) => (isActive ? activeLinkStyle : navLinkStyle)}
              >
                My Ads
              </NavLink>

              <div style={notificationWrapStyle} ref={notificationDropdownRef}>
                <button
                  type="button"
                  onClick={toggleNotifications}
                  style={
                    notificationsOpen
                      ? notificationBellButtonActiveStyle
                      : notificationBellButtonStyle
                  }
                  aria-label="Open notifications"
                >
                  <span style={notificationBellIconStyle}>🔔</span>

                  {notificationUnreadCount > 0 && (
                    <span style={notificationBadgeStyle}>
                      {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div style={notificationDropdownStyle}>
                    <div style={notificationDropdownHeaderStyle}>
                      <div>
                        <div style={notificationDropdownLabelStyle}>
                          NOTIFICATIONS
                        </div>
                        <div style={notificationDropdownTitleStyle}>
                          Recent Updates
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        style={markAllReadBtnStyle}
                        disabled={
                          markingAllNotifications || notificationUnreadCount === 0
                        }
                      >
                        {markingAllNotifications ? "Updating..." : "Mark all read"}
                      </button>
                    </div>

                    <div style={notificationSummaryRowStyle}>
                      <div style={notificationSummaryPillStyle}>
                        Total: {notifications.length}
                      </div>
                      <div style={notificationSummaryPillUnreadStyle}>
                        Unread: {notificationUnreadCount}
                      </div>
                    </div>

                    <div style={notificationListStyle}>
                      {loadingNotifications ? (
                        <div style={notificationStateCardStyle}>
                          <p style={infoTextStyle}>Loading notifications...</p>
                        </div>
                      ) : notificationsError ? (
                        <div style={notificationStateCardStyle}>
                          <p style={errorTextStyle}>{notificationsError}</p>
                        </div>
                      ) : !hasNotifications ? (
                        <div style={notificationStateCardStyle}>
                          <div style={emptyNotificationIconStyle}>🔕</div>
                          <p style={emptyNotificationTitleStyle}>
                            No notifications yet
                          </p>
                          <p style={emptyNotificationTextStyle}>
                            Your latest alerts, chats, reviews and account updates
                            will appear here.
                          </p>
                        </div>
                      ) : (
                        visibleNotifications.map((notification) => {
                          const meta = getNotificationMeta(notification);
                          const notificationId = getNotificationId(notification);
                          const isUnread =
                            notification?.isRead === false ||
                            notification?.read === false;

                          return (
                            <div
                              key={notificationId || `${getNotificationTitle(notification)}-${getNotificationTimestamp(notification)}`}
                              style={{
                                ...notificationItemStyle,
                                background: isUnread ? meta.soft : "#fff",
                                borderColor: isUnread ? meta.border : "#f3d5d8",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleNotificationOpen(notification)}
                                style={notificationItemButtonStyle}
                              >
                                <div
                                  style={{
                                    ...notificationIconWrapStyle,
                                    background: meta.soft,
                                    border: `1px solid ${meta.border}`,
                                  }}
                                >
                                  <span style={notificationIconStyle}>
                                    {meta.icon}
                                  </span>
                                </div>

                                <div style={notificationContentStyle}>
                                  <div style={notificationTopRowStyle}>
                                    <div
                                      style={{
                                        ...notificationItemTitleStyle,
                                        color: meta.accent,
                                      }}
                                    >
                                      {getNotificationTitle(notification)}
                                    </div>

                                    <div style={notificationTimeStyle}>
                                      {formatRelativeTime(
                                        getNotificationTimestamp(notification)
                                      )}
                                    </div>
                                  </div>

                                  <div style={notificationMessageStyle}>
                                    {getNotificationMessage(notification)}
                                  </div>

                                  <div style={notificationFooterRowStyle}>
                                    {isUnread ? (
                                      <span style={notificationUnreadPillStyle}>
                                        New
                                      </span>
                                    ) : (
                                      <span style={notificationReadPillStyle}>
                                        Read
                                      </span>
                                    )}

                                    {getNotificationLink(notification) ? (
                                      <span style={notificationViewTextStyle}>
                                        View →
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </button>

                              {isUnread && notificationId ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markNotificationAsRead(notificationId)
                                  }
                                  style={notificationMarkBtnStyle}
                                  disabled={activeNotificationId === notificationId}
                                >
                                  {activeNotificationId === notificationId
                                    ? "..."
                                    : "Mark read"}
                                </button>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div style={notificationDropdownFooterStyle}>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetchNotifications({ showLoader: true });
                        }}
                        style={notificationFooterBtnStyle}
                      >
                        Refresh
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate("/chats");
                        }}
                        style={notificationFooterPrimaryBtnStyle}
                      >
                        Open Chats
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  style={({ isActive }) => (isActive ? activeAdminStyle : navAdminStyle)}
                >
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>
      </div>

<>
  {drawerOpen && (
    <div style={overlayStyle} onClick={closeDrawer} />
  )}

  <div
    style={{
      ...drawerStyle,
      transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
    }}
      >
        <div style={drawerHeaderStyle}>
          <div>
            <div style={brandMiniStyle}>GENETIC BREEDS</div>
            <h2 style={drawerTitleStyle}>Account Panel</h2>
            <p style={drawerSubtitleStyle}>Advanced user menu</p>
          </div>

          <button type="button" onClick={closeDrawer} style={closeBtnStyle}>
            ×
          </button>
        </div>

        {!isAuthed ? (
          <div style={drawerBodyStyle}>
            <div style={emptyCardStyle}>
              <p style={emptyTextStyle}>Please login to open your account panel.</p>
            </div>
          </div>
        ) : (
          <div style={drawerContentWrapStyle}>
            <div style={{ ...drawerSidebarStyle, display: window.innerWidth < 768 && activeSection && activeSection !== "" ? "none" : "flex", flexDirection: "column" }}>
              <div style={userMiniCardStyle}>
                <div style={userAvatarStyle}>
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={userMiniNameStyle}>{user?.name || "User"}</div>
                  <div style={userMiniCodeStyle}>{user?.userCode || "No User Code"}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection("profile")}
                style={activeSection === "profile" ? sideItemActiveStyle : sideItemStyle}
              >
                My Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("licence")}
                style={activeSection === "licence" ? sideItemActiveStyle : sideItemStyle}
              >
                Licence Details
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("referral")}
                style={activeSection === "referral" ? sideItemActiveStyle : sideItemStyle}
              >
                Referral Details
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("membership")}
                style={activeSection === "membership" ? sideItemActiveStyle : sideItemStyle}
              >
                Membership Details
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("settings")}
                style={activeSection === "settings" ? sideItemActiveStyle : sideItemStyle}
              >
                Settings
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("support")}
                style={activeSection === "support" ? sideItemActiveStyle : sideItemStyle}
              >
                Help & Support
              </button>
            </div>

            <div style={{...drawerMainStyle, padding: window.innerWidth < 768 ? "12px" : ""}}>
              {/* Mobile back button */}
              {window.innerWidth < 768 && activeSection && (
                <button
                  onClick={() => setActiveSection("")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "none",
                    color: "#b91c1c",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    padding: "8px 0",
                    marginBottom: "12px",
                  }}
                >
                  ← Back
                </button>
              )}
              {loadingProfile ? (
                <div style={sectionCardStyle}>
                  <p style={infoTextStyle}>Loading profile...</p>
                </div>
              ) : profileError ? (
                <div style={sectionCardStyle}>
                  <p style={errorTextStyle}>{profileError}</p>
                </div>
              ) : !user ? (
                <div style={sectionCardStyle}>
                  <p style={errorTextStyle}>Failed to load profile</p>
                </div>
              ) : (
                <>
                  {activeSection === "profile" && (
                    <div style={sectionCardStyle}>
                      <div style={sectionHeaderRowStyle}>
                        <div>
                          <div style={sectionBadgeStyle}>ACCOUNT</div>
                          <h3 style={sectionTitleStyle}>My Profile</h3>
                          <p style={sectionDescStyle}>
                            Manage your profile details in one place.
                          </p>
                        </div>
                      </div>

                      <div style={fieldGridStyle}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>User Code</label>
                          <input
                            value={user.userCode || ""}
                            readOnly
                            style={readOnlyInputStyle}
                          />
                        </div>

                        <div style={fieldStyle}>
                          <label style={labelStyle}>Name</label>
                          <input
                            value={user.name || ""}
                            readOnly
                            style={readOnlyInputStyle}
                          />
                        </div>

                        <div style={fieldStyle}>
                          <label style={labelStyle}>Phone Number</label>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={inputStyle}
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div style={fieldStyle}>
                          <label style={labelStyle}>Mail ID</label>
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                            placeholder="Enter email address"
                          />
                        </div>

                        <div style={fieldStyle}>
                          <label style={labelStyle}>Country</label>
                          <input
                            value={user.country || ""}
                            readOnly
                            style={readOnlyInputStyle}
                          />
                        </div>

                        <div style={fieldStyle}>
                          <label style={labelStyle}>State</label>
                          <input
                            value={user.state || ""}
                            readOnly
                            style={readOnlyInputStyle}
                          />
                        </div>

                        <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>City</label>
                          <input
                            value={user.city || ""}
                            readOnly
                            style={readOnlyInputStyle}
                          />
                        </div>
                      </div>


{isAdmin && (
  <div style={fieldStyle}>
    <label style={labelStyle}>Payment Mode (Admin Only)</label>

    <select
      value={paymentRegionOverride}
      onChange={(e) => setPaymentRegionOverride(e.target.value)}
      style={inputStyle}
    >
      <option value="auto">Auto (Based on Country)</option>
      <option value="india">India (Razorpay)</option>
      <option value="international">International</option>
    </select>
  </div>
)}
                      <button
                        type="button"
                        onClick={updateProfileFields}
                        style={primaryActionBtnStyle}
                        disabled={savingProfile}
                      >
                     savingProfile
  ? "Saving..."
  : profileSaveStatus === "saved"
  ? "Saved ✅"
  : "Save Profile Changes"

                      </button>
                    </div>
                  )}

                  {activeSection === "licence" && (
                    <div style={sectionCardStyle}>
                      <div style={sectionHeaderRowStyle}>
                        <div>
                          <div style={sectionBadgeStyle}>VERIFICATION</div>
                          <h3 style={sectionTitleStyle}>Licence Details</h3>
                          <p style={sectionDescStyle}>
                            Upload your licence once. Status will move from pending to approved or rejected.
                          </p>
                        </div>

                        <div style={{ ...statusPillStyle, ...licenceStatusStyles }}>
                          {licenceStatusLabel}
                        </div>
                      </div>

                      <div style={fieldGridStyle}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Licence Type</label>
                          <select
                            value={licenceType}
                            onChange={(e) => setLicenceType(e.target.value)}
                            style={inputStyle}
                            disabled={isLicenceLocked}
                          >
                            <option value="">Select Licence Type</option>
                            <option value="Breeder Licence">Breeder Licence</option>
                            <option value="Pet Shop Licence">Pet Shop Licence</option>
                            <option value="Pet Seller Licence">Pet Seller Licence</option>
                          </select>
                        </div>

                        <div style={fieldStyle}>
                          <label style={labelStyle}>Licence Number</label>
                          <input
                            value={licenceNumber}
                            onChange={(e) => setLicenceNumber(e.target.value)}
                            style={inputStyle}
                            placeholder="Enter licence number"
                            disabled={isLicenceLocked}
                          />
                        </div>

                        {isIndiaUser && (
                          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                            <label style={labelStyle}>Licence Authority</label>
                            <input
                              value={licenceAuthority}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </div>
                        )}

                        {isIndiaUser && (
                          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                            <label style={labelStyle}>Mapped From Registration State</label>
                            <input
                              value={`${user.state || "-"}${user.city ? ` / ${user.city}` : ""}`}
                              readOnly
                              style={readOnlyInputStyle}
                            />
                          </div>
                        )}

                        <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>
                            {normalizedLicenceStatus === "rejected"
                              ? "Re-Upload Licence Document"
                              : "Licence Document Upload"}
                          </label>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => setLicenceFile(e.target.files?.[0] || null)}
                            style={fileInputStyle}
                            disabled={isLicenceLocked}
                          />
                        </div>
                      </div>

                      {licenceFile && (
                        <div style={softInfoBoxStyle}>
                          Selected file: <strong>{licenceFile.name}</strong>
                        </div>
                      )}

                      {user.licenceDocument ? (
                        <a
                          href={user.licenceDocument}
                          target="_blank"
                          rel="noreferrer"
                          style={licenceLinkStyle}
                        >
                          View Uploaded Licence Document
                        </a>
                      ) : (
                        <div style={softInfoBoxStyle}>No licence document uploaded yet.</div>
                      )}

                      {normalizedLicenceStatus === "pending" && (
                        <div style={pendingBoxStyle}>
                          Your licence is under admin review. Editing is locked until admin action.
                        </div>
                      )}

                      {normalizedLicenceStatus === "approved" && (
                        <div style={approvedBoxStyle}>
                          Licence upload success. Your licence has been approved by admin.
                        </div>
                      )}

                      {normalizedLicenceStatus === "rejected" && (
                        <div style={dangerBoxStyle}>
                          <strong>Rejected Reason:</strong>{" "}
                          {user.licenceRejectedReason ||
                            "Please re-upload with correct details and document."}
                        </div>
                      )}

                      {normalizedLicenceStatus === "not_uploaded" && (
                        <div style={softInfoBoxStyle}>
                          Upload your licence document to send it for admin verification.
                        </div>
                      )}

                      {isLicenceEditable && (
                        <button
                          type="button"
                          onClick={submitLicence}
                          style={primaryActionBtnStyle}
                          disabled={submittingLicence}
                        >
                          {submittingLicence
                            ? "Submitting..."
                            : normalizedLicenceStatus === "rejected"
                            ? "Re-Upload Licence"
                            : "Upload Licence"}
                        </button>
                      )}
                    </div>
                  )}

                  {activeSection === "referral" && (
                    <div style={sectionCardStyle}>
                      <div style={sectionHeaderRowStyle}>
                        <div>
                          <div style={sectionBadgeStyle}>REFERRAL</div>
                          <h3 style={sectionTitleStyle}>Referral Details</h3>
                          <p style={sectionDescStyle}>
                            Copy or share your unique referral code.
                          </p>
                        </div>
                      </div>

                      <div style={referralCardStyle}>
                        <div style={referralLabelStyle}>Your Unique Referral Code</div>
                        <div style={referralCodeBoxStyle}>
                          {user.referralCode || "No referral code"}
                        </div>

                        <div style={referralBtnRowStyle}>
                          <button
                            type="button"
                            onClick={copyReferralCode}
                            style={primaryActionBtnStyle}
                          >
                            Copy Code
                          </button>

                          <button
                            type="button"
                            onClick={shareReferral}
                            style={secondaryActionBtnStyle}
                          >
                            Invite Friends
                          </button>
                        </div>
                      </div>

                      <div style={statsGridStyle}>
                        <div style={miniStatCardStyle}>
                          <div style={miniStatLabelStyle}>Free Ads</div>
                          <div style={miniStatValueStyle}>{user.freePosts || 0}</div>
                        </div>

                        <div style={miniStatCardStyle}>
                          <div style={miniStatLabelStyle}>Referral Ads Used</div>
                          <div style={miniStatValueStyle}>{usedReferralAdsCount}</div>
                        </div>

                        <div style={miniStatCardStyle}>
                          <div style={miniStatLabelStyle}>Referral Credits Left</div>
                          <div style={miniStatValueStyle}>{availableReferralAdsCount}</div>
                        </div>

                        <div style={miniStatCardStyle}>
                          <div style={miniStatLabelStyle}>Next Referral Expiry</div>
                          <div style={miniStatValueStyleSmall}>
                            {formatDisplayDate(nextReferralExpiry)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "membership" && (
                    <div style={sectionCardStyle}>
                      <div style={sectionHeaderRowStyle}>
                        <div>
                          <div style={sectionBadgeStyle}>MEMBERSHIP</div>
                          <h3 style={sectionTitleStyle}>Membership Details</h3>
                          <p style={sectionDescStyle}>
                            View your membership plan, credits, status and expiry details.
                          </p>
                        </div>

                        <div style={{ ...statusPillStyle, ...membershipStatusStyles }}>
                          {membership?.status || "No Membership"}
                        </div>
                      </div>

                      {loadingMembership ? (
                        <p style={infoTextStyle}>Loading membership...</p>
                      ) : !membership || !membership.hasMembership ? (
                        <div style={softInfoBoxStyle}>
                          You do not have an active membership right now.
                        </div>
                      ) : (
                        <>
                          <div style={statsGridStyle}>
                            <div style={miniStatCardStyle}>
                              <div style={miniStatLabelStyle}>Plan</div>
                              <div style={miniStatValueStyle}>{membership.planName || "-"}</div>
                            </div>

                            <div style={miniStatCardStyle}>
                              <div style={miniStatLabelStyle}>Plan Key</div>
                              <div style={miniStatValueStyleSmall}>{membership.planKey || "-"}</div>
                            </div>

                            <div style={miniStatCardStyle}>
                              <div style={miniStatLabelStyle}>Posts Remaining</div>
                              <div style={miniStatValueStyle}>{membership.postsRemaining || 0}</div>
                            </div>

                            <div style={miniStatCardStyle}>
                              <div style={miniStatLabelStyle}>Boost Credits</div>
                              <div style={miniStatValueStyle}>{membership.boostsRemaining || 0}</div>
                            </div>

                            <div style={miniStatCardStyle}>
                              <div style={miniStatLabelStyle}>Posts Used</div>
                              <div style={miniStatValueStyle}>{membership.postsUsed || 0}</div>
                            </div>

                            <div style={miniStatCardStyle}>
                              <div style={miniStatLabelStyle}>Boosts Used</div>
                              <div style={miniStatValueStyle}>{membership.boostsUsed || 0}</div>
                            </div>
                          </div>

                          <div style={fieldGridStyleWithTopSpace}>
                            <div style={fieldStyle}>
                              <label style={labelStyle}>Amount Paid</label>
                              <input
                                value={formatCurrencyValue(
                                  membership.amountPaid,
                                  membership.currency
                                )}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </div>

                            <div style={fieldStyle}>
                              <label style={labelStyle}>Duration</label>
                              <input
                                value={`${membership.durationDays || 0} Days`}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </div>

                            <div style={fieldStyle}>
                              <label style={labelStyle}>Start Date</label>
                              <input
                                value={formatDisplayDate(membership.startsAt)}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </div>

                            <div style={fieldStyle}>
                              <label style={labelStyle}>Activated Date</label>
                              <input
                                value={formatDisplayDate(membership.activatedAt)}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </div>

                            <div style={fieldStyle}>
                              <label style={labelStyle}>Expiry Date</label>
                              <input
                                value={formatDisplayDate(membership.expiresAt)}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </div>

                            <div style={fieldStyle}>
                              <label style={labelStyle}>Badge</label>
                              <input
                                value={membership.badge || "-"}
                                readOnly
                                style={readOnlyInputStyle}
                              />
                            </div>

                            <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                              <label style={labelStyle}>Description</label>
                              <textarea
                                value={
                                  membership.description ||
                                  "No membership description available."
                                }
                                readOnly
                                style={readOnlyTextareaStyle}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeSection === "settings" && (
                    <div style={sectionCardStyle}>
                      <div style={sectionHeaderRowStyle}>
                        <div>
                          <div style={sectionBadgeStyle}>SECURITY</div>
                          <h3 style={sectionTitleStyle}>Settings</h3>
                          <p style={sectionDescStyle}>
                            Manage password, sessions and account actions.
                          </p>
                        </div>
                      </div>

                      <div style={settingsListStyle}>
                        <button
                          type="button"
                          onClick={openInlineChangePassword}
                          style={settingsItemStyle}
                        >
                          Change User Password
                        </button>

                        {showChangePasswordForm && (
                          <div style={inlinePasswordCardStyle}>
                            <div style={inlinePasswordTitleStyle}>Change Password</div>

                            {resetError ? (
                              <p style={inlineErrorTextStyle}>{resetError}</p>
                            ) : null}

                            {resetSuccess ? (
                              <p style={inlineSuccessTextStyle}>{resetSuccess}</p>
                            ) : null}

                            {resetStep === 1 && (
                              <div style={inlineFormWrapStyle}>
                                <input
                                  type="email"
                                  placeholder="Enter your email"
                                  value={resetForm.email}
                                  onChange={(e) =>
                                    setResetForm({
                                      ...resetForm,
                                      email: e.target.value,
                                    })
                                  }
                                  style={inputStyle}
                                />

                                <button
                                  type="button"
                                  onClick={sendOtp}
                                  style={primaryActionBtnStyle}
                                  disabled={sendingOtp}
                                >
                                  {sendingOtp ? "Sending..." : "Send OTP"}
                                </button>
                              </div>
                            )}

                            {resetStep === 2 && (
                              <div style={inlineFormWrapStyle}>
                                <input
                                  placeholder="Enter OTP"
                                  value={resetForm.otp}
                                  onChange={(e) =>
                                    setResetForm({
                                      ...resetForm,
                                      otp: e.target.value,
                                    })
                                  }
                                  style={inputStyle}
                                />

                                {resetTimer > 0 ? (
                                  <div style={timerTextStyle}>
                                    Resend OTP in {resetTimer}s
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={sendOtp}
                                    style={secondaryActionBtnStyle}
                                    disabled={sendingOtp}
                                  >
                                    {sendingOtp ? "Sending..." : "Resend OTP"}
                                  </button>
                                )}

                                <input
                                  type="password"
                                  placeholder="New Password"
                                  value={resetForm.newPassword}
                                  onChange={(e) =>
                                    setResetForm({
                                      ...resetForm,
                                      newPassword: e.target.value,
                                    })
                                  }
                                  style={inputStyle}
                                />

                                <input
                                  type="password"
                                  placeholder="Confirm Password"
                                  value={resetForm.confirmPassword}
                                  onChange={(e) =>
                                    setResetForm({
                                      ...resetForm,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                  style={inputStyle}
                                />

                                <button
                                  type="button"
                                  onClick={resetPasswordInline}
                                  style={primaryActionBtnStyle}
                                  disabled={resettingPassword}
                                >
                                  {resettingPassword ? "Updating..." : "Reset Password"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={logoutCurrentDevice}
                          style={settingsItemStyle}
                        >
                          Logout
                        </button>

                        <button
                          type="button"
                          onClick={logoutAllDevices}
                          style={settingsItemStyle}
                        >
                          Logout From All Devices
                        </button>

                        <button
                          type="button"
                          onClick={deleteAccount}
                          style={dangerSettingsItemStyle}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSection === "support" && (
                    <div style={sectionCardStyle}>
                      <div style={sectionHeaderRowStyle}>
                        <div>
                          <div style={sectionBadgeStyle}>SUPPORT</div>
                          <h3 style={sectionTitleStyle}>Help & Support</h3>
                          <p style={sectionDescStyle}>
                            Contact Genetic Breeds support team.
                          </p>
                        </div>
                      </div>

                      <div style={supportCardStyle}>
                        <div style={supportTitleStyle}>Email Support</div>
                        <a
                          href="mailto:geneticbreeds@gmail.com"
                          style={supportLinkStyle}
                        >
                          geneticbreeds@gmail.com
                        </a>
                        <p style={supportNoteStyle}>
                          Click the email above to open your mail app or Gmail.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 18px",
  background: "linear-gradient(135deg, #6b0f1a 0%, #b91327 55%, #d32f2f 100%)",
  position: "sticky",
  top: 0,
  zIndex: 1200,
  boxShadow: "0 8px 24px rgba(127, 29, 29, 0.22)",
};

const navLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const navRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "nowrap",
};

const menuButtonStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.12)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "4px",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

const menuLineStyle = {
  width: "16px",
  height: "2px",
  borderRadius: "999px",
  background: "#fff",
};

const navLinkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "800",
  fontSize: "13px",
  padding: "9px 14px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
};

const activeLinkStyle = {
  ...navLinkStyle,
  background: "#fff",
  color: "#991b1b",
  border: "1px solid rgba(255,255,255,0.28)",
};

const navAdminStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "900",
  fontSize: "13px",
  padding: "9px 14px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 6px 14px rgba(17,24,39,0.25)",
  transition: "all 0.2s ease",
};

const activeAdminStyle = {
  ...navAdminStyle,
  background: "linear-gradient(135deg, #000000 0%, #1f2937 100%)",
};

const navTextBtnStyle = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "13px",
  padding: "9px 14px",
  borderRadius: "12px",
};

const navBtnStyle = {
  background: "#fff",
  color: "#991b1b",
  border: "none",
  padding: "9px 14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "900",
  fontSize: "13px",
  boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
};

const inlineCountBadgeStyle = {
  marginLeft: "6px",
  background: "#ef4444",
  color: "#fff",
  borderRadius: "999px",
  padding: "2px 6px",
  fontSize: "11px",
  fontWeight: "700",
};

const notificationWrapStyle = {
  position: "relative",
};

const notificationBellButtonStyle = {
  position: "relative",
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.14)",
  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

const notificationBellButtonActiveStyle = {
  ...notificationBellButtonStyle,
  background: "#fff",
  border: "1px solid rgba(255,255,255,0.32)",
};

const notificationBellIconStyle = {
  fontSize: "18px",
  lineHeight: 1,
};

const notificationBadgeStyle = {
  position: "absolute",
  top: "-5px",
  right: "-5px",
  minWidth: "20px",
  height: "20px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 6px",
  fontSize: "10px",
  fontWeight: "900",
  boxShadow: "0 6px 14px rgba(185, 28, 28, 0.35)",
  border: "2px solid #fff",
};

const notificationDropdownStyle = {
  position: "absolute",
  top: "54px",
  right: 0,
  width: "min(420px, calc(100vw - 28px))",
  background: "#fff",
  border: "1px solid #fecaca",
  borderRadius: "20px",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
  overflow: "hidden",
  zIndex: 1400,
};

const notificationDropdownHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "10px",
  padding: "16px 16px 12px",
  background: "linear-gradient(135deg, #fff1f2 0%, #fff 100%)",
  borderBottom: "1px solid #ffe4e6",
};

const notificationDropdownLabelStyle = {
  fontSize: "10px",
  fontWeight: "900",
  letterSpacing: "0.8px",
  color: "#991b1b",
  marginBottom: "5px",
};

const notificationDropdownTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  color: "#111827",
};

const markAllReadBtnStyle = {
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#991b1b",
  borderRadius: "12px",
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "12px",
  whiteSpace: "nowrap",
};

const notificationSummaryRowStyle = {
  display: "flex",
  gap: "8px",
  padding: "12px 16px 0",
  flexWrap: "wrap",
};

const notificationSummaryPillStyle = {
  borderRadius: "999px",
  background: "#fff5f5",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
  padding: "6px 10px",
  fontSize: "11px",
  fontWeight: "800",
};

const notificationSummaryPillUnreadStyle = {
  ...notificationSummaryPillStyle,
  background: "#fef2f2",
  color: "#b91c1c",
};

const notificationListStyle = {
  maxHeight: "430px",
  overflowY: "auto",
  padding: "12px 16px 8px",
  display: "grid",
  gap: "10px",
};

const notificationStateCardStyle = {
  border: "1px dashed #fecaca",
  background: "#fffafa",
  borderRadius: "16px",
  padding: "18px 14px",
  textAlign: "center",
};

const emptyNotificationIconStyle = {
  fontSize: "24px",
  marginBottom: "8px",
};

const emptyNotificationTitleStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "14px",
  fontWeight: "900",
};

const emptyNotificationTextStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: 1.5,
};

const notificationItemStyle = {
  position: "relative",
  display: "flex",
  gap: "8px",
  alignItems: "stretch",
  border: "1px solid #f3d5d8",
  borderRadius: "16px",
  padding: "8px",
  transition: "all 0.2s ease",
};

const notificationItemButtonStyle = {
  flex: 1,
  minWidth: 0,
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  textAlign: "left",
  padding: 0,
  cursor: "pointer",
};

const notificationIconWrapStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const notificationIconStyle = {
  fontSize: "18px",
  lineHeight: 1,
};

const notificationContentStyle = {
  flex: 1,
  minWidth: 0,
};

const notificationTopRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "10px",
};

const notificationItemTitleStyle = {
  fontSize: "13px",
  fontWeight: "900",
  lineHeight: 1.4,
};

const notificationTimeStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#6b7280",
  whiteSpace: "nowrap",
};

const notificationMessageStyle = {
  marginTop: "5px",
  color: "#4b5563",
  fontSize: "12px",
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const notificationFooterRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  marginTop: "8px",
};

const notificationUnreadPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "#fee2e2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  padding: "4px 8px",
  fontSize: "10px",
  fontWeight: "900",
};

const notificationReadPillStyle = {
  ...notificationUnreadPillStyle,
  background: "#f3f4f6",
  color: "#4b5563",
  border: "1px solid #d1d5db",
};

const notificationViewTextStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#991b1b",
};

const notificationMarkBtnStyle = {
  alignSelf: "center",
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#991b1b",
  borderRadius: "10px",
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "11px",
  whiteSpace: "nowrap",
};

const notificationDropdownFooterStyle = {
  display: "flex",
  gap: "10px",
  justifyContent: "space-between",
  padding: "12px 16px 16px",
  borderTop: "1px solid #ffe4e6",
  background: "#fffafa",
};

const notificationFooterBtnStyle = {
  flex: 1,
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#991b1b",
  borderRadius: "12px",
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "12px",
};

const notificationFooterPrimaryBtnStyle = {
  ...notificationFooterBtnStyle,
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  border: "none",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.28)",
  zIndex: 1290,
};

const drawerStyle = {
  position: "fixed",
  top: 0,
  left: 0,

  // 👇 FULL SCREEN FIX
width: "min(720px, 96vw)",
maxWidth: "90vw",
height: "100vh",
overflow: "auto",

  background: "#fff7f7",
  zIndex: 1300,

  display: "flex",
  flexDirection: "column",

  // 👇 IMPORTANT: allow scrolling inside panel
};

const drawerHeaderStyle = {
  background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #ef4444 100%)",
  color: "#fff",
  padding: "18px 18px 14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const brandMiniStyle = {
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1px",
  opacity: 0.9,
  marginBottom: "6px",
};

const drawerTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "900",
};

const drawerSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: "rgba(255,255,255,0.85)",
};

const closeBtnStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.24)",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: "24px",
  lineHeight: 1,
  cursor: "pointer",
};

const drawerBodyStyle = {
  padding: "16px",
};

const emptyCardStyle = {
  background: "#fff",
  borderRadius: "16px",
  border: "1px solid #fecaca",
  padding: "16px",
};

const emptyTextStyle = {
  margin: 0,
  color: "#7f1d1d",
  fontWeight: "700",
  fontSize: "13px",
};

const drawerContentWrapStyle = {
  display: "grid",
  gridTemplateColumns: "185px 1fr",
  minHeight: 0,
  flex: 1,
};

const drawerSidebarStyle = {
  background: "#fff",
  borderRight: "1px solid #fee2e2",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const userMiniCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
  border: "1px solid #fecdd3",
  marginBottom: "4px",
};

const userAvatarStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  fontSize: "17px",
  flexShrink: 0,
};

const userMiniNameStyle = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#111827",
};

const userMiniCodeStyle = {
  marginTop: "3px",
  fontSize: "11px",
  fontWeight: "700",
  color: "#991b1b",
};

const sideItemStyle = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid transparent",
  background: "transparent",
  color: "#374151",
  fontWeight: "800",
  fontSize: "13px",
  cursor: "pointer",
};

const sideItemActiveStyle = {
  ...sideItemStyle,
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  boxShadow: "0 8px 18px rgba(127, 29, 29, 0.2)",
};

const drawerMainStyle = {
  padding: "14px",
  overflowY: "auto",
};

const sectionCardStyle = {
  background: "#fff",
  borderRadius: "18px",
  border: "1px solid #fee2e2",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
  padding: "14px",
};

const sectionHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  marginBottom: "14px",
};

const sectionBadgeStyle = {
  display: "inline-block",
  background: "#fff1f2",
  color: "#991b1b",
  border: "1px solid #fecdd3",
  borderRadius: "999px",
  padding: "4px 9px",
  fontSize: "10px",
  fontWeight: "900",
  letterSpacing: "0.4px",
  marginBottom: "7px",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "900",
  color: "#111827",
};

const sectionDescStyle = {
  margin: "5px 0 0",
  fontSize: "12px",
  color: "#6b7280",
  lineHeight: 1.5,
};

const statusPillStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const fieldGridStyleWithTopSpace = {
  ...fieldGridStyle,
  marginTop: "12px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#374151",
  marginBottom: "5px",
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #fca5a5",
  borderRadius: "10px",
  background: "#fff",
  boxSizing: "border-box",
  fontSize: "13px",
  outline: "none",
};

const fileInputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #fca5a5",
  borderRadius: "10px",
  background: "#fff",
  boxSizing: "border-box",
  fontSize: "12px",
};

const readOnlyInputStyle = {
  ...inputStyle,
  background: "#fff5f5",
  color: "#374151",
};

const readOnlyTextareaStyle = {
  ...readOnlyInputStyle,
  minHeight: "86px",
  resize: "vertical",
  fontFamily: "inherit",
};

const primaryActionBtnStyle = {
  marginTop: "12px",
  background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "12px",
};

const secondaryActionBtnStyle = {
  ...primaryActionBtnStyle,
  background: "#fff",
  color: "#991b1b",
  border: "1px solid #fca5a5",
};

const referralCardStyle = {
  background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
  border: "1px solid #fecdd3",
  borderRadius: "16px",
  padding: "14px",
};

const referralLabelStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#991b1b",
  marginBottom: "7px",
};

const referralCodeBoxStyle = {
  background: "#fff",
  border: "1px dashed #ef4444",
  borderRadius: "12px",
  padding: "10px",
  fontSize: "16px",
  fontWeight: "900",
  color: "#111827",
  textAlign: "center",
  letterSpacing: "0.7px",
};

const referralBtnRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
  marginTop: "12px",
};

const miniStatCardStyle = {
  background: "#fff",
  border: "1px solid #fee2e2",
  borderRadius: "14px",
  padding: "12px",
};

const miniStatLabelStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#6b7280",
  marginBottom: "5px",
};

const miniStatValueStyle = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#991b1b",
};

const miniStatValueStyleSmall = {
  fontSize: "15px",
  fontWeight: "900",
  color: "#991b1b",
  lineHeight: 1.4,
};

const settingsListStyle = {
  display: "grid",
  gap: "8px",
};

const settingsItemStyle = {
  width: "100%",
  textAlign: "left",
  padding: "11px 12px",
  borderRadius: "12px",
  border: "1px solid #fecaca",
  background: "#fff5f5",
  color: "#111827",
  fontWeight: "800",
  fontSize: "13px",
  cursor: "pointer",
};

const dangerSettingsItemStyle = {
  ...settingsItemStyle,
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fca5a5",
};

const inlinePasswordCardStyle = {
  marginTop: "6px",
  border: "1px solid #fecaca",
  background: "#fffafa",
  borderRadius: "14px",
  padding: "12px",
};

const inlinePasswordTitleStyle = {
  fontSize: "13px",
  fontWeight: "900",
  color: "#991b1b",
  marginBottom: "10px",
};

const inlineFormWrapStyle = {
  display: "grid",
  gap: "8px",
};

const inlineErrorTextStyle = {
  margin: "0 0 8px",
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: "700",
};

const inlineSuccessTextStyle = {
  margin: "0 0 8px",
  color: "#166534",
  fontSize: "12px",
  fontWeight: "700",
};

const timerTextStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#92400e",
};

const supportCardStyle = {
  background: "linear-gradient(135deg, #fff1f2 0%, #fff 100%)",
  border: "1px solid #fecdd3",
  borderRadius: "16px",
  padding: "16px",
};

const supportTitleStyle = {
  fontSize: "14px",
  fontWeight: "900",
  color: "#111827",
  marginBottom: "8px",
};

const supportLinkStyle = {
  color: "#b91c1c",
  fontWeight: "900",
  fontSize: "14px",
  textDecoration: "none",
  wordBreak: "break-word",
};

const supportNoteStyle = {
  margin: "8px 0 0",
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: 1.5,
};

const licenceLinkStyle = {
  display: "inline-block",
  marginTop: "12px",
  color: "#b91c1c",
  fontWeight: "800",
  textDecoration: "none",
  fontSize: "12px",
};

const softInfoBoxStyle = {
  marginTop: "12px",
  padding: "10px 12px",
  borderRadius: "10px",
  background: "#fff5f5",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
  fontWeight: "700",
  fontSize: "12px",
};

const pendingBoxStyle = {
  marginTop: "12px",
  background: "#fef3c7",
  border: "1px solid #fde68a",
  color: "#92400e",
  padding: "10px 12px",
  borderRadius: "10px",
  fontSize: "12px",
  lineHeight: 1.5,
};

const approvedBoxStyle = {
  marginTop: "12px",
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#166534",
  padding: "10px 12px",
  borderRadius: "10px",
  fontSize: "12px",
  lineHeight: 1.5,
};

const dangerBoxStyle = {
  marginTop: "12px",
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  padding: "10px 12px",
  borderRadius: "10px",
  fontSize: "12px",
  lineHeight: 1.5,
};

const infoTextStyle = {
  margin: 0,
  color: "#6b7280",
  fontWeight: "700",
  fontSize: "13px",
};

const errorTextStyle = {
  margin: 0,
  color: "#b91c1c",
  fontWeight: "700",
  fontSize: "13px",
};
