import { useState } from "react";
import VinylCarousel from "../components/VinylCarousel";
import { dummyTracks } from "../data/dummyTracks";
import "./MainPage.css";

export default function MainPage() {
  const [selectedTrack, setSelectedTrack] = useState(dummyTracks[0]);

  return (
    <main className="main-page">
      <header className="main-header">
        <h1>FIND YOUR NUMBER 18</h1>
        <button className="menu-button">≡</button>
      </header>

      <section className="character-section">
        <VinylCarousel tracks={dummyTracks} onSelect={setSelectedTrack} />

        <div className="angel"> // 임의 생성 추후 수정 필요
          <div className="angel-head">
            <span>▪</span>
            <span>▪</span>
          </div>
          <div className="angel-body">∨</div>
          <div className="wing left-wing" />
          <div className="wing right-wing" />
          <div className="angel-leg left-leg" />
          <div className="angel-leg right-leg" />
        </div>
      </section>

      <section className="playlist-info">
        <h2>사용자의 플레이리스트</h2> // 사용자 이름은 백엔드에서 전달 수정 필요
        <p>{dummyTracks.length}곡 · 18명이 추천함</p> // 추천한 사람 수는 백엔드에서 계산해서 전달할 것
      </section>

      <section className="track-list">
        {dummyTracks.slice(0, 2).map((track) => (
          <div className="track-item" key={track.id}>
            <img src={track.albumImage} alt={track.title} />
            <div>
              <strong>{track.title}</strong>
              <p>{track.artist}</p>
            </div>
            <span>0:30</span> // 백엔드에서 가져와야 함 수정 필요
          </div>
        ))}

        <div className="more-track">
          <div className="empty-cover" />
          <strong>+ {dummyTracks.length - 2}곡 더</strong>
        </div>
      </section>

      <button className="recommend-button">+ 노래 추천하기</button>
    </main>
  );
}