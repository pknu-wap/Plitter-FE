import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileShare.css";
import plusIcon from "../assets/plus.png";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://13.124.174.30:8080";

export default function ProfileShare() {
  const navigate = useNavigate();

  const [playlistName, setPlaylistName] = useState("봄날의 플레이리스트");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 개발 모드에서 useEffect가 두 번 실행되는 걸 막기 위한 용도
  const hasCreatedPlaylist = useRef(false);

  const createPlaylist = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/playlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        title: playlistName,
        cover_image: null,
      }),
    });

    const data = await response.json();

    console.log("플레이리스트 생성 응답:", data);

    if (!response.ok) {
      if (data.code === "PLAYLIST_ALREADY_EXISTS") {
        alert("이미 생성된 플레이리스트가 있어요.");
      } else {
        alert(data.message || "플레이리스트 생성에 실패했어요.");
      }

      return null;
    }

    return data.content.shareUrl;
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
    } catch (error) {
      console.error("링크 복사 실패", error);
      alert("링크 복사 중 문제가 발생했어요.");
    }
  };

  const handleGoRecommend = () => {
    navigate("/");
  };

  return (
    <main className="profile-share-page">
      <header className="profile-share-header">
        <h1>FIND YOUR NUMBER 18</h1>
      </header>

      <section className="profile-share-title">
        <h2>나만의 플레이리스트 만들기</h2>
        <p>플레이리스트의 이름을 작성해 주세요!</p>
      </section>

      <section className="share-profile-image-section">
        <button type="button" className="share-profile-image-button">
          <span className="share-plus-button">
            <img src={plusIcon} alt="플레이리스트 커버 사진 추가" />
          </span>
        </button>
      </section>

      <section className="share-form-section">
        <label className="share-label" htmlFor="playlist-name">
          플레이리스트 이름 &#40;선택&#41;
        </label>

        <input
          id="playlist-name"
          type="text"
          value={playlistName}
          onChange={(e) => {
            setPlaylistName(e.target.value);
            setCopied(false);
          }}
          className="share-input"
        />

        <label className="share-label share-link-label">공유 링크</label>

        <div
          className="share-link-box"
          onClick={handleCopyLink}
          role="button"
          tabIndex={0}
        >
          {isLoading
            ? "공유 링크 생성 중..."
            : shareLink || "공유 링크를 불러오지 못했어요"}
        </div>

        <p className="share-guide">
          {copied
            ? "공유 링크가 복사되었어요!"
            : "링크를 누르면 복사돼요. 친구들이 곡을 추천할 수 있어요"}
        </p>
      </section>

      <section className="share-bottom-buttons">
        <button type="button">인스타 스토리에 공유하기</button>
        <button type="button" onClick={handleGoRecommend}>
          노래 추천하러 가기
        </button>
      </section>
    </main>
  );
}