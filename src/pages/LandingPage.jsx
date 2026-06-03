import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./LandingPage.css";

import ellipse14 from "../assets/Ellipse 14.png";
import ellipse25 from "../assets/Ellipse 25.png";
import ellipse26 from "../assets/Ellipse 26.png";
import ellipse32 from "../assets/Ellipse 32.png";
import ellipse33 from "../assets/Ellipse 33.png";
import ellipse34 from "../assets/Ellipse 34.png";
import ellipse35 from "../assets/Ellipse 35.png";
import ellipse36 from "../assets/Ellipse 36.png";
import ellipse37 from "../assets/Ellipse 37.png";
import number18 from "../assets/NUMBER 18.png";

import plitterLogo from "../assets/Plitter.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { playlistId } = useParams();

  const isSharedLinkEntry = Boolean(playlistId);

  const handleKakaoLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/kakao/login`);
      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS" || !payload?.content) {
        throw new Error(payload?.message || "카카오 로그인 URL 요청에 실패했습니다.");
      }

      window.location.href = payload.content;
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      alert(error.message || "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleGuestRecommend = () => {
    if (!playlistId) {
      navigate("/search");
      return;
    }

    navigate(`/playlist/${playlistId}/recommend`);
  };

  return (
    <main className="landing-page">
      <header className="landing-header">
        <img src={plitterLogo} alt="PLITTER" className="plitter-logo" />
      </header>

      <section className="landing-hero">
        <div className="hero-text">
          <p className="hero-find">FIND</p>

          <p className="hero-description">
            친구들이 추천한 노래로 나만의 노래 취향을 발견해요
          </p>

          <p className="hero-your">YOUR</p>
        </div>

        <div className="vinyl-record">
          <img className="lp-layer lp-ellipse-25" src={ellipse25} alt="" />
          <img className="lp-layer lp-ellipse-14" src={ellipse14} alt="" />
          <img className="lp-layer lp-ellipse-37" src={ellipse37} alt="" />
          <img className="lp-layer lp-ellipse-33" src={ellipse33} alt="" />
          <img className="lp-layer lp-ellipse-35" src={ellipse35} alt="" />
          <img className="lp-layer lp-ellipse-36" src={ellipse36} alt="" />
          <img className="lp-layer lp-ellipse-34" src={ellipse34} alt="" />

          <img className="lp-number" src={number18} alt="NUMBER 18" />
          <img className="lp-center" src={ellipse26} alt="" />
          <img className="lp-dot" src={ellipse32} alt="" />
        </div>
      </section>

      <section className="landing-login-section">
        <p className="login-guide">SNS 계정으로 간편 가입하기</p>

        <button
          type="button"
          className="kakao-login-button"
          onClick={handleKakaoLogin}
        >
          <span className="kakao-icon" />
          <span className="kakao-login-label">카카오계정으로 로그인</span>
        </button>

        {isSharedLinkEntry && (
          <button
            type="button"
            className="guest-recommend-button"
            onClick={handleGuestRecommend}
          >
            게스트로 추천만 할게요 →
          </button>
        )}
      </section>
    </main>
  );
}