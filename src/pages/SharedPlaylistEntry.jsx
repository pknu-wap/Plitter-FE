import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./SharedPlaylistEntry.css";
import popCharacter from "../assets/pop.png";

const USE_MOCK_DATA = true;

const MOCK_PLAYLIST_META = {
  recommendationCount: 10,
  ownerNickname: "민주",
};

const MOCK_MY_PLAYLIST_ID = "6";

//const MOCK_CHARACTER_DATA = null;

// 캐릭터 생성 후 UI 확인용
const MOCK_CHARACTER_DATA = {
imageUrl: popCharacter,
};

const MOCK_RECOMMENDED_TRACKS = [
  {
    recommendationId: 1,
    spotifyId: "mock-1",
    title: "Ditto",
    artistName: "NewJeans",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b273edf5b257be1d6593e81bb45f",
    previewUrl: "",
    albumName: "OMG",
    commentCount: 0,
  },
  {
    recommendationId: 2,
    spotifyId: "mock-2",
    title: "Love wins all",
    artistName: "IU",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b2734ed058b71650a6ca2c04adff",
    previewUrl: "",
    albumName: "The Winning",
    commentCount: 0,
  },
  {
    recommendationId: 3,
    spotifyId: "mock-3",
    title: "Supernova",
    artistName: "aespa",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b273d0f2d75c7fb4b8c8de684aef",
    previewUrl: "",
    albumName: "Armageddon",
    commentCount: 0,
  },
    {
    recommendationId: 4,
    spotifyId: "mock-4",
    title: "Attention",
    artistName: "NewJeans",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b273d70036292d54f29e8b68ec01",
    previewUrl: "",
    albumName: "New Jeans",
    commentCount: 0,
  },
  {
    recommendationId: 5,
    spotifyId: "mock-5",
    title: "밤편지",
    artistName: "IU",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b273a1acb4f388d5e8c38847f172",
    previewUrl: "",
    albumName: "Palette",
    commentCount: 0,
  },
  {
    recommendationId: 6,
    spotifyId: "mock-6",
    title: "Hype Boy",
    artistName: "NewJeans",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b273d70036292d54f29e8b68ec01",
    previewUrl: "",
    albumName: "New Jeans",
    commentCount: 0,
  },
  {
    recommendationId: 7,
    spotifyId: "mock-7",
    title: "I AM",
    artistName: "IVE",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b27325f19f7d8fdb20b4700b9810",
    previewUrl: "",
    albumName: "I've IVE",
    commentCount: 0,
  },
  {
    recommendationId: 8,
    spotifyId: "mock-8",
    title: "첫 만남은 계획대로 되지 않아",
    artistName: "TWS",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b273c0c6c5b54f3dba39e9f77c47",
    previewUrl: "",
    albumName: "Sparkling Blue",
    commentCount: 0,
  },
  {
    recommendationId: 9,
    spotifyId: "mock-9",
    title: "Drama",
    artistName: "aespa",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b2736e18cf6a06f3a4e6f248a0e9",
    previewUrl: "",
    albumName: "Drama",
    commentCount: 0,
  },
  {
    recommendationId: 10,
    spotifyId: "mock-10",
    title: "ETA",
    artistName: "NewJeans",
    albumCoverImageUrl:
      "https://i.scdn.co/image/ab67616d0000b2733d98a0ae7c78a3a9babaf8af",
    previewUrl: "",
    albumName: "Get Up",
    commentCount: 0,
  },
];

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
    recommendationId: track?.recommendationId ?? null,
    spotifyId: track?.spotifyId || "",
    title: track?.title || "추천된 곡",
    artistName: track?.artistName || track?.artist || "아티스트 정보 없음",
    albumCoverImageUrl: track?.albumCoverImageUrl || fallbackCover || "",
    previewUrl: track?.previewUrl || "",
    albumName: track?.albumName || track?.album || "",
    commentCount: track?.commentCount ?? 0,
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
  if (USE_MOCK_DATA) return MOCK_RECOMMENDED_TRACKS;
  if (!playlistId) return [];

  const latestCover = localStorage.getItem(`lastRecommendedCover:${playlistId}`) || "";
  const historyCovers = getStoredCoverHistory(playlistId).map((cover) => normalizeTrack(null, cover));
  const storedTracks = getStoredRecommendedTracks(playlistId).map((track) => normalizeTrack(track));

  return dedupeTracksByCover([...storedTracks, normalizeTrack(null, latestCover), ...historyCovers]);
}

function mergeTracks(nextTracks, prevTracks) {
  return dedupeTracksByCover([...nextTracks, ...prevTracks]);
}

