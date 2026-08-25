import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '境曜有限公司｜BES Events 活動整合服務',
    short_name: '境曜 BES',
    description: '活動企劃統包、啟動儀式、AI 互動道具、活動特效、外派調酒與活動人員派遣。',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4A4947',
    lang: 'zh-Hant-TW',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
