// 카카오 로그인 Redirect URI용 페이지

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import "./AuthCallback.css";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const hasAccessToken = params.get("accessToken");
    const fallbackPath = code ? "/profile-share" : "/landing";

    const timer = window.setTimeout(() => {
      if (!hasAccessToken) {
        navigate(fallbackPath, { replace: true });
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="auth-callback-page" aria-label="로그인 처리 중">
      <img src={plitterLogo} alt="PLITTER" className="auth-callback-brand-image" />
      <div className="auth-callback-blobs" aria-hidden="true">
        <span className="blob blob-yellow" />
        <span className="blob blob-orange" />
        <span className="blob blob-blue" />
        <span className="blob blob-pink" />
        <span className="blob blob-green" />
        <span className="blob blob-violet" />
      </div>
    </main>
  );
}
