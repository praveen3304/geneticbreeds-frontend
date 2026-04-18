import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { startPayment } from "../utils/startPayment";
import {
  checkBannedBreedFrontend,
  getBannedBreedMessage
} from "../utils/bannedBreeds";


const DRAFT_KEY = "gb_post_ad_draft";
const API_BASE = "https://genetic-breeds-backend.onrender.com/api";
const MEMBERSHIP_PLANS = {
  india: [
    {
      key: "BASIC",
      name: "Basic Plan",
      adsCredits: 5,
      boostCredits: 2,
      validityDays: 60,
      originalPrice: 1250,
      offerPrice: 499,
      currency: "INR",
      badge: "Starter",
    },
    {
      key: "STANDARD",
      name: "Standard Plan",
      adsCredits: 10,
      boostCredits: 5,
      validityDays: 120,
      originalPrice: 2500,
      offerPrice: 999,
      currency: "INR",
      badge: "Popular",
    },
    {
      key: "PREMIUM",
      name: "Premium Plan",
      adsCredits: 15,
      boostCredits: 10,
      validityDays: 150,
      originalPrice: 3750,
      offerPrice: 1499,
      currency: "INR",
      badge: "Best Value",
    },
  ],
  global: [
    {
      key: "BASIC",
      name: "Basic Plan",
      adsCredits: 5,
      boostCredits: 2,
      validityDays: 60,
      originalPrice: 10,
      offerPrice: 6.99,
      currency: "USD",
      badge: "Starter",
    },
    {
      key: "STANDARD",
      name: "Standard Plan",
      adsCredits: 10,
      boostCredits: 5,
      validityDays: 120,
      originalPrice: 20,
      offerPrice: 12.99,
      currency: "USD",
      badge: "Popular",
    },
    {
      key: "PREMIUM",
      name: "Premium Plan",
      adsCredits: 15,
      boostCredits: 10,
      validityDays: 150,
      originalPrice: 30,
      offerPrice: 19.99,
      currency: "USD",
      badge: "Best Value",
    },
  ],
};

