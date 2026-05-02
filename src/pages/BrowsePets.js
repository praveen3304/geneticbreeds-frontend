import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function BrowsePets({ wishlist = [], toggleWishlist = () => {} }) {
  const [ads, setAds] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setIsMobile(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [breed, setBreed] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("Latest");
  const [galleryAd, setGalleryAd] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeShareId, setActiveShareId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const itemsPerPage = 24;

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch("https://genetic-breeds-backend.onrender.com/api/ads");
        const data = await res.json();

        if (!res.ok) {
          console.error("Browse ads error:", data.error || "Failed to load ads");
          setAds([]);
          return;
        }

        setAds(Array.isArray(data.ads) ? data.ads : []);
      } catch (err) {
        console.error("Browse fetch error:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    const closeShareMenu = () => setActiveShareId(null);
    window.addEventListener("click", closeShareMenu);
    return () => window.removeEventListener("click", closeShareMenu);
  }, []);

  const filtered = useMemo(() => {
    let list = [...ads].filter((p) => p.status === "Live" || p.status === "Sold");

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((p) =>
        `${p.title || ""} ${p.breed || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(s)
      );
    }

    if (breed.trim()) {
      const s = breed.trim().toLowerCase();
      list = list.filter((p) =>
        `${p.breed || p.title || ""}`.toLowerCase().includes(s)
      );
    }

    if (category !== "All") {
      list = list.filter((p) => (p.category || "") === category);
    }

    if (location.trim()) {
      const s = location.trim().toLowerCase();
      list = list.filter((p) =>
        `${p.city || p.location || p.state || ""}`.toLowerCase().includes(s)
      );
    }

    if (minPrice !== "") {
      list = list.filter((p) => Number(p.price) >= Number(minPrice));
    }

    if (maxPrice !== "") {
      list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    if (sort === "Price: Low") {
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return Number(a.price) - Number(b.price);
      });
    } else if (sort === "Price: High") {
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return Number(b.price) - Number(a.price);
      });
    } else if (sort === "Oldest") {
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    } else {
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return list;
  }, [ads, q, breed, category, location, minPrice, maxPrice, sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, breed, category, location, minPrice, maxPrice, sort]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getAdId = (ad) => ad._id || ad.id;
  const getAdTitle = (ad) => ad.title || ad.breed || "Pet Ad";
  const getAdLocation = (ad) => { const parts = [ad.city, ad.state].filter(Boolean); return parts.length > 0 ? parts.join(", ") : ad.location || "Location"; };
  const getAdImage = (ad) =>
    ad.images && ad.images.length > 0
      ? ad.images[0]
      : "https://placehold.co/600x400?text=No+Image";
  const getSellerName = (ad) =>
    ad.sellerName ||
    ad.seller?.name ||
    ad.user?.name ||
    ad.owner?.name ||
    ad.postedBy?.name ||
    ad.username ||
    "Verified Seller";

  const getShareLink = (ad) => `${window.location.origin}/pet/${getAdId(ad)}`;

  const handleShare = async (ad) => {
    const shareUrl = getShareLink(ad);
    const shareText = `${getAdTitle(ad)} - ₹${Number(ad.price || 0).toLocaleString("en-IN")} - ${getAdLocation(ad)}`;

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

  const resetFilters = () => {
    setQ("");
    setBreed("");
    setCategory("All");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSort("Latest");
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div className="page" style={{ background: "#f7f7fb" }}>
      <section
        className="hero"
        style={{
          background: "linear-gradient(135deg, #fff4c7, #f7d774)",
          borderRadius: "22px",
          padding: "18px 24px 20px",
          marginBottom: "18px",
          boxShadow: "0 10px 24px rgba(160, 120, 20, 0.10)",
          border: "1px solid rgba(194, 150, 50, 0.16)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
          }}
        >
          <Link
            to="/post"
            style={{
              background: "linear-gradient(135deg, #b3122a, #7a0016)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "700",
              boxShadow: "0 8px 18px rgba(122,0,22,0.18)",
            }}
          >
            + Post Your Pet
          </Link>
        </div>

        <h1
          className="hero-title"
          style={{
            margin: "2px 0 6px",
            textAlign: "center",
            fontSize: "42px",
            lineHeight: "1.05",
            color: "#2c1a5a",
            fontWeight: "800",
            letterSpacing: "-0.8px",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Browse Pets
        </h1>

        <p
          className="hero-sub"
          style={{
            textAlign: "center",
            fontSize: "15px",
            fontWeight: "600",
            color: "#5b4b2a",
            margin: "0 auto 14px",
            maxWidth: "760px",
            lineHeight: "1.45",
          }}
        >
          Discover trusted listings, compare breeds, and connect with sellers in one place.
        </p>

        <div
          className="browse-filters"
          style={{
            background: "linear-gradient(135deg, rgba(179,18,42,0.10), rgba(122,0,22,0.10))",
            border: "1px solid rgba(122, 0, 22, 0.12)",
            borderRadius: "18px",
            padding: "12px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Row 1: Search Breed | Category */}
            <div style={{ background: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", padding: "0 12px", minHeight: "44px", boxShadow: "0 3px 8px rgba(0,0,0,0.04)" }}>
              <span style={{ marginRight: "8px" }}>🐾</span>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setQ(e.target.value), setBreed(e.target.value))} placeholder="Search breed..." style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" }} />
            </div>
            <div style={{ background: "#fff", borderRadius: "12px", minHeight: "44px", padding: "0 12px", display: "flex", alignItems: "center", boxShadow: "0 3px 8px rgba(0,0,0,0.04)" }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" }}>
                <option value="All">Category</option>
                <option value="Dogs">Dogs</option>
                <option value="Cats">Cats</option>
                <option value="Birds">Birds</option>
                <option value="Horse">Horse</option>
                <option value="Cow">Cow</option>
                <option value="Exotics">Exotics</option>
              </select>
            </div>
            {/* Row 2: Min Price | Max Price */}
            <div style={{ background: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", padding: "0 12px", minHeight: "44px", boxShadow: "0 3px 8px rgba(0,0,0,0.04)" }}>
              <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min ₹" style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" }} />
            </div>
            <div style={{ background: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", padding: "0 12px", minHeight: "44px", boxShadow: "0 3px 8px rgba(0,0,0,0.04)" }}>
              <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max ₹" style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" }} />
            </div>
            {/* Row 3: Location | Search Button */}
            <div style={{ background: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", padding: "0 12px", minHeight: "44px", boxShadow: "0 3px 8px rgba(0,0,0,0.04)" }}>
              <span style={{ marginRight: "8px" }}>📍</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", background: "transparent" }} />
            </div>
            <button onClick={() => { setQ(searchInput); setBreed(searchInput); }} style={{ minHeight: "44px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #7a0016, #b3122a)", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 8px 18px rgba(122,0,22,0.16)" }}>🔍 Search</button>
          </div>
        </div>
      </section>

      <section className="list">
        <div
          className="list-top"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div
            className="muted"
            style={{
              color: "#4b5563",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Showing {filtered.length} pets
          </div>

          <div
            className="sort"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "8px 12px",
            }}
          >
            <span className="muted" style={{ color: "#6b7280", fontSize: "14px" }}>
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              <option>Latest</option>
              <option>Oldest</option>
              <option>Price: Low</option>
              <option>Price: High</option>
            </select>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "40px 20px",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              border: "1px solid #ececec",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "10px" }}>🐾</div>
            <h3 style={{ margin: "0 0 8px", color: "#1f2937" }}>
              No pets match your filters
            </h3>
            <p style={{ margin: "0 0 18px", color: "#6b7280" }}>
              Try changing search, breed, location, or price range.
            </p>
            <button
              onClick={resetFilters}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #7a0016, #b3122a)",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(250px, 270px))",
              gap: "18px",
              justifyContent: "start",
            }}
          >
            {currentItems.map((p) => (
              <div
                key={getAdId(p)}
                className="card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = p.isFeatured
                    ? "0 24px 48px rgba(245,158,11,0.28)"
                    : "0 18px 38px rgba(15,23,42,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = p.isFeatured
                    ? "0 18px 40px rgba(245,158,11,0.20)"
                    : "0 12px 30px rgba(15,23,42,0.08)";
                }}
                style={{
                  position: "relative",
                  background: "#fff",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: p.isFeatured
                    ? "0 18px 40px rgba(245,158,11,0.20)"
                    : "0 12px 30px rgba(15,23,42,0.08)",
                  border: p.isFeatured
                    ? "1px solid rgba(245,158,11,0.45)"
                    : "1px solid rgba(226,232,240,0.95)",
                  transform: "translateY(0)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "pointer",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    border: "1px solid rgba(255,255,255,0.85)",
                    background: wishlist.some((item) => (item._id || item.id) === getAdId(p))
                      ? "linear-gradient(135deg, #fff1f2, #ffe4e6)"
                      : "rgba(255,255,255,0.92)",
                    width: "42px",
                    height: "42px",
                    borderRadius: "999px",
                    fontSize: "18px",
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(6px)",
                  }}
                  title="Wishlist"
                >
                  {wishlist.some((item) => (item._id || item.id) === getAdId(p)) ? "❤️" : "🤍"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(p);
                  }}
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: "12px",
                    border: "1px solid rgba(255,255,255,0.85)",
                    background: "rgba(255,255,255,0.92)",
                    color: "#111827",
                    width: "42px",
                    height: "42px",
                    borderRadius: "999px",
                    fontSize: "16px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(6px)",
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
                      top: "108px",
                      right: "12px",
                      background: "#fff",
                      borderRadius: "14px",
                      padding: "10px",
                      boxShadow: "0 18px 36px rgba(0,0,0,0.18)",
                      border: "1px solid #eef2f7",
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      minWidth: "160px",
                    }}
                  >
                    <button
                      onClick={() => handleCopyLink(p)}
                      style={{
                        border: "none",
                        background: "#f3f4f6",
                        padding: "10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "700",
                        color: "#111827",
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
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "center",
                        textDecoration: "none",
                        fontWeight: "700",
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
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "center",
                        textDecoration: "none",
                        fontWeight: "700",
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
                        fontWeight: "700",
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
                      top: "108px",
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
                    onClick={(e) => { e.stopPropagation(); if(p.images && p.images.length > 0) { setGalleryAd(p); setGalleryIndex(0); } }}
                    src={getAdImage(p)}
                    alt={getAdTitle(p)}
                    style={{
                      opacity: p.status === "Sold" ? 0.72 : 1,
                      height: isMobile ? "180px" : "220px",
                      width: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      background: "#eef2f7",
                      display: "block",
                      transition: "transform 0.3s ease",
                      cursor: "pointer",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.30) 34%, rgba(15,23,42,0.04) 68%)",
                      pointerEvents: "none",
                    }}
                  />

                  {p.status === "Sold" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "800",
                        zIndex: 4,
                        letterSpacing: "0.4px",
                        boxShadow: "0 8px 16px rgba(220,38,38,0.28)",
                      }}
                    >
                      SOLD
                    </div>
                  )}

                  {p.isFeatured && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: p.status === "Sold" ? "76px" : "12px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "900",
                        zIndex: 4,
                        letterSpacing: "0.5px",
                        boxShadow: "0 8px 16px rgba(245,158,11,0.28)",
                      }}
                    >
                      BOOSTED
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      left: "14px",
                      right: "14px",
                      bottom: "14px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: "10px",
                      zIndex: 3,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.16)",
                          border: "1px solid rgba(255,255,255,0.22)",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "800",
                          marginBottom: "8px",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        🏷️ {p.category || "Other"}
                      </div>

                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "900",
                          color: "#fff",
                          lineHeight: "1.1",
                          textShadow: "0 3px 10px rgba(0,0,0,0.28)",
                        }}
                      >
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 11px",
                        borderRadius: "999px",
                        background: p.isFeatured
                          ? "rgba(255,247,237,0.94)"
                          : "rgba(255,255,255,0.92)",
                        color: p.isFeatured ? "#b45309" : "#111827",
                        fontSize: "12px",
                        fontWeight: "800",
                        whiteSpace: "nowrap",
                        boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
                      }}
                    >
                      📍 {getAdLocation(p)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "14px 14px 16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: "#111827",
                          lineHeight: "1.35",
                          marginBottom: "6px",
                        }}
                      >
                        {getAdTitle(p)}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: "#f8fafc",
                            border: "1px solid #e5e7eb",
                            color: "#334155",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          🛡️ {getSellerName(p)}
                        </span>

                        {p.isFeatured && p.featuredUntil && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background: "#fff7ed",
                              border: "1px solid #fed7aa",
                              color: "#b45309",
                              fontSize: "12px",
                              fontWeight: "800",
                            }}
                          >
                            ⚡ Until {new Date(p.featuredUntil).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        padding: "8px 10px",
                        borderRadius: "14px",
                        background: p.isFeatured
                          ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                          : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                        color: p.isFeatured ? "#b45309" : "#475569",
                        fontSize: "12px",
                        fontWeight: "800",
                        textAlign: "right",
                        minWidth: "88px",
                      }}
                    >
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    {p.status === "Sold" ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "11px 14px",
                          borderRadius: "12px",
                          background: "#f3f4f6",
                          color: "#6b7280",
                          fontWeight: "800",
                          fontSize: "13px",
                          pointerEvents: "none",
                          minWidth: "132px",
                        }}
                      >
                        Sold Out
                      </span>
                    ) : (
                      <Link
                        to={`/pet/${getAdId(p)}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "11px 16px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #7a0016, #b3122a)",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: "800",
                          fontSize: "13px",
                          boxShadow: "0 10px 22px rgba(122,0,22,0.18)",
                          minWidth: "142px",
                        }}
                      >
                        View Details <span style={{ fontSize: "14px" }}>→</span>
                      </Link>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#64748b",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: p.status === "Sold" ? "#ef4444" : "#22c55e",
                          display: "inline-block",
                        }}
                      />
                      {p.status === "Sold" ? "Sold" : "Available"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div
            className="pagination"
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  border: currentPage === i + 1 ? "none" : "1px solid #ddd",
                  background:
                    currentPage === i + 1
                      ? "linear-gradient(135deg, #7a0016, #b3122a)"
                      : "#fff",
                  color: currentPage === i + 1 ? "#fff" : "#111827",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      <footer
        style={{
          marginTop: "42px",
          padding: "30px",
          background: "linear-gradient(135deg, #1f2937, #6b7280)",
          color: "white",
          textAlign: "center",
          borderRadius: "18px 18px 0 0",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <a href="/about" style={{ color: "#fde68a", margin: "0 15px" }}>About</a>
          <a href="/contact" style={{ color: "#fde68a", margin: "0 15px" }}>Contact</a>
          <a href="/terms" style={{ color: "#fde68a", margin: "0 15px" }}>Terms & Conditions</a>
        </div>

        <div style={{ fontSize: "14px", opacity: 0.9 }}>
          © 2026 Genetic Breeds Pet Marketplace. All rights reserved.
        </div>
      </footer>
      {galleryAd && (
        <div onClick={() => setGalleryAd(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0" }}>
          {/* Header */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)", zIndex: 2 }}>
            <div style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}>{galleryAd.title || "Photos"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{galleryIndex + 1} / {(galleryAd.images || []).length}</span>
              <button onClick={() => setGalleryAd(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "22px", width: "40px", height: "40px", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          </div>
          {/* Main Image */}
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <img src={(galleryAd.images || [])[galleryIndex]} alt="" style={{ maxHeight: "75vh", maxWidth: "100vw", objectFit: "contain", userSelect: "none" }} />
            {(galleryAd.images || []).length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setGalleryIndex(i => Math.max(0, i-1)); }} style={{ position: "absolute", left: "12px", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: "28px", width: "48px", height: "48px", borderRadius: "999px", cursor: "pointer", display: galleryIndex === 0 ? "none" : "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>‹</button>
                <button onClick={e => { e.stopPropagation(); setGalleryIndex(i => Math.min((galleryAd.images||[]).length-1, i+1)); }} style={{ position: "absolute", right: "12px", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: "28px", width: "48px", height: "48px", borderRadius: "999px", cursor: "pointer", display: galleryIndex === (galleryAd.images||[]).length-1 ? "none" : "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>›</button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "rgba(0,0,0,0.6)", padding: "12px 16px", display: "flex", gap: "8px", overflowX: "auto", justifyContent: "center" }}>
            {(galleryAd.images || []).map((img, i) => (
              <img key={i} src={img} alt="" onClick={() => setGalleryIndex(i)} style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", border: i === galleryIndex ? "2.5px solid #fff" : "2px solid rgba(255,255,255,0.2)", cursor: "pointer", opacity: i === galleryIndex ? 1 : 0.55, flexShrink: 0, transition: "all 0.2s" }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
