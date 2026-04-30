// 카카오 로그인 Redirect URI용 페이지

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code") // 인가 코드
    
    console.log("인가코드:", code);

    if (code) {
      navigate("/main");
    } else { // 인가코드 없으면 로그인 페이지로
      //navigate("/");
    }
  }, [navigate]);

  return (
    <div>
      <h2> kakao login..</h2>
    </div>
  );
}