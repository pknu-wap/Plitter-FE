import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  // 분석 -> 카카오 로그인 버튼 클릭 시 동작하는 로직
  const handleKakaoLogin = () => {
    // 카카오 디벨로퍼스 REST API 키 넣기
    const REST_API_KEY = "REST API 키";
    
    // 로그인 성공 후 다시 돌려보낼 주소
    const REDIRECT_URI = "http://localhost:5173/auth/callback";

    // 카카오 로그인 페이지 주소 조립
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    // 완성된 주소로 화면 이동
    window.location.href = KAKAO_AUTH_URL;
  };

  // 분석 -> 게스트 버튼 클릭 시 메인으로 이동하는 로직
  const handleGuestLogin = () => {
    navigate("/main");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1> 카카오 로그인 </h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        {/* 카카오 로그인 버튼 UI */}
        <button 
          onClick={handleKakaoLogin}
          style={{ backgroundColor: "#FEE500", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          카카오로 시작하기
        </button>

        {/* 게스트 로그인 버튼 UI */}
        <button 
          onClick={handleGuestLogin}
          style={{ backgroundColor: "#EAEAEA", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          게스트로 둘러보기
        </button>
      </div>
      
    </div>
  );
}