import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import LoginPage from "./pages/LoginPage";
import AdminOverview from "./pages/AdminOverview";
import AuctionsPage from "./pages/AuctionsPage";
import CreateAuction from "./pages/CreateAuction";
import UsersPage from "./pages/UsersPage";
import TeamsPage from "./pages/TeamsPage";
import PlayersPage from "./pages/PlayersPage";
import HomePage from "./pages/HomePage";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import PublicPlayerRegistration from "./pages/PublicPlayerRegistration";
import LiveAuctionPage from "./pages/LiveAuctionPage";
import FeedbackPage from "./pages/FeedbackPage";
import { useEffect, useState } from "react";
import SiteOtpGate from "./components/SiteOtpGate";
import { SITE_LOCKED_EVENT, getSiteVerificationToken } from "./api/api";

export default function App() {
  const [siteVerified, setSiteVerified] = useState(() => Boolean(getSiteVerificationToken()));

  // Re-lock the site when the API reports that the OTP session expired.
  useEffect(() => {
    const lock = () => setSiteVerified(false);
    window.addEventListener(SITE_LOCKED_EVENT, lock);
    return () => window.removeEventListener(SITE_LOCKED_EVENT, lock);
  }, []);

  if (!siteVerified) return <SiteOtpGate onVerified={() => setSiteVerified(true)} />;
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register-player/:token" element={<PublicPlayerRegistration />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected user workspace */}
      <Route element={<ProtectedRoute role="user" />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/manage/teams" element={<TeamsPage />} />
          <Route path="/manage/players" element={<PlayersPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/live-auction" element={<LiveAuctionPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
      </Route>

      {/* Protected admin workspace */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="auctions" element={<AuctionsPage />} />
          <Route path="auctions/new" element={<CreateAuction />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="live-auction/:auctionId" element={<LiveAuctionPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
