import { useRef, useState } from "react";

export default function VinylCarousel({ tracks, onSelect }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const rotationRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const angleStep = tracks.length > 0 ? 360 / tracks.length : 0;
  const frontTrackIndex =
    tracks.length > 0
      ? ((-Math.round(rotation / angleStep) % tracks.length) + tracks.length) % tracks.length
      : -1;
  const carouselTracks = tracks
    .map((track, index) => ({ track, index, isFrontTrack: index === frontTrackIndex }))
    .sort((a, b) => {
      if (a.isFrontTrack === b.isFrontTrack) return 0;
      return a.isFrontTrack ? 1 : -1;
    });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    const nextRotation = rotationRef.current + diff * 0.3;

    if (Math.abs(diff) > 2) {
      hasDraggedRef.current = true;
    }

    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (!hasDraggedRef.current || tracks.length === 0) return;

    const snappedStep = Math.round(rotationRef.current / angleStep);
    const snappedRotation = snappedStep * angleStep;
    const snappedFrontTrackIndex = ((-snappedStep % tracks.length) + tracks.length) % tracks.length;

    rotationRef.current = snappedRotation;
    setRotation(snappedRotation);
    onSelect(tracks[snappedFrontTrackIndex]);
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
        perspective: "900px",
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
          top: "50%",
          width: "0px",
          height: "0px",
          transformStyle: "preserve-3d",
          transform: "translate(-50%, -50%)",
        }}
      >
        {carouselTracks.map(({ track, index }) => {
          const itemAngle = (index / tracks.length) * 360 + rotation;
          const rad = (itemAngle * Math.PI) / 180;

          const radius = 180;
          const itemSize = 88;

          const depth = Math.cos(rad);
          const scale = 0.75 + depth * 0.5;
          const isFrontTrack = index === frontTrackIndex;
          const zIndex = isFrontTrack ? 1000 : Math.round((depth + 1) * 50);
          const opacity = 0.5 + depth * 0.5;
          const itemDepth = isFrontTrack ? radius + 80 : radius;

          return (
            <div
              key={track.id}
              onClick={() => {
                if (hasDraggedRef.current) return;
                onSelect(track);
              }}
              draggable={false}
              style={{
                position: "absolute",
                width: `${itemSize}px`,
                height: `${itemSize}px`,
                borderRadius: "0px",
                background: "linear-gradient(180deg, #121212 0%, #111 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                cursor: isDragging ? "grabbing" : "pointer",
                zIndex,
                opacity,
                transform: `rotateY(${itemAngle}deg) translateZ(${itemDepth}px) translate(-50%, -50%) scale(${scale})`,
                transformStyle: "preserve-3d",
                transition: isDragging ? "none" : "transform 0.2s ease",
                overflow: "hidden",
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
                  width: "100%",
                  height: "100%",
                  borderRadius: "0px",
                  objectFit: "cover",
                  transform: "translate(-50%, -50%)",
                  userSelect: "none",
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
