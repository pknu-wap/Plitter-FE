import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import kakaoBtn from "../assets/kakao_login.png";
import { buildSearchPath } from "../lib/playlistShare";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const publicShareId =
    searchParams.get("publicShareId") || searchParams.get("playlistId");
  const redirectParam = searchParams.get("redirect");
  const storedRedirectPath = localStorage.getItem("postLoginRedirect") || "";
  const shareRedirectPath =
    redirectParam || storedRedirectPath || buildSearchPath(publicShareId);
  const redirectPath = shareRedirectPath || "";
  const hasPlaylistContext =
    shareRedirectPath.includes("publicShareId=") ||
    shareRedirectPath.includes("/playlist/");

  const handleKakaoLogin = async () => {
    try {
      if (redirectPath) {
        localStorage.setItem("postLoginRedirect", redirectPath);
      } else {
        localStorage.removeItem("postLoginRedirect");
      }
      const response = await fetch("/api/auth/kakao/login");

      if (!response.ok) {
        throw new Error("카카오 로그인 URL 요청에 실패했습니다.");
      }

      const data = await response.json();

      if (data.code !== "SUCCESS" || !data.content) {
        throw new Error(data.message || "카카오 로그인 URL이 없습니다.");
      }

      window.location.href = data.content;
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
    }
  };

  
  // *** 게스트 토큰 및 랜덤 닉네임 발급 api ***
  const handleGuestLogin = async () => {
    if (!hasPlaylistContext) {
      alert("게스트 추천은 플레이리스트 공유링크에서만 시작할 수 있어요.");
      return;
    }

    setIsGuestLoading(true);

    try {
      // 1. 게스트 생성 요청 : guestToken과 랜덤 닉네임 발급
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      // 2. 응답을 JS로 바꿔서 guestToken, nickname을 꺼낼 준비
      const data = await response.json();

      // 백엔드 응답 래퍼가 response/content 중 무엇이든 처리하게
      const guestData = data.response || data.content || data;
      const issuedGuestToken = guestData.guestToken;
      const issuedGuestNickname = guestData.nickname || guestData.randomNickname;

      console.log("guest login response:", data);

      if (!response.ok || !issuedGuestToken || !issuedGuestNickname) {
        throw new Error(data.message || "게스트 토큰 발급에 실패했습니다.");
      }

      // 3. 게스트 흐름 : 카카오 로그인 토큰과 섞이면 안되니 accessToken 삭제
      localStorage.removeItem("accessToken");

      // 4. 이후 추천 등록 API에서 사용할 게스트 정보는 localStorage에 보관
      localStorage.setItem("guestToken", issuedGuestToken);
      localStorage.setItem("guestNickname", issuedGuestNickname);
      localStorage.removeItem("postLoginRedirect");

      // 5. 로그인 이후 목적지로 이동
      navigate(shareRedirectPath);
    } catch (error) {
      console.error("게스트 로그인 실패:", error);
      alert(error.message || "게스트 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-content">
        <div className="login-title-box">
          <h1>FIND YOUR NUMBER 18</h1>
        </div>

        <p className="login-description">
          친구들이 추천한 노래로 나만의 음악 정체성을 발견해요
        </p>
      </section>

      <section className="login-button-section">
        <p className="login-sub-text">SNS 계정으로 간편 가입하기</p>

        <img
          src={kakaoBtn}
          onClick={handleKakaoLogin}
          alt="카카오계정으로 로그인"
          className="kakao-login-button"
        />

        <button
          onClick={handleGuestLogin}
          className="guest-login-button"
          disabled={isGuestLoading}
        >
          {isGuestLoading ? "게스트 생성 중..." : "게스트로 추천만 할게요"}
        </button>
      </section>
    </div>
  );
}
