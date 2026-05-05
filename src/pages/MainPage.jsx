import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VinylCarousel from "../components/VinylCarousel";
import { dummyTracks } from "../data/dummyTracks";
import "./MainPage.css";

export default function MainPage() {
  const [selectedTrack, setSelectedTrack] = useState(dummyTracks[0]);
  const navigate = useNavigate();

  return (
    <main className="main-page">
      <header className="main-header">
        <h1>FIND YOUR NUMBER 18</h1>
        <button className="login-button" onClick={() => navigate("/login")}>
          login
        </button>
      </header>

      <section className="record-section">
        <VinylCarousel tracks={dummyTracks} onSelect={setSelectedTrack} />
      </section>

      <button className="recommend-button">+ 노래 추천하기</button>
    </main>
  );
}