import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./SharedPlaylistEntry.css";

function getStoredCoverHistory(playlistId) {
  if (!playlistId) return [];
  try {
    const raw = localStorage.getItem(`recommendedCovers:${playlistId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getStoredRecommendedTracks(playlistId) {
  if (!playlistId) return [];
  try {
    const raw = localStorage.getItem(`recommendedTracks:${playlistId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeTrack(track, fallbackCover) {
  return {
    spotifyId: track?.spotifyId || "",
    title: track?.title || "추천된 곡",
    artistName: track?.artistName || track?.artist || "아티스트 정보 없음",
    albumCoverImageUrl: track?.albumCoverImageUrl || fallbackCover || "",
    previewUrl: track?.previewUrl || "",
    albumName: track?.albumName || track?.album || "",
  };
}

function dedupeTracksByCover(tracks) {
  const seen = new Set();
  return tracks.filter((track) => {
    const cover = track?.albumCoverImageUrl || "";
    if (!cover || seen.has(cover)) return false;
    seen.add(cover);
    return true;
  });
}

function buildInitialTracks(playlistId) {
  if (!playlistId) return [];

  const latestCover = localStorage.getItem(`lastRecommendedCover:${playlistId}`) || "";
  const historyCovers = getStoredCoverHistory(playlistId).map((cover) => normalizeTrack(null, cover));
  const storedTracks = getStoredRecommendedTracks(playlistId).map((track) => normalizeTrack(track));

  return dedupeTracksByCover([...storedTracks, normalizeTrack(null, latestCover), ...historyCovers]);
}

function mergeTracks(nextTracks, prevTracks) {
  return dedupeTracksByCover([...nextTracks, ...prevTracks]);
}

export default function SharedPlaylistEntry() {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const normalizedPlaylistId = (playlistId || "").trim();

  const accessToken = localStorage.getItem("accessToken") || "";
  const guestToken = localStorage.getItem("guestToken") || "";
  const isLoggedIn = Boolean(accessToken || guestToken);

  const storageKey = useMemo(() => {
    if (!normalizedPlaylistId) return "";
    return `lastRecommendedCover:${normalizedPlaylistId}`;
  }, [normalizedPlaylistId]);

  const [playlistMeta, setPlaylistMeta] = useState({
    recommendationCount: 0,
    ownerNickname: "",
  });
  const [recommendedTracks, setRecommendedTracks] = useState(() => buildInitialTracks(normalizedPlaylistId));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const linkError = !normalizedPlaylistId ? "유효하지 않은 공유 링크입니다." : "";
  const pointerStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const searchPath = useMemo(() => {
    if (!normalizedPlaylistId) return "/search";
    return `/search?playlistId=${encodeURIComponent(normalizedPlaylistId)}`;
  }, [normalizedPlaylistId]);

  useEffect(() => {
    if (!normalizedPlaylistId) return;

    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/playlists/${normalizedPlaylistId}/public`);
        const payload = await parseJson(response);

        if (!response.ok || payload?.code !== "SUCCESS") {
          return;
        }

        setPlaylistMeta({
          recommendationCount: payload?.content?.recommendationCount || 0,
          ownerNickname: payload?.content?.ownerNickname || "",
        });

        const latestCoverImageUrl = payload?.content?.latestCoverImageUrl || "";
        if (latestCoverImageUrl && storageKey) {
          localStorage.setItem(storageKey, latestCoverImageUrl);
        }

        const publicRecommendations = Array.isArray(payload?.content?.recommendations)
          ? payload.content.recommendations
          : [];
        const publicTracks = publicRecommendations
          .map((recommendation) => normalizeTrack(recommendation))
          .filter((track) => track.albumCoverImageUrl)
          .reverse();
        const storedHistoryTracks = getStoredCoverHistory(normalizedPlaylistId).map((cover) => normalizeTrack(null, cover));
        const latestPublicTrack = normalizeTrack(null, latestCoverImageUrl);
        const nextTracks = publicTracks.length > 0
          ? mergeTracks(publicTracks, [...storedHistoryTracks, latestPublicTrack])
          : mergeTracks([latestPublicTrack, ...storedHistoryTracks], []);

        if (publicTracks.length > 0) {
          localStorage.setItem(`recommendedTracks:${normalizedPlaylistId}`, JSON.stringify(publicTracks));
        }

        setRecommendedTracks(nextTracks);
      } catch {
        // Ignore and use fallback UI.
      }
    };

    void fetchPlaylist();
  }, [normalizedPlaylistId, storageKey]);

  useEffect(() => {
    if (recommendedTracks.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((prevIndex) => {
      if (prevIndex < recommendedTracks.length) {
        return prevIndex;
      }
      return 0;
    });
  }, [recommendedTracks]);

  const handleStartRecommendation = () => {
    if (!normalizedPlaylistId) {
      alert("유효하지 않은 공유 링크입니다.");
      return;
    }

    if (!isLoggedIn) {
      localStorage.setItem("postLoginRedirect", searchPath);
      navigate(`/login?playlistId=${encodeURIComponent(normalizedPlaylistId)}`);
      return;
    }

    navigate(searchPath);
  };

  const openRecommendationTrack = (track) => {
    if (!track?.albumCoverImageUrl) return;

    navigate(`/lp?playlistId=${encodeURIComponent(normalizedPlaylistId)}`, {
      state: {
        track,
        playlistId: normalizedPlaylistId,
        isRecommended: true,
      },
    });
  };

  const trackCount = recommendedTracks.length;
  const centerTrack = trackCount > 0 ? recommendedTracks[activeIndex] : null;
  const leftTrack = trackCount > 1
    ? recommendedTracks[(activeIndex - 1 + trackCount) % trackCount]
    : null;
  const rightTrack = trackCount > 1
    ? recommendedTracks[(activeIndex + 1) % trackCount]
    : null;
  const indicatorProgress = trackCount > 1 ? activeIndex / (trackCount - 1) : 0;
  const ownerLabel = playlistMeta.ownerNickname
    ? `${playlistMeta.ownerNickname}님의 플레이리스트`
    : "친구의 플레이리스트";
  const description = playlistMeta.recommendationCount > 0
    ? `${ownerLabel}에 ${playlistMeta.recommendationCount}곡이 모였어요`
    : "친구에게 어울리는 한 곡을 쌓아보세요";
  const helperText = isLoggedIn
    ? "마음에 드는 앨범을 눌러 추천 흐름을 이어가 보세요."
    : "로그인하거나 게스트로 입장해 추천을 남겨보세요.";
  const hasTrackIdentity = centerTrack
    && (centerTrack.title !== "추천된 곡" || centerTrack.artistName !== "아티스트 정보 없음");
  const moveCarousel = (direction) => {
    if (trackCount <= 1) return;

    setActiveIndex((prevIndex) => {
      const nextIndex = prevIndex + direction;
      return (nextIndex + trackCount) % trackCount;
    });
  };

  const handlePointerDown = (event) => {
    if (trackCount <= 1) return;

    pointerStartXRef.current = event.clientX;
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || trackCount <= 1) return;

    const diff = event.clientX - pointerStartXRef.current;
    if (Math.abs(diff) < 40) return;

    hasDraggedRef.current = true;
    moveCarousel(diff > 0 ? -1 : 1);
    pointerStartXRef.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  const handleSideCoverClick = (direction) => {
    if (hasDraggedRef.current) return;
    moveCarousel(direction);
  };

  const handleCenterCoverClick = () => {
    if (hasDraggedRef.current || !centerTrack) return;
    openRecommendationTrack(centerTrack);
  };

  return (
    <main className="shared-entry-page">
      <header className="shared-entry-header">
        <button type="button" className="shared-brand" onClick={() => navigate("/")}>
          PLITTER
        </button>
        {accessToken ? (
          <button type="button" className="shared-my-list-button" onClick={() => navigate("/main")}>
            내 리스트
          </button>
        ) : null}
      </header>

      <section className="shared-entry-copy">
        <p className="shared-entry-eyebrow">{ownerLabel}</p>
        <h1>{description}</h1>
        <p>{helperText}</p>
      </section>

      <section className="shared-record-section">
        <div
          className="shared-cover-stack"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <button
            type="button"
            className="shared-main-cover shared-main-cover-back-left"
            onClick={() => handleSideCoverClick(-1)}
            disabled={!leftTrack}
            aria-label="왼쪽 추천곡 보기"
          >
            {leftTrack ? <img src={leftTrack.albumCoverImageUrl} alt={leftTrack.title} className="shared-side-image" /> : null}
          </button>
          <button
            type="button"
            className="shared-main-cover shared-main-cover-back-right"
            onClick={() => handleSideCoverClick(1)}
            disabled={!rightTrack}
            aria-label="오른쪽 추천곡 보기"
          >
            {rightTrack ? <img src={rightTrack.albumCoverImageUrl} alt={rightTrack.title} className="shared-side-image" /> : null}
          </button>

          {centerTrack ? (
            <button
              type="button"
              className="shared-main-cover shared-main-cover-front"
              onClick={handleCenterCoverClick}
              aria-label="대표 추천곡 보기"
            >
              <img className="shared-cover" src={centerTrack.albumCoverImageUrl} alt={centerTrack.title} />
              <span className="shared-center-caption">
                <strong>{hasTrackIdentity ? centerTrack.title : "추천 커버 모음"}</strong>
                <span>{hasTrackIdentity ? centerTrack.artistName : "추천된 모든 곡 커버를 넘겨서 볼 수 있어요"}</span>
              </span>
            </button>
          ) : (
            <div className="shared-cover-placeholder" aria-hidden="true" />
          )}
        </div>
        {trackCount > 1 ? (
          <div className="shared-cover-indicator" aria-label={`추천 곡 ${activeIndex + 1} / ${trackCount}`}>
            <span className="shared-cover-indicator-track" />
            <span
              className="shared-cover-indicator-thumb"
              style={{
                left: `calc((100% - 20px) * ${indicatorProgress})`,
              }}
            />
          </div>
        ) : null}
      </section>

      {linkError ? <p className="shared-playlist-error">{linkError}</p> : null}

      <button type="button" className="shared-recommend-button" onClick={handleStartRecommendation}>
        + 노래 추천하기
      </button>
    </main>
  );
}
