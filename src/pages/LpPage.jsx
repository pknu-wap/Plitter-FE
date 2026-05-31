import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import vinylImage from "../assets/lp-vinyl.png";
import "./LpPage.css";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://13.124.174.30:8080/api";

function normalizeTrack(track) {
  if (!track) return null;

  return {
    spotifyId: track.spotifyId,
    title: track.title || "제목 없음",
    artistName: track.artistName || track.artist || "아티스트 정보 없음",
    albumCoverImageUrl: track.albumCoverImageUrl || track.albumImage || "",
    previewUrl: track.previewUrl || "",
    albumName: track.albumName || track.album || "",
  };
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minute = Math.floor(seconds / 60);
  const second = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minute}:${second}`;
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function LpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const initialTrack = normalizeTrack(location.state?.track);

  const [displayTrack, setDisplayTrack] = useState(initialTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);

  const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(Boolean(location.state?.openRecommendSheet));
  const [commentText, setCommentText] = useState(location.state?.commentText || "");
  const [isAnonymous, setIsAnonymous] = useState(location.state?.isAnonymous ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRecommended, setIsRecommended] = useState(Boolean(location.state?.isRecommended));
  const [showComments, setShowComments] = useState(true);
  const [comments, setComments] = useState(Array.isArray(location.state?.localComments) ? location.state.localComments : []);
  const [commentCount, setCommentCount] = useState(location.state?.commentCount || comments.length || 0);

  const [recommendationId, setRecommendationId] = useState(location.state?.recommendationId || null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  const accessToken = localStorage.getItem("accessToken") || "";
  const guestToken = localStorage.getItem("guestToken") || "";
  const guestNickname = localStorage.getItem("guestNickname") || "익명";

  const isKakaoUser = Boolean(accessToken);
  const isGuestUser = !isKakaoUser && Boolean(guestToken);

  const playlistId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return location.state?.playlistId || params.get("playlistId") || "1";
  }, [location.search, location.state?.playlistId]);

  useEffect(() => {
    if (!displayTrack?.previewUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(displayTrack.previewUrl);

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [displayTrack?.previewUrl]);

  const fetchComments = async (id) => {
    if (!id) return;

    setIsCommentsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/recommendations/${id}`);
      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS") {
        return;
      }

      const content = payload?.content;
      const fetchedComments = Array.isArray(content?.comments) ? content.comments : [];

      setComments(fetchedComments);
      setCommentCount(fetchedComments.length);
      setIsRecommended(fetchedComments.length > 0);

      if (content) {
        setDisplayTrack((prevTrack) =>
          normalizeTrack({
            ...prevTrack,
            spotifyId: content.spotifyId,
            title: content.title,
            artistName: content.artist,
            albumCoverImageUrl: content.albumCoverImageUrl,
            previewUrl: content.previewUrl,
          }),
        );
      }
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (recommendationId) {
      const timer = setTimeout(() => {
        void fetchComments(recommendationId);
      }, 0);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [recommendationId]);

  const handleTogglePlay = async () => {
    if (!audioRef.current) {
      alert("이 곡은 미리듣기를 지원하지 않습니다.");
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      alert("재생에 실패했습니다.");
    }
  };

  const handleRecommend = async () => {
    if (!displayTrack?.spotifyId) {
      alert("추천할 곡 정보가 없습니다.");
      return;
    }

    if (!commentText.trim()) {
      alert("코멘트를 입력해주세요.");
      return;
    }

    if (!isKakaoUser && !isGuestUser) {
      alert("로그인 또는 게스트 입장 후 추천할 수 있습니다.");
      navigate("/login");
      return;
    }

    const requestData = {
      spotifyId: displayTrack.spotifyId,
      title: displayTrack.title,
      artistName: displayTrack.artistName,
      albumCoverImageUrl: displayTrack.albumCoverImageUrl,
      previewUrl: displayTrack.previewUrl || null,
      comment: commentText.trim(),
      guestToken: isGuestUser ? guestToken : null,
      randomNickname: isGuestUser ? guestNickname : "",
      isAnonymous: isKakaoUser ? isAnonymous : true,
    };

    const headers = {
      "Content-Type": "application/json",
      ...(isKakaoUser ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/recommendations`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      });

      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS") {
        alert(payload?.message || "추천 등록에 실패했습니다.");
        return;
      }

      const newRecommendationId = payload?.content?.recommendationId;

      setIsCommentPopupOpen(false);
      setIsRecommended(true);

      if (newRecommendationId) {
        setRecommendationId(newRecommendationId);
        await fetchComments(newRecommendationId);
      } else {
        const optimisticName = isKakaoUser ? (isAnonymous ? "익명" : "나") : guestNickname;
        const optimisticComments = [{ recommenderName: optimisticName, comment: commentText.trim() }];
        setComments(optimisticComments);
        setCommentCount(optimisticComments.length);
      }
    } catch {
      alert("추천 등록 중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToComments = () => {
    if (!recommendationId && comments.length === 0) {
      alert("표시할 코멘트가 없습니다.");
      return;
    }

    navigate("/comments", {
      state: {
        track: displayTrack,
        recommendationId,
        playlistId,
        commentText,
        isRecommended,
        commentCount,
        localComments: comments,
      },
    });
  };

  const notes = comments.slice(0, 4);
  const hasNotes = notes.length > 0;
  const progressRatio = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  if (!displayTrack) {
    return (
      <main className="lp-page">
        <header className="lp-header">PLITTER</header>
        <section className="lp-empty">
          <p>선택된 곡이 없습니다.</p>
          <button type="button" onClick={() => navigate("/search")}>검색 페이지로 이동</button>
        </section>
      </main>
    );
  }

  return (
    <main className="lp-page">
      <header className="lp-header">PLITTER</header>

      <section className="lp-stage">
        <div className="lp-record-view">
          <img className="lp-vinyl" src={vinylImage} alt="vinyl" aria-hidden="true" />
          <img className="lp-album-cover" src={displayTrack.albumCoverImageUrl} alt={displayTrack.title} />
        </div>

        {hasNotes && showComments ? (
          <div className="post-it-container" aria-label="comments-notes">
            {notes.map((comment, index) => (
              <article key={`${comment.recommenderName}-${index}`} className={`post-it post-it-${index + 1}`}>
                <p>{comment.comment}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {(hasNotes || isRecommended) ? (
        <button type="button" className="comment-pill" onClick={() => setShowComments((prev) => !prev)}>
          코멘트
        </button>
      ) : null}

      <section className="lp-track-preview">
        <h2>{displayTrack.title}</h2>
        <p>{displayTrack.artistName}</p>
      </section>

      <section className="player-bar-container">
        <div className="progress-bar-bg" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressRatio * 100)}>
          <div className="progress-bar-fill" style={{ width: `${progressRatio * 100}%` }} />
          <span className="progress-thumb" style={{ left: `${progressRatio * 100}%` }} />
        </div>

        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <button type="button" className="play-btn" onClick={handleTogglePlay}>
          {isPlaying ? "❚❚" : "▶"}
        </button>

        {isRecommended || hasNotes || recommendationId ? (
          <button type="button" className="view-comments-btn" onClick={handleGoToComments}>
            {isCommentsLoading ? "코멘트 불러오는 중..." : `이 곡의 코멘트 ${commentCount}개 보기 →`}
          </button>
        ) : (
          <button type="button" className="view-comments-btn" onClick={() => setIsCommentPopupOpen(true)}>
            친구에게 추천하기 →
          </button>
        )}
      </section>

      {isCommentPopupOpen ? (
        <div className="comment-sheet-overlay" onClick={() => setIsCommentPopupOpen(false)}>
          <section className="comment-bottom-sheet" onClick={(event) => event.stopPropagation()}>
            <span className="sheet-handle" aria-hidden="true" />

            <div className="sheet-track-info">
              <img className="sheet-album-cover" src={displayTrack.albumCoverImageUrl} alt={displayTrack.title} />
              <div className="sheet-track-text">
                <h3>{displayTrack.title}</h3>
                <p>{displayTrack.artistName}</p>
                <span>앨범 {displayTrack.albumName || "-"}</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="commentText">코멘트</label>
              <textarea
                id="commentText"
                placeholder="이 노래를 들을 때 떠오르는 장면을 적어주세요"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
            </div>

            <div className="anonymous-row">
              <div>
                <strong>익명 여부</strong>
                <p>익명을 선택하면 랜덤 닉네임으로 추천됩니다.</p>
              </div>
              <button
                type="button"
                className={`anonymous-toggle ${isAnonymous ? "on" : "off"}`}
                onClick={() => setIsAnonymous((prev) => !prev)}
                disabled={!isKakaoUser}
              >
                {isKakaoUser ? (isAnonymous ? "ON" : "OFF") : "ON"}
              </button>
            </div>

            <button type="button" className="recommend-btn" onClick={handleRecommend} disabled={isSubmitting}>
              {isSubmitting ? "추천 등록 중..." : "추천하기"}
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
