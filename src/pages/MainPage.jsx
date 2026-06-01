import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VinylCarousel from "../components/VinylCarousel";
import { dummyTracks } from "../data/dummyTracks";
import "./MainPage.css";

const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://13.124.174.30:8080";

const REQUIRED_RECOMMENDATION_COUNT = 3;

export default function MainPage() {
  const [, setSelectedTrack] = useState(dummyTracks[0]);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken")
  );

  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isLoggedIn = Boolean(accessToken);

  const sharedPlaylistId = searchParams.get("playlistId");
  const myPlaylistId = localStorage.getItem("playlistId") || "1";
  const playlistId = sharedPlaylistId || myPlaylistId;

  const isSharedPlaylist = Boolean(sharedPlaylistId);
  const isMyPlaylist = !isSharedPlaylist;

  useEffect(() => {
    const fetchPlaylistInfo = async () => {
      if (!playlistId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/playlists/${playlistId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          }
        );

        const data = await response.json();

        if (data.code !== "SUCCESS") {
          throw new Error(data.message || "플레이리스트 조회에 실패했습니다.");
        }

        setPlaylistInfo(data.content);
      } catch (error) {
        console.error("플레이리스트 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistInfo();
  }, [playlistId, accessToken]);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!playlistId || !isMyPlaylist) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/playlists/${playlistId}/character`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          }
        );

        const data = await response.json();

        if (data.code === "SUCCESS") {
          setHasCharacter(true);
          return;
        }

        if (data.code === "CHARACTER_NOT_FOUND") {
          setHasCharacter(false);
          return;
        }

        setHasCharacter(false);
      } catch (error) {
        console.error("캐릭터 조회 실패:", error);
        setHasCharacter(false);
      }
    };

    fetchCharacter();
  }, [playlistId, isMyPlaylist, accessToken]);

  const recommendationCount = playlistInfo?.recommendationCount ?? 0;

  const canCreateCharacter =
    playlistInfo?.canCreateCharacter ||
    recommendationCount >= REQUIRED_RECOMMENDATION_COUNT;

  const handleAuthButtonClick = async () => {
    if (isSharedPlaylist) {
      navigate("/main");
      return;
    }

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      navigate("/", { replace: true });
    }
  };

  const getHeaderButtonText = () => {
    if (isSharedPlaylist) return "내 플리로 이동";
    return isLoggedIn ? "logout" : "login";
  };

  const getBottomButtonText = () => {
    if (isMyPlaylist) {
      if (hasCharacter) return "캐릭터 다시 생성하기";
      return "캐릭터 생성하러 가기";
    }

    return "+ 노래 추천하기";
  };

  const getBottomDescription = () => {
    if (isMyPlaylist && !hasCharacter && !canCreateCharacter) {
      return `추천 ${REQUIRED_RECOMMENDATION_COUNT}개 이상이 되면 생성이 가능합니다. 현재 ${recommendationCount}/${REQUIRED_RECOMMENDATION_COUNT}`;
    }

    return "";
  };

  const isBottomButtonDisabled =
    isLoading || (isMyPlaylist && !hasCharacter && !canCreateCharacter);

  const handleBottomButtonClick = () => {
    if (isMyPlaylist) {
      if (!hasCharacter && !canCreateCharacter) return;

      if (hasCharacter) {
        navigate(`/character-loading?playlistId=${playlistId}&recreate=true`);
        return;
      }

      navigate(`/character-loading?playlistId=${playlistId}`);
      return;
    }

    navigate(`/search?playlistId=${playlistId}`);
  };

  return (
    <main className="main-page">
      <header className="main-header">
        <h1>FIND YOUR NUMBER 18</h1>

        <button className="login-button" onClick={handleAuthButtonClick}>
          {getHeaderButtonText()}
        </button>
      </header>

      <section className="record-section">
        <VinylCarousel tracks={dummyTracks} onSelect={setSelectedTrack} />
      </section>

      <div className="main-bottom-area">
        <button
          className="recommend-button"
          onClick={handleBottomButtonClick}
          disabled={isBottomButtonDisabled}
        >
          {isLoading ? "불러오는 중..." : getBottomButtonText()}
        </button>

        {getBottomDescription() && (
          <p className="main-bottom-description">{getBottomDescription()}</p>
        )}
      </div>
    </main>
  );
}