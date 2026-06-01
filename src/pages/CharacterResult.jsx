import { useNavigate, useSearchParams } from "react-router-dom";
import { characterResults } from "../data/CharacterResults";
import "./CharacterResult.css";

export default function CharacterResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type") || "rnb";
  const result = characterResults[type] || characterResults.rnb;

  return (
    <main
      className="character-result-page"
      style={{ background: result.background }}
    >
      <header className="result-header">
        <h1>PLITTER</h1>
      </header>

      <section className="result-content">
        <p className="result-title">{result.name}님의 캐릭터는</p>

        <div className="character-image-wrap">
          <img
            src={result.image}
            alt={result.characterName}
            className="character-image"
          />
        </div>

        <button className="character-name-button">
          {result.characterName}
        </button>

        <div className="tag-list">
          {result.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <button
        className="go-playlist-button"
        onClick={() => navigate("/main")}
      >
        내 플리로 돌아가기
      </button>
    </main>
  );
}