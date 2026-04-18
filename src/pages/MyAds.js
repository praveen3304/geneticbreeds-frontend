import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

function getDaysLeft(featuredUntil) {
  if (!featuredUntil) return 0;

  const now = new Date();
  const expiry = new Date(featuredUntil);
  const diffMs = expiry.getTime() - now.getTime();

  if (Number.isNaN(expiry.getTime()) || diffMs <= 0) return 0;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-IN");
}

function getStatusColor(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "live") return "#166534";
  if (normalized === "sold") return "#16a34a";
  if (normalized === "expired") return "#b91c1c";
  if (normalized === "pending") return "#92400e";
  if (normalized === "stopped") return "#6b7280";

  return "#111827";
}

function getStatusBadgeStyle(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "live") {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    };
  }

  if (normalized === "sold") {
    return {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #86efac",
    };
  }

  if (normalized === "expired") {
    return {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    };
  }

  if (normalized === "pending") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a",
    };
  }

  return {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
  };
}

function getCategoryLabel(value) {
  return value || "General";
}

export default function MyAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [uiMessage, setUiMessage] = useState({ type: "", text: "" });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    adId: "",
    adTitle: "",
  });

  const [boostModal, setBoostModal] = useState({
    open: false,
    ad: null,
    selectedDays: 7,
  });

  const [renewModal, setRenewModal] = useState({
    open: false,
    adId: "",
    adTitle: "",
    selectedMethod: "membership_credit",
  });

  const fetchMyAds = async () => {
    try {
      const token = localStorage.getItem("gb_token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/ads/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load my ads");
        setAds([]);
      } else {
        setAds(Array.isArray(data.ads) ? data.ads : []);
        setError("");
      }
    } catch (err) {
      console.error("MyAds fetch error:", err);
      setError("Server error");
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const setInlineMessage = (type, text) => {
    setUiMessage({ type, text });

    setTimeout(() => {
      setUiMessage((current) =>
        current.text === text ? { type: "", text: "" } : current
      );
    }, 3000);
  };

  const enhancedAds = useMemo(() => {
    return ads.map((ad) => {
      const boostDaysLeft = ad.isFeatured ? getDaysLeft(ad.featuredUntil) : 0;
      const boostActive = ad.isFeatured && boostDaysLeft > 0;

      return {
        ...ad,
        boostDaysLeft,
        boostActive,
      };
    });
  }, [ads]);

  const openDeleteModal = (ad) => {
    setDeleteModal({
      open: true,
      adId: ad._id,
      adTitle: ad.title || ad.breed || "this ad",
    });
  };

  const closeDeleteModal = () => {
    if (actionLoadingId === deleteModal.adId) return;

    setDeleteModal({
      open: false,
      adId: "",
      adTitle: "",
    });
  };

  const confirmDelete = async () => {
    const adId = deleteModal.adId;
    if (!adId) return;

    try {
      setActionLoadingId(adId);
      const token = localStorage.getItem("gb_token");

      const res = await fetch(`${API_BASE_URL}/api/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setInlineMessage("error", data.error || "Failed to delete ad");
        return;
      }

      setInlineMessage("success", "Ad deleted successfully");
      closeDeleteModal();
      fetchMyAds();
    } catch (err) {
      console.error("Delete error:", err);
      setInlineMessage("error", "Server error");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleMarkSold = async (adId) => {
    try {
      setActionLoadingId(adId);
      const token = localStorage.getItem("gb_token");

      const res = await fetch(`${API_BASE_URL}/api/ads/${adId}/sold`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setInlineMessage("error", data.error || "Failed to update status");
        return;
      }

      setInlineMessage("success", "Marked as sold");
      fetchMyAds();
    } catch (err) {
      console.error("Mark sold error:", err);
      setInlineMessage("error", "Server error");
    } finally {
      setActionLoadingId("");
    }
  };

  const openBoostModal = (ad) => {
    if (ad.boostActive) {
      setInlineMessage(
        "error",
        `This ad is already boosted. ${ad.boostDaysLeft} day(s) remaining.`
      );
      return;
    }

    setBoostModal({
      open: true,
      ad,
      selectedDays: 7,
    });
  };

  const closeBoostModal = () => {
    if (boostModal.ad?._id && actionLoadingId === boostModal.ad._id) return;

    setBoostModal({
      open: false,
      ad: null,
      selectedDays: 7,
    });
  };

  const confirmBoostAd = async () => {
    const ad = boostModal.ad;
    const days = Number(boostModal.selectedDays);

    if (!ad?._id) return;

    if (![7, 14, 30].includes(days)) {
      setInlineMessage("error", "Please select only 7, 14, or 30 days");
      return;
    }

    try {
      setActionLoadingId(ad._id);
      const token = localStorage.getItem("gb_token");

      const res = await fetch(`${API_BASE_URL}/api/ads/${ad._id}/boost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInlineMessage("error", data.error || "Failed to boost ad");
        return;
      }

      setInlineMessage("success", data.message || "Ad boosted successfully");
      closeBoostModal();
      fetchMyAds();
    } catch (err) {
      console.error("Boost ad error:", err);
      setInlineMessage("error", "Server error");
    } finally {
      setActionLoadingId("");
    }
  };

  const openRenewModal = (ad) => {
    setRenewModal({
      open: true,
      adId: ad._id,
      adTitle: ad.title || ad.breed || "this ad",
      selectedMethod: "membership_credit",
    });
  };

  const closeRenewModal = () => {
    if (actionLoadingId === renewModal.adId) return;

    setRenewModal({
      open: false,
      adId: "",
      adTitle: "",
      selectedMethod: "membership_credit",
    });
  };

  const confirmRenewAd = async () => {
    const adId = renewModal.adId;
    const normalizedMethod = String(renewModal.selectedMethod || "").trim();

    if (!adId) return;

    if (
      !["membership_credit", "referral_credit", "pay_now"].includes(
        normalizedMethod
      )
    ) {
      setInlineMessage(
        "error",
        "Choose only: membership_credit, referral_credit, or pay_now"
      );
      return;
    }

    try {
      setActionLoadingId(adId);
      const token = localStorage.getItem("gb_token");

      const res = await fetch(`${API_BASE_URL}/api/ads/${adId}/renew`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          publishMethod: normalizedMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInlineMessage("error", data.error || "Failed to renew ad");
        return;
      }

      setInlineMessage("success", "Ad renewed successfully");
      closeRenewModal();
      fetchMyAds();
    } catch (err) {
      console.error("Renew error:", err);
      setInlineMessage("error", "Server error");
    } finally {
      setActionLoadingId("");
    }
  };

  useEffect(() => {
    const hasOpenModal =
      deleteModal.open || boostModal.open || renewModal.open;

    if (!hasOpenModal) return;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (deleteModal.open) closeDeleteModal();
      if (boostModal.open) closeBoostModal();
      if (renewModal.open) closeRenewModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [deleteModal.open, boostModal.open, renewModal.open, actionLoadingId]);

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <div style={loadingCardStyle}>
          <div style={loadingSpinnerStyle} />
          <div style={loadingTitleStyle}>Loading your ads...</div>
          <div style={loadingTextStyle}>
            Please wait while we fetch your listings.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={pageStyle}>
        <div style={pageHeaderStyle}>
          <div>
            <div style={pageBadgeStyle}>MANAGE LISTINGS</div>
            <h2 style={pageTitleStyle}>My Ads</h2>
            <p style={pageSubtitleStyle}>
              Control your listings, boost visibility, renew expired ads, and
              manage sale status from one advanced dashboard.
            </p>
          </div>

          <div style={summaryGridStyle}>
            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>Total Ads</div>
              <div style={summaryValueStyle}>{enhancedAds.length}</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>Live Ads</div>
              <div style={summaryValueStyle}>
                {
                  enhancedAds.filter(
                    (ad) => String(ad.status || "").toLowerCase() === "live"
                  ).length
                }
              </div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>Boosted</div>
              <div style={summaryValueStyle}>
                {enhancedAds.filter((ad) => ad.boostActive).length}
              </div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>Expired</div>
              <div style={summaryValueStyle}>
                {
                  enhancedAds.filter(
                    (ad) => String(ad.status || "").toLowerCase() === "expired"
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {uiMessage.text ? (
          <div
            style={{
              ...inlineMessageStyle,
              background:
                uiMessage.type === "error"
                  ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                  : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            }}
          >
            <div style={inlineMessageIconStyle}>
              {uiMessage.type === "error" ? "⚠" : "✓"}
            </div>
            <div>{uiMessage.text}</div>
          </div>
        ) : null}

        {error && <p style={errorTextStyle}>{error}</p>}

        {enhancedAds.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyStateIconStyle}>📦</div>
            <h3 style={emptyStateTitleStyle}>No ads found</h3>
            <p style={emptyStateTextStyle}>
              Your posted ads will appear here once available.
            </p>
          </div>
        ) : (
          <div style={gridStyle}>
            {enhancedAds.map((ad) => {
              const statusStyles = getStatusBadgeStyle(ad.status);
              const isActionLoading = actionLoadingId === ad._id;

              return (
                <div key={ad._id} style={cardStyle}>
                  <div style={mediaColumnStyle}>
                    {ad.images && ad.images.length > 0 ? (
                      <div style={imageWrapStyle}>
                        <img
                          src={ad.images[0]}
                          alt={ad.breed || ad.title}
                          style={{
                            ...imageStyle,
                            opacity: ad.status === "Sold" ? 0.65 : 1,
                          }}
                        />

                        {ad.status === "Sold" && (
                          <div style={soldRibbonStyle}>SOLD</div>
                        )}

                        {ad.boostActive && (
                          <div style={boostRibbonStyle}>BOOSTED</div>
                        )}
                      </div>
                    ) : (
                      <div style={noImageStyle}>No Image</div>
                    )}
                  </div>

                  <div style={contentColumnStyle}>
                    <div style={topRowStyle}>
                      <div>
                        <h3 style={cardTitleStyle}>{ad.title || ad.breed}</h3>
                        <p style={cardSubTitleStyle}>
                          Ad Code: <strong>{ad.adCode || "N/A"}</strong>
                        </p>
                      </div>

                      <div
                        style={{
                          ...statusBadgeStyle,
                          ...statusStyles,
                        }}
                      >
                        {ad.status || "N/A"}
                      </div>
                    </div>

                    <div style={infoGridStyle}>
                      <div style={infoBoxStyle}>
                        <div style={infoLabelStyle}>Category</div>
                        <div style={infoValueStyle}>
                          {getCategoryLabel(ad.category)}
                        </div>
                      </div>

                      <div style={infoBoxStyle}>
                        <div style={infoLabelStyle}>Price</div>
                        <div style={infoValueStyle}>₹{ad.price}</div>
                      </div>

                      <div style={infoBoxStyle}>
                        <div style={infoLabelStyle}>Posted On</div>
                        <div style={infoValueStyle}>{formatDate(ad.createdAt)}</div>
                      </div>

                      <div style={infoBoxStyle}>
                        <div style={infoLabelStyle}>Status Color</div>
                        <div
                          style={{
                            ...infoValueStyle,
                            color: getStatusColor(ad.status),
                          }}
                        >
                          {ad.status}
                        </div>
                      </div>
                    </div>

                    {ad.boostActive ? (
                      <div style={boostInfoCardStyle}>
                        <div style={boostInfoTitleStyle}>Boost Active</div>
                        <div style={boostInfoTextStyle}>
                          Active until <strong>{formatDate(ad.featuredUntil)}</strong>
                        </div>
                        <div style={boostInfoDaysStyle}>
                          {ad.boostDaysLeft} day(s) remaining
                        </div>
                      </div>
                    ) : ad.isFeatured && ad.featuredUntil ? (
                      <div style={softInfoBoxStyle}>
                        Previous boost ended on{" "}
                        <strong>{formatDate(ad.featuredUntil)}</strong>
                      </div>
                    ) : null}

                    <div style={actionsWrapStyle}>
                      {String(ad.status || "").toLowerCase() === "live" && (
                        <button
                          type="button"
                          onClick={() => openBoostModal(ad)}
                          disabled={ad.boostActive || isActionLoading}
                          style={{
                            ...buttonBaseStyle,
                            background: ad.boostActive
                              ? "#fde68a"
                              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: ad.boostActive ? "#92400e" : "#fff",
                            cursor:
                              ad.boostActive || isActionLoading
                                ? "not-allowed"
                                : "pointer",
                            boxShadow: ad.boostActive
                              ? "none"
                              : "0 10px 24px rgba(245, 158, 11, 0.22)",
                          }}
                        >
                          {isActionLoading
                            ? "Processing..."
                            : ad.boostActive
                            ? `Boost Active (${ad.boostDaysLeft}d left)`
                            : "Boost Ad"}
                        </button>
                      )}

                      {String(ad.status || "").toLowerCase() === "expired" && (
                        <button
                          type="button"
                          onClick={() => openRenewModal(ad)}
                          disabled={isActionLoading}
                          style={{
                            ...buttonBaseStyle,
                            background:
                              "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            color: "#fff",
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
                          }}
                        >
                          {isActionLoading ? "Processing..." : "Renew Ad"}
                        </button>
                      )}

                      {String(ad.status || "").toLowerCase() !== "sold" && (
                        <button
                          type="button"
                          onClick={() => handleMarkSold(ad._id)}
                          disabled={isActionLoading}
                          style={{
                            ...buttonBaseStyle,
                            background:
                              "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            color: "#fff",
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            boxShadow: "0 10px 24px rgba(22, 163, 74, 0.22)",
                          }}
                        >
                          {isActionLoading ? "Processing..." : "Mark as Sold"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openDeleteModal(ad)}
                        disabled={isActionLoading}
                        style={{
                          ...buttonBaseStyle,
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                          color: "#fff",
                          cursor: isActionLoading ? "not-allowed" : "pointer",
                          boxShadow: "0 10px 24px rgba(239, 68, 68, 0.22)",
                        }}
                      >
                        {isActionLoading ? "Processing..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteModal.open && (
        <div style={modalOverlayStyle} onClick={closeDeleteModal}>
          <div
            style={modalCardStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalIconWrapDangerStyle}>🗑</div>
            <div style={modalBadgeDangerStyle}>DELETE AD</div>
            <h3 style={modalTitleStyle}>Delete this ad?</h3>
            <p style={modalTextStyle}>
              You are about to delete <strong>{deleteModal.adTitle}</strong>.
              This action cannot be undone.
            </p>

            <div style={modalButtonRowStyle}>
              <button
                type="button"
                onClick={closeDeleteModal}
                style={modalSecondaryButtonStyle}
                disabled={actionLoadingId === deleteModal.adId}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                style={modalDangerButtonStyle}
                disabled={actionLoadingId === deleteModal.adId}
              >
                {actionLoadingId === deleteModal.adId
                  ? "Deleting..."
                  : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {boostModal.open && (
        <div style={modalOverlayStyle} onClick={closeBoostModal}>
          <div
            style={largeModalCardStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalIconWrapWarnStyle}>🚀</div>
            <div style={modalBadgeWarnStyle}>BOOST AD</div>
            <h3 style={modalTitleStyle}>Choose your boost duration</h3>
            <p style={modalTextStyle}>
              Select how long you want to boost{" "}
              <strong>{boostModal.ad?.title || boostModal.ad?.breed}</strong>.
            </p>

            <div style={selectionGridStyle}>
              {[7, 14, 30].map((days) => {
                const selected = Number(boostModal.selectedDays) === days;

                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() =>
                      setBoostModal((prev) => ({
                        ...prev,
                        selectedDays: days,
                      }))
                    }
                    style={{
                      ...selectionCardStyle,
                      ...(selected
                        ? selectionCardActiveStyle
                        : selectionCardInactiveStyle),
                    }}
                  >
                    <div style={selectionTitleStyle}>{days} Days</div>
                    <div style={selectionSubtitleStyle}>
                      {days === 7
                        ? "Quick visibility boost"
                        : days === 14
                        ? "Balanced promotion period"
                        : "Maximum highlight duration"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={boostSummaryBoxStyle}>
              <div style={boostSummaryLabelStyle}>Selected Boost</div>
              <div style={boostSummaryValueStyle}>
                {boostModal.selectedDays} day(s)
              </div>
            </div>

            <div style={modalButtonRowStyle}>
              <button
                type="button"
                onClick={closeBoostModal}
                style={modalSecondaryButtonStyle}
                disabled={actionLoadingId === boostModal.ad?._id}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmBoostAd}
                style={modalWarnButtonStyle}
                disabled={actionLoadingId === boostModal.ad?._id}
              >
                {actionLoadingId === boostModal.ad?._id
                  ? "Boosting..."
                  : "Confirm Boost"}
              </button>
            </div>
          </div>
        </div>
      )}

      {renewModal.open && (
        <div style={modalOverlayStyle} onClick={closeRenewModal}>
          <div
            style={largeModalCardStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalIconWrapPrimaryStyle}>🔄</div>
            <div style={modalBadgePrimaryStyle}>RENEW AD</div>
            <h3 style={modalTitleStyle}>Choose renewal method</h3>
            <p style={modalTextStyle}>
              Renew <strong>{renewModal.adTitle}</strong> using one of the
              available publishing methods.
            </p>

            <div style={renewMethodListStyle}>
              {[
                {
                  key: "membership_credit",
                  title: "Membership Credit",
                  text: "Use one post credit from your active membership plan.",
                },
                {
                  key: "referral_credit",
                  title: "Referral Credit",
                  text: "Use an available referral credit if eligible.",
                },
                {
                  key: "pay_now",
                  title: "Pay Now",
                  text: "Proceed with direct payment based renewal flow.",
                },
              ].map((method) => {
                const selected = renewModal.selectedMethod === method.key;

                return (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() =>
                      setRenewModal((prev) => ({
                        ...prev,
                        selectedMethod: method.key,
                      }))
                    }
                    style={{
                      ...renewMethodItemStyle,
                      ...(selected
                        ? renewMethodItemActiveStyle
                        : renewMethodItemInactiveStyle),
                    }}
                  >
                    <div style={renewMethodTitleStyle}>{method.title}</div>
                    <div style={renewMethodTextStyle}>{method.text}</div>
                  </button>
                );
              })}
            </div>

            <div style={renewSummaryBoxStyle}>
              <div style={boostSummaryLabelStyle}>Selected Method</div>
              <div style={boostSummaryValueStyle}>
                {renewModal.selectedMethod}
              </div>
            </div>

            <div style={modalButtonRowStyle}>
              <button
                type="button"
                onClick={closeRenewModal}
                style={modalSecondaryButtonStyle}
                disabled={actionLoadingId === renewModal.adId}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmRenewAd}
                style={modalPrimaryButtonStyle}
                disabled={actionLoadingId === renewModal.adId}
              >
                {actionLoadingId === renewModal.adId
                  ? "Renewing..."
                  : "Confirm Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const loadingPageStyle = {
  minHeight: "55vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background:
    "radial-gradient(circle at top, rgba(254, 242, 242, 0.9), #fff 55%)",
};

const loadingCardStyle = {
  width: "min(420px, 100%)",
  background: "#fff",
  border: "1px solid #fee2e2",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
  textAlign: "center",
};

const loadingSpinnerStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "999px",
  margin: "0 auto 14px",
  border: "4px solid #fecaca",
  borderTop: "4px solid #dc2626",
  animation: "spin 1s linear infinite",
};

const loadingTitleStyle = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#111827",
};

const loadingTextStyle = {
  marginTop: "8px",
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: 1.6,
};

const pageStyle = {
  padding: "24px",
  maxWidth: "1180px",
  margin: "0 auto",
};

const pageHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: "18px",
  alignItems: "stretch",
  marginBottom: "22px",
};

const pageBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "6px 12px",
  background: "#fff1f2",
  color: "#991b1b",
  border: "1px solid #fecdd3",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "0.8px",
  marginBottom: "10px",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "30px",
  fontWeight: "900",
  color: "#111827",
  lineHeight: 1.15,
};

const pageSubtitleStyle = {
  margin: "10px 0 0",
  maxWidth: "720px",
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: 1.7,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const summaryCardStyle = {
  background: "linear-gradient(135deg, #fff 0%, #fff5f5 100%)",
  border: "1px solid #fee2e2",
  borderRadius: "18px",
  padding: "16px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
};

const summaryLabelStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#6b7280",
  marginBottom: "8px",
};

const summaryValueStyle = {
  fontSize: "26px",
  fontWeight: "900",
  color: "#991b1b",
};

const gridStyle = {
  display: "grid",
  gap: "18px",
};

const cardStyle = {
  border: "1px solid #fee2e2",
  borderRadius: "24px",
  padding: "18px",
  background: "#fff",
  position: "relative",
  display: "flex",
  gap: "18px",
  alignItems: "flex-start",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
};

const mediaColumnStyle = {
  flexShrink: 0,
};

const imageWrapStyle = {
  position: "relative",
  borderRadius: "18px",
  overflow: "hidden",
  border: "1px solid #fee2e2",
  background: "#fff7f7",
};

const imageStyle = {
  width: "220px",
  height: "220px",
  objectFit: "cover",
  display: "block",
};

const noImageStyle = {
  width: "220px",
  height: "220px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
  border: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280",
  fontSize: "15px",
  fontWeight: "700",
};

const soldRibbonStyle = {
  position: "absolute",
  top: "12px",
  left: "12px",
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.3px",
  boxShadow: "0 10px 24px rgba(22, 163, 74, 0.24)",
};

const boostRibbonStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.3px",
  boxShadow: "0 10px 24px rgba(245, 158, 11, 0.24)",
};

const contentColumnStyle = {
  flex: 1,
  minWidth: 0,
};

const topRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
};

const cardTitleStyle = {
  margin: "0 0 8px",
  fontSize: "25px",
  color: "#111827",
  fontWeight: "900",
  lineHeight: 1.2,
};

const cardSubTitleStyle = {
  margin: 0,
  fontSize: "13px",
  color: "#6b7280",
};

const statusBadgeStyle = {
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: "900",
  whiteSpace: "nowrap",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const infoBoxStyle = {
  background: "#fffafa",
  border: "1px solid #fee2e2",
  borderRadius: "16px",
  padding: "14px",
};

const infoLabelStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#6b7280",
  marginBottom: "8px",
  letterSpacing: "0.2px",
};

const infoValueStyle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#111827",
  lineHeight: 1.4,
};

const boostInfoCardStyle = {
  marginTop: "16px",
  background: "linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)",
  border: "1px solid #fed7aa",
  borderRadius: "18px",
  padding: "14px 16px",
};

const boostInfoTitleStyle = {
  fontSize: "13px",
  fontWeight: "900",
  color: "#b45309",
  marginBottom: "6px",
};

const boostInfoTextStyle = {
  fontSize: "13px",
  color: "#92400e",
  lineHeight: 1.6,
};

const boostInfoDaysStyle = {
  marginTop: "8px",
  fontSize: "12px",
  fontWeight: "900",
  color: "#78350f",
};

const softInfoBoxStyle = {
  marginTop: "16px",
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  color: "#475569",
  borderRadius: "16px",
  padding: "13px 15px",
  fontSize: "13px",
  lineHeight: 1.6,
};

const actionsWrapStyle = {
  marginTop: "18px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const buttonBaseStyle = {
  border: "none",
  padding: "11px 15px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "800",
  transition: "all 0.2s ease",
};

const inlineMessageStyle = {
  marginBottom: "16px",
  borderRadius: "16px",
  padding: "13px 16px",
  fontWeight: "800",
  fontSize: "13px",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
};

const inlineMessageIconStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
};

const errorTextStyle = {
  color: "#dc2626",
  marginBottom: "16px",
  fontWeight: "800",
};

const emptyStateStyle = {
  background: "linear-gradient(135deg, #fff 0%, #fff5f5 100%)",
  border: "1px solid #fee2e2",
  borderRadius: "24px",
  padding: "36px 24px",
  textAlign: "center",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.05)",
};

const emptyStateIconStyle = {
  fontSize: "36px",
  marginBottom: "10px",
};

const emptyStateTitleStyle = {
  margin: 0,
  fontSize: "22px",
  color: "#111827",
  fontWeight: "900",
};

const emptyStateTextStyle = {
  margin: "8px 0 0",
  color: "#6b7280",
  fontSize: "14px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1600,
};

const modalCardStyle = {
  width: "min(460px, 100%)",
  background: "#fff",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid #fee2e2",
  boxShadow: "0 28px 70px rgba(15, 23, 42, 0.24)",
  textAlign: "center",
};

const largeModalCardStyle = {
  width: "min(640px, 100%)",
  background: "#fff",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid #fee2e2",
  boxShadow: "0 28px 70px rgba(15, 23, 42, 0.24)",
};

const modalIconBaseStyle = {
  width: "62px",
  height: "62px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 14px",
  fontSize: "28px",
};

const modalIconWrapDangerStyle = {
  ...modalIconBaseStyle,
  background: "#fee2e2",
  border: "1px solid #fecaca",
};

const modalIconWrapWarnStyle = {
  ...modalIconBaseStyle,
  background: "#fef3c7",
  border: "1px solid #fde68a",
};

const modalIconWrapPrimaryStyle = {
  ...modalIconBaseStyle,
  background: "#dbeafe",
  border: "1px solid #bfdbfe",
};

const modalBadgeBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  padding: "6px 12px",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "0.7px",
  margin: "0 auto 12px",
};

const modalBadgeDangerStyle = {
  ...modalBadgeBaseStyle,
  background: "#fff1f2",
  color: "#b91c1c",
  border: "1px solid #fecdd3",
};

const modalBadgeWarnStyle = {
  ...modalBadgeBaseStyle,
  background: "#fffbeb",
  color: "#b45309",
  border: "1px solid #fde68a",
};

const modalBadgePrimaryStyle = {
  ...modalBadgeBaseStyle,
  background: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "26px",
  fontWeight: "900",
  color: "#111827",
  textAlign: "center",
};

const modalTextStyle = {
  margin: "12px auto 0",
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#6b7280",
  maxWidth: "520px",
  textAlign: "center",
};

const modalButtonRowStyle = {
  marginTop: "22px",
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  flexWrap: "wrap",
};

const modalSecondaryButtonStyle = {
  minWidth: "140px",
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#374151",
  fontWeight: "800",
  fontSize: "13px",
  cursor: "pointer",
};

const modalDangerButtonStyle = {
  minWidth: "140px",
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
  color: "#fff",
  fontWeight: "800",
  fontSize: "13px",
  cursor: "pointer",
};

const modalWarnButtonStyle = {
  minWidth: "140px",
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  color: "#fff",
  fontWeight: "800",
  fontSize: "13px",
  cursor: "pointer",
};

const modalPrimaryButtonStyle = {
  minWidth: "140px",
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "#fff",
  fontWeight: "800",
  fontSize: "13px",
  cursor: "pointer",
};

const selectionGridStyle = {
  marginTop: "20px",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "12px",
};

const selectionCardStyle = {
  textAlign: "left",
  borderRadius: "18px",
  padding: "16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const selectionCardActiveStyle = {
  background: "linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)",
  border: "1px solid #f59e0b",
  boxShadow: "0 14px 28px rgba(245, 158, 11, 0.12)",
};

const selectionCardInactiveStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
};

const selectionTitleStyle = {
  fontSize: "17px",
  fontWeight: "900",
  color: "#111827",
};

const selectionSubtitleStyle = {
  marginTop: "6px",
  fontSize: "12px",
  lineHeight: 1.6,
  color: "#6b7280",
};

const boostSummaryBoxStyle = {
  marginTop: "18px",
  background: "#fffaf0",
  border: "1px solid #fde68a",
  borderRadius: "18px",
  padding: "14px 16px",
};

const renewSummaryBoxStyle = {
  marginTop: "18px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "18px",
  padding: "14px 16px",
};

const boostSummaryLabelStyle = {
  fontSize: "11px",
  fontWeight: "800",
  color: "#6b7280",
  marginBottom: "6px",
};

const boostSummaryValueStyle = {
  fontSize: "16px",
  fontWeight: "900",
  color: "#111827",
};

const renewMethodListStyle = {
  marginTop: "20px",
  display: "grid",
  gap: "12px",
};

const renewMethodItemStyle = {
  width: "100%",
  textAlign: "left",
  borderRadius: "18px",
  padding: "16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const renewMethodItemActiveStyle = {
  background: "linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)",
  border: "1px solid #60a5fa",
  boxShadow: "0 14px 28px rgba(37, 99, 235, 0.10)",
};

const renewMethodItemInactiveStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
};

const renewMethodTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  color: "#111827",
};

const renewMethodTextStyle = {
  marginTop: "6px",
  fontSize: "12px",
  lineHeight: 1.6,
  color: "#6b7280",
};
