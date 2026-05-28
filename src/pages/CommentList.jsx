import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CommentList.css";

export default function CommentList() {
    const location = useLocation();
    const navigate = useNavigate();

    // LpPage에서 노래 정보(track) 가져오기
    const track = location.state?.track;

    // 뒤로가기 누르면 LP페이지로
    const handleGoBack = () => {
        navigate("/lp", { state: { track: track, hidePopup: true } });
    };

    return (
        <main className="comments-page">

            <h1>FIND YOUR NUMBER 18</h1>

            <button className="back-btn" onClick={handleGoBack}>
                ← 돌아가기
            </button>

            {/* 상단 앨범 커버 및 곡 정보 */}

            <section className="track-info-card">
                <img
                    src={track?.albumCoverImageUrl}
                    alt="cover"
                    className="card-cover"
                />
                <div className="card-details">
                    <h2 className="card-title">{track?.title}</h2>
                    <p className="card-artist">{track?.artistName}</p>
                </div>
            </section>
            {/* ========================================== */}

        </main>
    );
}