import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { characterResults } from "../data/CharacterResults";
import { API_BASE_URL, parseJson } from "../lib/api";
import "./CharacterResult.css";
import plitterLogo from "../assets/Plitter.png";

const DEFAULT_BACKGROUND =
  "linear-gradient(160deg, #fffaf0 0%, #ffd8c6 45%, #ffb08e 100%)";

function getCharacterBackground(tags) {
  const joinedTags = Array.isArray(tags) ? tags.join(" ") : "";

  if (joinedTags.includes("강렬한")) {
    return "linear-gradient(160deg, #fff9f2 0%, #ffc8b1 44%, #ff8b64 100%)";
  }

  if (joinedTags.includes("밝은") || joinedTags.includes("쾌활한")) {
    return "linear-gradient(160deg, #fffdf4 0%, #fff0a8 42%, #ffd1a1 100%)";
  }

  if (joinedTags.includes("잔잔한") || joinedTags.includes("감성적인")) {
    return "linear-gradient(160deg, #fffaf5 0%, #d9d7ff 44%, #b7c8ff 100%)";
  }

  return DEFAULT_BACKGROUND;
}

export default function CharacterResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type") || "rnb";
  const playlistId = searchParams.get("playlistId");
  const fallbackResult = characterResults[type] || characterResults.rnb;
  const [characterResult, setCharacterResult] = useState(() =>
    playlistId
      ? null
      : {
          imageUrl: fallbackResult.image,
          characterName: fallbackResult.characterName,
          tags: fallbackResult.tags,
          ownerNickname: fallbackResult.name,
        }
  );
  const [isLoading, setIsLoading] = useState(Boolean(playlistId));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!playlistId) return;

    const authToken =
      localStorage.getItem("accessToken") || localStorage.getItem("guestToken") || "";
    const redirectPath = `/character-result?playlistId=${encodeURIComponent(playlistId)}`;

    let cancelled = false;

    const fetchCharacterResult = async () => {
      if (!authToken) {
        localStorage.setItem("postLoginRedirect", redirectPath);
        navigate("/login", { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const authHeaders = {
          Authorization: `Bearer ${authToken}`,
        };

        const [characterResponse, playlistResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/playlists/${playlistId}/character`, {
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/playlists/${playlistId}/public`),
        ]);

        const [characterPayload, playlistPayload] = await Promise.all([
          parseJson(characterResponse),
          parseJson(playlistResponse),
        ]);

        if (!characterResponse.ok || characterPayload?.code !== "SUCCESS") {
          if (characterPayload?.code === "UNAUTHORIZED") {
            localStorage.setItem("postLoginRedirect", redirectPath);
            navigate("/login", { replace: true });
            return;
          }

          throw new Error(characterPayload?.message || "캐릭터 결과를 불러오지 못했습니다.");
        }

        if (cancelled) return;

        setCharacterResult({
          imageUrl: characterPayload?.content?.imageUrl || fallbackResult.image,
          characterName:
            characterPayload?.content?.characterName || fallbackResult.characterName,
          tags: characterPayload?.content?.tags || fallbackResult.tags,
          ownerNickname:
            playlistPayload?.code === "SUCCESS"
              ? playlistPayload?.content?.ownerNickname || ""
              : "",
        });
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error.message || "캐릭터 결과를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchCharacterResult();

    return () => {
      cancelled = true;
    };
  }, [fallbackResult.characterName, fallbackResult.image, fallbackResult.tags, navigate, playlistId]);

  const backgroundStyle = characterResult?.tags?.length
    ? getCharacterBackground(characterResult.tags)
    : fallbackResult.background || DEFAULT_BACKGROUND;

  const resultTitle = characterResult?.ownerNickname
    ? `${characterResult.ownerNickname}님의 캐릭터는`
    : "당신의 캐릭터는";

  return (
    <main
      className="character-result-page"
      style={{ background: backgroundStyle }}
    >
      <header className="result-header">
        <img src={plitterLogo} alt="PLITTER" className="character-logo" />
      </header>

      <section className="result-content">
        <p className="result-eyebrow">캐릭터 결과</p>
        <h1 className="result-title">
          {isLoading ? "캐릭터 결과를 불러오고 있어요" : resultTitle}
        </h1>

        <div className="character-image-wrap">
          {characterResult?.imageUrl ? (
            <img
              src={characterResult.imageUrl}
              alt={characterResult.characterName}
              className="character-image"
            />
          ) : (
            <div className="character-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <button className="character-name-button">
          {isLoading ? "캐릭터 생성 중..." : characterResult?.characterName || "결과 없음"}
        </button>

        {errorMessage ? (
          <p className="result-error-message">{errorMessage}</p>
        ) : (
          <div className="tag-list">
            {(characterResult?.tags || []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
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
