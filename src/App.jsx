import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import SongSearch from './pages/SongSearch';
import CharacterLoading from "./pages/CharacterLoading";

function AuthTokenHandler() { // 백엔드에서 발급한 accessToken 수신,관리 모듈
  const location = useLocation(); // 현재 주소창 정보 가져옴
  const navigate = useNavigate(); // 페이지 이동 함수

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // 1. 주소창의 ? 뒤의 파라미터 분석
    const accessToken = searchParams.get("accessToken");
    // 2. 그중 accessToken 값 뽑아냄
    if (!accessToken) return;
    // 3. 토큰 없으면 종료
    localStorage.setItem("accessToken", accessToken);
    // 4. 토큰 있으면 브라우저의 localStorage(금고)에 저장
    searchParams.delete("accessToken");
    // 5. 주소창에서 accessToken 파라미터 지움
    navigate(
    // 6. 토큰 지운 주소로 브라우저 덮어씌움 (replace:true = 뒤로가기 방지)
      {
        pathname: location.pathname,
        search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]); 
  // 주소 바뀔 때마다 실행

  return null; // 화면에 그릴  UI 없으니 null 반환
}

function App() {
  return (
    <BrowserRouter>
      <AuthTokenHandler />
      <Routes>
        {/* 첫 화면(/) MainPage */}
        <Route path="/" element={<MainPage />} />

        {/* 로그인 페이지 */}
        <Route path="/login" element={<Login />} />

        {/* 게스트 로그인 후 경로 */}
        <Route path="/guest" element={<div> after guest login </div>} />

        {/* 카카오 인가 코드 수신 경로 */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* 카카오 로그인 완료 후 경로 */}
        <Route path="/main" element={<MainPage />} />
        {/* 노래 검색 페이지 */}
        <Route path="/search" element={<SongSearch />} /> 

        <Route path="/character-loading" element={<CharacterLoading />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