function getPlaylistIdFromResponseContent(content) {
  if (content?.playlistId) {
    return String(content.playlistId).trim();
  }

  if (typeof content?.shareUrl === "string" && content.shareUrl) {
    try {
      const shareUrl = new URL(content.shareUrl, window.location.origin);
      const matchedPath = shareUrl.pathname.match(/^\/playlist\/([^/]+)$/);
      return matchedPath ? decodeURIComponent(matchedPath[1]).trim() : "";
    } catch {
      return "";
    }
  }

  return "";
}

export default function SharedPlaylistEntry() {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const normalizedPlaylistId = (playlistId || (USE_MOCK_DATA ? MOCK_MY_PLAYLIST_ID : "")).trim();

  const accessToken = localStorage.getItem("accessToken") || "";
  const guestToken = localStorage.getItem("guestToken") || "";
  const isLoggedIn = USE_MOCK_DATA ? true : Boolean(accessToken || guestToken);

  const storageKey = useMemo(() => {
    if (!normalizedPlaylistId) return "";
    return `lastRecommendedCover:${normalizedPlaylistId}`;
  }, [normalizedPlaylistId]);

  const guestRecommendedKey = useMemo(() => {
    if (!normalizedPlaylistId) return "";
    return `guestRecommended:${normalizedPlaylistId}`;
  }, [normalizedPlaylistId]);

  const recommendationLimitKey = useMemo(() => {
    if (!normalizedPlaylistId) return "";
    return `recommendLimitExceeded:${normalizedPlaylistId}`;
  }, [normalizedPlaylistId]);

  const [playlistMeta, setPlaylistMeta] = useState(
    USE_MOCK_DATA
      ? MOCK_PLAYLIST_META
      : {
          recommendationCount: 0,
          ownerNickname: "",
        }
  );
  const [characterData, setCharacterData] = useState(USE_MOCK_DATA ? MOCK_CHARACTER_DATA : null);
  const [myPlaylistId, setMyPlaylistId] = useState(USE_MOCK_DATA ? MOCK_MY_PLAYLIST_ID : "");
  const [recommendedTracks, setRecommendedTracks] = useState(() => buildInitialTracks(normalizedPlaylistId));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGuestRecommended, setHasGuestRecommended] = useState(() => {
    if (USE_MOCK_DATA) return false;
    if (!normalizedPlaylistId) return false;
    return localStorage.getItem(`guestRecommended:${normalizedPlaylistId}`) === "true";
  });
  const [hasRecommendationLimitExceeded, setHasRecommendationLimitExceeded] = useState(() => {
    if (USE_MOCK_DATA) return false;
    if (!normalizedPlaylistId) return false;
    return localStorage.getItem(`recommendLimitExceeded:${normalizedPlaylistId}`) === "true";
  });
  const linkError = !normalizedPlaylistId ? "유효하지 않은 공유 링크입니다." : "";
  const pointerStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isMyPlaylist = USE_MOCK_DATA
    ? myPlaylistId === normalizedPlaylistId
    : Boolean(accessToken) && myPlaylistId === normalizedPlaylistId;

  const searchPath = useMemo(() => {
    if (!normalizedPlaylistId) return "/search";
    return `/search?playlistId=${encodeURIComponent(normalizedPlaylistId)}`;
  }, [normalizedPlaylistId]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!guestRecommendedKey) return;
    setHasGuestRecommended(localStorage.getItem(guestRecommendedKey) === "true");
  }, [guestRecommendedKey]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!recommendationLimitKey) return;
    setHasRecommendationLimitExceeded(localStorage.getItem(recommendationLimitKey) === "true");
  }, [recommendationLimitKey]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
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
    if (USE_MOCK_DATA) return;
    if (!normalizedPlaylistId) return;

    const fetchCharacter = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/playlists/${normalizedPlaylistId}/character/download-url`,
          {
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : {},
          }
        );
        const payload = await parseJson(response);

        if (!response.ok || payload?.code !== "SUCCESS" || !payload?.content?.imageUrl) {
          setCharacterData(null);
          return;
        }

        setCharacterData(payload.content);
      } catch {
        setCharacterData(null);
      }
    };

    void fetchCharacter();
  }, [normalizedPlaylistId, accessToken]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!accessToken || !normalizedPlaylistId) return;

    let cancelled = false;

    const checkMyPlaylist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/playlists/check`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = await parseJson(response);

        if (
          !response.ok ||
          payload?.code !== "SUCCESS" ||
          !payload?.content?.hasPlaylist
        ) {
          if (!cancelled) {
            setMyPlaylistId("");
          }
          return;
        }

        if (!cancelled) {
          setMyPlaylistId(getPlaylistIdFromResponseContent(payload.content));
        }
      } catch {
        if (!cancelled) {
          setMyPlaylistId("");
        }
      }
    };

    void checkMyPlaylist();

    return () => {
      cancelled = true;
    };
  }, [accessToken, normalizedPlaylistId]);

  const handleGoMyPlaylist = () => {
    if (myPlaylistId) {
      navigate(`/playlist/${encodeURIComponent(myPlaylistId)}`);
      return;
    }

    navigate("/main");
  };

  const handleCopyShareLink = async () => {
  if (!normalizedPlaylistId) {
    alert("유효하지 않은 공유 링크입니다.");
    return;
  }

  const shareLink = `${window.location.origin}/playlist/${normalizedPlaylistId}`;

  try {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  } catch (error) {
    console.error("공유 링크 복사 실패", error);
    alert("공유 링크 복사 중 문제가 발생했어요.");
  }
};

  const handleStartRecommendation = () => {
    if (!normalizedPlaylistId) {
      alert("유효하지 않은 공유 링크입니다.");
      return;
    }

    if (isMyPlaylist && playlistMeta.recommendationCount >= 10) {
      navigate(`/character-loading?playlistId=${encodeURIComponent(normalizedPlaylistId)}`);
      return;
    }

    if (hasGuestRecommended && !accessToken && guestToken) {
      navigate("/login");
      return;
    }

    if (hasRecommendationLimitExceeded && Boolean(accessToken) && !isMyPlaylist) {
      return;
    }

    if (isMyPlaylist) {
      alert("추천곡이 10개 이상 모이면 캐릭터를 생성할 수 있어요.");
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
        recommendationId: track.recommendationId ?? null,
        commentCount: track.commentCount ?? 0,
      },
    });
  };

  const trackCount = recommendedTracks.length;
  const currentIndex = trackCount > 0 ? activeIndex % trackCount : 0;
  const centerTrack = trackCount > 0 ? recommendedTracks[currentIndex] : null;
  const leftTrack = trackCount > 1
    ? recommendedTracks[(currentIndex - 1 + trackCount) % trackCount]
    : null;
  const rightTrack = trackCount > 1
    ? recommendedTracks[(currentIndex + 1) % trackCount]
    : null;
  const indicatorProgress = trackCount > 1 ? currentIndex / (trackCount - 1) : 0;

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

  const showLimitMessage = hasRecommendationLimitExceeded && Boolean(accessToken) && !isMyPlaylist;
  const showRecommendButton = !showLimitMessage;
  const buttonText = (() => {
    if (isMyPlaylist && playlistMeta.recommendationCount >= 10) {
      return "캐릭터 생성하러 가기";
    }

    if (hasGuestRecommended && !accessToken && guestToken) {
      return "내 플레이리스트도 만들러가기";
    }

    return "+ 노래 추천하기";
  })();

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

  const handlePointerUp = () => {
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
          <img src={plitterLogo} alt="PLITTER" className="header-logo-image" />
        </button>
        {accessToken ? (
          <button type="button" className="shared-my-list-button" onClick={handleGoMyPlaylist}>
            MY
          </button>
        ) : null}
      </header>

      <section className="shared-entry-copy">
        {characterData ? (
          <div className="shared-character-info">
            <img
              src={characterData.imageUrl}
              alt={"생성된 캐릭터"}
              className="shared-character-image"
            />
          </div>
        ) : (
          <>
            <h1>{description}</h1>
            <p>{helperText}</p>
          </>
        )}
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
            </button>
          ) : (
            <div className="shared-cover-placeholder" aria-hidden="true" />
          )}
        </div>

        {trackCount > 1 ? (
          <div className="shared-cover-indicator" aria-label={`추천 곡 ${currentIndex + 1} / ${trackCount}`}>
            <span className="shared-cover-indicator-track" />
            <span
              className="shared-cover-indicator-thumb"
              style={{
                left: `calc((100% - 20px) * ${indicatorProgress})`,
              }}
            />
          </div>
        ) : null}

        <p className="shared-entry-eyebrow">{ownerLabel}</p>
      </section>

      {linkError ? <p className="shared-playlist-error">{linkError}</p> : null}

      {showLimitMessage ? (
        <p className="shared-limit-message">한 친구에게 3번까지 추천이 가능합니다</p>
      ) : null}

      {showRecommendButton ? (
        <button type="button" className="shared-recommend-button" onClick={handleStartRecommendation}>
          {buttonText}
        </button>
      ) : null}
      {isMyPlaylist ? (
      <button
          type="button"
          className={`shared-copy-link-button ${copied ? "copied" : ""}`}
          onClick={handleCopyShareLink}
        >
          {copied ? "공유 링크가 복사되었어요" : "공유 링크 복사하기"}
        </button>
      ) : null}
    </main>
  );
}