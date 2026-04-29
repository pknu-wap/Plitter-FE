import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 첫 화면(/)에 LoginPage 띄우기 */}
        <Route path="/" element={<Login/>} />
        
        {/* 게스트 버튼을 누르면 이동할 임시 경로*/}
        <Route path="/main" element={<div>메인 페이지 (게스트 입장 완료)</div>} />
        
        {/* 카카오 로그인 후 돌아올 경로*/}
        <Route path="/auth/callback" element={<div>카카오 로그인 처리 중...</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;