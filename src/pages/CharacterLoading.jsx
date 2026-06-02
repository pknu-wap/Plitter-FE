import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import "./CharacterLoading.css";

export default function CharacterLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const playlistId = searchParams.get("playlistId");
  const recreate = searchParams.get("recreate");
  const eyebrowText = recreate ? "캐릭터 다시 생성 중" : "캐릭터 생성 중";

  useEffect(() => {
    if (!playlistId) {
      alert("플레이리스트 정보를 찾을 수 없습니다.");
      navigate("/main", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      if (recreate) {
        navigate(`/character-result?playlistId=${playlistId}&recreate=true`, {
          replace: true,
        });
        return;
      }

      navigate(`/character-result?playlistId=${playlistId}`, {
        replace: true,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [playlistId, recreate, navigate]);

  return (
    <main className="character-create-page">
      <header className="character-header">
        <img src={plitterLogo} alt="PLITTER" className="character-logo" />
      </header>

      <div className="gradient-blob blob-orange" />
      <div className="gradient-blob blob-yellow" />
      <div className="gradient-blob blob-blue" />
      <div className="gradient-blob blob-pink" />
      <div className="gradient-blob blob-green" />
      <div className="gradient-blob blob-purple" />

      <section className="character-content">
        <div className="character-loading-copy">
          <p className="character-loading-eyebrow">{eyebrowText}</p>
          <h1>플레이리스트의 분위기를 정리하고 있어요</h1>
          <p>잠시 후 캐릭터 결과 페이지로 이동합니다.</p>
        </div>

        <div className="character-loading-indicator" aria-hidden="true">
          <span className="character-loading-track" />
          <span className="character-loading-thumb" />
        </div>
      </section>
    </main>
  );
}
