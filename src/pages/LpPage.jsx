import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import vinylImage from "../assets/lp-vinyl.png";
import "./LpPage.css";

const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://13.124.174.30:8080";

export default function LpPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const track = location.state?.track;
    const accessToken = localStorage.getItem("accessToken") || "";
    const guestToken = localStorage.getItem("guestToken") || "";
    const guestNickname = localStorage.getItem("guestNickname") || "";
    const isKakaoUser = Boolean(accessToken);
    const isGuestUser = !isKakaoUser && Boolean(guestToken);

    // SongSearch(새 추천)와 MainPage(플리에서 선택) 중 넘어온 경로 판단
    const isNewRecommendation = location.state?.isNewRecommendation ?? true;

    // true : 새 추천 / false : 플리 조회(코멘트 입력창x)
    const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(false);

    // '돌아가기'로 넘어오면 팝업 닫기 
    useEffect(() => {
        if (location.state?.hidePopup) {
            setIsCommentPopupOpen(false);

            // 만약 돌아올 때 isRecommended가 true였다면 스위치를 다시 켜줍니다.
            if (location.state?.isRecommended) {
                setIsRecommended(true);
            }
        }
    }, [location.state]);

    // 돌아왔을 때 코멘트 정보 가져오기
    const [commentText, setCommentText] = useState(location.state?.commentText || "");

    // 닉네임, 코멘트 텍스트 상태
    const [nickname, setNickname] = useState(guestNickname);
    // Kakao users can choose whether this recommendation is anonymous.
    const [isAnonymous, setIsAnonymous] = useState(false);

    // 추천하기 버튼
    const [isRecommended, setIsRecommended] = useState(location.state?.isRecommended || false);

    // Spotify embed 플레이어 상태 관리
    const [isPlayerVisible, setIsPlayerVisible] = useState(false); // embed 플레이어 표시 여부
    const [embedUrl, setEmbedUrl] = useState(null); // Spotify embed URL
    const [isPlaying, setIsPlaying] = useState(false); // 재생/일시정지 상태

    const handlePlayClick = async () => {
        if (!track?.spotifyId) {
            alert("곡 정보가 없습니다.");
            return;
        }

        const authToken =
            localStorage.getItem("accessToken") || localStorage.getItem("guestToken");

        if (!authToken) {
            alert("로그인 또는 게스트 선택 후 미리듣기를 사용할 수 있습니다.");
            return;
        }

        try {
            // 백엔드 embedUrl
            const response = await fetch(`${API_BASE_URL}/api/tracks/${track.spotifyId}/play`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            if (response.ok && data.response?.embedUrl) {
                setEmbedUrl(data.response.embedUrl);
                setIsPlayerVisible(true); // 플레이어 표시
                setIsPlaying(true); // 재생 상태로 변경
            } else {
                alert("플레이어를 불러올 수 없습니다.");
            }
        } catch (err) {
            console.error("API 호출 에러:", err);
            alert("네트워크 오류가 발생했습니다.");
        }
    };

    // 일시정지 버튼 클릭
    const handlePauseClick = () => {
        setIsPlaying(false); // 일시정지 상태로 변경
    };

    // 추천 완료 후 화면 전환 (게스트 or 카카오)
    const handleRecommendationComplete = () => {
        // 나중에 게스트/카카오 구분해서 화면 이동
        // 임시: alert 표시
        alert("추천 완료");
        // navigate("/"); // 나중에 완료 화면으로 이동
    };


    // 포스트잇(코멘트) on/off
    const [showComments, setShowComments] = useState(true);

    // 코멘트 개수 저장 (임시:5개)
    const [commentCount, setCommentCount] = useState(5);


    // *** 추천 등록 API 호출 ***
    const handleRecommend = async () => {
        const currentAccessToken = localStorage.getItem("accessToken") || "";
        const currentGuestToken = localStorage.getItem("guestToken") || "";
        const currentGuestNickname = localStorage.getItem("guestNickname") || "";
        const isCurrentKakaoUser = Boolean(currentAccessToken);
        const isCurrentGuestUser = !isCurrentKakaoUser && Boolean(currentGuestToken);

        if (!track) {
            alert("추천할 노래 정보가 없습니다.");
            return;
        }

        if (!commentText.trim()) {
            alert("코멘트를 입력해주세요.");
            return;
        }

        if (!isCurrentKakaoUser && !isCurrentGuestUser) {
            alert("카카오 로그인 또는 게스트 입장 후 추천할 수 있습니다.");
            return;
        }

        // playlistId 전달 브랜치가 머지 전까지 "1"로 테스트
        const playlistId =
            location.state?.playlistId || new URLSearchParams(location.search).get("playlistId") || "1";

        // 카카오 유저는 accessToken으로 인증, 게스트는 guestToken 보냄
        const requestData = {
            spotifyId: track.spotifyId,
            title: track.title,
            artistName: track.artistName,
            albumCoverImageUrl: track.albumCoverImageUrl,
            previewUrl: track.previewUrl || null,
            comment: commentText,
            isAnonymous: isCurrentKakaoUser ? isAnonymous : true,
            ...(isCurrentGuestUser ? { guestToken: currentGuestToken, randomNickname: "" } : {}),
        };

        const headers = {
            "Content-Type": "application/json",
            ...(isCurrentKakaoUser ? { Authorization: `Bearer ${currentAccessToken}` } : {}),
        };

        try {
            console.log("recommendation request:", {
                userType: isCurrentKakaoUser ? "kakao" : "guest",
                playlistId,
                requestData,
            });

            const response = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/recommendations`, {
                method: "POST",
                headers,
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (!response.ok || result.code !== "SUCCESS") {
                alert(result.message || "추천 등록에 실패했습니다.");
                return;
            }

            setIsCommentPopupOpen(false); // 코멘트 입력창 닫기
            setIsRecommended(true); // 추천 완료 -> 포스트잇 표시
            setCommentCount((prevCount) => prevCount + 1);
        } catch (error) {
            console.error("추천 등록 API 에러:", error);
            alert("추천 등록 중 네트워크 오류가 발생했습니다.");
        }
    };
    // 노래 정보(track) 가지고 /comments로 이동
    const handleGoToComments = () => {
        navigate("/comments", {
            state: {
                track: track,
                isRecommended: isRecommended,
                commentText: commentText
            }
        });
    };

    return (
        <main className="lp-page">
            <h1>FIND YOUR NUMBER 18</h1>

            {/* 경우2 : 플리에서 넘어왔을 때 코멘트 on/off */}
            {(!isNewRecommendation || isRecommended) && (
                <button
                    className="comment-toggle-btn"
                    onClick={() => setShowComments(!showComments)}
                >
                    {showComments ? "코멘트 OFF" : "코멘트 ON"}
                </button>
            )}

            {/* Spotify embed 플레이어 */}
            {isPlayerVisible && embedUrl && (
                <div style={{ width: "100%", marginTop: "20px" }}>
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        title="Spotify Player"
                    />
                </div>
            )}

            {/* 추천 후 코멘트on : 포스트잇 */}
            {isRecommended ? (
                showComments ? (
                    <div className="post-it-container">
                        <div className="post-it">
                            <p>{commentText}</p>
                        </div>
                    </div>
                ) : null
            ) : null}

            {/* 앨범 커버, 곡명, 가수명 렌더링 */}
            {track ? (
                <section className="lp-track-preview">
                    <div className="lp-record-view">
                        <img className="lp-vinyl" src={vinylImage} alt="" aria-hidden="true" />
                        <img
                            className="lp-album-cover"
                            src={track.albumCoverImageUrl}
                            alt={track.title}
                        />
                    </div>
                    <h2>{track.title}</h2>
                    <p>{track.artistName}</p>
                </section>
            ) : null}

            {/* 노래 재생바 */}
            {!isCommentPopupOpen ? (
                <div className="player-bar-container">

                    {/* 재생 게이지 막대 */}
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill"></div>
                    </div>

                    {/* 현재 시간과 총 시간 */}
                    <div className="time-info">
                        <span>0:00</span>
                        <span>0:30</span>
                    </div>

                    {/* 재생/일시정지 버튼 토글 */}
                    <div className="play-control-row">
                        {!isPlaying ? (
                            <button
                                className="play-btn"
                                onClick={handlePlayClick}
                                disabled={isPlayerVisible} // 이미 로드됐으면 비활성화
                            >
                                ▶
                            </button>
                        ) : (
                            <button
                                className="play-btn"
                                onClick={handlePauseClick}
                            >
                                ⏸
                            </button>
                        )}
                    </div>

                    {isNewRecommendation && !isRecommended ? (
                        // 경우 1: 새로 추천하러 들어왔고, 아직 추천을 완료하지 않은 경우
                        <button
                            className="view-comments-btn"
                            onClick={() => setIsCommentPopupOpen(true)}
                        >
                            이 노래 친구에게 추천하기 →
                        </button>
                    ) : (
                        // 경우 2: 이미 추천을 완료했거나(isRecommended), 애초에 플리에서 들어온 경우
                        <button
                            className="view-comments-btn"
                            onClick={handleGoToComments}
                        >
                            이 곡의 코멘트 {commentCount}개 보기 →
                        </button>
                    )}

                </div>
            ) : null}

            {/* 바텀 시트 렌더링 */}
            {isCommentPopupOpen ? (
                <div className="comment-bottom-sheet">

                    {/* 앨범 커버, 곡명, 아티스트명 반투명창 */}
                    <div className="sheet-track-info">
                        <img
                            className="sheet-album-cover"
                            src={track?.albumCoverImageUrl}
                            alt={track?.title}
                        />
                        <div className="sheet-track-text">
                            <h3>{track?.title}</h3>
                            <p>{track?.artistName}</p>
                        </div>
                    </div>
                    
                    {/* 익명 체크 박스 */}
                    {isKakaoUser ? (
                        <label className="anonymous-check">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                            />
                            익명으로 추천하기
                        </label>
                    ) : null}

                    {isGuestUser ? (
                        <div className="input-group">
                            <label>닉네임</label>
                            <input
                                type="text"
                                placeholder="@yyyh"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                    ) : null}

                    {/* 코멘트 입력 */}
                    <div className="input-group">
                        <label>코멘트</label>
                        <textarea
                            placeholder="코멘트 입력"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                    </div>

                    {/* 추천하기 버튼 연결 */}
                    <div className="popup-actions">
                        <button className="recommend-btn" onClick={handleRecommend}>
                            추천하기
                        </button>
                    </div>

                </div>
            ) : null}

        </main>
    );
}
