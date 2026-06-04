import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import { buildSearchPath } from "../lib/playlistShare";
import searchIcon from "../assets/magnifyingglass.png";
import "./SongSearch.css";

const SEARCH_LIMIT = 10;

export default function SongSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const accessToken = localStorage.getItem("accessToken") || "";
  const guestToken = localStorage.getItem("guestToken") || "";

  const publicShareId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("publicShareId") || params.get("playlistId");
  }, [location.search]);
  const playlistContextError = !publicShareId ? "공유된 플레이리스트 링크로 접속해 주세요." : "";

  useEffect(() => {
    if (!publicShareId) return;

    if (!accessToken && !guestToken) {
      const redirectPath = buildSearchPath(publicShareId);
      localStorage.setItem("postLoginRedirect", redirectPath);
      navigate(`/login?publicShareId=${encodeURIComponent(publicShareId)}`, { replace: true });
    }
  }, [accessToken, guestToken, navigate, publicShareId]);

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
      const query = new URLSearchParams({ keyword: normalized, limit: String(SEARCH_LIMIT) });
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
    if (!publicShareId) {
      alert("플레이리스트 정보가 없습니다. 공유 링크로 다시 접속해 주세요.");
      return;
    }

    navigate("/lp", {
      state: {
        track,
        publicShareId,
        isNewRecommendation: true,
      },
    });
  };

  return (
    <main className="song-search-page">
      <header className="song-search-header">
        <button type="button" className="brand-home-button" onClick={() => navigate("/")}>
          <img src={plitterLogo} alt="PLITTER" className="header-logo-image" />
        </button>
      </header>

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
      {!error && playlistContextError ? <p className="song-search-error">{playlistContextError}</p> : null}

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
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
