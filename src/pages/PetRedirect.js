import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PetRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

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
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };
    startChat();
  }, [id, navigate]);

  if (error) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p>Unable to open this listing. Please log in and try again.</p>
      </div>
    );
  }

  return <div style={{ padding: "100px 20px", textAlign: "center" }}>Loading...</div>;
}
