import { useEffect, useMemo, useState } from "react";
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

  return dedupeTracksByCover([...storedTracks, normalizeTrack(null, latestCover), ...historyCovers]).slice(0, 3);
}

function mergeTracks(nextTracks, prevTracks) {
  return dedupeTracksByCover([...nextTracks, ...prevTracks]).slice(0, 3);
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
  });
  const [recommendedTracks, setRecommendedTracks] = useState(() => buildInitialTracks(normalizedPlaylistId));
  const linkError = !normalizedPlaylistId ? "유효하지 않은 공유 링크입니다." : "";

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
        });

        const latestCoverImageUrl = payload?.content?.latestCoverImageUrl || "";
        if (latestCoverImageUrl && storageKey) {
          localStorage.setItem(storageKey, latestCoverImageUrl);
        }

        const storedHistoryTracks = getStoredCoverHistory(normalizedPlaylistId).map((cover) => normalizeTrack(null, cover));
        const latestPublicTrack = normalizeTrack(null, latestCoverImageUrl);
        setRecommendedTracks((prev) => mergeTracks([latestPublicTrack, ...storedHistoryTracks], prev));

        if (!accessToken) return;

        const privateResponse = await fetch(`${API_BASE_URL}/playlists/${normalizedPlaylistId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const privatePayload = await parseJson(privateResponse);

        if (!privateResponse.ok || privatePayload?.code !== "SUCCESS") {
          return;
        }

        const recommendations = Array.isArray(privatePayload?.content?.recommendations)
          ? privatePayload.content.recommendations
          : [];
        const latestTracks = recommendations
          .map((recommendation) => normalizeTrack(recommendation))
          .filter((track) => track.albumCoverImageUrl)
          .slice(-10)
          .reverse();

        if (latestTracks.length > 0) {
          localStorage.setItem(`recommendedTracks:${normalizedPlaylistId}`, JSON.stringify(latestTracks));
        }

        setRecommendedTracks((prev) => mergeTracks(latestTracks, prev));
      } catch {
        // Ignore and use fallback UI.
      }
    };

    void fetchPlaylist();
  }, [accessToken, normalizedPlaylistId, storageKey]);

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

  const centerTrack = recommendedTracks[0] || null;
  const leftTrack = recommendedTracks[1] || recommendedTracks[0] || null;
  const rightTrack = recommendedTracks[2] || recommendedTracks[1] || recommendedTracks[0] || null;
  const description = playlistMeta.recommendationCount > 0
    ? `친구의 플레이리스트에 ${playlistMeta.recommendationCount}곡이 모였어요`
    : "친구에게 어울리는 한 곡을 쌓아보세요";
  const helperText = isLoggedIn
    ? "마음에 드는 앨범을 눌러 추천 흐름을 이어가 보세요."
    : "로그인하거나 게스트로 입장해 추천을 남겨보세요.";
  const hasTrackIdentity = centerTrack
    && (centerTrack.title !== "추천된 곡" || centerTrack.artistName !== "아티스트 정보 없음");

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
        <p className="shared-entry-eyebrow">친구의 플레이리스트</p>
        <h1>{description}</h1>
        <p>{helperText}</p>
      </section>

      <section className="shared-record-section">
        <div className="shared-cover-stack">
          <button
            type="button"
            className="shared-main-cover shared-main-cover-back-left"
            onClick={() => openRecommendationTrack(leftTrack)}
            disabled={!leftTrack}
            aria-label="왼쪽 추천곡 보기"
          >
            {leftTrack ? <img src={leftTrack.albumCoverImageUrl} alt={leftTrack.title} className="shared-side-image" /> : null}
          </button>
          <button
            type="button"
            className="shared-main-cover shared-main-cover-back-right"
            onClick={() => openRecommendationTrack(rightTrack)}
            disabled={!rightTrack}
            aria-label="오른쪽 추천곡 보기"
          >
            {rightTrack ? <img src={rightTrack.albumCoverImageUrl} alt={rightTrack.title} className="shared-side-image" /> : null}
          </button>

          {centerTrack ? (
            <button
              type="button"
              className="shared-main-cover shared-main-cover-front"
              onClick={() => openRecommendationTrack(centerTrack)}
              aria-label="대표 추천곡 보기"
            >
              <img className="shared-cover" src={centerTrack.albumCoverImageUrl} alt={centerTrack.title} />
              <span className="shared-center-caption">
                <strong>{hasTrackIdentity ? centerTrack.title : "최근 추천 커버"}</strong>
                <span>{hasTrackIdentity ? centerTrack.artistName : "공유 링크에서 추천을 이어갈 수 있어요"}</span>
              </span>
            </button>
          ) : (
            <div className="shared-cover-placeholder" aria-hidden="true" />
          )}
        </div>
      </section>

      {linkError ? <p className="shared-playlist-error">{linkError}</p> : null}

      <button type="button" className="shared-recommend-button" onClick={handleStartRecommendation}>
        + 노래 추천하기
      </button>
    </main>
  );
}
