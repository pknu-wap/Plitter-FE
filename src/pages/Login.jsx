import { useState } from "react";
import { useNavigate } from "react-router-dom";
import kakaoBtn from "../assets/kakao_login.png";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleKakaoLogin = async () => {
    try {
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

      if (!response.ok || !data.response?.guestToken || !data.response?.nickname) {
        throw new Error(data.message || "게스트 토큰 발급에 실패했습니다.");
      }

      // 3. 게스트 흐름 : 카카오 로그인 토큰과 섞이면 안되니 accessToken 삭제
      localStorage.removeItem("accessToken");

      // 4. 이후 추천 등록 API에서 사용할 게스트 정보는 localStorage에 보관
      localStorage.setItem("guestToken", data.response.guestToken);
      localStorage.setItem("guestNickname", data.response.nickname);

      // 5. 게스트도 노래 검색 후 추천해야 하므로 SongSearch 페이지로 이동
      navigate("/search");
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
