import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

function renderStars(rating) {
  const rounded = Math.round(Number(rating || 0));
  return "★★★★★"
    .split("")
    .map((star, index) => (index < rounded ? "★" : "☆"))
    .join("");
}

export default function SellerProfile() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [ads, setAds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/users/${sellerId}`);
        const data = await res.json();
        if (res.ok) setSeller(data.user);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchSellerAds = async () => {
      try {
        const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/ads?seller=${sellerId}`);
        const data = await res.json();
        if (res.ok) setAds(data.ads || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchSellerReviews = async () => {
      try {
        const res = await fetch(`https://genetic-breeds-backend.onrender.com/api/reviews/seller/${sellerId}`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
    fetchSellerAds();
    fetchSellerReviews();
  }, [sellerId]);

  const memberSince = useMemo(() => {
    if (!seller?.createdAt) return "N/A";
    const date = new Date(seller.createdAt);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }, [seller]);

  const activeAds = useMemo(() => {
    return ads.filter((ad) => String(ad?.status || "").toLowerCase() === "live").length;
  }, [ads]);

  const soldAds = useMemo(() => {
    return ads.filter((ad) => String(ad?.status || "").toLowerCase() === "sold").length;
  }, [ads]);

  if (loading) {
    return <div style={{ padding: "100px 20px" }}>Loading seller profile...</div>;
  }

  if (!seller) {
    return <div style={{ padding: "100px 20px" }}>Seller not found</div>;
  }

  return (
    <div
      style={{
        padding: "90px 20px",
        background: "#f7f7fb",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gap: "18px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "22px",
            padding: "24px",
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            border: "1px solid #ececec",
          }}
        >
          <Link
            to="/browse"
            style={{
              display: "inline-block",
              marginBottom: "16px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: "#f3f4f6",
              color: "#111827",
              fontWeight: "700",
            }}
          >
            ← Back
          </Link>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f3d6dc, #eadcff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "800",
                color: "#7a0016",
                boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
              }}
            >
              {(seller?.name || "S").slice(0, 1).toUpperCase()}
            </div>

            <div>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: "34px",
                  lineHeight: "1.1",
                  color: "#1f2559",
                }}
              >
                {seller.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px 18px",
                  color: "#4b5563",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                <span>Member since: {memberSince}</span>
                <span>Total Ads: {ads.length}</span>
                <span>Active Ads: {activeAds}</span>
                <span>Sold Ads: {soldAds}</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    color: "#d97706",
                    letterSpacing: "1px",
                  }}
                >
                  {renderStars(averageRating)}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#9a3412",
                  }}
                >
                  {averageRating ? `${averageRating}/5` : "No rating yet"}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#7c2d12",
                  }}
                >
                  ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "22px",
              padding: "22px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
              border: "1px solid #ececec",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "14px",
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  color: "#1f2559",
                }}
              >
                Seller Listings
              </h2>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#6b7280",
                }}
              >
                {ads.length} listing{ads.length !== 1 ? "s" : ""}
              </div>
            </div>

            {ads.length === 0 ? (
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #ececec",
                  borderRadius: "16px",
                  padding: "26px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                No listings available for this seller yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {ads.map((ad) => (
                  <Link
                    key={ad._id}
                    to={`/pet/${ad._id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      background: ad?.isFeatured
                        ? "linear-gradient(180deg, #fffdf5, #ffffff)"
                        : "#fff",
                      borderRadius: "16px",
                      border: ad?.isFeatured ? "2px solid #f59e0b" : "1px solid #eee",
                      overflow: "hidden",
                      boxShadow: ad?.isFeatured
                        ? "0 10px 24px rgba(245,158,11,0.18)"
                        : "0 6px 14px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={
                          ad.images && ad.images.length > 0
                            ? ad.images[0]
                            : "https://placehold.co/600x400?text=No+Image"
                        }
                        alt={ad.title}
                        style={{
                          width: "100%",
                          height: "170px",
                          objectFit: "cover",
                          background: "#f3f4f6",
                          display: "block",
                        }}
                      />

                      {ad?.isFeatured && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: "800",
                            boxShadow: "0 6px 14px rgba(245,158,11,0.28)",
                          }}
                        >
                          BOOSTED
                        </div>
                      )}

                      {String(ad?.status || "").toLowerCase() === "sold" && (
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
                          }}
                        >
                          SOLD
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "inline-block",
                          marginBottom: "8px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "linear-gradient(135deg, #7a0016, #b3122a)",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {ad.category || "Pet"}
                      </div>

                      <div
                        style={{
                          fontWeight: "800",
                          fontSize: "16px",
                          color: "#111827",
                          lineHeight: "1.3",
                          marginBottom: "8px",
                          minHeight: "42px",
                        }}
                      >
                        {ad.title || ad.breed || "Pet Ad"}
                      </div>

                      <div
                        style={{
                          color: ad?.isFeatured ? "#b45309" : "#b3122a",
                          fontWeight: "900",
                          fontSize: "17px",
                        }}
                      >
                        ₹{Number(ad.price || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "22px",
              padding: "22px",
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
              border: "1px solid #ececec",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "14px",
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  color: "#1f2559",
                }}
              >
                Seller Reviews
              </h2>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#6b7280",
                }}
              >
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #ececec",
                  borderRadius: "16px",
                  padding: "22px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                No reviews yet for this seller.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "16px",
                      padding: "14px",
                      background: "#fffdfc",
                    }}
                  >
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
                      <div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#111827",
                          }}
                        >
                          {review?.reviewerId?.name || "Buyer"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: "600",
                            marginTop: "2px",
                          }}
                        >
                          {review?.createdAt
                            ? new Date(review.createdAt).toLocaleDateString("en-IN")
                            : ""}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "16px",
                          color: "#d97706",
                          fontWeight: "800",
                          letterSpacing: "1px",
                        }}
                      >
                        {renderStars(review.rating)}{" "}
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#9a3412",
                            letterSpacing: 0,
                          }}
                        >
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#374151",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {review.comment || "No written comment provided."}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
