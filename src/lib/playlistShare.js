export function getPlaylistIdFromResponseContent(content) {
  if (content?.playlistId === null || content?.playlistId === undefined) {
    return "";
  }

  return String(content.playlistId).trim();
}

export function getPublicShareIdFromResponseContent(content) {
  if (typeof content?.publicShareId === "string" && content.publicShareId) {
    return content.publicShareId.trim();
  }

  if (typeof content?.shareUrl === "string" && content.shareUrl) {
    try {
      const shareUrl = new URL(content.shareUrl, window.location.origin);
      const matchedPath = shareUrl.pathname.match(/^\/playlist\/([^/]+)$/);
      return matchedPath ? decodeURIComponent(matchedPath[1]).trim() : "";
    } catch {
      return "";
    }
  }

  if (typeof content?.playlistId === "string" && content.playlistId) {
    return content.playlistId.trim();
  }

  return "";
}

export function buildPlaylistPath(publicShareId) {
  if (!publicShareId) return "/profile-share";
  return `/playlist/${encodeURIComponent(publicShareId)}`;
}

export function buildPlaylistShareLink(publicShareId) {
  if (!publicShareId) return "";
  return `${window.location.origin}${buildPlaylistPath(publicShareId)}`;
}

export function buildSearchPath(publicShareId) {
  if (!publicShareId) return "/search";
  return `/search?publicShareId=${encodeURIComponent(publicShareId)}`;
}
