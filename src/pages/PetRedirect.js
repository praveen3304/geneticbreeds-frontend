import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SellerAdView from "./SellerAdView";

export default function PetRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [isOwnAd, setIsOwnAd] = useState(false);

  useEffect(() => {
    const startChat = async () => {
      try {
        const token = localStorage.getItem("gb_token");
        const res = await fetch("https://genetic-breeds-backend.onrender.com/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ adId: id }),
        });
        const data = await res.json();
        if (data.chat?._id) {
          navigate(`/chat/${data.chat._id}`, { replace: true });
        } else if (data.error === "You cannot chat with your own ad") {
          setIsOwnAd(true);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };
    startChat();
  }, [id, navigate]);

  if (isOwnAd) {
    return <SellerAdView adId={id} />;
  }

  if (error) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p>Unable to open this listing. Please log in and try again.</p>
      </div>
    );
  }

  return <div style={{ padding: "100px 20px", textAlign: "center" }}>Loading...</div>;
}
