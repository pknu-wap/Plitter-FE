import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, parseJson } from "../lib/api";
import RealMain from "./RealMain";
import "./LandingPage.css";

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
    <RealMain
      loginSection={
        <section className="landing-login-section" aria-label="로그인">
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
      }
    />
  );
}
