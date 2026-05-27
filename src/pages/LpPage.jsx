import { useLocation } from "react-router-dom";
import { useState } from "react";
import vinylImage from "../assets/lp-vinyl.png";
import "./LpPage.css";

export default function LpPage() {
    const location = useLocation();
    const track = location.state?.track;

    // 하단 코멘트 팝업창 힘열림/닫 
    const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(true);

    // 닉네임, 코멘트 텍스트 상태 관리
    const [nickname, setNickname] = useState("");
    const [commentText, setCommentText] = useState("");

    // *** 코멘트 API ***
    const handleRecommend = () => {
        // 1. 나중에 백엔드로 보낼 데이터 확인용
        console.log("입력된 데이터:", nickname, commentText);

        // 2. 추천하기 누르면 팝업창 닫음 (기존 LP 페이지 남음)
        setIsCommentPopupOpen(false);
    };
    return (
        <main className="lp-page">
            <h1>FIND YOUR NUMBER 18</h1>

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
