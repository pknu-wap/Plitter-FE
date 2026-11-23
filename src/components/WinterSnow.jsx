import { useEffect, useState } from "react";
import SantaSleigh from "./SantaSleigh";
import "./WinterSnow.css";

// Stable variations keep the snowfall continuous when routes change.
const snowflakes = Array.from({ length: 24 }, (_, index) => ({
  "--snow-left": `${((index * 37) % 97) + 1}%`,
  "--snow-size": `${9 + (index % 5) * 2}px`,
  "--snow-duration": `${14 + ((index * 7) % 15)}s`,
  "--snow-delay": `${-((index * 11) % 29)}s`,
  "--snow-opacity": 0.3 + (index % 5) * 0.12,
  "--snow-drift": `${((index * 13) % 65) - 32}px`,
  "--snow-rotation": `${(index * 47) % 360}deg`,
}));

export default function WinterSnow() {
  const [heldFlakes, setHeldFlakes] = useState({});
  const [flakeOffsets, setFlakeOffsets] = useState({});
  const pausedFlakes = new Set(Object.values(heldFlakes).map((drag) => drag.flakeId));

  const holdFlake = (event, flakeId) => {
    if (event.button !== 0 || pausedFlakes.has(flakeId)) return;
    event.preventDefault();
    const flakeRect = event.currentTarget.getBoundingClientRect();
    const panelRect = event.currentTarget.parentElement.getBoundingClientRect();
    const offset = flakeOffsets[flakeId] || { x: 0, y: 0 };
    const drag = {
      flakeId,
      startX: event.clientX,
      startY: event.clientY,
      offset,
      minX: panelRect.left - flakeRect.left,
      maxX: panelRect.right - flakeRect.right,
      minY: panelRect.top - flakeRect.top,
      maxY: panelRect.bottom - flakeRect.bottom,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointerId = event.pointerId;
    setHeldFlakes((current) => ({ ...current, [pointerId]: drag }));
  };

  const moveFlake = (event) => {
    const drag = heldFlakes[event.pointerId];
    if (!drag) return;
    const deltaX = Math.min(drag.maxX, Math.max(drag.minX, event.clientX - drag.startX));
    const deltaY = Math.min(drag.maxY, Math.max(drag.minY, event.clientY - drag.startY));
    setFlakeOffsets((current) => ({
      ...current,
      [drag.flakeId]: { x: drag.offset.x + deltaX, y: drag.offset.y + deltaY },
    }));
  };

  const resetFlakeOffset = (flakeId) => {
    // Start its next fall at the top after continuing from the drop position.
    setFlakeOffsets((current) => {
      if (!(flakeId in current)) return current;
      const next = { ...current };
      delete next[flakeId];
      return next;
    });
  };

  const releaseFlake = (event) => {
    const pointerId = event.pointerId;
    setHeldFlakes((current) => {
      if (!(pointerId in current)) return current;
      const next = { ...current };
      delete next[pointerId];
      return next;
    });
  };

  useEffect(() => {
    const resumeSnow = () => setHeldFlakes({});

    const handleVisibilityChange = () => {
      if (document.hidden) resumeSnow();
    };

    window.addEventListener("blur", resumeSnow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", resumeSnow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="winter-snow" aria-hidden="true">
      {["left", "right"].map((side) => (
        <div key={side} className={`winter-snow-panel winter-snow-panel--${side}`}>
          <SantaSleigh />
          {snowflakes.map((style, index) => (
            <span
              key={index}
              className="winter-snow-flake"
              style={{
                ...style,
                "--snow-offset-x": `${flakeOffsets[`${side}-${index}`]?.x || 0}px`,
                "--snow-offset-y": `${flakeOffsets[`${side}-${index}`]?.y || 0}px`,
              }}
              data-paused={pausedFlakes.has(`${side}-${index}`)}
              onPointerDown={(event) => holdFlake(event, `${side}-${index}`)}
              onPointerMove={moveFlake}
              onPointerUp={releaseFlake}
              onPointerCancel={releaseFlake}
              onLostPointerCapture={releaseFlake}
              onAnimationIteration={() => resetFlakeOffset(`${side}-${index}`)}
            >
              <svg viewBox="-12 -12 24 24" fill="none" focusable="false">
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <path
                    key={angle}
                    d="M0 0V-10M-3-7 0-4 3-7"
                    transform={`rotate(${angle})`}
                  />
                ))}
              </svg>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
