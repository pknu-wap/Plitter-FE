import { useLocation } from "react-router-dom";
import { useState } from "react";
import vinylImage from "../assets/lp-vinyl.png";
import "./LpPage.css";

export default function LpPage() {
    const location = useLocation();
    const track = location.state?.track;

    // 하단 코멘트 팝업창
    const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(true);

    // 닉네임, 코멘트 텍스트 상태
    const [nickname, setNickname] = useState("");
    const [commentText, setCommentText] = useState("");

    // 추천하기 버튼
    const [isRecommended, setIsRecommended] = useState(false);

    // 포스트잇(코멘트) on/off
    const [showComments, setShowComments] = useState(true);

    // *** 코멘트 API ***
    const handleRecommend = async () => {

        // 연동에 쓸 데이터
        const requestData = {
            spotifyId: track.spotifyId,
            title: track.title,
            artistName: track.artistName,
            albumCoverImageUrl: track.albumCoverImageUrl,
            previewUrl: track.previewUrl || "", // 미리듣기 없는 경우 대비
            comment: commentText,
            guestToken: "test-guest-token-1234", // 임시 토큰 값
            isAnonymous: false
        };

        console.log("백엔드에 보낼 데이터(예정):", requestData);

        /* 임시 주석 처리 (백엔드 연동 전)
        try {
            const response = await fetch("/api/playlists/1/recommendations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (result.code === "SUCCESS") {
                console.log("백엔드 저장", result.content);

                // 1. 코멘트 입력창 내리기
                setIsCommentPopupOpen(false);

                // 2. 최종 추천 성공 (이후 포스트잇 띄우기)
                setIsRecommended(true);
            } else {
                alert("추천 실패: " + result.message);
            }
        } catch (error) {
            console.error("API 통신 에러:", error);
        }
        */

        setIsCommentPopupOpen(false); // 팝업 닫기
        setIsRecommended(true);       // 추천 완료 스위치 ON (포스트잇 띄울 준비)

    };
    return (
        <main className="lp-page">
            <h1>FIND YOUR NUMBER 18</h1>

            {/* 코멘트 on/off */}
            <button
                className="comment-toggle-btn"
                onClick={() => setShowComments(showComments ? false : true)}
            >
                {showComments ? "코멘트 OFF" : "코멘트 ON"}
            </button>

            {/* 추천 후 코멘트on일 때 포스트잇 띄우기 */}
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

                    {/* 재생 버튼 */}
                    <div className="play-control-row">
                        <button className="play-btn">▶</button>
                    </div>

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

                    {/* 닉네임 입력 */}
                    <div className="input-group">
                        <label>닉네임</label>
                        <input
                            type="text"
                            placeholder="@yyyh"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

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
