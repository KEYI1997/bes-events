'use client';

import { useEffect, useState } from 'react';
import { ListVideo, LoaderCircle, Play } from 'lucide-react';
import { getYouTubeEmbedUrl, type YouTubeSource } from '@/lib/youtube';

interface PlaylistItem {
  videoId: string;
  title: string;
  thumbnail: string;
  position: number;
}

interface PlaylistResponse {
  items?: PlaylistItem[];
  totalCount?: number;
  error?: string;
}

export default function YouTubeVideoSection({ source, className = '' }: { source: YouTubeSource; className?: string }) {
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState(source.videoId || '');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(source.playlistId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!source.playlistId) return;

    const controller = new AbortController();

    fetch(`/api/youtube/playlist?list=${encodeURIComponent(source.playlistId)}`, { signal: controller.signal })
      .then(async response => {
        const payload = await response.json() as PlaylistResponse;
        if (!response.ok) throw new Error(payload.error || '影片清單暫時無法載入。');
        return payload;
      })
      .then(payload => {
        const items = payload.items || [];
        setPlaylistItems(items);
        setTotalCount(payload.totalCount || items.length);
        setSelectedVideoId(current => current && items.some(item => item.videoId === current) ? current : (items[0]?.videoId || current));
      })
      .catch(fetchError => {
        if (fetchError.name !== 'AbortError') setError('播放清單暫時無法載入，仍可直接觀看影片。');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [source.playlistId, source.videoId]);

  const embedUrl = getYouTubeEmbedUrl({
    videoId: selectedVideoId || source.videoId,
    playlistId: source.playlistId,
  });

  if (!embedUrl) return null;

  if (!source.playlistId) {
    return <section className={className}>
      <h2 className="text-lg font-bold text-[#4a4947]">影片介紹</h2>
      <div className="mt-5 aspect-video overflow-hidden rounded-xl bg-[#201f1d] shadow-[0_14px_30px_rgba(70,57,43,0.12)]">
        <iframe title="產品影片介紹" src={embedUrl} className="h-full w-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      </div>
    </section>;
  }

  return <section className={className}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-[#4a4947]">影片介紹</h2>
        <p className="mt-1 text-sm text-[#756e66]">依播放清單順序瀏覽同系列影片</p>
      </div>
      <p aria-live="polite" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#805e45]"><ListVideo size={16} aria-hidden="true" />{loading ? '載入清單中…' : `共 ${totalCount || playlistItems.length} 支影片`}</p>
    </div>

    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-5">
      <div className="aspect-video overflow-hidden rounded-xl bg-[#201f1d] shadow-[0_14px_30px_rgba(70,57,43,0.12)]">
        <iframe key={embedUrl} title="產品播放清單影片" src={embedUrl} className="h-full w-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      </div>

      <aside className="min-w-0 rounded-xl border border-[#e6dfd6] bg-[#fffdf9] p-3" aria-label="播放清單影片">
        <div className="flex items-center justify-between gap-3 border-b border-[#eee7df] px-1 pb-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4a4947]"><ListVideo size={17} aria-hidden="true" />播放清單</span>
          <span className="text-xs font-medium tabular-nums text-[#8a8177]">{totalCount || playlistItems.length} 支</span>
        </div>

        {loading ? <div className="flex h-24 items-center justify-center gap-2 text-sm text-[#756e66]"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" />載入影片中…</div> : error ? <p role="status" className="px-1 py-4 text-sm leading-6 text-[#8a5b3f]">{error}</p> : <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:h-[25rem] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pr-1 lg:[scrollbar-gutter:stable] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#f4eee7] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c7ad99]">
          {playlistItems.map((item, index) => {
            const selected = item.videoId === (selectedVideoId || source.videoId);
            return <button key={`${item.videoId}-${item.position}`} type="button" onClick={() => setSelectedVideoId(item.videoId)} aria-pressed={selected} className={`group flex min-w-[15.5rem] shrink-0 items-center gap-3 rounded-lg border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa7452] lg:min-w-0 ${selected ? 'border-[#aa7452] bg-[#fcf5ef]' : 'border-transparent hover:border-[#d7c3b1] hover:bg-[#fcf8f4]'}`}>
              <span className="relative block aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-[#e9e1d7]">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : <span className="flex h-full items-center justify-center text-[#8a8177]"><Play size={18} fill="currentColor" aria-hidden="true" /></span>}
                <span className="absolute inset-0 flex items-center justify-center bg-black/15 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Play size={20} fill="currentColor" aria-hidden="true" /></span>
              </span>
              <span className="min-w-0"><span className="mb-1 block text-xs tabular-nums text-[#9a7160]">{index + 1}</span><span className="line-clamp-2 block text-sm font-medium leading-5 text-[#4a4947]">{item.title}</span></span>
            </button>;
          })}
        </div>}
      </aside>
    </div>
  </section>;
}

