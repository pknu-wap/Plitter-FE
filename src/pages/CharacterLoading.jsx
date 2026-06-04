import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import plitterLogo from "../assets/Plitter.png";
import { API_BASE_URL, parseJson } from "../lib/api";
import { buildPlaylistPath } from "../lib/playlistShare";
import "./CharacterLoading.css";

export default function CharacterLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const playlistId = searchParams.get("playlistId");
  const publicShareId = searchParams.get("publicShareId");
  const recreate = searchParams.get("recreate");
  const eyebrowText = recreate ? "캐릭터 다시 생성 중" : "캐릭터 생성 중";
  const [loadingTitle, setLoadingTitle] = useState("플레이리스트의 분위기를 정리하고 있어요");
  const [loadingDescription, setLoadingDescription] = useState("잠시 후 캐릭터 결과 페이지로 이동합니다.");

  useEffect(() => {
    if (!playlistId) {
      alert("플레이리스트 정보를 찾을 수 없습니다.");
      navigate("/main", { replace: true });
      return;
    }

    const authToken =
      localStorage.getItem("accessToken") || localStorage.getItem("guestToken") || "";
    const playlistPath = publicShareId ? buildPlaylistPath(publicShareId) : "/main";
    const redirectPath = recreate
      ? `/character-loading?playlistId=${encodeURIComponent(playlistId)}${
          publicShareId ? `&publicShareId=${encodeURIComponent(publicShareId)}` : ""
        }&recreate=true`
      : `/character-loading?playlistId=${encodeURIComponent(playlistId)}${
          publicShareId ? `&publicShareId=${encodeURIComponent(publicShareId)}` : ""
        }`;

    let cancelled = false;

    const requestCharacter = async () => {
      if (!authToken) {
        localStorage.setItem("postLoginRedirect", redirectPath);
        alert("로그인이 필요합니다.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoadingTitle(
          recreate
            ? "새로운 캐릭터 버전을 만들고 있어요"
            : "플레이리스트의 분위기를 정리하고 있어요"
        );
        setLoadingDescription("생성 가능 여부를 확인하고 있습니다.");

        const authHeaders = {
          Authorization: `Bearer ${authToken}`,
        };

        const availabilityResponse = await fetch(
          `${API_BASE_URL}/playlists/${playlistId}/character/availability`,
          {
            headers: authHeaders,
          }
        );
        const availabilityPayload = await parseJson(availabilityResponse);

        if (!availabilityResponse.ok || availabilityPayload?.code !== "SUCCESS") {
          if (availabilityPayload?.code === "UNAUTHORIZED") {
            localStorage.setItem("postLoginRedirect", redirectPath);
            alert("로그인이 필요합니다.");
            navigate("/login", { replace: true });
            return;
          }

          throw new Error(
            availabilityPayload?.message || "캐릭터 생성 가능 여부를 확인하지 못했습니다."
          );
        }

        if (!availabilityPayload?.content?.available) {
          const requiredCount = availabilityPayload?.content?.requiredCount ?? 10;
          const currentCount = availabilityPayload?.content?.currentCount ?? 0;
          alert(
            `추천 ${requiredCount}곡 이상이 필요합니다. 현재 ${currentCount}/${requiredCount}`
          );
          navigate(playlistPath, { replace: true });
          return;
        }

        if (cancelled) return;

        setLoadingDescription("실제 캐릭터 이미지를 생성하고 있습니다.");

        const createResponse = await fetch(
          `${API_BASE_URL}/playlists/${playlistId}/character`,
          {
            method: "POST",
            headers: authHeaders,
          }
        );
        const createPayload = await parseJson(createResponse);

        if (!createResponse.ok || createPayload?.code !== "SUCCESS") {
          if (createPayload?.code === "UNAUTHORIZED") {
            localStorage.setItem("postLoginRedirect", redirectPath);
            alert("로그인이 필요합니다.");
            navigate("/login", { replace: true });
            return;
          }

          if (createPayload?.code === "CHARACTER_NOT_AVAILABLE") {
            const requiredCount = availabilityPayload?.content?.requiredCount ?? 10;
            const currentCount = availabilityPayload?.content?.currentCount ?? 0;
            alert(
              `추천 ${requiredCount}곡 이상이 필요합니다. 현재 ${currentCount}/${requiredCount}`
            );
            navigate(playlistPath, { replace: true });
            return;
          }

          throw new Error(createPayload?.message || "캐릭터 생성에 실패했습니다.");
        }

        if (cancelled) return;

        navigate(
          `/character-result?playlistId=${encodeURIComponent(playlistId)}${
            publicShareId ? `&publicShareId=${encodeURIComponent(publicShareId)}` : ""
          }`,
          {
          replace: true,
          }
        );
      } catch (error) {
        if (cancelled) return;
        alert(error.message || "캐릭터 생성 중 오류가 발생했습니다.");
        navigate(playlistPath, { replace: true });
      }
    };

    void requestCharacter();

    return () => {
      cancelled = true;
    };
  }, [playlistId, publicShareId, recreate, navigate]);

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
          <h1>{loadingTitle}</h1>
          <p>{loadingDescription}</p>
        </div>

        <div className="character-loading-indicator" aria-hidden="true">
          <span className="character-loading-track" />
          <span className="character-loading-thumb" />
        </div>
      </section>
    </main>
  );
}
