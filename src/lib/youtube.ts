export interface YouTubeSource {
  videoId?: string;
  playlistId?: string;
}

export function parseYouTubeSource(rawUrl: string): YouTubeSource | null {
  const value = rawUrl.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathParts = url.pathname.split('/').filter(Boolean);
    const playlistId = url.searchParams.get('list') || undefined;
    let videoId: string | undefined;

    if (host === 'youtu.be') {
      videoId = pathParts[0] || undefined;
    } else if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v') || undefined;
      if (['embed', 'shorts', 'live'].includes(pathParts[0] || '')) videoId = pathParts[1] || undefined;
    }

    return videoId || playlistId ? { videoId, playlistId } : null;
  } catch {
    // Keep legacy bare video IDs working for older product records.
    return /^[A-Za-z0-9_-]{11}$/.test(value) ? { videoId: value } : null;
  }
}

export function getYouTubeEmbedUrl(source: YouTubeSource): string {
  if (source.videoId) {
    const params = new URLSearchParams({ rel: '0' });
    if (source.playlistId) params.set('list', source.playlistId);
    return `https://www.youtube.com/embed/${encodeURIComponent(source.videoId)}?${params.toString()}`;
  }

  if (source.playlistId) {
    return `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(source.playlistId)}&rel=0`;
  }

  return '';
}
