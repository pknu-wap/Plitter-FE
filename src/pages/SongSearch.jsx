import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SongSearch.css";
import searchIcon from "../assets/magnifyingglass.png";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://13.124.174.30:8080/api";

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function SongSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const playlistId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("playlistId") || "1";
  }, [location.search]);

  const searchTracks = async (term) => {
    const normalized = term.trim();

    if (!normalized) {
      setSearchResults([]);
      setError("");
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({ keyword: normalized, limit: "20" });
      const response = await fetch(`${API_BASE_URL}/tracks/search?${query.toString()}`);
      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS") {
        setSearchResults([]);
        setHasSearched(true);
        setError(payload?.message || "검색 중 오류가 발생했습니다.");
        return;
      }

      const tracks = Array.isArray(payload?.content) ? payload.content : [];
      setSearchResults(tracks);
      setHasSearched(true);
    } catch {
      setSearchResults([]);
      setHasSearched(true);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!keyword.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      searchTracks(keyword);
    }, 350);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelectTrack = (track) => {
    navigate("/lp", {
      state: {
        track,
        playlistId,
        isNewRecommendation: true,
      },
    });
  };

  return (
    <main className="song-search-page">
      <header className="song-search-header">PLITTER</header>

      <section className="search-box" aria-label="track-search">
        <img src={searchIcon} alt="검색" className="search-icon" />
        <input
          type="text"
          value={keyword}
          onChange={(event) => {
            const nextKeyword = event.target.value;
            if (!nextKeyword.trim()) {
              setSearchResults([]);
              setError("");
              setHasSearched(false);
            }
            setKeyword(nextKeyword);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              searchTracks(keyword);
            }
          }}
          placeholder="아티스트, 노래, 가사 등"
          className="search-input"
          aria-label="노래 검색"
        />
        <button
          className="voice-button"
          type="button"
          aria-label="음성 검색"
          onClick={() => searchTracks(keyword)}
        >
          🎙
        </button>
      </section>

      {isLoading ? <p className="song-search-status">검색 중입니다...</p> : null}
      {error ? <p className="song-search-error">{error}</p> : null}

      {!isLoading && !error && hasSearched && searchResults.length === 0 ? (
        <p className="song-search-status">검색 결과가 없습니다.</p>
      ) : null}

      {!isLoading && !hasSearched ? (
        <section className="song-search-empty">
          <h2>친구에게 어울리는 노래를 추천 해보세요!</h2>
          <p>아티스트, 노래, 가사 등을 검색합니다</p>
        </section>
      ) : null}

      {searchResults.length > 0 ? (
        <ul className="song-list">
          {searchResults.map((track) => (
            <li key={track.spotifyId} className="song-list-item">
              <button type="button" className="song-list-button" onClick={() => handleSelectTrack(track)}>
                <img src={track.albumCoverImageUrl} alt={track.title} className="song-cover" />
                <div className="track-info">
                  <h3>{track.title}</h3>
                  <p>{track.artistName}</p>
                  <span>앨범 {track.albumName || track.album || "-"}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
