import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    
    console.log("인가 코드:", code);

    if (code) {
      navigate("/main");
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div>
      <h2> kakao login..</h2>
    </div>
  );
}