export default function PostAd() {
  const navigate = useNavigate();
  const submitLock = useRef(false);

  const user = JSON.parse(localStorage.getItem("gb_user") || "{}");
  const paymentRegionOverride = String(
    user.paymentRegionOverride || "auto"
  ).trim().toLowerCase();
  const country = user.country || "India";
  const normalizedCountry = String(country).trim().toLowerCase();

  const isIndiaUser =
    paymentRegionOverride === "india"
      ? true
      : paymentRegionOverride === "international"
      ? false
      : normalizedCountry === "india";

  const countryPlanKey = isIndiaUser ? "india" : "global";

  const [form, setForm] = useState({
    category: "",
    breed: "",
    gender: "",
    age: "",
    title: "",
    price: "",
    country: country,
    state: "",
    city: "",
    pincode: "",
    certificate: "",
    location: "",
    ownerName: "",
    phone: "",
    licence: "",
    images: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [formError, setFormError] = useState("");
  const [publishOptions, setPublishOptions] = useState(null);
  const [publishOptionsLoading, setPublishOptionsLoading] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedPublishMethod, setSelectedPublishMethod] = useState("pay_now");
  const [selectedMembershipPlan, setSelectedMembershipPlan] = useState("");
  const [selectedBoostDays, setSelectedBoostDays] = useState(0);
  const [boostModeOpen, setBoostModeOpen] = useState(false);
  const [publishActionError, setPublishActionError] = useState("");
  const [uiMessage, setUiMessage] = useState({ type: "", text: "" });
  const [membershipPlanOptions, setMembershipPlanOptions] = useState([]);

  // ── Banned breed popup state
  const [bannedPopup, setBannedPopup] = useState({
    open: false,
    type: "",        // "dog" | "wildlife"
    matchedBreed: "",
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setForm((prev) => ({
          ...prev,
          ...parsed,
          country: parsed.country || country,
          images: [],
        }));
      } catch (err) {
        console.error("Draft load error:", err);
      }
    }
  }, [country]);

  useEffect(() => {
    const draftData = { ...form };
    delete draftData.images;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [form]);

  const imagePreviews = useMemo(() => {
    return form.images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [form.images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews]);

  const currencySymbol =
    country === "India"
      ? "₹"
      : country === "UK"
      ? "£"
      : country === "UAE"
      ? "AED"
      : "$";

  const normalizeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const normalizeCurrency = (value, fallback = isIndiaUser ? "INR" : "USD") => {
    const text = String(value || "").trim().toUpperCase();
    return text || fallback;
  };

  const formatAmount = (value) => {
    const amount = normalizeNumber(value, 0);
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  };

  const normalizeMembershipPlan = (plan, fallbackCurrency) => ({
    key: String(plan?.key || plan?.planKey || "").trim(),
    name: String(plan?.name || "").trim(),
    adsCredits: normalizeNumber(plan?.adsCredits ?? plan?.totalPosts, 0),
    boostCredits: normalizeNumber(plan?.boostCredits ?? plan?.totalBoosts, 0),
    validityDays: normalizeNumber(plan?.validityDays ?? plan?.durationDays, 0),
    originalPrice: normalizeNumber(plan?.originalPrice, 0),
    offerPrice: normalizeNumber(plan?.offerPrice, 0),
    currency: normalizeCurrency(plan?.currency, fallbackCurrency),
    badge: String(plan?.badge || "").trim(),
  });

  const membershipPlans = useMemo(() => {
    return Array.isArray(membershipPlanOptions) ? membershipPlanOptions : [];
  }, [membershipPlanOptions]);

  const boostPlans = useMemo(() => {
    const boostConfig = publishOptions?.boostPricing || {};
    const currency = normalizeCurrency(
      boostConfig.currency || publishOptions?.payNow?.currency,
      isIndiaUser ? "INR" : "USD"
    );
    return [
      {
        key: "NO_BOOST",
        days: 0,
        name: "No Boost",
        price: 0,
        currency,
        description: "Continue without additional visibility.",
      },
      {
        key: "BOOST_7",
        days: 7,
        name: "🔥 7 Days Boost",
        price: normalizeNumber(boostConfig[7], 0),
        currency,
        description: "Higher visibility for 7 days",
      },
      {
        key: "BOOST_14",
        days: 14,
        name: "🚀 14 Days Boost",
        price: normalizeNumber(boostConfig[14], 0),
        currency,
        description: "Stronger visibility for 14 days",
      },
      {
        key: "BOOST_30",
        days: 30,
        name: "⭐ 30 Days Boost",
        price: normalizeNumber(boostConfig[30], 0),
        currency,
        description: "Maximum visibility for 30 days",
      },
    ];
  }, [publishOptions, isIndiaUser]);

  const selectedPlanData = useMemo(() => {
    return membershipPlans.find((plan) => plan.key === selectedMembershipPlan) || null;
  }, [membershipPlans, selectedMembershipPlan]);

  const selectedBoostPlan = useMemo(() => {
    return boostPlans.find((plan) => plan.days === selectedBoostDays) || boostPlans[0] || null;
  }, [boostPlans, selectedBoostDays]);

  const publishMethods = useMemo(() => {
    if (!publishOptions) return [];
    const payNowCurrency = normalizeCurrency(
      publishOptions?.payNow?.currency,
      isIndiaUser ? "INR" : "USD"
    );
    const payNowAmount = normalizeNumber(publishOptions?.payNow?.amount, 0);
    const payNowOriginalAmount = normalizeNumber(publishOptions?.payNow?.originalAmount, 0);
    return [
      {
        key: "pay_now",
        title: "Pay Now",
        subtitle:
          publishOptions?.payNow && payNowAmount > 0
            ? `Offer ${payNowCurrency} ${formatAmount(payNowAmount)}`
            : "Instant payment publishing",
        originalAmount: payNowOriginalAmount > 0 ? payNowOriginalAmount : null,
        description: "Publish this ad instantly using direct payment.",
        available: true,
        accent: "#b91c1c",
        bg: "#fff7f7",
        border: "#fecaca",
      },
      {
        key: "referral_credit",
        title: "Post Via Referral",
        subtitle: "",
        originalAmount: null,
        description: "",
        available: (publishOptions.referralCredits || 0) > 0,
        unavailableMessage: "No referral code available. Continue with Pay Now.",
        accent: "#1d4ed8",
        bg: "#eff6ff",
        border: "#bfdbfe",
      },
      {
        key: "membership_credit",
        title: "Post Via Membership",
        subtitle: "",
        originalAmount: null,
        description: "",
        available: (publishOptions.membershipPostsRemaining || 0) > 0,
        unavailableMessage: "No membership post credit available right now.",
        accent: "#7c3aed",
        bg: "#f5f3ff",
        border: "#ddd6fe",
      },
      {
        key: "buy_membership",
        title: "Buy Membership",
        subtitle: "Get post credits and boost credits",
        originalAmount: null,
        description: "Best option for regular breeders and repeat sellers.",
        available: true,
        accent: "#a16207",
        bg: "#fffbeb",
        border: "#fde68a",
      },
    ];
  }, [publishOptions, isIndiaUser]);

  const selectedMethodData = useMemo(() => {
    return publishMethods.find((m) => m.key === selectedPublishMethod) || null;
  }, [publishMethods, selectedPublishMethod]);

  const checkoutAmount = useMemo(() => {
    if (selectedPublishMethod === "buy_membership" && selectedPlanData) {
      return {
        amount: normalizeNumber(selectedPlanData.offerPrice, 0),
        originalAmount: normalizeNumber(selectedPlanData.originalPrice, 0),
        currency: normalizeCurrency(selectedPlanData.currency, isIndiaUser ? "INR" : "USD"),
      };
    }
    if (selectedPublishMethod === "pay_now" && publishOptions?.payNow) {
      return {
        amount: normalizeNumber(publishOptions?.payNow?.amount, 0),
        originalAmount: normalizeNumber(publishOptions?.payNow?.originalAmount, 0),
        currency: normalizeCurrency(publishOptions?.payNow?.currency, isIndiaUser ? "INR" : "USD"),
      };
    }
    return {
      amount: 0,
      originalAmount: 0,
      currency: normalizeCurrency("", isIndiaUser ? "INR" : "USD"),
    };
  }, [selectedPublishMethod, selectedPlanData, publishOptions, isIndiaUser]);

  const totalPayable = useMemo(() => {
    let amount = normalizeNumber(checkoutAmount.amount, 0);
    if (selectedBoostPlan) {
      amount += normalizeNumber(selectedBoostPlan.price, 0);
    }
    return amount;
  }, [checkoutAmount, selectedBoostPlan]);

  const setInlineMessage = (type, text) => {
    setUiMessage({ type, text });
    setTimeout(() => {
      setUiMessage((current) => (current.text === text ? { type: "", text: "" } : current));
    }, 3500);
  };

  const closePublishModal = () => {
    setPublishModalOpen(false);
    setSelectedPublishMethod("pay_now");
    setSelectedMembershipPlan("");
    setSelectedBoostDays(0);
    setBoostModeOpen(false);
    setPublishActionError("");
    submitLock.current = false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length >= 7) {
        setTitleError("Phone numbers are not allowed in title");
      } else {
        setTitleError("");
      }
    }
    if (formError) setFormError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setForm((prev) => ({ ...prev, images: files }));
    if (files.length > 0 && formError) setFormError("");
  };

  const resetFormState = () => {
    setForm({
      category: "",
      breed: "",
      gender: "",
      age: "",
      title: "",
      price: "",
      country: country,
      state: "",
      city: "",
      pincode: "",
      certificate: "",
      location: "",
      ownerName: "",
      phone: "",
      licence: "",
      images: [],
    });
    setTitleError("");
    setFormError("");
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    resetFormState();
    setInlineMessage("success", "Draft cleared successfully.");
  };

  const generateRequestId = () => {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  };

  const submitAd = async ({ paymentId = null, publishMethod = "" } = {}) => {
    const token = localStorage.getItem("gb_token");
    const formData = new FormData();
    formData.append("category", form.category);
    formData.append("breed", form.breed);
    formData.append("gender", form.gender);
    formData.append("age", form.age);
    formData.append("title", form.title);
    formData.append("price", form.price);
    formData.append("country", form.country || country);
    formData.append("state", form.state);
    formData.append("city", form.city);
    formData.append("pincode", form.pincode);
    formData.append("certificate", form.certificate);
    formData.append("location", form.location);
    formData.append("ownerName", form.ownerName);
    formData.append("phone", form.phone);
    formData.append("licence", form.licence);
    formData.append("clientRequestId", generateRequestId());
    if (publishMethod) formData.append("publishMethod", publishMethod);
    formData.append("boostDays", String(selectedBoostDays || 0));
    if (paymentId) formData.append("paymentId", paymentId);
    form.images.forEach((image) => formData.append("images", image));
    const res = await fetch(`${API_BASE}/ads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("gb_token")}` },
      body: formData,
    });
    return res.json();
  };

  const fetchPublishOptions = async () => {
    const token = localStorage.getItem("gb_token");
    const res = await fetch(`${API_BASE}/ads/publish-options`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { error: "Failed to load publish options" };
    return res.json();
  };

  const fetchMembershipPlans = async () => {
    const token = localStorage.getItem("gb_token");
    const res = await fetch(`${API_BASE}/payments/plans`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.plans)) return data.plans;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const extractCreatedAdId = (data) => {
    if (!data) return null;
    return (
      data?.adId ||
      data?._id ||
      data?.id ||
      data?.ad?._id ||
      data?.ad?.id ||
      data?.result?.adId ||
      data?.result?._id ||
      data?.result?.ad?._id ||
      null
    );
  };

  const finalizeSuccessfulPublish = () => {
    localStorage.removeItem(DRAFT_KEY);
    resetFormState();
    setPublishModalOpen(false);
    setPublishOptions(null);
    setSelectedPublishMethod("pay_now");
    setSelectedMembershipPlan("");
    setSelectedBoostDays(0);
    setBoostModeOpen(false);
    setInlineMessage("success", "Pet posted successfully.");
    navigate("/my-ads");
  };

  const handleBoostAfterPublish = async (createdAdId) => {
    if (!selectedBoostPlan || normalizeNumber(selectedBoostPlan.days, 0) <= 0) {
      finalizeSuccessfulPublish();
      return;
    }
    if (!createdAdId) {
      throw new Error("Ad created, but boost could not start because ad ID was not found.");
    }
    const token = localStorage.getItem("gb_token");
    await startPayment({
      token,
      paymentFor: "boost",
      boostDays: normalizeNumber(selectedBoostPlan.days, 0),
      adId: createdAdId,
      onSuccess: () => { finalizeSuccessfulPublish(); },
      onError: (error) => { throw error || new Error("Boost payment failed"); },
    });
  };

  const handleDirectPublish = async () => {
    const token = localStorage.getItem("gb_token");
    await startPayment({
      token,
      paymentFor: "ad",
      onSuccess: async (verifyData) => {
        const paymentId = verifyData?.payment?._id || null;
        const data = await submitAd({ paymentId, publishMethod: "pay_now" });
        if (data.error) throw new Error(data.error || "Failed to post pet");
        const createdAdId = extractCreatedAdId(data);
        await handleBoostAfterPublish(createdAdId);
      },
      onError: (error) => { throw error || new Error("Payment failed"); },
    });
  };

  const handleMembershipPurchaseAndPublish = async () => {
    const token = localStorage.getItem("gb_token");
    if (!selectedMembershipPlan) throw new Error("Please select a membership plan first.");
    await startPayment({
      token,
      paymentFor: "membership",
      planKey: selectedMembershipPlan,
      onSuccess: async (verifyData) => {
        const paymentId = verifyData?.payment?._id || null;
        const data = await submitAd({ paymentId, publishMethod: "membership_credit" });
        if (data.error) throw new Error(data.error || "Failed to post pet using membership");
        const createdAdId = extractCreatedAdId(data);
        await handleBoostAfterPublish(createdAdId);
      },
      onError: (error) => { throw error || new Error("Membership payment failed"); },
    });
  };

  const handleCreditPublish = async (method) => {
    const data = await submitAd({ publishMethod: method });
    if (data.error) throw new Error(data.error || "Failed to post pet");
    const createdAdId = extractCreatedAdId(data);
    await handleBoostAfterPublish(createdAdId);
  };

  const finalizePublish = async () => {
    if (!selectedPublishMethod) {
      setPublishActionError("Please select one publish option to continue.");
      return;
    }
    if (!selectedMethodData?.available) {
      setPublishActionError(selectedMethodData?.unavailableMessage || "This option is not available.");
      return;
    }
    if (selectedPublishMethod === "buy_membership" && !selectedMembershipPlan) {
      setPublishActionError("Please select a membership plan first.");
      return;
    }
    setPublishActionError("");
    setSubmitting(true);
    try {
      if (selectedPublishMethod === "pay_now") {
        await handleDirectPublish();
      } else if (selectedPublishMethod === "buy_membership") {
        await handleMembershipPurchaseAndPublish();
      } else if (selectedPublishMethod === "membership_credit") {
        await handleCreditPublish("membership_credit");
      } else if (selectedPublishMethod === "referral_credit") {
        await handleCreditPublish("referral_credit");
      } else {
        throw new Error("Invalid publish method selected");
      }
    } catch (err) {
      console.error("Finalize publish error:", err);
      setPublishActionError(err.message || "Server error");
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  // ── FIXED handleSubmit — properly async, breed check with country awareness
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLock.current || submitting || publishOptionsLoading) return;

    setFormError("");

    // ── Title phone number check
    const digitsOnly = form.title.replace(/\D/g, "");
    if (digitsOnly.length >= 7) {
      setTitleError("Phone numbers are not allowed in title");
      return;
    }

    // ── Banned breed / illegal wildlife check (country-aware)
const result = checkBannedBreedFrontend(form.breed, form.country || country);

if (result.banned) {
  const message = getBannedBreedMessage(
    result.matchedBreed,
    form.country || country
  );

  setFormError(message); // shows error in UI
  return;
}

    // ── Image check
    if (!form.images || form.images.length === 0) {
      setFormError("Please upload at least one image before posting.");
      return;
    }

    const token = localStorage.getItem("gb_token");
    if (!token) {
      setInlineMessage("error", "Please login first.");
      return;
    }

    submitLock.current = true;
    setPublishOptionsLoading(true);
    setPublishActionError("");

    try {
      const options = await fetchPublishOptions();
      console.log("PUBLISH OPTIONS:", options);

// 🔴 Handle banned breed from backend
if (options?.error === "BANNED_BREED") {
  const message = getBannedBreedMessage(
    options.matchedBreed,
    options.country
  );

  setFormError(message);

  submitLock.current = false;
  setPublishOptionsLoading(false);
  return;
}

// ⚠️ Normal errors
if (options?.error) {
  setInlineMessage("error", options.error || "Failed to load publish options");
  submitLock.current = false;
  setPublishOptionsLoading(false);
  return;
}
      const plans = await fetchMembershipPlans();
      const defaultPlans = MEMBERSHIP_PLANS[countryPlanKey] || [];
      const payNowCurrency = normalizeCurrency(
        options?.payNow?.currency,
        isIndiaUser ? "INR" : "USD"
      );

      const formattedPlans = Array.isArray(plans)
        ? plans
            .map((plan) => normalizeMembershipPlan(plan, payNowCurrency))
            .filter((plan) => plan.key && plan.name)
        : [];

      const finalPlans =
        formattedPlans.length > 0 &&
        formattedPlans.some((plan) => normalizeNumber(plan.offerPrice, 0) > 0)
          ? formattedPlans
          : defaultPlans.map((plan) => normalizeMembershipPlan(plan, payNowCurrency));

      console.log("PLANS:", finalPlans);

      setPublishOptions(options);
      setMembershipPlanOptions(finalPlans);

      if (options.licenceBlocked) {
        setInlineMessage("error", options.licenceMessage || "Posting is blocked");
        submitLock.current = false;
        setPublishOptionsLoading(false);
        return;
      }

      setSelectedPublishMethod("pay_now");
      setSelectedMembershipPlan("");
      setSelectedBoostDays(0);
      setBoostModeOpen(false);
      setPublishModalOpen(true);
    } catch (err) {
      console.error("Publish options error:", err);
      setInlineMessage("error", "Failed to load publish options");
      submitLock.current = false;
    } finally {
      setPublishOptionsLoading(false);
    }
  };

  // ── Styles
  const pageStyle = {
    minHeight: "100vh",
    background: "#f7f7fb",
    padding: "32px 20px 60px",
  };

  const wrapperStyle = {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
    gap: "24px",
    alignItems: "start",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "22px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  };

  const heroStyle = {
    background: "linear-gradient(135deg, #fff4c7, #f7d774)",
    color: "#2c1a5a",
    padding: "32px",
  };

  const badgeStyle = {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(44, 26, 90, 0.08)",
    color: "#5b4b2a",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.4px",
    marginBottom: "14px",
  };

  const formBodyStyle = { padding: "30px" };

  const sectionTitleStyle = {
    margin: "0 0 16px",
    fontSize: "19px",
    fontWeight: "800",
    color: "#111827",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  };

  const fieldStyle = { display: "flex", flexDirection: "column" };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  const sideCardStyle = {
    ...cardStyle,
    padding: "24px",
    position: "sticky",
    top: "24px",
  };

  const submitButtonStyle = {
    width: "100%",
    background:
      submitting || publishOptionsLoading
        ? "#f3a7b1"
        : "linear-gradient(135deg, #7a0016, #b3122a)",
    color: "#fff",
    padding: "15px 18px",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "800",
    cursor: submitting || publishOptionsLoading ? "not-allowed" : "pointer",
    transition: "0.2s ease",
    boxShadow: "0 10px 20px rgba(179, 18, 42, 0.22)",
  };

  const secondaryButtonStyle = {
    width: "100%",
    background: "#ffffff",
    color: "#1f2937",
    padding: "14px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  };

  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.58)",
    backdropFilter: "blur(6px)",
    zIndex: 1500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
  };

  const modalCardStyle = {
    width: "min(1040px, 100%)",
    maxHeight: "88vh",
    overflowY: "auto",
    overflowX: "hidden",
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.26)",
  };

  const modalHeaderStyle = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "linear-gradient(135deg, #7a0016 0%, #b3122a 100%)",
    color: "#fff",
    padding: "18px 22px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  };

  const checkoutWrapStyle = {
    display: "grid",
    gridTemplateColumns: "1.06fr 0.94fr",
    gap: "16px",
    padding: "16px",
    alignItems: "start",
  };

  const sectionCardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    background: "#fff",
    overflow: "hidden",
  };

  const compactHeadStyle = {
    padding: "12px 14px",
    borderBottom: "1px solid #eef2f7",
    background: "#fafafa",
  };

  const listWrapStyle = {
    padding: "14px",
    display: "grid",
    gap: "10px",
  };

  const summaryPanelStyle = {
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    position: "sticky",
    top: "84px",
  };

  const inlineMessageStyle = {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 2000,
    minWidth: "280px",
    maxWidth: "420px",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "#fff",
    fontWeight: "800",
    fontSize: "14px",
    boxShadow: "0 16px 30px rgba(15, 23, 42, 0.2)",
    background: uiMessage.type === "error" ? "#dc2626" : "#15803d",
  };

  const localFormErrorStyle = {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "12px",
    fontWeight: "700",
    fontSize: "13px",
    lineHeight: 1.5,
  };

  // ── Banned popup message builder
  const bannedPopupMessage =
    bannedPopup.type === "wildlife"
      ? {
          icon: "🚫",
          title: "Illegal Wildlife — Not Allowed",
          body: `"${bannedPopup.matchedBreed}" is a protected or illegal wildlife species. Trading, buying, or selling this animal is strictly prohibited under wildlife protection laws.`,
          sub: "If found guilty, this may result in legal prosecution under the Wildlife Protection Act or CITES regulations.",
          color: "#7c3aed",
          bg: "#f5f3ff",
          border: "#ddd6fe",
          btnColor: "#7c3aed",
        }
      : {
          icon: "⚠️",
          title: "Banned Breed — Not Allowed",
          body: `"${bannedPopup.matchedBreed}" is a banned or restricted breed in ${form.country || country}. Selling or buying this breed is illegal under local animal regulations.`,
          sub: "Please remove this breed from your listing. You may contact local authorities for more information.",
          color: "#b91c1c",
          bg: "#fff1f2",
          border: "#fecaca",
          btnColor: "#b91c1c",
        };

  return (
    <>
      {uiMessage.text ? <div style={inlineMessageStyle}>{uiMessage.text}</div> : null}

      {/* ── Banned Breed Popup ── */}
      {bannedPopup.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "min(500px, 100%)",
              background: "#fff",
              borderRadius: "24px",
              border: `1px solid ${bannedPopupMessage.border}`,
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: bannedPopupMessage.bg,
                borderBottom: `1px solid ${bannedPopupMessage.border}`,
                padding: "22px 22px 18px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                {bannedPopupMessage.icon}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "900",
                  color: bannedPopupMessage.color,
                  lineHeight: 1.2,
                }}
              >
                {bannedPopupMessage.title}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "22px" }}>
              <div
                style={{
                  background: bannedPopupMessage.bg,
                  border: `1px solid ${bannedPopupMessage.border}`,
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginBottom: "14px",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: 1.7,
                }}
              >
                {bannedPopupMessage.body}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                  fontWeight: "600",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                }}
              >
                {bannedPopupMessage.sub}
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setBannedPopup({ open: false, type: "", matchedBreed: "" });
                    // Clear breed field so user can correct it
                    setForm((prev) => ({ ...prev, breed: "" }));
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${bannedPopupMessage.color}, ${bannedPopupMessage.btnColor})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "13px 18px",
                    fontSize: "14px",
                    fontWeight: "900",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Understood — Change Breed
                </button>

                <button
                  type="button"
                  onClick={() => setBannedPopup({ open: false, type: "", matchedBreed: "" })}
                  style={{
                    background: "#fff",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={pageStyle}>
        <div style={wrapperStyle}>
          <div style={cardStyle}>
            <div style={heroStyle}>
              <div style={badgeStyle}>SELLER PANEL</div>
              <h1 style={{ margin: 0, fontSize: "34px", lineHeight: 1.1, fontWeight: "800" }}>
                Post Your Pet
              </h1>
              <p style={{ margin: "12px 0 0", fontSize: "15px", lineHeight: 1.7, color: "#5b4b2a", maxWidth: "760px" }}>
                Create a clean, trusted, professional-looking listing with pet details, seller information, location, and photos.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={formBodyStyle}>
              <div style={{ marginBottom: "28px" }}>
                <h2 style={sectionTitleStyle}>Pet Information</h2>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} required style={inputStyle}>
                      <option value="">Select Category</option>
                      <option value="Dogs">Dogs</option>
                      <option value="Cats">Cats</option>
                      <option value="Birds">Birds</option>
                      <option value="Horse">Horse</option>
                      <option value="Cow">Cow</option>
                      <option value="Exotics">Exotics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Breed</label>
                    <input
                      type="text"
                      name="breed"
                      placeholder="Rajapalayam, Labrador..."
                      value={form.breed}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required style={inputStyle}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Age</label>
                    <input type="text" name="age" placeholder="8 months" value={form.age} onChange={handleChange} required style={inputStyle} />
                  </div>

                  <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Healthy Rajapalayam puppy for sale"
                      value={form.title}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, border: titleError ? "1px solid #dc2626" : "1px solid #d1d5db" }}
                    />
                    {titleError && (
                      <span style={{ marginTop: "6px", color: "#dc2626", fontSize: "13px", fontWeight: "600" }}>
                        {titleError}
                      </span>
                    )}
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Price ({currencySymbol})</label>
                    <input type="number" name="price" placeholder="20000" value={form.price} onChange={handleChange} required style={inputStyle} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Certificate</label>
                    <select name="certificate" value={form.certificate} onChange={handleChange} required style={inputStyle}>
                      <option value="">Select Certificate Status</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Without Certificate">Without Certificate</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <h2 style={sectionTitleStyle}>Location Details</h2>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Country</label>
                    <input type="text" name="country" value={form.country} readOnly style={{ ...inputStyle, background: "#f3f4f6" }} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>State</label>
                    <input type="text" name="state" placeholder="Tamil Nadu" value={form.state} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>City</label>
                    <input type="text" name="city" placeholder="Chennai" value={form.city} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Pincode</label>
                    <input type="text" name="pincode" placeholder="600001" value={form.pincode} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Location</label>
                    <input type="text" name="location" placeholder="Street / Area / Nearby landmark" value={form.location} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <h2 style={sectionTitleStyle}>Seller Information</h2>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Owner Name</label>
                    <input type="text" name="ownerName" placeholder="Your full name" value={form.ownerName} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Phone</label>
                    <input type="text" name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Licence</label>
                    <input type="text" name="licence" placeholder="Licence number" value={form.licence} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <h2 style={sectionTitleStyle}>Photos</h2>
                <div style={{ border: "1px dashed #cbd5e1", borderRadius: "16px", padding: "18px", background: "#f8fafc" }}>
                  <label style={{ ...labelStyle, marginBottom: "10px" }}>
                    Upload up to 5 images (minimum 1 image required)
                  </label>
                  <input type="file" name="images" accept="image/*" multiple onChange={handleImageChange} disabled={submitting || publishOptionsLoading} />
                  {form.images.length > 0 && (
                    <>
                      <p style={{ marginTop: "12px", marginBottom: "12px", color: "#475569", fontSize: "14px", fontWeight: "600" }}>
                        {form.images.length} image(s) selected
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 110px))", gap: "12px" }}>
                        {imagePreviews.map((item, index) => (
                          <div key={index} style={{ width: "110px", height: "110px", borderRadius: "12px", overflow: "hidden", border: "1px solid #d1d5db", background: "#fff" }}>
                            <img src={item.url} alt={`preview-${index}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {formError ? <div style={localFormErrorStyle}>{formError}</div> : null}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <button type="button" onClick={clearDraft} style={secondaryButtonStyle}>
                  Clear Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting || publishOptionsLoading}
                  style={submitButtonStyle}
                  onMouseOver={(e) => {
                    if (!submitting && !publishOptionsLoading)
                      e.currentTarget.style.background = "linear-gradient(135deg, #6a0012, #9f1024)";
                  }}
                  onMouseOut={(e) => {
                    if (!submitting && !publishOptionsLoading)
                      e.currentTarget.style.background = "linear-gradient(135deg, #7a0016, #b3122a)";
                  }}
                >
                  {publishOptionsLoading ? "Preparing Checkout..." : submitting ? "Processing..." : "Post Pet"}
                </button>
              </div>
            </form>
          </div>

          <div style={sideCardStyle}>
            <div style={{ background: "#fff1f2", border: "1px solid #dc2626", padding: "14px", borderRadius: "12px", marginBottom: country === "India" ? "14px" : "0", color: "#7f1d1d", fontWeight: "600", lineHeight: "1.6", fontSize: "13px" }}>
              <strong>Important Notice:</strong>
              <br />
              Unlicensed users can post up to 5 ads within a 5-month period.
              <br />
              Upgrade or update your breeder licence to unlock unlimited ad posting and additional features.
              <br />
              Licensed sellers get higher trust visibility and better buyer reach.
            </div>

            {country === "India" && (
              <div style={{ background: "linear-gradient(135deg, #fff8dc, #fff4c7)", border: "1px solid #f7d774", padding: "14px", borderRadius: "12px", lineHeight: "1.6", fontSize: "13px" }}>
                <strong style={{ display: "block", fontSize: "16px", marginBottom: "6px", color: "#111827" }}>
                  Apply for Licence (India)
                </strong>
                <div style={{ color: "#1f2937" }}>
                  You can apply for Breeder Licence or Pet Shop Licence through your State Animal Welfare Board or Local Municipal Authority.
                </div>
                <div style={{ marginTop: "12px", color: "#111827", fontWeight: "700" }}>Animal Welfare Board of India:</div>
                <a href="https://awbi.gov.in" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "4px", color: "#7a0016", fontWeight: "700", textDecoration: "none", wordBreak: "break-word", fontSize: "13px" }}>
                  https://awbi.gov.in
                </a>
                <div style={{ marginTop: "12px", color: "#111827", fontWeight: "700" }}>You may also contact:</div>
                <div style={{ marginTop: "6px", color: "#1f2937" }}>
                  • State Animal Welfare Board<br />
                  • Municipal Corporation / Local Authority<br />
                  • Animal Husbandry Department
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {publishModalOpen && publishOptions && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ ...modalHeaderStyle, display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", lineHeight: 1.1 }}>
                  Complete Your Publishing
                </h2>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.92)", fontSize: "14px", lineHeight: 1.6, maxWidth: "780px" }}>
                  Choose your posting method, add boost if needed, and review the final payable amount before continuing.
                </p>
              </div>
              <button
                type="button"
                onClick={closePublishModal}
                style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "24px", lineHeight: 1, cursor: "pointer", flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            <div style={checkoutWrapStyle}>
              <div style={{ display: "grid", gap: "14px" }}>
                {publishActionError ? (
                  <div style={{ padding: "12px 14px", borderRadius: "14px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#b91c1c", fontWeight: "700", fontSize: "13px" }}>
                    {publishActionError}
                  </div>
                ) : null}

                <div style={sectionCardStyle}>
                  <div style={listWrapStyle}>
                    {publishMethods.map((method) => {
                      const active = selectedPublishMethod === method.key;
                      return (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => {
                            if (!method.available) {
                              setPublishActionError(method.unavailableMessage || "This option is not available.");
                              if (method.key === "referral_credit") setSelectedPublishMethod("pay_now");
                              return;
                            }
                            setSelectedPublishMethod(method.key);
                            setPublishActionError("");
                          }}
                          style={{
                            width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: "16px",
                            border: active ? `2px solid ${method.accent}` : `1px solid ${method.border}`,
                            background: method.bg,
                            cursor: method.available ? "pointer" : "not-allowed",
                            opacity: method.available ? 1 : 0.55,
                            boxShadow: active ? "0 8px 20px rgba(15, 23, 42, 0.06)" : "none",
                            transition: "0.18s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: "18px", fontWeight: "900", color: method.accent, marginBottom: "4px", lineHeight: 1.1 }}>{method.title}</div>
                              {method.subtitle ? <div style={{ fontSize: "14px", color: "#111827", fontWeight: "700", lineHeight: 1.45 }}>{method.subtitle}</div> : null}
                              {method.originalAmount ? <div style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280", textDecoration: "line-through", fontWeight: "700" }}>{checkoutAmount.currency} {formatAmount(method.originalAmount)}</div> : null}
                              {method.description ? <div style={{ marginTop: "6px", fontSize: "12px", color: "#4b5563", fontWeight: "700" }}>{method.description}</div> : null}
                              {!method.available ? <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: "800", color: "#991b1b" }}>{method.unavailableMessage || "Not available right now"}</div> : null}
                            </div>
                            <div style={{ width: "22px", height: "22px", borderRadius: "999px", border: `2px solid ${method.accent}`, background: active ? method.accent : "#fff", flexShrink: 0, marginTop: "4px" }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedPublishMethod === "buy_membership" && (
                  <div style={sectionCardStyle}>
                    <div style={compactHeadStyle}>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: "#111827" }}>Membership Plans</div>
                    </div>
                    <div style={listWrapStyle}>
                      {membershipPlans.map((plan) => {
                        const active = selectedMembershipPlan === plan.key;
                        return (
                          <div key={plan.key} style={{ border: active ? "2px solid #a16207" : "1px solid #f3e8b5", borderRadius: "16px", background: active ? "#fffaf0" : "#ffffff", overflow: "hidden" }}>
                            <button
                              type="button"
                              onClick={() => { setSelectedMembershipPlan(plan.key); setPublishActionError(""); }}
                              style={{ width: "100%", textAlign: "left", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer" }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", background: "#fff7e6", color: "#92400e", fontWeight: "800", fontSize: "10px", marginBottom: "8px" }}>{plan.badge}</div>
                                  <div style={{ fontSize: "18px", fontWeight: "900", color: "#92400e", marginBottom: "4px" }}>{plan.name}</div>
                                  <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, fontWeight: "700" }}>
                                    {plan.adsCredits} Ad Credits • {plan.boostCredits} Boost Credits • {plan.validityDays} Days
                                  </div>
                                </div>
                                <div style={{ width: "22px", height: "22px", borderRadius: "999px", border: "2px solid #a16207", background: active ? "#a16207" : "#fff", flexShrink: 0, marginTop: "4px" }} />
                              </div>
                            </button>
                            <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f3e8b5", background: active ? "#fffdf7" : "#fff" }}>
                              <div style={{ paddingTop: "12px", fontSize: "12px", color: "#6b7280", textDecoration: "line-through", fontWeight: "700" }}>
                                {plan.currency} {formatAmount(plan.originalPrice)}
                              </div>
                              <div style={{ marginTop: "4px", fontSize: "18px", color: "#111827", fontWeight: "900" }}>
                                Offer {plan.currency} {formatAmount(plan.offerPrice)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={sectionCardStyle}>
                  <div style={listWrapStyle}>
                    <button
                      type="button"
                      onClick={() => setBoostModeOpen((prev) => !prev)}
                      style={{ width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: "16px", border: boostModeOpen ? "2px solid #0f766e" : "1px solid #cbd5e1", background: boostModeOpen ? "#f0fdfa" : "#ffffff", cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "17px", fontWeight: "900", color: "#0f766e", marginBottom: "4px" }}>Add Boost Post</div>
                          <div style={{ fontSize: "12px", color: "#374151", fontWeight: "700" }}>Click to view available boost plans.</div>
                        </div>
                        <div style={{ width: "22px", height: "22px", borderRadius: "999px", border: "2px solid #0f766e", background: boostModeOpen ? "#0f766e" : "#fff", flexShrink: 0, marginTop: "4px" }} />
                      </div>
                    </button>

                    {boostModeOpen && boostPlans.map((boost) => {
                      const active = selectedBoostDays === boost.days;
                      return (
                        <div key={boost.key} style={{ border: active ? "2px solid #0f766e" : "1px solid #cbd5e1", borderRadius: "16px", background: active ? "#f0fdfa" : "#ffffff", overflow: "hidden" }}>
                          <button type="button" onClick={() => setSelectedBoostDays(boost.days)} style={{ width: "100%", textAlign: "left", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                              <div>
                                <div style={{ fontSize: "17px", fontWeight: "900", color: "#0f766e", marginBottom: "4px" }}>{boost.name}</div>
                              </div>
                              <div style={{ width: "22px", height: "22px", borderRadius: "999px", border: "2px solid #0f766e", background: active ? "#0f766e" : "#fff", flexShrink: 0, marginTop: "4px" }} />
                            </div>
                          </button>
                          <div style={{ padding: "0 16px 14px", borderTop: "1px solid #ccfbf1", background: active ? "#f7fffd" : "#fff" }}>
                            <div style={{ paddingTop: "12px", fontSize: "13px", color: "#374151", fontWeight: "700", lineHeight: 1.6 }}>{boost.description}</div>
                            <div style={{ marginTop: "6px", fontSize: "18px", color: "#111827", fontWeight: "900" }}>
                              {boost.days === 0 ? "Free" : `Offer ${boost.currency} ${formatAmount(boost.price)}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={summaryPanelStyle}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "900", color: "#6b7280", letterSpacing: "0.5px", marginBottom: "6px" }}>ORDER SUMMARY</div>
                  <h3 style={{ margin: 0, fontSize: "22px", lineHeight: 1.1, fontWeight: "900", color: "#111827" }}>Review & Continue</h3>
                </div>

                <div style={{ borderRadius: "16px", background: "#ffffff", border: "1px solid #e5e7eb", padding: "14px", display: "grid", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "800" }}>Posting Method</div>
                    <div style={{ marginTop: "4px", fontSize: "18px", fontWeight: "900", color: "#111827" }}>{selectedMethodData?.title || "Pay Now"}</div>
                    {selectedMethodData?.description ? <div style={{ marginTop: "4px", fontSize: "12px", color: "#4b5563", lineHeight: 1.5 }}>{selectedMethodData.description}</div> : null}
                  </div>

                  {selectedPublishMethod === "buy_membership" && selectedPlanData ? (
                    <div>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "800" }}>Membership Plan</div>
                      <div style={{ marginTop: "4px", fontSize: "17px", fontWeight: "900", color: "#92400e" }}>{selectedPlanData.name}</div>
                      <div style={{ marginTop: "4px", fontSize: "12px", color: "#4b5563", lineHeight: 1.5 }}>
                        {selectedPlanData.adsCredits} Ad Credits • {selectedPlanData.boostCredits} Boost Credits • {selectedPlanData.validityDays} Days
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "800" }}>Boost Selection</div>
                    <div style={{ marginTop: "4px", fontSize: "17px", fontWeight: "900", color: "#0f766e" }}>{selectedBoostPlan ? selectedBoostPlan.name : "No Boost"}</div>
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#4b5563", lineHeight: 1.5 }}>
                      {selectedBoostPlan ? selectedBoostPlan.description : "No boost added for this checkout."}
                    </div>
                  </div>
                </div>

                <div style={{ borderRadius: "16px", background: "#ffffff", border: "1px solid #e5e7eb", padding: "14px", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: "700" }}>Publishing</span>
                    <span style={{ fontSize: "14px", color: "#111827", fontWeight: "900" }}>{checkoutAmount.currency} {formatAmount(checkoutAmount.amount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: "700" }}>Boost</span>
                    <span style={{ fontSize: "14px", color: "#111827", fontWeight: "900" }}>
                      {selectedBoostPlan ? `${selectedBoostPlan.currency} ${formatAmount(selectedBoostPlan.price)}` : `${checkoutAmount.currency} 0`}
                    </span>
                  </div>
                  {normalizeNumber(checkoutAmount.originalAmount, 0) > normalizeNumber(checkoutAmount.amount, 0) ? (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "700" }}>Original</span>
                      <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "800", textDecoration: "line-through" }}>
                        {checkoutAmount.currency} {formatAmount(checkoutAmount.originalAmount)}
                      </span>
                    </div>
                  ) : null}
                  <div style={{ height: "1px", background: "#e5e7eb", margin: "2px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "15px", color: "#111827", fontWeight: "900" }}>Total Payable</span>
                    <span style={{ fontSize: "24px", color: "#111827", fontWeight: "900" }}>{checkoutAmount.currency} {formatAmount(totalPayable)}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={finalizePublish}
                    disabled={submitting}
                    style={{ background: "linear-gradient(135deg, #7a0016, #b3122a)", color: "#fff", border: "none", borderRadius: "14px", padding: "15px 18px", fontSize: "15px", fontWeight: "900", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 10px 22px rgba(179, 18, 42, 0.22)" }}
                  >
                    {submitting
                      ? "Processing..."
                      : selectedPublishMethod === "buy_membership"
                      ? "Proceed To Membership Payment"
                      : selectedPublishMethod === "pay_now"
                      ? "Pay & Publish"
                      : "Continue & Publish"}
                  </button>
                  <button type="button" onClick={closePublishModal} style={{ ...secondaryButtonStyle, width: "100%", padding: "12px 16px" }}>
                    Back / Cancel
                  </button>
                </div>

                <div style={{ fontSize: "12px", lineHeight: 1.6, color: "#6b7280", fontWeight: "600" }}>
                  By continuing, you confirm the selected posting method, boost choice, and final amount shown in this checkout.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
