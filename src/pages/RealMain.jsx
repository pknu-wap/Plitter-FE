import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./RealMain.css";

import plitterLogo from "../assets/Plitter.png";

import ellipse14 from "../assets/Ellipse 14.png";
import ellipse25 from "../assets/Ellipse 25.png";
import ellipse26 from "../assets/Ellipse 26.png";
import ellipse32 from "../assets/Ellipse 32.png";
import ellipse33 from "../assets/Ellipse 33.png";
import ellipse34 from "../assets/Ellipse 34.png";
import ellipse35 from "../assets/Ellipse 35.png";
import ellipse36 from "../assets/Ellipse 36.png";
import ellipse37 from "../assets/Ellipse 37.png";
import number18 from "../assets/NUMBER 18.png";

import ellipse27 from "../assets/Ellipse 27.png";
import ellipse28 from "../assets/Ellipse 28.png";
import ellipse29 from "../assets/Ellipse 29.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [thumbX, setThumbX] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  const maxSlide = 74;

  const handleKakaoLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/kakao/login`);
      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS" || !payload?.content) {
        throw new Error(payload?.message || "카카오 로그인 URL 요청에 실패했습니다.");
      }

      window.location.href = payload.content;
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      alert(error.message || "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleGuestStart = () => {
    navigate("/landing");
  };

  const handleSliderDown = (e) => {
    if (isLeaving) return;

    setIsDragging(true);
    setStartX(e.clientX - thumbX);
  };

  const handleSliderMove = (e) => {
    if (!isDragging || isLeaving) return;

    const nextX = e.clientX - startX;
    const limitedX = Math.max(0, Math.min(nextX, maxSlide));

    setThumbX(limitedX);
  };

  const handleSliderUp = () => {
    if (!isDragging || isLeaving) return;

    setIsDragging(false);

    if (thumbX > maxSlide * 0.75) {
      setThumbX(maxSlide);
      setIsLeaving(true);

      setTimeout(() => {
        handleGuestStart();
      }, 100);
    } else {
      setThumbX(0);
    }
  };

  return (
    <main
      className={"realmain-page"}
      onPointerMove={handleSliderMove}
      onPointerUp={handleSliderUp}
      onPointerCancel={handleSliderUp}
    >
      <header className="landing-header">
        <img src={plitterLogo} alt="PLITTER" className="plitter-logo" />
      </header>

      <section className="landing-hero">
        <div className="hero-text">
          <p className="hero-find">FIND</p>

          <p className="hero-description">
            친구들이 추천한 노래로 나만의 노래 취향을 발견해요
          </p>

          <p className="hero-your">YOUR</p>
        </div>

        <div className="vinyl-record lp-motion-red">
          <img className="lp-layer lp-ellipse-25" src={ellipse25} alt="" />
          <img className="lp-layer lp-ellipse-14" src={ellipse14} alt="" />
          <img className="lp-layer lp-ellipse-37" src={ellipse37} alt="" />
          <img className="lp-layer lp-ellipse-33" src={ellipse33} alt="" />
          <img className="lp-layer lp-ellipse-35" src={ellipse35} alt="" />
          <img className="lp-layer lp-ellipse-36" src={ellipse36} alt="" />
          <img className="lp-layer lp-ellipse-34" src={ellipse34} alt="" />

          <img className="lp-number" src={number18} alt="NUMBER 18" />
          <img className="lp-center" src={ellipse26} alt="" />
          <img className="lp-dot" src={ellipse32} alt="" />
        </div>

        <div className="vinyl-record-back">
          <img
            className="lp-layer lp-ellipse-27 lp-motion-yellow"
            src={ellipse27}
            alt=""
          />
          <img
            className="lp-layer lp-ellipse-28 lp-motion-blue"
            src={ellipse28}
            alt=""
          />
          <img
            className="lp-layer lp-ellipse-29 lp-motion-blue"
            src={ellipse29}
            alt=""
          />
        </div>

        <div className="start-slider">
          <div
            className="start-slider-thumb"
            style={{
              transform: `translateX(${thumbX}px)`,
              transition: isDragging ? "none" : "transform 0.25s ease",
            }}
            onPointerDown={handleSliderDown}
          />
          <span className="start-slider-text">START</span>
        </div>
      </section>
    </main>
  );
}
