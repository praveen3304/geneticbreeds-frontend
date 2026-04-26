import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import PawAnimation from "./components/PawAnimation";
import toast from "react-hot-toast";

import PetDetails from "./pages/PetDetails";
import Chat from "./pages/Chat";
import Chats from "./pages/Chats";
import Wishlist from "./pages/Wishlist";
import ResetPassword from "./pages/ResetPassword";
import MyAds from "./pages/MyAds";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDailyPostsPage from "./pages/AdminDailyPostsPage";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import AdminReferralsPage from "./pages/AdminReferralsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminLicencesPage from "./pages/AdminLicencesPage";
import Plans from "./pages/Plans";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import BrowsePets from "./pages/BrowsePets";
import Terms from "./pages/Terms";
import PostAd from "./pages/PostAd";
import Contact from "./pages/Contact";
import AdminPetsPage from "./pages/AdminPetsPage";
import SellerProfile from "./pages/SellerProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Disclaimer from "./pages/Disclaimer";
import RefundPolicy from "./pages/RefundPolicy";
import About from "./pages/About";

export default function App() {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("gb_token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gb_user") || "null");
    } catch {
      return null;
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("gb_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("gb_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (post) => {
    const postId = post._id || post.id;
    const exists = wishlist.find((item) => (item._id || item.id) === postId);

    if (exists) {
      setWishlist(wishlist.filter((item) => (item._id || item.id) !== postId));
      toast("Removed from wishlist ❌");
    } else {
      setWishlist([...wishlist, post]);
      toast.success("Added to wishlist ❤️");
    }
  };

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const isAuthed = !!token;
  const isAdmin = !!user && user.role === "admin";

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  const onLogout = () => {
    localStorage.removeItem("gb_token");
    localStorage.removeItem("gb_user");
    setToken("");
    setUser(null);

    toast("Logged out 👋");
    setAuthOpen(false);
  };

  const onAuthSuccess = ({ token: newToken, user: newUser }) => {
    if (newToken) {
      localStorage.setItem("gb_token", newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem("gb_user", JSON.stringify(newUser));
      setUser(newUser);
    }

    toast.success("Login successful 🚀");
    setAuthOpen(false);
    navigate("/browse", { replace: true });
  };

  return (
    <>
      <Toaster position="top-right" />
      <PawAnimation />

      <Navbar
        isAuthed={isAuthed}
        wishlist={wishlist}
        onLogin={openLogin}
        onRegister={openRegister}
        onLogout={onLogout}
        isAdmin={isAdmin}
      />

      {authOpen && (
        <AuthModal
          type={authMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={onAuthSuccess}
        />
      )}

      {/* 🔥 MAIN CONTENT */}
      <div style={{ minHeight: "90vh" }}>
        <Routes>
          <Route path="/" element={<Landing onLogin={openLogin} onRegister={openRegister} />} />

          <Route path="/admin/dashboard" element={isAuthed && isAdmin ? <AdminDashboardPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/daily-posts" element={isAuthed && isAdmin ? <AdminDailyPostsPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/referrals" element={isAuthed && isAdmin ? <AdminReferralsPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/users" element={isAuthed && isAdmin ? <AdminUsersPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/licences" element={isAuthed && isAdmin ? <AdminLicencesPage /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={isAuthed && isAdmin ? <AdminPetsPage /> : <Navigate to="/" replace />} />

          <Route path="/plans" element={<Plans />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-ads" element={isAuthed ? <MyAds /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={isAuthed ? <Profile /> : <Navigate to="/" replace />} />

          {/* ✅ LEGAL */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/refund" element={<RefundPolicy />} />

          <Route path="/browse" element={isAuthed ? <BrowsePets wishlist={wishlist} toggleWishlist={toggleWishlist} /> : <Navigate to="/" replace />} />
          <Route path="/wishlist" element={isAuthed ? <Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} /> : <Navigate to="/" replace />} />
          <Route path="/post" element={isAuthed ? <PostAd /> : <Navigate to="/" replace />} />
          <Route path="/chats" element={isAuthed ? <Chats /> : <Navigate to="/" replace />} />
          <Route path="/contact" element={isAuthed ? <Contact /> : <Navigate to="/" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/seller/:sellerId" element={<SellerProfile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* 🔥 FOOTER FIXED */}
      <footer style={{ textAlign: "center", padding: "20px", marginTop: "40px", background: "#0f172a" }}>
        <Link to="/terms">Terms</Link> |{" "}
        <Link to="/privacy">Privacy</Link> |{" "}
        <Link to="/disclaimer">Disclaimer</Link> |{" "}
        <Link to="/refund">Refund</Link>
      </footer>
    </>
  );
}
