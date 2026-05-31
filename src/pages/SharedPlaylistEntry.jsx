import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function SharedPlaylistEntry() {
  const navigate = useNavigate();
  const { playlistId } = useParams();

  useEffect(() => {
    const normalizedPlaylistId = (playlistId || "").trim();

    if (!normalizedPlaylistId) {
      navigate("/", { replace: true });
      return;
    }

    const target = `/search?playlistId=${encodeURIComponent(normalizedPlaylistId)}`;
    const accessToken = localStorage.getItem("accessToken");
    const guestToken = localStorage.getItem("guestToken");

    if (accessToken || guestToken) {
      navigate(target, { replace: true });
      return;
    }

    localStorage.setItem("postLoginRedirect", target);
    navigate(`/login?playlistId=${encodeURIComponent(normalizedPlaylistId)}`, { replace: true });
  }, [navigate, playlistId]);

  return null;
}
