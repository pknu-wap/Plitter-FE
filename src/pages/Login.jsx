// 카카오 로그인 페이지

import { useNavigate } from "react-router-dom"; // Hook import
import kakaoBtn from "../assets/kakao_login.png";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://3.39.194.83:8080";

export default function Login() { // component 선언
    const navigate = useNavigate();

    // 카카오 로그인 이후
    const handleKakaoLogin = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/kakao/login`);

            if (!response.ok) {
                throw new Error("카카오 로그인 URL 요청 실패");
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

    // 게스트 로그인 이후
    const handleGuestLogin = () => {
        navigate("/guest");
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
