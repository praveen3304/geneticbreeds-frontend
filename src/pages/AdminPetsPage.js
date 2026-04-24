import React, { useEffect, useMemo, useState } from "react";
import AdminNav from "../components/AdminNav";
const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

const colors = {
  bg: "linear-gradient(180deg, #fff8f8 0%, #ffffff 58%, #fff7f7 100%)",
  primary: "#b11226",
  primaryDark: "#7f0d1c",
  primarySoft: "#fdecef",
  text: "#18212f",
  muted: "#667085",
  border: "#edd6da",
  white: "#ffffff",
  successBg: "#ecfdf3",
  successText: "#047857",
  successBorder: "#a7f3d0",
  dangerBg: "#fff1f2",
  dangerText: "#be123c",
  dangerBorder: "#fecdd3",
  cardShadow: "0 10px 28px rgba(17, 24, 39, 0.06)",
};

const statusTheme = {
  live: {
    bg: "#eafaf1",
    color: "#0f9f57",
    border: "1px solid #b8ebcb",
    label: "Live",
  },
  stopped: {
    bg: "#fff7e8",
    color: "#a16207",
    border: "1px solid #f5d48f",
    label: "Stopped",
  },
  rejected: {
    bg: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    label: "Rejected",
  },
  hidden: {
    bg: "#f3f4f6",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    label: "Hidden",
  },
  default: {
    bg: "#eef2ff",
    color: "#4338ca",
    border: "1px solid #c7d2fe",
    label: "Unknown",
  },
};

