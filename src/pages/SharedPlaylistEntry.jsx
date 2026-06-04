import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import popImage from "../assets/rnb.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import {
  buildPlaylistPath,
  buildPlaylistShareLink,
  buildSearchPath,
  getPlaylistIdFromResponseContent,
  getPublicShareIdFromResponseContent,
} from "../lib/playlistShare";
import "./SharedPlaylistEntry.css";

const USE_MOCK_DATA = false;
const FORCE_MOCK_CHARACTER = false;

const MOCK_PLAYLIST_META = {
  recommendationCount: 10,
  ownerNickname: "민주",
};

const MOCK_MY_PLAYLIST_ID = "6";

const MOCK_CHARACTER_DATA = {
  characterName: "테스트 캐릭터",
  imageUrl: popImage,
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

  const latestCover =
    localStorage.getItem(`lastRecommendedCover:${playlistId}`) || "";

  const historyCovers = getStoredCoverHistory(playlistId).map((cover) =>
    normalizeTrack(null, cover)
  );

  const storedTracks = getStoredRecommendedTracks(playlistId).map((track) =>
    normalizeTrack(track)
  );

  return dedupeTracksByCover([
    ...storedTracks,
    normalizeTrack(null, latestCover),
    ...historyCovers,
  ]);
}

function mergeTracks(nextTracks, prevTracks) {
  return dedupeTracksByCover([...nextTracks, ...prevTracks]);
}

function getCharacterAvailabilityMessage(availability) {
  const requiredCount = availability?.requiredCount ?? 10;
  const currentCount = availability?.currentCount ?? 0;

  return `추천 ${requiredCount}곡 이상이 필요합니다. 현재 ${currentCount}/${requiredCount}`;
}

