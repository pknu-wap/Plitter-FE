import { useLocation } from "react-router-dom";
import vinylImage from "../assets/lp-vinyl.png";
import "./LpPage.css";

export default function LpPage() {
  const location = useLocation();
  const track = location.state?.track;

  return (
    <main className="lp-page">
      <h1>FIND YOUR NUMBER 18</h1>

      {/* SongSearch의 track의 앨범 정보 렌더링 */}
      {track && (
        <section className="lp-track-preview">

          {/* LP 원판과 앨범 커버 겹치는 박스 */}
          <div className="lp-record-view">
            
            <img className="lp-vinyl" src={vinylImage} alt="" aria-hidden="true" />
            <img
              className="lp-album-cover"
              src={track.albumCoverImageUrl}
              alt={track.title}
            />
          </div>
          <h2>{track.title}</h2>
          <p>{track.artistName}</p>
        </section>
      )}
    </main>
  );
}
