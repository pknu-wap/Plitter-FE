import { useState } from "react";

export default function VinylCarousel({ tracks, onSelect }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setRotation((prev) => prev + diff * 0.2);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        position: "relative",
        marginTop: "50px",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {tracks.map((track, index) => {
          const angle = (index / tracks.length) * 360 + rotation;
          const rad = (angle * Math.PI) / 180;

          const x = Math.sin(rad) * 200;
          const y = Math.cos(rad) * 60;

          return (
            <img
              key={track.id}
              src={track.albumImage}
              alt={track.title}
              onMouseDown={handleMouseDown}
              onClick={() => onSelect(track)}
              style={{
                position: "absolute",
                width: "80px",
                height: "80px",
                transform: `translate(${x}px, ${y}px)`,
                borderRadius: "50%",
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}