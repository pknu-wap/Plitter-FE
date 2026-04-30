import { useNavigate } from "react-router-dom"; // Hook import

export default function Login() { // component 선언
  const navigate = useNavigate();

  // 카카오 로그인 버튼 클릭 후 로직
  const handleKakaoLogin = () => {
    // 카카오 디벨로퍼스 REST API 키 넣기
    const REST_API_KEY = "REST API 키";
    
    // 로그인 후 돌아올 주소
    const REDIRECT_URI = "http://localhost:5173/auth/callback";

    // KaKao Template Literal : REST API KEY, REDIECT_URI 전송
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    // External Redirect : 카카오 서버로 이동
    window.location.href = KAKAO_AUTH_URL;
  };

  // 게스트 버튼 클릭 후 메인으로 이동
  const handleGuestLogin = () => {
    navigate("/main");
  };

  // JSX Rendering
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        {/* 카카오 로그인 버튼 UI */}
        <button 
          onClick={handleKakaoLogin} // Event Binding : 매뉴얼 함수 연결
          style={{ backgroundColor: "#FEE500", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          카카오계정으로 로그인
        </button>

        {/* 게스트 로그인 버튼 UI */}
        <button 
          onClick={handleGuestLogin}
          style={{ backgroundColor: "#EAEAEA", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          게스트로 추천만 할게요
        </button>
      </div>
      
    </div>
  );
}