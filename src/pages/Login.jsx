// 카카오 로그인 페이지

import { useNavigate } from "react-router-dom"; // Hook import
import kakaoBtn from "../assets/kakao_login.png"

export default function Login() { // component 선언
    const navigate = useNavigate();

    // 카카오 로그인 버튼 클릭 후 로직
    const handleKakaoLogin = () => {
        // 카카오 디벨로퍼스 REST API 키 
        const REST_API_KEY = "1d65ad9d5b15d04d74d793739309ba69";

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
        <div style={{ // 페이지 전체 중앙 정렬
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#ffffff"
        }}>

            <div style={{ // 카카오,게스트 버튼 묶음
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "340px"
            }}>
                {/* 게스트 로그인 UI */}
                <button
                    onClick={handleGuestLogin} // Event Binding: 클릭->로그인
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#8D949E"
                    }}
                > 게스트로 추천만 할게요
                </button>

                {/* 카카오 로그인 UI */}
                <img
                    src={kakaoBtn}
                    onClick={handleKakaoLogin}
                    alt="카카오 로그인 버튼"
                    style={{
                        width: "340px",
                        height: "45px",
                        borderRadius: "24.5px",
                        cursor: "pointer",
                        objectFit: "fill" // 이미지가 버튼 크기에 맞게
                    }}
                />
            </div>

        </div>
    );
}