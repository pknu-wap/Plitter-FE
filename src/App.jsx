import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import SongSearch from "./pages/SongSearch";
import LandingPage from "./pages/LandingPage";
import RealMain from "./pages/RealMain";
import ProfileShare from "./pages/ProfileShare";

function AuthTokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) return;

    localStorage.setItem("accessToken", accessToken);

    searchParams.delete("accessToken");

    navigate(
      {
        pathname: location.pathname,
        search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      },
      { replace: true }
    );
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
          
          
      </Routes>
    </BrowserRouter>
  );
}

export default App;