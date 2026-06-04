import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import vinylImage from "../assets/lp-vinyl.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import { buildSearchPath } from "../lib/playlistShare";
import "./LpPage.css";


function normalizeTrack(track) {
  if (!track) return null;

  return {
    recommendationId: track.recommendationId ?? null,
    spotifyId: track.spotifyId,
    title: track.title || "제목 없음",
    artistName: track.artistName || track.artist || "아티스트 정보 없음",
    albumCoverImageUrl: track.albumCoverImageUrl || track.albumImage || "",
    previewUrl: track.previewUrl || "",
    commentCount: track.commentCount ?? 0,
  };
}

function normalizeComment(comment) {
  if (!comment) return null;

  if (typeof comment === "string") {
    return { recommenderName: "익명", comment };
  }

  const commentText = comment.comment || comment.content || comment.text || "";

  if (!commentText) return null;

  return {
    recommenderName: comment.recommenderName || comment.nickname || comment.name || "익명",
    comment: commentText,
  };
}

function normalizeComments(comments) {
  if (!Array.isArray(comments)) return [];

  return comments.map(normalizeComment).filter(Boolean);
}

export default function LpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const playerPanelRef = useRef(null);

  const initialTrack = normalizeTrack(location.state?.track);

  const [displayTrack, setDisplayTrack] = useState(initialTrack);
  const [embedUrl, setEmbedUrl] = useState("");
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const isNewRecommendationEntry = Boolean(location.state?.isNewRecommendation);

  const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(Boolean(location.state?.openRecommendSheet));
  const [commentText, setCommentText] = useState(location.state?.commentText || "");
  const [isAnonymous, setIsAnonymous] = useState(location.state?.isAnonymous ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRecommended, setIsRecommended] = useState(Boolean(location.state?.isRecommended));
  const [showComments, setShowComments] = useState(true);
  const [comments, setComments] = useState(() => normalizeComments(location.state?.localComments));
  const [commentCount, setCommentCount] = useState(
    () => location.state?.commentCount ?? initialTrack?.commentCount ?? normalizeComments(location.state?.localComments).length,
  );

  const [recommendationId, setRecommendationId] = useState(location.state?.recommendationId ?? initialTrack?.recommendationId ?? null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  const accessToken = localStorage.getItem("accessToken") || "";
  const guestToken = localStorage.getItem("guestToken") || "";
  const guestNickname = localStorage.getItem("guestNickname") || "익명";

  const isKakaoUser = Boolean(accessToken);
  const isGuestUser = !isKakaoUser && Boolean(guestToken);

  const publicShareId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      location.state?.publicShareId ||
      params.get("publicShareId") ||
      params.get("playlistId")
    );
  }, [location.search, location.state?.publicShareId]);

  const fetchComments = useCallback(async (id) => {
    if (!id) return;

    setIsCommentsLoading(true);

    try {
      const detailPath = accessToken
        ? `${API_BASE_URL}/playlists/recommendations/${id}`
        : `${API_BASE_URL}/playlists/recommendations/${id}/public`;
      const response = await fetch(detailPath, {
        headers: accessToken
          ? {
            Authorization: `Bearer ${accessToken}`,
          }
          : {},
      });
      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS") {
        return;
      }

      const content = payload?.content;
      const fetchedComments = normalizeComments(content?.comments);

      setComments(fetchedComments);
      setCommentCount(fetchedComments.length);
      setIsRecommended(fetchedComments.length > 0);

      if (content) {
        setDisplayTrack((prevTrack) =>
          normalizeTrack({
            ...prevTrack,
            recommendationId: content.recommendationId,
            spotifyId: content.spotifyId,
            title: content.title,
            artistName: content.artist,
            albumCoverImageUrl: content.albumCoverImageUrl,
            previewUrl: content.previewUrl,
            commentCount: fetchedComments.length,
          }),
        );
      }
    } finally {
      setIsCommentsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (recommendationId) {
      const timer = setTimeout(() => {
        void fetchComments(recommendationId);
      }, 0);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [fetchComments, recommendationId]);

  const scrollToPlayerPanel = useCallback(() => {
    requestAnimationFrame(() => {
      playerPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const handleLoadPlayer = async () => {
    if (embedUrl) {
      if (!isPlayerVisible) {
        setIsPlayerVisible(true);
      }
      scrollToPlayerPanel();
      return;
    }

    if (!displayTrack?.spotifyId) {
      alert("재생할 곡 정보가 없습니다.");
      return;
    }

    if (!accessToken && !guestToken) {
      alert("로그인 또는 게스트 입장 후 미리듣기를 사용할 수 있습니다.");
      return;
    }

    setIsPlayerLoading(true);

    try {
      const playUrl = `${API_BASE_URL}/tracks/${displayTrack.spotifyId}/play`;
      const response = await fetch(playUrl, {
        method: "GET",
        headers: accessToken
          ? {
            Authorization: `Bearer ${accessToken}`,
          }
          : {},
      });

      const payload = await parseJson(response);
      const nextEmbedUrl = payload?.response?.embedUrl || payload?.content?.embedUrl;

      if (!response.ok || !nextEmbedUrl) {
        alert(payload?.message || "플레이어를 불러오지 못했습니다.");
        return;
      }

      setIsPlayerVisible(false);
      setEmbedUrl(nextEmbedUrl);

      // iframe 먼저 렌더링된 뒤 visible 클래스를 붙여야 내려오는 애니메이션 보임
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPlayerVisible(true);
          scrollToPlayerPanel();
        });
      });
    } catch {
      alert("플레이어 요청 중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsPlayerLoading(false);
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
      if (publicShareId) {
        const redirectPath = buildSearchPath(publicShareId);
        localStorage.setItem("postLoginRedirect", redirectPath);
        navigate(`/login?publicShareId=${encodeURIComponent(publicShareId)}`);
      } else {
        navigate("/login");
      }
      return;
    }

    if (!publicShareId) {
      alert("플레이리스트 정보가 없습니다. 공유 링크에서 다시 시작해 주세요.");
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
      const response = await fetch(
        `${API_BASE_URL}/playlists/share/${encodeURIComponent(publicShareId)}/recommendations`,
        {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
        }
      );

      const payload = await parseJson(response);

      if (!response.ok || payload?.code !== "SUCCESS") {
        alert(payload?.message || "추천 등록에 실패했습니다.");
        return;
      }

      const newRecommendationId = payload?.content?.recommendationId;

      setIsCommentPopupOpen(false);
      setIsRecommended(true);

      if (publicShareId && displayTrack.albumCoverImageUrl) {
        localStorage.setItem(`lastRecommendedCover:${publicShareId}`, displayTrack.albumCoverImageUrl);
        try {
          const trackHistoryKey = `recommendedTracks:${publicShareId}`;
          const rawTrackHistory = localStorage.getItem(trackHistoryKey);
          const parsedTrackHistory = rawTrackHistory ? JSON.parse(rawTrackHistory) : [];
          const trackHistory = Array.isArray(parsedTrackHistory) ? parsedTrackHistory : [];
          const nextTrackHistory = [
            {
              spotifyId: displayTrack.spotifyId,
              title: displayTrack.title,
              artistName: displayTrack.artistName,
              albumCoverImageUrl: displayTrack.albumCoverImageUrl,
              previewUrl: displayTrack.previewUrl || "",
            },
            ...trackHistory,
          ];
          const uniqueTrackHistory = [];
          const seenCover = new Set();
          nextTrackHistory.forEach((track) => {
            const cover = track?.albumCoverImageUrl || "";
            if (!cover || seenCover.has(cover)) return;
            seenCover.add(cover);
            uniqueTrackHistory.push(track);
          });
          localStorage.setItem(trackHistoryKey, JSON.stringify(uniqueTrackHistory.slice(0, 10)));

          const historyKey = `recommendedCovers:${publicShareId}`;
          const rawHistory = localStorage.getItem(historyKey);
          const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
          const history = Array.isArray(parsedHistory) ? parsedHistory : [];
          const nextHistory = [displayTrack.albumCoverImageUrl, ...history.filter(Boolean)];
          const uniqueHistory = [...new Set(nextHistory)].slice(0, 10);
          localStorage.setItem(historyKey, JSON.stringify(uniqueHistory));
        } catch {
          // Ignore storage parsing issue and continue.
        }
      }

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
        publicShareId,
        commentText,
        isRecommended,
        commentCount,
        localComments: comments,
      },
    });
  };

  const notes = comments.slice(0, 5);
  const hasNotes = notes.length > 0;
  const canToggleComments = hasNotes;
  if (!displayTrack) {
    return (
      <main className="lp-page">
        <header className="lp-header">
          <button type="button" className="brand-home-button" onClick={() => navigate("/")}>
            <img src={plitterLogo} alt="PLITTER" className="header-logo-image" />
          </button>
        </header>
        <section className="lp-empty">
          <p>선택된 곡이 없습니다.</p>
          <button type="button" onClick={() => navigate("/search")}>검색 페이지로 이동</button>
        </section>
      </main>
    );
  }

  return (
    <main className="lp-page">
      <header className="lp-header">
        <button type="button" className="brand-home-button" onClick={() => navigate("/")}>
          <img src={plitterLogo} alt="PLITTER" className="header-logo-image" />
        </button>
      </header>
      
      {/* 스포티파이 embed 플레이어 */}
      {embedUrl ? (
        <section
          ref={playerPanelRef}
          className={`spotify-player-panel ${isPlayerVisible ? "visible" : ""}`}
          aria-label="Spotify preview player"
        >
          <div className="airpods-player-shell">
            <span className="airpods-lid-line" aria-hidden="true" />
            <span className="airpods-led" aria-hidden="true" />
            <iframe
              src={embedUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`${displayTrack.title} Spotify player`}
            />
          </div>
        </section>
      ) : null}

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

        {canToggleComments ? (
          <button
            type="button"
            className="comment-pill"
            onClick={() => setShowComments((prev) => !prev)}
            aria-label={showComments ? "코멘트 숨기기" : "코멘트 보이기"}
          >
            {showComments ? "코멘트" : ""}
          </button>
        ) : null}
      </section>

      <section className="lp-track-preview">
        <h2>{displayTrack.title}</h2>
        <p>{displayTrack.artistName}</p>
      </section>

      <section className="lp-action-group">
        {!isNewRecommendationEntry && !embedUrl ? (
          <button
            type="button"
            className="load-player-btn"
            onClick={handleLoadPlayer}
            disabled={isPlayerLoading}
          >
            {isPlayerLoading ? "노래 플레이어 불러오는 중..." : "노래 플레이어 불러오기"}
          </button>
        ) : null}
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
              </div>
            </div>

            <div className={`input-group ${isGuestUser ? "guest-comment-input-group" : ""}`}>
              <label htmlFor="commentText">코멘트</label>
              <textarea
                id="commentText"
                placeholder="이 노래를 들을 때 떠오르는 장면을 적어주세요"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
            </div>

            {isKakaoUser ? (
            <div className="anonymous-row">
              <div>
                <strong>익명 여부</strong>
                <p>익명을 선택하면 랜덤 닉네임으로,<br />
                  선택하지 않으면 카카오톡 이름으로 추천됩니다.
                </p>
              </div>
              <button
                type="button"
                className={`anonymous-toggle ${isAnonymous ? "on" : "off"}`}
                onClick={() => setIsAnonymous((prev) => !prev)}
              >
                {isAnonymous ? "ON" : "OFF"}
              </button>
            </div>
            ) : null}

            <button type="button" className="recommend-btn" onClick={handleRecommend} disabled={isSubmitting}>
              {isSubmitting ? "추천 등록 중..." : "추천하기"}
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
