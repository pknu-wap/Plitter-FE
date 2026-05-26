import { useLocation } from "react-router-dom";
import "./LpPage.css";

export default function LpPage() {
  const location = useLocation();
  const track = location.state?.track;

  return (
    <main className="lp-page">
      <h1>FIND YOUR NUMBER 18</h1>
    
      {/* SongSearch에서 받아온 track 있으면 앨범 정보 렌더링 */}
      {track && (
        <section className="lp-track-preview">
          <img
            className="lp-album-cover"
            src={track.albumCoverImageUrl}
            alt={track.title}
          />
          <h2>{track.title}</h2>
          <p>{track.artistName}</p>
        </section>
      )}
    </main>
  );
}
