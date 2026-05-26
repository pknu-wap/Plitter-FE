import { useLocation } from "react-router-dom";

export default function LpPage() {
  const location = useLocation();
  const track = location.state?.track;

  return (
    // SongSearch.css 임시적용
    <main className="song-search-page">
      <h1>FIND YOUR NUMBER 18</h1>

      {track && (
        <section>
          <p>{track.title}</p>
        </section>
      )}
    </main>
  );
}
