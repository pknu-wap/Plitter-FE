import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AuthCallback from "./pages/AuthCallback";
import CommentList from "./pages/CommentList";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import LpPage from "./pages/LpPage";
import MainPage from "./pages/MainPage";
import ProfileShare from "./pages/ProfileShare";
import RealMain from "./pages/RealMain";
import SharedPlaylistEntry from "./pages/SharedPlaylistEntry";
import SongSearch from "./pages/SongSearch";

function AuthTokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) return;

    localStorage.setItem("accessToken", accessToken);
    localStorage.removeItem("guestToken");
    localStorage.removeItem("guestNickname");

    const postLoginRedirect = localStorage.getItem("postLoginRedirect");
    localStorage.removeItem("postLoginRedirect");
    navigate(postLoginRedirect || "/main", { replace: true });
  }, [location.pathname, location.search, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthTokenHandler />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/guest" element={<div>after guest login</div>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/search" element={<SongSearch />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/realmain" element={<RealMain />} />
        <Route path="/profile-share" element={<ProfileShare />} />
        <Route path="/playlist/:playlistId" element={<SharedPlaylistEntry />} />
        <Route path="/lp" element={<LpPage />} />
        <Route path="/comments" element={<CommentList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
