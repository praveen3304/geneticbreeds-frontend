import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startPayment } from "../utils/startPayment";

export default function Plans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPlan, setBuyingPlan] = useState("");
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    redirectTo: "",
  });

  const token = localStorage.getItem("gb_token");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("gb_user") || "{}");
    } catch (error) {
      return {};
    }
  }, []);

  const openModal = ({
    type = "success",
    title = "",
    message = "",
    redirectTo = "",
  }) => {
    setModal({
      open: true,
      type,
      title,
      message,
      redirectTo,
    });
  };

  const closeModal = () => {
    const redirectTo = modal.redirectTo;

    setModal({
      open: false,
      type: "success",
      title: "",
      message: "",
      redirectTo: "",
    });

    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const fetchPlans = async () => {
    const res = await fetch(
      `/api/payments/plans?country=${encodeURIComponent(user.country || "India")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load plans");
    }

    setPlans(Array.isArray(data) ? data : []);
  };

  const fetchCredits = async () => {
    const res = await fetch("/api/payments/my-credits", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load credits");
    }

    setCredits(data);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchCredits()]);
    } catch (err) {
      console.error(err);
      openModal({
        type: "error",
        title: "Unable to load plans",
        message: err.message || "Something went wrong while loading plans.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFreePlanUsed = () => {
    if (!credits) return false;

    return (
      credits.planName === "Free" ||
      Number(credits.adsTotal || 0) > 0 ||
      Number(credits.adsUsed || 0) > 0 ||
      Number(credits.adsRemaining || 0) > 0
    );
  };

  const isCurrentPlan = (planName) => {
    return credits && credits.planName === planName;
  };

  const getButtonText = (plan) => {
    if (buyingPlan === plan.name) {
      return "Processing...";
    }

    if (plan.name === "Free" && isFreePlanUsed()) {
      return "Used";
    }

    if (isCurrentPlan(plan.name) && plan.name !== "Free") {
      return "Current Plan";
    }

    return "Buy Plan";
  };

  const isButtonDisabled = (plan) => {
    if (buyingPlan) return true;

    if (plan.name === "Free" && isFreePlanUsed()) {
      return true;
    }

    return false;
  };

  const getPlanKey = (plan) => {
    if (plan.key) return plan.key;

    const normalizedName = String(plan.name || "").trim().toUpperCase();

    if (normalizedName.includes("PREMIUM")) return "PREMIUM";
    if (normalizedName.includes("STANDARD")) return "STANDARD";
    return "BASIC";
  };

  const buyPlan = async (plan) => {
    try {
      setBuyingPlan(plan.name);

      const planKey = getPlanKey(plan);

      await startPayment({
        token,
        paymentFor: "membership",
        planKey,
        onSuccess: async () => {
          try {
            await fetchCredits();

            openModal({
              type: "success",
              title: "Plan Purchased",
              message: `${plan.name} plan activated successfully.`,
            });
          } catch (refreshError) {
            console.error("Credits refresh error:", refreshError);
            openModal({
              type: "success",
              title: "Payment Successful",
              message:
                "Your payment was successful. Please refresh the page to view updated credits.",
            });
          } finally {
            setBuyingPlan("");
          }
        },
        onError: (error) => {
          console.error("Plan payment error:", error);

          openModal({
            type: "error",
            title: "Payment Failed",
            message: error?.message || "Something went wrong while processing payment.",
          });

          setBuyingPlan("");
        },
      });
    } catch (err) {
      console.error(err);

      openModal({
        type: "error",
        title: "Purchase Failed",
        message: err.message || "Something went wrong while purchasing the plan.",
      });

      setBuyingPlan("");
    }
  };

  const renderPriceBlock = (plan) => {
    const originalPrice = Number(plan.originalPrice || 0);
    const offerPrice = Number(plan.offerPrice || plan.price || 0);
    const currency = plan.currency || "";

    return (
      <div style={{ marginBottom: "14px" }}>
        {originalPrice > offerPrice ? (
          <p
            style={{
              margin: "0 0 6px",
              color: "#6b7280",
              textDecoration: "line-through",
              fontSize: "14px",
            }}
          >
            {currency} {originalPrice}
          </p>
        ) : null}

        <p
          style={{
            margin: 0,
            color: "#111827",
            fontWeight: "800",
            fontSize: "22px",
          }}
        >
          {currency} {offerPrice}
        </p>
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading plans...</div>;
  }

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1 style={{ marginBottom: "10px" }}>Membership Plans</h1>

        <p style={{ margin: "0 0 10px", color: "#4b5563" }}>
          Choose the right plan for your posting and boost needs.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          {plans.map((plan, i) => {
            const disabled = isButtonDisabled(plan);
            const buttonText = getButtonText(plan);

            return (
              <div
                key={i}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "16px",
                  padding: "20px",
                  background: "#fff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {plan.badge ? (
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: "10px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: "#ede9fe",
                      color: "#5b21b6",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {plan.badge}
                  </div>
                ) : null}

                <h2
                  style={{
                    margin: "0 0 12px",
                    fontSize: "22px",
                    color: "#111827",
                  }}
                >
                  {plan.name}
                </h2>

                {renderPriceBlock(plan)}

                <div style={{ marginBottom: "14px", color: "#374151", fontSize: "14px" }}>
                  <p style={{ margin: "0 0 6px" }}>
                    Ads: <strong>{plan.totalPosts ?? plan.ads ?? 0}</strong>
                  </p>
                  <p style={{ margin: "0 0 6px" }}>
                    Boosts: <strong>{plan.totalBoosts ?? 0}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    Validity: <strong>{plan.durationDays ?? 0} days</strong>
                  </p>
                </div>

                {plan.description ? (
                  <p
                    style={{
                      margin: "0 0 16px",
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {plan.description}
                  </p>
                ) : null}

                <button
                  onClick={() => buyPlan(plan)}
                  disabled={disabled}
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    width: "100%",
                    background: disabled ? "#9ca3af" : "#2d1b69",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                    transition: "0.2s ease",
                  }}
                >
                  {buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {modal.open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#fff",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px 24px 14px",
                background:
                  modal.type === "success"
                    ? "linear-gradient(135deg, #1f1147 0%, #44217a 100%)"
                    : "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "12px",
                }}
              >
                {modal.type === "success" ? "✓" : "!"}
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "800",
                }}
              >
                {modal.title}
              </h3>
            </div>

            <div style={{ padding: "22px 24px 24px" }}>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#374151",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                {modal.message}
              </p>

              <button
                onClick={closeModal}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "12px",
                  padding: "13px 16px",
                  background: "#2d1b69",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
