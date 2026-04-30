import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 첫 화면(/) LoginPage*/}
        <Route path="/" element={<Login/>} />
        
        {/* 게스트 로그인 후 임시경로*/}
        <Route path="/main" element={<div> main page (guest)</div>} />
        
        {/* 카카오 로그인 후 돌아올 경로*/}
        <Route path="/auth/callback" element={<div> kakao login.. </div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;