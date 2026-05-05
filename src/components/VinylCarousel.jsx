import { useState } from "react";

export default function VinylCarousel({ tracks, onSelect }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    setRotation((prev) => prev + diff * 0.3);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "230px",
        position: "absolute",
        left: "0px",
        top: "170px",
        marginTop: "50px",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%", // 캐러셀 중심 좌표
          transform: "translate(-50%, -50%)",
        }}
      >
        {tracks.map((track, index) => {
          const angle = (index / tracks.length) * 360 + rotation;
          const rad = (angle * Math.PI) / 180;

          const radiusX = 180; //LP 간격
          const radiusY = 42; // 캐러셀 높이 조절
          const itemSize = 76;

          const x = Math.sin(rad) * radiusX;
          const y = Math.cos(rad) * radiusY;

          const depth = Math.cos(rad);
          const isBack = depth < 0;

          if (isBack) return null;

          const scale = 0.75 + depth * 0.5; // LP 크기 조정

          return (
            <div
              key={track.id}
              onClick={() => onSelect(track)}
              draggable={false}
              style={{
                position: "absolute",
                width: `${itemSize}px`,
                height: `${itemSize}px`,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #111 0 8px, #2a2a2a 9px 18px, #050505 19px 100%)",
                boxShadow: "0px 10px 24px rgba(0, 0, 0, 0.35)",
                cursor: isDragging ? "grabbing" : "pointer",
                zIndex: Math.round(depth * 100),
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.2s ease",
                overflow: "hidden", // LP 배경
                userSelect: "none",
              }}
            >
              <img
                src={track.albumImage}
                alt={track.title}
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  transform: "translate(-50%, -50%)", // 앨범 이미지
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#f5f5f5",
                  transform: "translate(-50%, -50%)", // LP 구멍
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}