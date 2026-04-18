import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Wishlist({ wishlist = [], toggleWishlist = () => {} }) {
  const [localItems, setLocalItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [activeShareId, setActiveShareId] = useState(null);

  const getAdId = (ad) => ad?._id || ad?.id;
  const getAdTitle = (ad) => ad?.title || ad?.breed || "Pet Ad";
  const getAdImage = (ad) =>
    ad?.images && ad.images.length > 0
      ? ad.images[0]
      : "https://placehold.co/600x400?text=No+Image";
  const getCategory = (ad) => ad?.category || ad?.type || "Pet";
  const getLocation = (ad) => ad?.city || ad?.location || ad?.state || "Location not available";
  const getPrice = (ad) => Number(ad?.price || 0).toLocaleString("en-IN");

  useEffect(() => {
    const closeShareMenu = () => setActiveShareId(null);
    window.addEventListener("click", closeShareMenu);
    return () => window.removeEventListener("click", closeShareMenu);
  }, []);

  useEffect(() => {
    const cleaned = Array.isArray(wishlist)
      ? wishlist.filter((item, index, arr) => {
          const id = getAdId(item);
          return id && arr.findIndex((x) => getAdId(x) === id) === index;
        })
      : [];

    setLocalItems(cleaned);
  }, [wishlist]);

  const sortedWishlist = useMemo(() => {
    return [...localItems].sort((a, b) => {
      if (a?.isFeatured && !b?.isFeatured) return -1;
      if (!a?.isFeatured && b?.isFeatured) return 1;
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });
  }, [localItems]);

  const getShareLink = (ad) => `${window.location.origin}/pet/${getAdId(ad)}`;

  const handleShare = async (ad) => {
    const shareUrl = getShareLink(ad);
    const shareText = `${getAdTitle(ad)} - ₹${getPrice(ad)} - ${getLocation(ad)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: getAdTitle(ad),
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    setActiveShareId(getAdId(ad));
  };

  const handleCopyLink = async (ad) => {
    try {
      await navigator.clipboard.writeText(getShareLink(ad));
      setCopiedId(getAdId(ad));
      setTimeout(() => setCopiedId(null), 1800);
      setActiveShareId(null);
    } catch (err) {
      window.prompt("Copy this link:", getShareLink(ad));
    }
  };

  return (
    <div className="page" style={{ background: "#f7f7fb", minHeight: "100vh" }}>
      <section
        className="hero"
        style={{
          background: "linear-gradient(135deg, #fff4f6, #ffe7cc)",
          borderRadius: "24px",
          padding: "26px 24px 24px",
          marginBottom: "20px",
          boxShadow: "0 10px 28px rgba(179,18,42,0.10)",
          border: "1px solid rgba(179,18,42,0.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <div>
            <h1
              className="hero-title"
              style={{
                margin: "0 0 6px",
                fontSize: "40px",
                lineHeight: "1.05",
                color: "#2c1a5a",
                fontWeight: "800",
                letterSpacing: "-0.8px",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              My Wishlist
            </h1>

            <p
              className="hero-sub"
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: "600",
                color: "#6b4d2e",
                lineHeight: "1.5",
              }}
            >
              Your saved pets, neatly organized for quick review and comparison.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #f3d1d8",
              borderRadius: "16px",
              padding: "12px 16px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
              minWidth: "180px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                marginBottom: "4px",
              }}
            >
              Saved Pets
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#b3122a",
                lineHeight: 1,
              }}
            >
              {sortedWishlist.length}
            </div>
          </div>
        </div>

        {sortedWishlist.length === 0 ? (
          <div
            className="empty-box"
            style={{
              marginTop: "22px",
              background: "#fff",
              borderRadius: "20px",
              padding: "42px 20px",
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
              border: "1px solid #ececec",
            }}
          >
            <div style={{ fontSize: "46px", marginBottom: "12px" }}>💝</div>
            <h3
              style={{
                margin: "0 0 8px",
                color: "#111827",
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              No pets in your wishlist yet
            </h3>
            <p
              style={{
                margin: "0 0 18px",
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Save the pets you like from the browse page and they will appear here.
            </p>

            <Link
              to="/browse"
              style={{
                display: "inline-block",
                padding: "11px 18px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #7a0016, #b3122a)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "700",
                boxShadow: "0 8px 18px rgba(122,0,22,0.18)",
              }}
            >
              Browse Pets
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  color: "#4b5563",
                  fontWeight: "700",
                  fontSize: "15px",
                }}
              >
                Showing {sortedWishlist.length} saved pet{sortedWishlist.length > 1 ? "s" : ""}
              </div>

              <Link
                to="/browse"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "#fff",
                  color: "#7a0016",
                  textDecoration: "none",
                  fontWeight: "700",
                  border: "1px solid #f0c9d0",
                }}
              >
                + Add More Pets
              </Link>
            </div>

            <div
              className="grid"
              style={{
                marginTop: "18px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 270px))",
                gap: "18px",
                justifyContent: "start",
              }}
            >
              {sortedWishlist.map((p) => (
                <div
                  key={getAdId(p)}
                  className="card"
                  style={{
                    position: "relative",
                    background: p?.isFeatured
                      ? "linear-gradient(180deg, #fffdf5, #ffffff)"
                      : "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: p?.isFeatured
                      ? "0 14px 32px rgba(245,158,11,0.28)"
                      : "0 10px 24px rgba(0,0,0,0.08)",
                    border: p?.isFeatured
                      ? "2px solid #f59e0b"
                      : "1px solid #ececec",
                    transform: p?.isFeatured ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      border: "none",
                      background: "#fff",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#991b1b",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.14)",
                      zIndex: 5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Remove from wishlist"
                  >
                    ×
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      border: "none",
                      background: "#fff",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      fontSize: "18px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.14)",
                      zIndex: 5,
                    }}
                    title="Remove from wishlist"
                  >
                    ❤️
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(p);
                    }}
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      border: "1px solid #fde68a",
                      background: "#fef08a",
                      color: "#111827",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      fontSize: "16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 4,
                    }}
                    title="Share"
                  >
                    ↗
                  </button>

                  {activeShareId === getAdId(p) && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        bottom: "60px",
                        right: "12px",
                        background: "#fff",
                        borderRadius: "12px",
                        padding: "10px",
                        boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        minWidth: "150px",
                      }}
                    >
                      <button
                        onClick={() => handleCopyLink(p)}
                        style={{
                          border: "none",
                          background: "#f3f4f6",
                          padding: "9px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        📋 Copy Link
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `${getAdTitle(p)} ${getShareLink(p)}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "#25D366",
                          color: "white",
                          padding: "9px",
                          borderRadius: "8px",
                          textAlign: "center",
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        WhatsApp
                      </a>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(
                          getShareLink(p)
                        )}&text=${encodeURIComponent(getAdTitle(p))}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "#0088cc",
                          color: "white",
                          padding: "9px",
                          borderRadius: "8px",
                          textAlign: "center",
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        Telegram
                      </a>

                      <button
                        onClick={() => setActiveShareId(null)}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: "12px",
                          color: "#6b7280",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {copiedId === getAdId(p) && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "60px",
                        left: "12px",
                        background: "#111827",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        zIndex: 6,
                        boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                      }}
                    >
                      Link copied
                    </div>
                  )}

                  <div style={{ position: "relative" }}>
                    <img
                      className="card-img"
                      src={getAdImage(p)}
                      alt={getAdTitle(p)}
                      style={{
                        height: "190px",
                        width: "100%",
                        objectFit: "contain",
                        background: "#f3f4f6",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                      }}
                    />

                    {p?.isFeatured && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0",
                          right: "0",
                          background: "linear-gradient(135deg, #f59e0b, #d97706)",
                          color: "#fff",
                          padding: "6px 14px",
                          fontSize: "11px",
                          fontWeight: "900",
                          borderBottomLeftRadius: "12px",
                          letterSpacing: "0.5px",
                          boxShadow: "0 6px 14px rgba(245,158,11,0.4)",
                          zIndex: 5,
                        }}
                      >
                        BOOSTED AD
                      </div>
                    )}

                    {String(p?.status || "").toLowerCase() === "sold" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "#e53935",
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          zIndex: 4,
                        }}
                      >
                        SOLD
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "14px 12px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "linear-gradient(135deg, #7a0016, #b3122a)",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {getCategory(p)}
                      </span>

                      <span
                        style={{
                          fontSize: "12px",
                          color: "#4b5563",
                          fontWeight: "600",
                        }}
                      >
                        {getLocation(p)}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: "800",
                        color: "#111827",
                        marginBottom: "8px",
                        lineHeight: "1.3",
                        minHeight: "44px",
                      }}
                    >
                      {getAdTitle(p)}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "8px",
                        alignItems: "start",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "900",
                          color: p?.isFeatured ? "#b45309" : "#b3122a",
                          fontSize: "17px",
                          background: p?.isFeatured ? "#fff7ed" : "transparent",
                          padding: p?.isFeatured ? "4px 8px" : "0",
                          borderRadius: "8px",
                          width: "fit-content",
                        }}
                      >
                        ₹{getPrice(p)}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p?.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN")
                          : "Saved"}
                      </div>
                    </div>

                    {p?.isFeatured && p?.featuredUntil && (
                      <div
                        style={{
                          marginBottom: "10px",
                          fontSize: "12px",
                          color: "#b45309",
                          fontWeight: "700",
                        }}
                      >
                        Boosted until: {new Date(p.featuredUntil).toLocaleDateString("en-IN")}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Link
                        to={`/pet/${getAdId(p)}`}
                        style={{
                          display: "inline-block",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #7a0016, #b3122a)",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: "700",
                          fontSize: "13px",
                          boxShadow: "0 8px 18px rgba(122,0,22,0.18)",
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
