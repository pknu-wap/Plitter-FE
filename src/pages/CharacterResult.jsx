import { useNavigate, useSearchParams } from "react-router-dom";
import { characterResults } from "../data/CharacterResults";
import "./CharacterResult.css";
import plitterLogo from "../assets/Plitter.png";

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
        <img src={plitterLogo} alt="PLITTER" className="character-logo" />
      </header>

      <section className="result-content">
        <p className="result-eyebrow">캐릭터 결과</p>
        <h1 className="result-title">{result.name}님의 캐릭터는</h1>

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
