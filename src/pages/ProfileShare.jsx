import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./ProfileShare.css";

const USE_MOCK_DATA = true;

const MOCK_PLAYLIST_CONTENT = {
  playlistId: "mock-playlist",
  shareUrl: `${window.location.origin}/playlist/mock-playlist`,
};

export default function ProfileShare() {
  const navigate = useNavigate();

  const [playlistName, setPlaylistName] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPlaylist, setHasPlaylist] = useState(false);
  const [myPlaylistPath, setMyPlaylistPath] = useState("");

  const hasCheckedPlaylist = useRef(false);

  const getNickname = () => {
    return (
      localStorage.getItem("nickname") ||
      localStorage.getItem("userName") ||
      localStorage.getItem("name") ||
      "사용자"
    );
  };

  const getPlaylistIdFromResponseContent = (content) => {
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
  };

  const applyPlaylistContent = (content) => {
    const playlistId = getPlaylistIdFromResponseContent(content);

    const nextShareLink =
      content?.shareUrl ||
      (playlistId ? `${window.location.origin}/playlist/${playlistId}` : "");

    setHasPlaylist(true);
    setShareLink(nextShareLink);
    setMyPlaylistPath(playlistId ? `/playlist/${playlistId}` : "");
  };

  const checkPlaylist = async () => {
    const nickname = getNickname();
    setPlaylistName(`${nickname}님의 플레이리스트`);

    if (USE_MOCK_DATA) {
      setIsLoading(true);

      setTimeout(() => {
        applyPlaylistContent(MOCK_PLAYLIST_CONTENT);
        setIsLoading(false);
      }, 300);

      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/playlists/check`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await parseJson(response);

      console.log("플레이리스트 존재 여부 응답:", data);

      if (!response.ok || data?.code !== "SUCCESS") {
        setHasPlaylist(false);
        setShareLink("");
        setMyPlaylistPath("");
        return;
      }

      if (!data?.content?.hasPlaylist) {
        setHasPlaylist(false);
        setShareLink("");
        setMyPlaylistPath("");
        return;
      }

      applyPlaylistContent(data.content);
    } catch (error) {
      console.error("플레이리스트 확인 실패", error);
      alert("플레이리스트 확인 중 문제가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    const nickname = getNickname();
    const finalPlaylistName = `${nickname}님의 플레이리스트`;

    setPlaylistName(finalPlaylistName);

    if (USE_MOCK_DATA) {
      return MOCK_PLAYLIST_CONTENT;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    const data = await parseJson(response);

    console.log("플레이리스트 생성 응답:", data);

    if (!response.ok) {
      if (data?.code === "PLAYLIST_ALREADY_EXISTS") {
        alert("이미 생성된 플레이리스트가 있어요.");
        await checkPlaylist();
        return null;
      }

      alert(data?.message || "플레이리스트 생성에 실패했어요.");
      return null;
    }

    return data.content || null;
  };

  useEffect(() => {
    const loadPlaylistStatus = async () => {
      if (hasCheckedPlaylist.current) return;
      hasCheckedPlaylist.current = true;

      await checkPlaylist();
    };

    loadPlaylistStatus();
  }, []);

  const handleCreatePlaylist = async () => {
    try {
      setIsLoading(true);

      const newPlaylistContent = await createPlaylist();

      if (!newPlaylistContent) return;

      applyPlaylistContent(newPlaylistContent);
    } catch (error) {
      console.error("플레이리스트 생성 실패", error);
      alert("플레이리스트 생성 중 문제가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoMyPlaylist = () => {
    if (!myPlaylistPath) {
      alert("플레이리스트 경로를 확인할 수 없어요.");
      return;
    }

    navigate(myPlaylistPath);
  };

  const handleCopyLink = async () => {
    if (!shareLink) {
      alert("아직 공유 링크가 생성되지 않았어요.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("링크 복사 실패", error);
      alert("링크 복사 중 문제가 발생했어요.");
    }
  };

  return (
    <main className="profile-share-page">
      <header className="profile-share-header">
        <img src={plitterLogo} alt="PLITTER" className="plitter-logo" />
      </header>

      <section className="share-main-content">
        <p className="share-main-text">
          링크를 공유하여
          <br />
          친구들에게 추천곡을 받아보세요
        </p>

        <div className="share-glow" />

        <div className="share-player-line">
          <span className="line" />
          <span className="slider" />
          <span className="line" />
        </div>

        <h2 className="playlist-title">
          {playlistName || "플레이리스트를 확인하는 중..."}
        </h2>
      </section>

      <section className="share-bottom-area">
        {hasPlaylist ? (
          <>
            <button
              type="button"
              className={`copy-link-button ${copied ? "copied" : ""}`}
              onClick={handleCopyLink}
              disabled={isLoading}
            >
              {isLoading
                ? "공유 링크 확인 중..."
                : copied
                ? "공유 링크가 복사되었어요"
                : "공유 링크 복사하기"}
            </button>

            <button
              type="button"
              className="my-playlist-button"
              onClick={handleGoMyPlaylist}
              disabled={isLoading || !myPlaylistPath}
            >
              생성된 플레이리스트로 이동
            </button>
          </>
        ) : (
          <button
            type="button"
            className="copy-link-button"
            onClick={handleCreatePlaylist}
            disabled={isLoading}
          >
            {isLoading ? "확인 중..." : "플레이리스트 생성하기"}
          </button>
        )}
      </section>
    </main>
  );
}