async function requestCharacterAvailability(playlistId, accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/playlists/${playlistId}/character/availability`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const payload = await parseJson(response);

  return {
    response,
    payload,
    content: payload?.content ?? null,
  };
}

export default function SharedPlaylistEntry() {
  const navigate = useNavigate();
  const { publicShareId } = useParams();

  const normalizedPublicShareId = (
    publicShareId ||
    (USE_MOCK_DATA ? MOCK_MY_PLAYLIST_ID : "")
  ).trim();

  const accessToken = localStorage.getItem("accessToken") || "";
  const guestToken = localStorage.getItem("guestToken") || "";
  const isLoggedIn = USE_MOCK_DATA ? true : Boolean(accessToken || guestToken);

  const storageKey = useMemo(() => {
    if (!normalizedPublicShareId) return "";
    return `lastRecommendedCover:${normalizedPublicShareId}`;
  }, [normalizedPublicShareId]);

  const guestRecommendedKey = useMemo(() => {
    if (!normalizedPublicShareId) return "";
    return `guestRecommended:${normalizedPublicShareId}`;
  }, [normalizedPublicShareId]);

  const recommendationLimitKey = useMemo(() => {
    if (!normalizedPublicShareId) return "";
    return `recommendLimitExceeded:${normalizedPublicShareId}`;
  }, [normalizedPublicShareId]);

  const [playlistMeta, setPlaylistMeta] = useState(
    USE_MOCK_DATA
      ? MOCK_PLAYLIST_META
      : {
          recommendationCount: 0,
          ownerNickname: "",
        }
  );

  const [characterData, setCharacterData] = useState(
    FORCE_MOCK_CHARACTER || USE_MOCK_DATA ? MOCK_CHARACTER_DATA : null
  );

  const [myPlaylistId, setMyPlaylistId] = useState(
    USE_MOCK_DATA ? MOCK_MY_PLAYLIST_ID : ""
  );
  const [myPlaylistPublicShareId, setMyPlaylistPublicShareId] = useState(
    USE_MOCK_DATA ? MOCK_MY_PLAYLIST_ID : ""
  );

  const [recommendedTracks, setRecommendedTracks] = useState(() =>
    buildInitialTracks(normalizedPublicShareId)
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const [characterAvailability, setCharacterAvailability] = useState(
    USE_MOCK_DATA
      ? { available: true, requiredCount: 10, currentCount: 10 }
      : null
  );

  const [isCharacterAvailabilityLoading, setIsCharacterAvailabilityLoading] =
    useState(false);

  const hasGuestRecommended = useMemo(() => {
    if (USE_MOCK_DATA) return false;
    if (!guestRecommendedKey) return false;

    return localStorage.getItem(guestRecommendedKey) === "true";
  }, [guestRecommendedKey]);

  const hasRecommendationLimitExceeded = useMemo(() => {
    if (USE_MOCK_DATA) return false;
    if (!recommendationLimitKey) return false;

    return localStorage.getItem(recommendationLimitKey) === "true";
  }, [recommendationLimitKey]);

  const linkError = !normalizedPublicShareId ? "유효하지 않은 공유 링크입니다." : "";

  const pointerStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const isMyPlaylist = USE_MOCK_DATA
    ? myPlaylistPublicShareId === normalizedPublicShareId
    : Boolean(accessToken) && myPlaylistPublicShareId === normalizedPublicShareId;

  const searchPath = useMemo(() => {
    if (!normalizedPublicShareId) return "/search";

    return buildSearchPath(normalizedPublicShareId);
  }, [normalizedPublicShareId]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!normalizedPublicShareId) return;

    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/playlists/share/${encodeURIComponent(
            normalizedPublicShareId
          )}/public`
        );

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

        const publicRecommendations = Array.isArray(
          payload?.content?.recommendations
        )
          ? payload.content.recommendations
          : [];

        const publicTracks = publicRecommendations
          .map((recommendation) => normalizeTrack(recommendation))
          .filter((track) => track.albumCoverImageUrl)
          .reverse();

        const storedHistoryTracks = getStoredCoverHistory(
          normalizedPublicShareId
        ).map((cover) => normalizeTrack(null, cover));

        const latestPublicTrack = normalizeTrack(null, latestCoverImageUrl);

        const nextTracks =
          publicTracks.length > 0
            ? mergeTracks(publicTracks, [
                ...storedHistoryTracks,
                latestPublicTrack,
              ])
            : mergeTracks([latestPublicTrack, ...storedHistoryTracks], []);

        if (publicTracks.length > 0) {
          localStorage.setItem(
            `recommendedTracks:${normalizedPublicShareId}`,
            JSON.stringify(publicTracks)
          );
        }

        setRecommendedTracks(nextTracks);
      } catch {
        // fallback UI 사용
      }
    };

    void fetchPlaylist();
  }, [normalizedPublicShareId, storageKey]);

  useEffect(() => {
    if (USE_MOCK_DATA || FORCE_MOCK_CHARACTER) return;
    if (!accessToken || !isMyPlaylist || !myPlaylistId) return;

    const fetchCharacter = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/playlists/${myPlaylistId}/character/download-url`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const payload = await parseJson(response);

        const nextCharacterImageUrl =
          payload?.content?.downloadUrl || payload?.content?.imageUrl || "";

        if (
          !response.ok ||
          payload?.code !== "SUCCESS" ||
          !nextCharacterImageUrl
        ) {
          setCharacterData(null);
          return;
        }

        setCharacterData({
          ...payload.content,
          imageUrl: nextCharacterImageUrl,
        });
      } catch {
        setCharacterData(null);
      }
    };

    void fetchCharacter();
  }, [accessToken, isMyPlaylist, myPlaylistId]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!accessToken || !normalizedPublicShareId) return;

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
            setMyPlaylistPublicShareId("");
          }

          return;
        }

        if (!cancelled) {
          setMyPlaylistId(getPlaylistIdFromResponseContent(payload.content));
          setMyPlaylistPublicShareId(
            getPublicShareIdFromResponseContent(payload.content)
          );
        }
      } catch {
        if (!cancelled) {
          setMyPlaylistId("");
          setMyPlaylistPublicShareId("");
        }
      }
    };

    void checkMyPlaylist();

    return () => {
      cancelled = true;
    };
  }, [accessToken, normalizedPublicShareId]);

  useEffect(() => {
    if (USE_MOCK_DATA) return;
    if (!isMyPlaylist || !myPlaylistId || !accessToken) return;

    let cancelled = false;

    const loadCharacterAvailability = async () => {
      setIsCharacterAvailabilityLoading(true);

      try {
        const { response, payload, content } =
          await requestCharacterAvailability(myPlaylistId, accessToken);

        if (!response.ok || payload?.code !== "SUCCESS") {
          if (!cancelled) {
            setCharacterAvailability(null);
          }

          return;
        }

        if (!cancelled) {
          setCharacterAvailability(content);
        }
      } catch {
        if (!cancelled) {
          setCharacterAvailability(null);
        }
      } finally {
        if (!cancelled) {
          setIsCharacterAvailabilityLoading(false);
        }
      }
    };

    void loadCharacterAvailability();

    return () => {
      cancelled = true;
    };
  }, [accessToken, isMyPlaylist, myPlaylistId]);

  const handleGoMyPlaylist = () => {
    if (myPlaylistPublicShareId) {
      navigate(buildPlaylistPath(myPlaylistPublicShareId));
      return;
    }

    navigate("/main");
  };

  const handleCopyShareLink = async () => {
    if (!normalizedPublicShareId) {
      alert("유효하지 않은 공유 링크입니다.");
      return;
    }

    const shareLink = buildPlaylistShareLink(normalizedPublicShareId);

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

  const handleStartRecommendation = async () => {
    if (!normalizedPublicShareId) {
      alert("유효하지 않은 공유 링크입니다.");
      return;
    }

    if (isMyPlaylist) {
      if (!accessToken) {
        localStorage.setItem(
          "postLoginRedirect",
          buildPlaylistPath(normalizedPublicShareId)
        );

        navigate(`/login?publicShareId=${encodeURIComponent(normalizedPublicShareId)}`);
        return;
      }

      setIsCharacterAvailabilityLoading(true);

      try {
        const { response, payload, content } =
          await requestCharacterAvailability(myPlaylistId, accessToken);

        if (!response.ok || payload?.code !== "SUCCESS") {
          if (payload?.code === "UNAUTHORIZED") {
            localStorage.setItem(
              "postLoginRedirect",
              buildPlaylistPath(normalizedPublicShareId)
            );

            navigate(
              `/login?publicShareId=${encodeURIComponent(normalizedPublicShareId)}`
            );

            return;
          }

          throw new Error(
            payload?.message || "캐릭터 생성 가능 여부를 확인하지 못했습니다."
          );
        }

        setCharacterAvailability(content);

        if (!content?.available) {
          alert(getCharacterAvailabilityMessage(content));
          return;
        }

        const recreateQuery = hasCharacter ? "&recreate=true" : "";

        navigate(
          `/character-loading?playlistId=${encodeURIComponent(
            myPlaylistId
          )}&publicShareId=${encodeURIComponent(
            normalizedPublicShareId
          )}${recreateQuery}`
        );
      } catch (error) {
        alert(error.message || "캐릭터 생성 가능 여부를 확인하지 못했습니다.");
      } finally {
        setIsCharacterAvailabilityLoading(false);
      }

      return;
    }

    if (hasGuestRecommended && !accessToken && guestToken) {
      navigate("/landing");
      return;
    }

    if (hasRecommendationLimitExceeded && Boolean(accessToken) && !isMyPlaylist) {
      return;
    }

    if (!isLoggedIn) {
      localStorage.setItem("postLoginRedirect", searchPath);

      navigate(`/login?publicShareId=${encodeURIComponent(normalizedPublicShareId)}`);
      return;
    }

    navigate(searchPath);
  };

  const openRecommendationTrack = (track) => {
    if (!track?.albumCoverImageUrl) return;

    navigate(`/lp?publicShareId=${encodeURIComponent(normalizedPublicShareId)}`, {
      state: {
        track,
        publicShareId: normalizedPublicShareId,
        isRecommended: true,
        recommendationId: track.recommendationId ?? null,
        commentCount: track.commentCount ?? 0,
      },
    });
  };

  const trackCount = recommendedTracks.length;
  const currentIndex = trackCount > 0 ? activeIndex % trackCount : 0;

  const centerTrack = trackCount > 0 ? recommendedTracks[currentIndex] : null;

  const leftTrack =
    trackCount > 1
      ? recommendedTracks[(currentIndex - 1 + trackCount) % trackCount]
      : null;

  const rightTrack =
    trackCount > 1
      ? recommendedTracks[(currentIndex + 1) % trackCount]
      : null;

  const indicatorProgress =
    trackCount > 1 ? currentIndex / (trackCount - 1) : 0;

  const ownerLabel = playlistMeta.ownerNickname
    ? `${playlistMeta.ownerNickname}님의 플레이리스트`
    : "친구의 플레이리스트";

  const showLimitMessage =
    hasRecommendationLimitExceeded && Boolean(accessToken) && !isMyPlaylist;

  const showRecommendButton = !showLimitMessage;

  const showCharacterBlockedMessage =
    isMyPlaylist &&
    Boolean(characterAvailability) &&
    characterAvailability.available === false;

  const isCreateCharacterDisabled =
    isMyPlaylist &&
    (isCharacterAvailabilityLoading ||
      characterAvailability?.available === false);

  const hasCharacter = Boolean(characterData?.imageUrl);
  const showShareGuideMessage =
    showCharacterBlockedMessage && !hasCharacter;

  const buttonText = (() => {
    if (isMyPlaylist) {
      if (isCharacterAvailabilityLoading) {
        return "생성 가능 여부 확인 중...";
      }

      if (hasCharacter) {
        return "캐릭터 다시 생성하기";
      }

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
        <button
          type="button"
          className="shared-brand"
          onClick={() => navigate("/logotorealmain")}
        >
          <img
            src={plitterLogo}
            alt="PLITTER"
            className="header-logo-image"
          />
        </button>

        {accessToken ? (
          <button
            type="button"
            className="shared-my-list-button"
            onClick={handleGoMyPlaylist}
          >
            MY
          </button>
        ) : null}
      </header>

      <section className="shared-record-section">
        <div
          className="shared-cover-stack"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="shared-character-layer">
            {characterData ? (
              <img
                src={characterData.imageUrl}
                alt={characterData.characterName || "생성된 캐릭터"}
                className="shared-character-image"
              />
            ) : (
              <div className="shared-character-placeholder" aria-hidden="true" />
            )}
          </div>

          <button
            type="button"
            className="shared-main-cover shared-main-cover-back-left"
            onClick={() => handleSideCoverClick(-1)}
            disabled={!leftTrack}
            aria-label="왼쪽 추천곡 보기"
          >
            {leftTrack ? (
              <img
                src={leftTrack.albumCoverImageUrl}
                alt={leftTrack.title}
                className="shared-side-image"
              />
            ) : null}
          </button>

          <button
            type="button"
            className="shared-main-cover shared-main-cover-back-right"
            onClick={() => handleSideCoverClick(1)}
            disabled={!rightTrack}
            aria-label="오른쪽 추천곡 보기"
          >
            {rightTrack ? (
              <img
                src={rightTrack.albumCoverImageUrl}
                alt={rightTrack.title}
                className="shared-side-image"
              />
            ) : null}
          </button>

          {centerTrack ? (
            <button
              type="button"
              className="shared-main-cover shared-main-cover-front"
              onClick={handleCenterCoverClick}
              aria-label="대표 추천곡 보기"
            >
              <img
                className="shared-cover"
                src={centerTrack.albumCoverImageUrl}
                alt={centerTrack.title}
              />
            </button>
          ) : (
            <div className="shared-cover-placeholder" aria-hidden="true" />
          )}
        </div>

        {trackCount > 1 ? (
          <div
            className="shared-cover-indicator"
            aria-label={`추천 곡 ${currentIndex + 1} / ${trackCount}`}
          >
            <span className="shared-cover-indicator-track" />
            <span
              className="shared-cover-indicator-thumb"
              style={{
                left: `calc((100% - 28px) * ${indicatorProgress})`,
              }}
            />
          </div>
        ) : null}

        <p className="shared-entry-eyebrow">{ownerLabel}</p>
      </section>

      {linkError ? (
        <p className="shared-playlist-error">{linkError}</p>
      ) : null}

      {showLimitMessage ? (
        <p className="shared-limit-message">
          한 친구에게 3번까지 추천이 가능합니다
        </p>
      ) : null}

      {showCharacterBlockedMessage ? (
        <>
          <p className="shared-limit-message">
            {getCharacterAvailabilityMessage(characterAvailability)}
          </p>
          {showShareGuideMessage ? (
            <p className="shared-share-guide-message">
              공유 링크를 공유해서 추천을 받아보세요
            </p>
          ) : null}
        </>
      ) : null}

      {showRecommendButton ? (
        <button
          type="button"
          className="shared-recommend-button"
          onClick={handleStartRecommendation}
          disabled={isCreateCharacterDisabled}
        >
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
