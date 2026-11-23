import { useEffect, useRef, useState } from "react";
import "./SantaSleigh.css";

export default function SantaSleigh() {
  const dragRef = useRef(null);
  const [isHeld, setIsHeld] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const holdSleigh = (event) => {
    if (event.button !== 0 || dragRef.current) return;
    event.preventDefault();
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const panel = target.parentElement.getBoundingClientRect();
    target.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      target,
      startX: event.clientX,
      startY: event.clientY,
      offset,
      minX: panel.left - rect.left,
      maxX: panel.right - rect.right,
      minY: panel.top - rect.top,
      maxY: panel.bottom - rect.bottom,
    };
    setIsHeld(true);
  };

  const moveSleigh = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const deltaX = Math.min(drag.maxX, Math.max(drag.minX, event.clientX - drag.startX));
    const deltaY = Math.min(drag.maxY, Math.max(drag.minY, event.clientY - drag.startY));
    setOffset({ x: drag.offset.x + deltaX, y: drag.offset.y + deltaY });
  };

  const releaseSleigh = (event) => {
    if (event.pointerId !== dragRef.current?.pointerId) return;
    dragRef.current = null;
    setIsHeld(false);
  };

  const resetFlightOffset = (event) => {
    if (event.target === event.currentTarget) setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const resumeFlight = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag?.target.hasPointerCapture(drag.pointerId)) {
        drag.target.releasePointerCapture(drag.pointerId);
      }
      setIsHeld(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) resumeFlight();
    };
    window.addEventListener("blur", resumeFlight);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", resumeFlight);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="winter-sleigh"
      aria-hidden="true"
      data-held={isHeld}
      style={{
        "--sleigh-offset-x": `${offset.x}px`,
        "--sleigh-offset-y": `${offset.y}px`,
      }}
      onPointerDown={holdSleigh}
      onPointerMove={moveSleigh}
      onPointerUp={releaseSleigh}
      onPointerCancel={releaseSleigh}
      onLostPointerCapture={releaseSleigh}
      onAnimationIteration={resetFlightOffset}
    >
      <svg
        className="winter-sleigh-art"
        viewBox="0 0 320 150"
        fill="none"
        focusable="false"
      >
        {/* A little stardust trails behind the sleigh. */}
        <g fill="#fff9dc">
          <path d="m19 79 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" />
          <path d="m40 107 1.5-4 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5Z" />
          <circle cx="8" cy="105" r="1.5" />
          <circle cx="35" cy="63" r="1.5" />
          <circle cx="57" cy="124" r="1.5" />
        </g>

        {/* Presents, Santa, and the curved red sleigh. */}
        <path d="M57 76c-15-20-5-39 10-37 16-5 31 13 23 35Z" fill="#648574" />
        <path d="m61 42 15-4m-12 6 13-3" stroke="#e6ca85" strokeWidth="3" strokeLinecap="round" />
        <path d="m65 76-3-14 18-4 5 17Z" fill="#d5b575" />
        <path d="m71 60 4 16m-12-7 19-4" stroke="#fff0ca" strokeWidth="3" />
        <path d="M88 62c-9 5-14 17-13 28h42c1-16-9-30-19-29Z" fill="#bd514a" />
        <path d="M81 80h35v7H79Z" fill="#513d3b" />
        <rect x="96" y="79" width="8" height="9" rx="1.5" stroke="#e6ca85" strokeWidth="2" />
        <path d="m109 68 16 8 14-8" stroke="#bd514a" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="140" cy="67" r="4.5" fill="#f0c4ab" />
        <ellipse cx="98" cy="51" rx="14" ry="15" fill="#f0c4ab" />
        <path d="M84 52c-5 21 7 25 14 23 12-3 18-16 13-24-2 9-7 10-13 6-6 5-10 3-14-5Z" fill="#fff7e9" />
        <path d="M82 38c0-13 9-22 18-22 11 0 16 7 24 7l-10 13Z" fill="#bd514a" />
        <path d="M83 38c8-5 20-6 29-2" stroke="#fff7e9" strokeWidth="7" strokeLinecap="round" />
        <circle cx="124" cy="24" r="5" fill="#fff7e9" />
        <circle cx="103" cy="47" r="1.5" fill="#513d3b" />
        <circle cx="111" cy="52" r="3" fill="#e6a18c" />
        <path d="M46 83c18 2 30 11 62 10l15-16h15l-9 21c-5 12-18 17-35 17H67c-11 0-17-11-21-32Z" fill="#ab4944" />
        <path d="M47 83c17 3 34 12 61 10l15-16h16" stroke="#e6ca85" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m69 113-3 12m49-15-4 15M53 128h69c17 0 24-7 20-13" stroke="#e6ca85" strokeWidth="4" strokeLinecap="round" />
        <path d="M74 101c8 4 17 5 25 4" stroke="#d78068" strokeWidth="2" strokeLinecap="round" />

        {/* Reins lead to Rudolph's bright red nose. */}
        <path d="M141 68c24 20 56 15 93-12M143 70c31 27 57 25 90-9" stroke="#8c7060" strokeWidth="1.5" strokeLinecap="round" />
        <g stroke="#967156" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m211 81-8 15-18 4m33-17 5 12-9 11" />
          <path d="m246 76 16 8 14-7m-37 3 5 15 17 3" />
        </g>
        <g stroke="#513d3b" strokeWidth="4" strokeLinecap="round">
          <path d="m185 100-5 1m34 5-3 4m65-33 5-3m-20 24 5 1" />
        </g>
        <path d="m207 66-10-6 2 9 11 6" fill="#a68060" />
        <ellipse cx="225" cy="74" rx="25" ry="13" transform="rotate(-12 225 74)" fill="#b58b66" />
        <path d="m238 72 5-24 13-3 1 25" fill="#b58b66" />
        <path d="M249 46c1-9 13-14 22-8l10 11-9 11-19-1Z" fill="#b58b66" />
        <path d="m251 43-7-12c7-3 12 1 14 8m8-2 8-11c4 5 2 10-3 15" fill="#b58b66" />
        <path d="m254 35-3-15m1 7-9-4m10 2 5-8m7 18 3-16m0 7 9-5m-8 0-4-8" stroke="#85664e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m242 57 16 4" stroke="#a94743" strokeWidth="5" strokeLinecap="round" />
        <circle cx="251" cy="63" r="3" fill="#e6ca85" />
        <circle cx="268" cy="45" r="2" fill="#513d3b" />
        <path d="M275 54c-3 1-5 0-6-1" stroke="#85664e" strokeWidth="1.5" strokeLinecap="round" />
        <circle className="winter-rudolph-glow" cx="282" cy="48" r="12" fill="#e96b61" fillOpacity="0.16" />
        <circle cx="282" cy="48" r="5" fill="#d95b52" />
        <circle cx="283" cy="46" r="1.5" fill="#ffe2cb" />
      </svg>
    </div>
  );
}
