import { useState } from "react";
import { dummyTracks } from "../data/dummyTracks";
import VinylCarousel from "../components/VinylCarousel.jsx";
import SelectedTrackCard from "../components/SelectedTrackCard";

export default function MainPage() {
  const [selectedTrack, setSelectedTrack] = useState(dummyTracks[0]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>메인페이지</h1>

      <VinylCarousel
        tracks={dummyTracks}
        onSelect={setSelectedTrack}
      />

      <SelectedTrackCard track={selectedTrack} />
    </div>
  );
}