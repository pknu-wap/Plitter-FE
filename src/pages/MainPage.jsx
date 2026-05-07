import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VinylCarousel from "../components/VinylCarousel";
import { dummyTracks } from "../data/dummyTracks";
import "./MainPage.css";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://3.39.194.83:8080";

export default function MainPage() {
  const [, setSelectedTrack] = useState(dummyTracks[0]);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(accessToken);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, [location.pathname, location.search]);

  const handleAuthButtonClick = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      navigate("/", { replace: true });
    }
  };

  return (
    <main className="main-page">
      <header className="main-header">
        <h1>FIND YOUR NUMBER 18</h1>
        <button className="login-button" onClick={handleAuthButtonClick}>
          {isLoggedIn ? "logout" : "login"}
        </button>
      </header>

      <section className="record-section">
        <VinylCarousel tracks={dummyTracks} onSelect={setSelectedTrack} />
      </section>

      <button className="recommend-button">+ 노래 추천하기</button>
    </main>
  );
}
