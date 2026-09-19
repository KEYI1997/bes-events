import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600;

const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;
const MAX_PLAYLIST_ITEMS = 200;

interface YouTubePlaylistItem {
  contentDetails?: { videoId?: string };
  snippet?: {
    title?: string;
    position?: number;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
}

interface YouTubePlaylistResponse {
  items?: YouTubePlaylistItem[];
  nextPageToken?: string;
  pageInfo?: { totalResults?: number };
}

export async function GET(request: NextRequest) {
  const playlistId = request.nextUrl.searchParams.get('list')?.trim() || '';
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (!PLAYLIST_ID_PATTERN.test(playlistId)) {
    return NextResponse.json({ error: '無效的播放清單。' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: '影片清單暫時無法載入。' }, { status: 503 });
  }

  try {
    const playlistItems: Array<{ videoId: string; title: string; thumbnail: string; position: number }> = [];
    let nextPageToken: string | undefined;
    let totalCount = 0;

    do {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: '50',
        key: apiKey,
      });
      if (nextPageToken) params.set('pageToken', nextPageToken);

      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, {
        next: { revalidate },
      });

      if (!response.ok) {
        console.warn('YouTube playlist request failed', { status: response.status, playlistId });
        throw new Error('YouTube playlist request failed');
      }

      const payload = await response.json() as YouTubePlaylistResponse;
      totalCount = payload.pageInfo?.totalResults ?? totalCount;

      for (const item of payload.items || []) {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        if (!videoId) continue;

        const thumbnails = item.snippet?.thumbnails || {};
        const thumbnail = thumbnails.medium?.url || thumbnails.high?.url || thumbnails.default?.url || '';
        playlistItems.push({
          videoId,
          title: item.snippet?.title || 'YouTube 影片',
          thumbnail,
          position: item.snippet?.position ?? playlistItems.length,
        });
      }

      nextPageToken = payload.nextPageToken;
    } while (nextPageToken && playlistItems.length < MAX_PLAYLIST_ITEMS);

    return NextResponse.json({
      items: playlistItems,
      totalCount: Math.max(totalCount, playlistItems.length),
      hasMore: Boolean(nextPageToken),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: '影片清單暫時無法載入。' }, { status: 502 });
  }
}
