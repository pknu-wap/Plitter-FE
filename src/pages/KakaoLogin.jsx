function KakaoLogin() {
    const LoginButton = () => {
        alert("카카오 로그인 API 연결 대기");
    };

    return (
    // return 안 : 부모 태그(div) 1개만
        <div>
            <button onClick={LoginButton}>
            카카오 로그인 연동 테스트 
            </button>
        </div>
    );
}

export default KakaoLogin; //KakaoLogin 함수 내보내기