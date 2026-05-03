import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const pets = [
    {
      id: 1,
      title: "Golden Retriever",
      location: "Chennai",
      price: 12000,
      category: "Dogs",
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=80",
      createdAt: "2026-03-18T10:30:00.000Z",
    },
    {
      id: 2,
      title: "Persian Cat",
      location: "Coimbatore",
      price: 8000,
      category: "Cats",
      image:
        "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80",
      createdAt: "2026-03-16T08:15:00.000Z",
    },
    {
      id: 3,
      title: "Parrot",
      location: "Madurai",
      price: 2500,
      category: "Birds",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      createdAt: "2026-03-17T15:45:00.000Z",
    },
    {
      id: 4,
      title: "Labrador Puppy",
      location: "Bangalore",
      price: 25000,
      category: "Dogs",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80",
      createdAt: "2026-03-14T12:20:00.000Z",
    },
    {
      id: 5,
      title: "Siamese Cat",
      location: "Salem",
      price: 9500,
      category: "Cats",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
      createdAt: "2026-03-13T09:00:00.000Z",
    },
    {
      id: 6,
      title: "Love Birds",
      location: "Hyderabad",
      price: 4500,
      category: "Birds",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      createdAt: "2026-03-12T18:10:00.000Z",
    },
  ];

  const finalCategory = category === "Other" ? customCategory : category;

  const filteredPets = useMemo(() => {
    let data = [...pets];

    data = data.filter((pet) => {
      const matchesSearch = search
        ? pet.title.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesLocation = location
        ? pet.location.toLowerCase().includes(location.toLowerCase())
        : true;

      const matchesCategory = finalCategory
        ? pet.category.toLowerCase().includes(finalCategory.toLowerCase())
        : true;

      const matchesMinPrice = minPrice ? pet.price >= Number(minPrice) : true;
      const matchesMaxPrice = maxPrice ? pet.price <= Number(maxPrice) : true;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    if (sortBy === "priceLow") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHigh") {
      data.sort((a, b) => b.price - a.price);
    } else if (sortBy === "oldest") {
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return data;
  }, [pets, search, location, finalCategory, minPrice, maxPrice, sortBy]);

  const handleShare = async (pet) => {
    const shareUrl = `${window.location.origin}/browse`;
    const shareText = `${pet.title} - ₹${pet.price.toLocaleString()} - ${pet.location}`;

    if (navigator.share && navigator.canShare()) {
      try {
        await navigator.share({
          title: pet.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.log("Share cancelled", err);
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f3f4f6",
    paddingBottom: "50px",
  };

  const containerStyle = {
    maxWidth: "1350px",
    margin: "0 auto",
  };

  const heroStyle = {
    background: "#ffffff",
    borderRadius: "0 0 22px 22px",
    boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
    padding: "28px 20px 20px",
    marginBottom: "18px",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "24px",
  };

  const gridFiltersStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
  };

  const rowBetweenStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "14px 0 18px",
    gap: "12px",
    flexWrap: "wrap",
  };

  const cardsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    position: "relative",
  };

  const badgeStyle = {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "999px",
    zIndex: 2,
  };

  const iconButtonStyle = {
    position: "absolute",
    right: "12px",
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    zIndex: 2,
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={heroStyle}>
          <div style={headerStyle}>
            <h1
              style={{
                margin: 0,
                fontSize: "64px",
                fontWeight: "800",
                color: "#2d2a59",
                lineHeight: 1.1,
              }}
            >
              Browse Pets
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                color: "#6b7280",
                fontSize: "16px",
              }}
            >
              Find your perfect companion from our verified sellers
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
            <Link
              to="/post"
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "12px 22px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Post Your Pet
            </Link>
          </div>

          <div style={gridFiltersStyle}>
            <input
              type="text"
              placeholder="Search pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value !== "Other") {
                  setCustomCategory("");
                }
              }}
              style={inputStyle}
            >
              <option value="">Category</option>
              <option value="Dogs">Dogs</option>
              <option value="Cats">Cats</option>
              <option value="Birds">Birds</option>
              <option value="Horse">Horse</option>
              <option value="Cow">Cow</option>
              <option value="Exotics">Exotics</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={inputStyle}
            />

            <div />
          </div>

          {category === "Other" && (
            <div style={{ marginTop: "12px" }}>
              <input
                type="text"
                placeholder="Enter category manually..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={rowBetweenStyle}>
          <div style={{ color: "#6b7280", fontSize: "15px" }}>
            Showing {filteredPets.length} pets
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#6b7280", fontSize: "15px" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                ...inputStyle,
                width: "180px",
                padding: "10px 14px",
              }}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div style={cardsGridStyle}>
          {filteredPets.map((pet) => (
            <div key={pet.id} style={cardStyle}>
              <div style={badgeStyle}>{pet.category}</div>

              <button
                style={{ ...iconButtonStyle, top: "10px" }}
                title="Wishlist"
              >
                ❤️
              </button>

              <button
                onClick={() => handleShare(pet)}
                style={{ ...iconButtonStyle, top: "56px" }}
                title="Share"
              >
                ↗
              </button>

              <img
                src={pet.image}
                alt={pet.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div style={{ padding: "16px" }}>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {pet.title}
                </h3>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  ₹{pet.price.toLocaleString()}
                  <span style={{ color: "#9ca3af", margin: "0 8px" }}>•</span>
                  <span style={{ color: "#6b7280", fontWeight: "500" }}>
                    {pet.location}
                  </span>
                </div>

                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Posted on: {new Date(pet.createdAt).toLocaleDateString()}
                </p>

                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#111827",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
