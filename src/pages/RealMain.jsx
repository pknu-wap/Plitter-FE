import { useRef, useState } from "react";
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

export default function RealMain({ loginSection }) {
  const dragRef = useRef(null);
  const loginRef = useRef(null);
  const holdSpinRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbX, setThumbX] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [finishAngle, setFinishAngle] = useState(360);

  const maxSlide = 74;
  const isHoldingEnd = isDragging && thumbX >= maxSlide;

  const finishSpin = (sliderAngle) => {
    const record = holdSpinRef.current;
    // Freeze the held rotation so the final turn can compensate for its angle.
    const transform = getComputedStyle(record).transform;
    const matrix = new DOMMatrixReadOnly(transform);
    record.style.animation = "none";
    record.style.transform = transform;
    const heldAngle = (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360;
    const uprightAngle = Math.ceil((sliderAngle + heldAngle + 180) / 360) * 360;
    setFinishAngle(uprightAngle - heldAngle);
    setIsStarted(true);
  };

  const resetHoldSpin = () => {
    holdSpinRef.current?.getAnimations().forEach((animation) => {
      animation.currentTime = 0;
    });
  };

  const handleSliderDown = (e) => {
    if (isStarted || e.button !== 0 || dragRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX - thumbX };
    setIsDragging(true);
  };

  const handleSliderMove = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId || isStarted) return;
    setThumbX(Math.max(0, Math.min(e.clientX - drag.startX, maxSlide)));
  };

  const handleSliderUp = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const finalX = Math.max(0, Math.min(e.clientX - drag.startX, maxSlide));
    dragRef.current = null;
    setIsDragging(false);
    setThumbX(finalX >= maxSlide * 0.75 ? finalX : 0);
    if (finalX >= maxSlide * 0.75) {
      finishSpin((finalX / maxSlide) * 90);
    } else {
      resetHoldSpin();
    }
  };

  const cancelSlider = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    setThumbX(0);
    resetHoldSpin();
  };

  const handleKeyboardStart = (e) => {
    if (e.detail === 0) finishSpin((thumbX / maxSlide) * 90);
  };

  const handleLoginReveal = (e) => {
    if (e.target !== e.currentTarget) return;
    loginRef.current?.querySelector("button")?.focus({ preventScroll: true });
  };

  return (
    <main
      className={`realmain-page${isDragging ? " is-dragging" : ""}${isHoldingEnd ? " is-holding-end" : ""}${isStarted ? " is-started" : ""}`}
      style={{
        "--start-angle": `${(thumbX / maxSlide) * 90}deg`,
        "--start-finish-angle": `${finishAngle}deg`,
      }}
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
          <div className="start-record-spin">
            <div ref={holdSpinRef} className="start-record-hold-spin">
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
          </div>
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

        <div className="start-slider" inert={isStarted} aria-hidden={isStarted}>
          <button
            type="button"
            className="start-slider-thumb"
            aria-label="START — 오른쪽으로 당겨 로그인하기"
            style={{
              transform: `translateX(${isStarted ? maxSlide : thumbX}px)`,
              transition: isDragging ? "none" : "transform 0.25s ease",
            }}
            onPointerDown={handleSliderDown}
            onPointerMove={handleSliderMove}
            onPointerUp={handleSliderUp}
            onPointerCancel={cancelSlider}
            onLostPointerCapture={cancelSlider}
            onClick={handleKeyboardStart}
          />
          <span className="start-slider-text">START</span>
        </div>
      </section>

      <div
        ref={loginRef}
        className="start-login-reveal"
        inert={!isStarted}
        aria-hidden={!isStarted}
        onAnimationEnd={handleLoginReveal}
      >
        {loginSection}
      </div>
    </main>
  );
}
