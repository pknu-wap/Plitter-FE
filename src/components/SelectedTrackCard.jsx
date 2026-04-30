export default function SelectedTrackCard({ track }) {
  if (!track) return null;

  return (
    <div style={{ marginTop: "40px" }}>
      <img
        src={track.albumImage}
        alt={track.title}
        style={{ width: "200px", borderRadius: "10px" }}
      />
      <h2>{track.title}</h2>
      <p>{track.artist}</p>
      <p>💬 {track.comment}</p>
      <p>👤 {track.recommender}</p>
    </div>
  );
}