import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CommentList.css";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://13.124.174.30:8080/api";

function normalizeTrack(track) {
  if (!track) return null;

  return {
    spotifyId: track.spotifyId,
    title: track.title || "제목 없음",
    artistName: track.artistName || track.artist || "아티스트 정보 없음",
    albumCoverImageUrl: track.albumCoverImageUrl || track.albumImage || "",
    albumName: track.albumName || track.album || "",
    previewUrl: track.previewUrl || "",
  };
}

function avatarColor(name) {
  const palette = ["#bca57c", "#8c5b34", "#f0b500", "#6e8a3d", "#6d7c94"];
  const seed = (name || "익명").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function CommentList() {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken") || "";

  const [track, setTrack] = useState(normalizeTrack(location.state?.track));
  const [comments, setComments] = useState(Array.isArray(location.state?.localComments) ? location.state.localComments : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const recommendationId = location.state?.recommendationId || null;
  const playlistId = location.state?.playlistId || "1";
  const hasInitialLocalComments = Array.isArray(location.state?.localComments) && location.state.localComments.length > 0;

  useEffect(() => {
    const fetchComments = async () => {
      if (!recommendationId) return;
      if (!accessToken) {
        if (!hasInitialLocalComments) {
          setError("코멘트 전체 조회는 로그인 사용자에게 제공됩니다.");
        }
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/playlists/recommendations/${recommendationId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = await parseJson(response);

        if (!response.ok || payload?.code !== "SUCCESS") {
          setError(payload?.message || "코멘트를 불러오지 못했습니다.");
          return;
        }

        const content = payload?.content;
        const fetchedComments = Array.isArray(content?.comments) ? content.comments : [];

        setComments(fetchedComments);

        if (content) {
          setTrack(
            normalizeTrack({
              spotifyId: content.spotifyId,
              title: content.title,
              artistName: content.artist,
              albumCoverImageUrl: content.albumCoverImageUrl,
              previewUrl: content.previewUrl,
            }),
          );
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [accessToken, hasInitialLocalComments, recommendationId]);

  const handleWriteComment = () => {
    navigate("/lp", {
      state: {
        track,
        recommendationId,
        playlistId,
        isRecommended: true,
        openRecommendSheet: true,
        localComments: comments,
        commentCount: comments.length,
      },
    });
  };

  return (
    <main className="comments-page">
      <header className="comments-header">
        <button type="button" className="brand-home-button" onClick={() => navigate("/")}>
          PLITTER
        </button>
      </header>

      <section className="track-info-card">
        <img src={track?.albumCoverImageUrl} alt={track?.title || "앨범 커버"} className="card-cover" />

        <div className="card-details">
          <h2 className="card-title">{track?.title}</h2>
          <p className="card-artist">{track?.artistName}</p>
          <p className="card-album">앨범 {track?.albumName || "-"}</p>
          <button type="button" className="write-comment-btn" onClick={handleWriteComment}>
            코멘트 작성하기 →
          </button>
        </div>
      </section>

      {isLoading ? <p className="comments-status">코멘트를 불러오는 중입니다...</p> : null}
      {error ? <p className="comments-error">{error}</p> : null}

      {!isLoading && !error && comments.length === 0 ? (
        <p className="comments-status">아직 등록된 코멘트가 없습니다.</p>
      ) : null}

      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment, index) => {
            const name = comment.recommenderName || "익명";
            const initial = name[0] || "익";

            return (
              <li key={`${name}-${index}`} className="comment-item">
                <div className="comment-author-row">
                  <span className="comment-avatar" style={{ backgroundColor: avatarColor(name) }}>
                    {initial.toUpperCase()}
                  </span>
                  <strong className="comment-author">{name}</strong>
                </div>
                <p className="comment-text">{comment.comment}</p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