export default function AdminPetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const token = localStorage.getItem("gb_token");

  const getHeaders = (withJson = false) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    if (withJson) headers["Content-Type"] = "application/json";
    return headers;
  };

  const parseResponse = async (res) => {
    const raw = await res.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }
    return { raw, data };
  };

  const cleanHtmlError = (raw) => {
    if (!raw) return "";
    return raw
      .replace(/<pre>/gi, " ")
      .replace(/<\/pre>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getErrorMessage = (raw, data, fallback) => {
    if (data?.message) return data.message;
    const cleaned = cleanHtmlError(raw);
    return cleaned || fallback;
  };

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/pets`, {
        headers: getHeaders(),
      });

      const { raw, data } = await parseResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(raw, data, "Failed to fetch admin pets"));
      }

      setPets(Array.isArray(data.pets) ? data.pets : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
  };

  const handleAction = async (id, action) => {
    try {
      setBusyId(`${id}-${action}`);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE_URL}/api/admin/ads/${id}/${action}`, {
        method: `POST",
        headers: getHeaders(true),
      });

      const { raw, data } = await parseResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(raw, data, `Failed to ${action} ad`));
      }

      showSuccess(`Ad ${action} action completed successfully.`);
      await fetchPets();
    } catch (err) {
      console.error(err);
      showError(err.message || `Unable to ${action} this ad.`);
    } finally {
      setBusyId("");
    }
  };

  const handleHide = async (id) => {
    try {
      setBusyId(`${id}-hide`);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE_URL}/api/admin/ads/${id}/hide`, {
        method: `POST",
        headers: getHeaders(true),
      });

      const { raw, data } = await parseResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(raw, data, "Failed to hide ad"));
      }

      showSuccess("Ad hidden successfully.");
      await fetchPets();
    } catch (err) {
      console.error(err);
      showError(err.message || "Unable to hide this ad.");
    } finally {
      setBusyId("");
    }
  };

  const normalizedPets = useMemo(() => {
    return pets.map((pet) => ({
      ...pet,
      normalizedStatus: String(pet.status || "").toLowerCase(),
      images: Array.isArray(pet.images) ? pet.images.filter(Boolean) : [],
    }));
  }, [pets]);

  const filteredPets = useMemo(() => {
    return normalizedPets.filter((pet) => {
      const haystack = [pet.title, pet.adCode, pet.breed, pet.status, pet._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || pet.normalizedStatus === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [normalizedPets, query, statusFilter]);

  const stats = useMemo(() => {
    const count = (value) =>
      normalizedPets.filter((pet) => pet.normalizedStatus === value).length;

    return [
      { label: "Total", value: normalizedPets.length, accent: "#111827" },
      { label: "Live", value: count("live"), accent: "#0f9f57" },
      { label: "Stopped", value: count("stopped"), accent: "#a16207" },
      { label: "Rejected", value: count("rejected"), accent: "#be123c" },
      { label: "Hidden", value: count("hidden"), accent: "#475467" },
    ];
  }, [normalizedPets]);

  const getStatusStyle = (status) =>
    statusTheme[String(status || "").toLowerCase()] || statusTheme.default;

  const openPreview = (img, title) => {
    setPreviewImage(img);
    setPreviewTitle(title || "Ad Image");
  };

  const closePreview = () => {
    setPreviewImage("");
    setPreviewTitle("");
  };

  const actionButtonStyle = (variant = "primary", disabled = false) => ({
    border: "none",
    borderRadius: "12px",
    padding: "10px 15px",
    fontWeight: 800,
    fontSize: "12px",
    cursor: disabled ? "not-allowed" : "pointer",
    minWidth: "92px",
    opacity: disabled ? 0.65 : 1,
    transition: "all 0.2s ease",
    background:
      variant === "danger"
        ? "linear-gradient(135deg, #ef4444, #be123c)"
        : variant === "warning"
        ? "linear-gradient(135deg, #f59e0b, #d97706)"
        : variant === "muted"
        ? "#f4f4f5"
        : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    color: variant === "muted" ? "#344054" : "#fff",
    boxShadow:
      variant === "muted" ? "none" : "0 8px 18px rgba(17, 24, 39, 0.12)",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        padding: "12px 16px 20px",
      }}
    >
      <AdminNav />

      <div style={{ maxWidth: "1260px", margin: "12px auto 0" }}>
        <div
          style={{
            position: "sticky",
            top: "72px",
            zIndex: 20,
            background: `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
            borderRadius: "22px",
            padding: "16px 18px",
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
                Admin Control Center
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "24px",
                  lineHeight: 1.15,
                  fontWeight: 800,
                }}
              >
                Pet Ads Management
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Review ads, monitor status, preview listing images, and manage moderation quickly.
              </p>
            </div>

            <button
              onClick={fetchPets}
              style={{
                ...actionButtonStyle("muted", false),
                background: "rgba(255,255,255,0.16)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.24)",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                background: colors.white,
                borderRadius: "18px",
                padding: "14px 16px",
                border: `1px solid ${colors.border}`,
                boxShadow: "0 8px 18px rgba(17, 24, 39, 0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: colors.muted,
                  marginBottom: "6px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  color: item.accent,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: colors.white,
            borderRadius: "18px",
            border: `1px solid ${colors.border}`,
            boxShadow: "0 8px 20px rgba(17, 24, 39, 0.05)",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Search by title, breed, ad code, or status"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: "1 1 260px",
                minWidth: "220px",
                padding: "11px 14px",
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                outline: "none",
                fontSize: "13px",
                background: "#fff",
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                minWidth: "150px",
                padding: "11px 14px",
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                outline: "none",
                fontSize: "13px",
                background: colors.primarySoft,
                color: colors.text,
                fontWeight: 700,
              }}
            >
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="stopped">Stopped</option>
              <option value="rejected">Rejected</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: "12px",
              background: colors.dangerBg,
              color: colors.dangerText,
              border: `1px solid ${colors.dangerBorder}`,
              padding: "12px 14px",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "13px",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginBottom: "12px",
              background: colors.successBg,
              color: colors.successText,
              border: `1px solid ${colors.successBorder}`,
              padding: "12px 14px",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            {success}
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              background: colors.white,
              borderRadius: "18px",
              padding: "22px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.muted,
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Loading ads...
            </p>
          </div>
        ) : filteredPets.length === 0 ? (
          <div
            style={{
              background: colors.white,
              borderRadius: "18px",
              padding: "24px",
              textAlign: "center",
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "8px",
                color: colors.text,
                fontSize: "18px",
              }}
            >
              No ads found
            </h3>
            <p
              style={{
                marginBottom: 0,
                color: colors.muted,
                fontSize: "13px",
              }}
            >
              Try changing the search text or status filter.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {filteredPets.map((pet) => {
              const statusMeta = getStatusStyle(pet.status);
              const hasImages = pet.images && pet.images.length > 0;
              const mainImage = hasImages ? pet.images[0] : "";

              return (
                <div
                  key={pet._id}
                  style={{
                    background: colors.white,
                    borderRadius: "20px",
                    border: `1px solid ${colors.border}`,
                    boxShadow: colors.cardShadow,
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "116px minmax(0, 1fr)",
                      gap: "14px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div
                        onClick={() =>
                          mainImage ? openPreview(mainImage, pet.title || "Ad Image") : null
                        }
                        style={{
                          width: "116px",
                          height: "116px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          background: "#f3f4f6",
                          border: `1px solid ${colors.border}`,
                          marginBottom: "8px",
                          cursor: mainImage ? "pointer" : "default",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={pet.title || "pet"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "11px",
                              color: colors.muted,
                              fontWeight: 700,
                            }}
                          >
                            No Image
                          </span>
                        )}
                      </div>

                      {hasImages ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "6px",
                          }}
                        >
                          {pet.images.slice(0, 6).map((img, index) => (
                            <div
                              key={`${pet._id}-${index}`}
                              onClick={() => openPreview(img, pet.title || "Ad Image")}
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: `1px solid ${colors.border}`,
                                cursor: "pointer",
                                background: "#f8fafc",
                              }}
                              title={`Preview image ${index + 1}`}
                            >
                              <img
                                src={img}
                                alt={`pet-${index}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <h2
                            style={{
                              margin: "0 0 10px",
                              color: colors.text,
                              fontSize: "18px",
                              lineHeight: 1.25,
                            }}
                          >
                            {pet.title || "Untitled"}
                          </h2>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginBottom: "10px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "5px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: 800,
                                background: statusMeta.bg,
                                color: statusMeta.color,
                                border: statusMeta.border,
                              }}
                            >
                              {statusMeta.label}
                            </span>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "5px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: colors.primarySoft,
                                color: colors.primaryDark,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {pet.breed || "No Breed"}
                            </span>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "5px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: "#f8fafc",
                                color: colors.muted,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {pet.images?.length || 0} Image
                              {(pet.images?.length || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => {
                              if (window.confirm("Reject this ad?")) {
                                handleAction(pet._id, "reject");
                              }
                            }}
                            disabled={!!busyId}
                            style={actionButtonStyle("danger", !!busyId)}
                          >
                            {busyId === `${pet._id}-reject` ? "Rejecting..." : "Reject"}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm("Stop this ad?")) {
                                handleAction(pet._id, "stop");
                              }
                            }}
                            disabled={!!busyId}
                            style={actionButtonStyle("warning", !!busyId)}
                          >
                            {busyId === `${pet._id}-stop` ? "Stopping..." : "Stop"}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm("Hide this ad?")) {
                                handleHide(pet._id);
                              }
                            }}
                            disabled={!!busyId}
                            style={{
                              ...actionButtonStyle("muted", !!busyId),
                              border: `1px solid ${colors.border}`,
                            }}
                          >
                            {busyId === `${pet._id}-hide` ? "Hiding..." : "Hide"}
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                          gap: "10px",
                          marginTop: "4px",
                        }}
                      >
                        <InfoCard label="Ad Code" value={pet.adCode || "N/A"} />
                        <InfoCard label="Breed" value={pet.breed || "N/A"} />
                        <InfoCard label="Status" value={pet.status || "N/A"} />
                        <InfoCard label="Pet ID" value={pet._id || "N/A"} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewImage ? (
        <div
          onClick={closePreview}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.72)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(920px, 96vw)",
              background: "#fff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: colors.text,
                  fontSize: "14px",
                }}
              >
                {previewTitle}
              </div>

              <button
                onClick={closePreview}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  color: "#111827",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px",
                maxHeight: "80vh",
              }}
            >
              <img
                src={previewImage}
                alt={previewTitle}
                style={{
                  maxWidth: "100%",
                  maxHeight: "74vh",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        padding: "11px 12px",
        borderRadius: "14px",
        background: "#fcfcfd",
        border: "1px solid #edf0f3",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#111827",
          fontWeight: 700,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
