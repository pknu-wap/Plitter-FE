import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./ProfileShare.css";

export default function ProfileShare() {
  const navigate = useNavigate();

  const [playlistName, setPlaylistName] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasCreatedPlaylist = useRef(false);

  const createPlaylist = async () => {
    const accessToken = localStorage.getItem("accessToken");

    const nickname =
      localStorage.getItem("nickname") ||
      localStorage.getItem("userName") ||
      localStorage.getItem("name");

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return null;
    }

    const finalNickname = nickname || "사용자";
    const finalPlaylistName = `${finalNickname}님의 플레이리스트`;

    setPlaylistName(finalPlaylistName);

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
      if (data.code === "PLAYLIST_ALREADY_EXISTS") {
        alert("이미 생성된 플레이리스트가 있어요.");

        // 명세상 이미 존재할 때는 content가 null일 수 있음
        return null;
      }

      alert(data.message || "플레이리스트 생성에 실패했어요.");
      return null;
    }

    return data.content?.shareUrl || null;
  };

  useEffect(() => {
    const loadShareLink = async () => {
      if (hasCreatedPlaylist.current) return;
      hasCreatedPlaylist.current = true;

      try {
        setIsLoading(true);

        const newShareLink = await createPlaylist();

        if (!newShareLink) return;

        setShareLink(newShareLink);
      } catch (error) {
        console.error("공유 링크 생성 실패", error);
        alert("공유 링크 생성 중 문제가 발생했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    loadShareLink();
  }, []);

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
          {playlistName || "플레이리스트를 불러오는 중..."}
        </h2>
      </section>

      <section className="share-bottom-area">
        <button
          type="button"
          className={`copy-link-button ${copied ? "copied" : ""}`}
          onClick={handleCopyLink}
          disabled={isLoading}
        >
          {isLoading
            ? "공유 링크 생성 중..."
            : copied
            ? "공유 링크가 복사되었어요"
            : "공유 링크 복사하기"}
        </button>
      </section>
    </main>
  );
}
