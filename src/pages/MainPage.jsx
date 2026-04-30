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

        <div className="angel">
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
        <h2>내 번호 18번의 플레이리스트</h2>
        <p>{dummyTracks.length}곡 · 18명이 추천함</p>
      </section>

      <section className="track-list">
        {dummyTracks.slice(0, 2).map((track) => (
          <div className="track-item" key={track.id}>
            <img src={track.albumImage} alt={track.title} />
            <div>
              <strong>{track.title}</strong>
              <p>{track.artist}</p>
            </div>
            <span>0:30</span>
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