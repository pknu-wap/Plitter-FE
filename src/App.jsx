import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, parseJson } from "./lib/api";
import { buildPlaylistPath, getPublicShareIdFromResponseContent } from "./lib/playlistShare";
import AuthCallback from "./pages/AuthCallback";

import CommentList from "./pages/CommentList";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import LpPage from "./pages/LpPage";
import ProfileShare from "./pages/ProfileShare";
import RealMain from "./pages/RealMain";
import SharedPlaylistEntry from "./pages/SharedPlaylistEntry";
import SongSearch from "./pages/SongSearch";
import CharacterLoading from "./pages/CharacterLoading";
import CharacterResult from "./pages/CharacterResult";
import LogotoRealMain from "./pages/LogotoRealMain";

function toPlaylistPathFromResponseContent(content) {
  const publicShareId = getPublicShareIdFromResponseContent(content);
  if (publicShareId) return buildPlaylistPath(publicShareId);

  return null;
}

async function resolveMyPlaylistPath(accessToken) {
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
  };

  const checkResponse = await fetch(`${API_BASE_URL}/playlists/check`, {
    headers: authHeaders,
  });
  const checkPayload = await parseJson(checkResponse);

  if (
    checkResponse.ok &&
    checkPayload?.code === "SUCCESS" &&
    checkPayload?.content?.hasPlaylist
  ) {
    return toPlaylistPathFromResponseContent(checkPayload.content) || "/profile-share";
  }

  const createResponse = await fetch(`${API_BASE_URL}/playlists`, {
    method: "POST",
    headers: authHeaders,
  });
  const createPayload = await parseJson(createResponse);

  if (
    createResponse.ok &&
    createPayload?.code === "SUCCESS"
  ) {
    return toPlaylistPathFromResponseContent(createPayload.content) || "/profile-share";
  }

  if (createPayload?.code === "PLAYLIST_ALREADY_EXISTS") {
    const retryCheckResponse = await fetch(`${API_BASE_URL}/playlists/check`, {
      headers: authHeaders,
    });
    const retryCheckPayload = await parseJson(retryCheckResponse);

    if (
      retryCheckResponse.ok &&
      retryCheckPayload?.code === "SUCCESS" &&
      retryCheckPayload?.content?.hasPlaylist
    ) {
      return toPlaylistPathFromResponseContent(retryCheckPayload.content) || "/profile-share";
    }
  }

  return "/profile-share";
}

function AuthTokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) return;

    localStorage.setItem("accessToken", accessToken);
    localStorage.removeItem("guestToken");
    localStorage.removeItem("guestNickname");

    const postLoginRedirect = localStorage.getItem("postLoginRedirect");
    localStorage.removeItem("postLoginRedirect");

    const redirectAfterLogin = async () => {
      if (postLoginRedirect) {
        navigate(postLoginRedirect, { replace: true });
        return;
      }

      try {
        const myPlaylistPath = await resolveMyPlaylistPath(accessToken);
        if (!cancelled) {
          navigate(myPlaylistPath, { replace: true });
        }
      } catch (error) {
        console.error("내 플레이리스트 경로 확인 실패:", error);
        if (!cancelled) {
          navigate("/profile-share", { replace: true });
        }
      }
    };

    redirectAfterLogin();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate]);

  return null;
}

function MainEntryPage() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken") || "";

  useEffect(() => {
    let cancelled = false;

    if (!accessToken) return;

    const redirectToMyPlaylist = async () => {
      try {
        const myPlaylistPath = await resolveMyPlaylistPath(accessToken);
        if (!cancelled) {
          navigate(myPlaylistPath, { replace: true });
        }
      } catch (error) {
        console.error("메인 진입 경로 확인 실패:", error);
        if (!cancelled) {
          navigate("/profile-share", { replace: true });
        }
      }
    };

    redirectToMyPlaylist();

    return () => {
      cancelled = true;
    };
  }, [accessToken, navigate]);

  return <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthTokenHandler />

      <Routes>
        <Route path="/" element={<RealMain/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/guest" element={<div>after guest login</div>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/main" element={<MainEntryPage />} />
        <Route path="/search" element={<SongSearch />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/realmain" element={<RealMain />} />
        <Route path="/profile-share" element={<ProfileShare />} />
        <Route path="/playlist/:publicShareId" element={<SharedPlaylistEntry />} />
        <Route path="/lp" element={<LpPage />} />
        <Route path="/comments" element={<CommentList />} />
        <Route path="/loading" element={<CharacterLoading />} />
        <Route path="/character-loading" element={<CharacterLoading />} />
        <Route path="/result" element={<CharacterResult />} />
        <Route path="/character-result" element={<CharacterResult />} />
        <Route path="/logotorealmain" element={<LogotoRealMain />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
