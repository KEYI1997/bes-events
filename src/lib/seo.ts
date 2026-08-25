import type { Metadata } from 'next';
import { FACEBOOK_URL, LINE_URL } from '@/lib/siteLinks';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (configuredSiteUrl?.startsWith('http')
  ? configuredSiteUrl
  : 'https://besevent.com'
).replace(/\/$/, '');

export const SITE_NAME = '境曜有限公司';
export const SITE_ALTERNATE_NAME = 'BES Events';
export const SITE_DESCRIPTION =
  '境曜有限公司（BES Events）是台北活動整合公司，提供活動企劃統包、啟動儀式、AI 互動道具、活動特效、外派調酒與專業活動人員派遣。';
export const SITE_PHONE = '+886912727596';
export const SITE_EMAIL = 'Jingyaoactivities@gmail.com';
export const SITE_TAX_ID = '60373507';
export const SITE_ADDRESS = '臺北市中山區民權東路二段92巷6之1號';
export const DEFAULT_OG_IMAGE = '/images/hero/hero-1.png';

export const SERVICE_SEO_PAGES = [
  {
    slug: 'ai-interactive-props',
    name: 'AI 互動道具',
    summary: '以生成式 AI、影像與聲音互動，打造可參與、可分享的品牌活動體驗。',
    intents: '品牌互動、展覽體驗、企業活動',
    image: '/images/services/AI互動道具.png',
  },
  {
    slug: 'event-package',
    name: '活動企劃統包',
    summary: '整合策略企劃、視覺設計、舞台技術、流程控管與現場執行。',
    intents: '記者會、發表會、尾牙春酒、家庭日',
    image: '/images/services/活動策劃統包.png',
  },
  {
    slug: 'opening-ceremony',
    name: '啟動儀式',
    summary: '提供星辰運轉、全息投影、沙漏、燈球與客製啟動道具。',
    intents: '開幕典禮、揭牌、品牌發表會',
    image: '/images/services/啟動儀式.png',
  },
  {
    slug: 'special-effects',
    name: '活動特效',
    summary: '依場地與流程規劃低煙、泡泡、彩帶、冷焰火與 CO₂ 等現場效果。',
    intents: '舞台演出、典禮、企業活動',
    image: '/images/services/活動特效.png',
  },
  {
    slug: 'bartending',
    name: '外派調酒',
    summary: '行動吧台、專業調酒師、客製酒單與活動用酒的一站式服務。',
    intents: '婚禮、派對、品牌活動、企業晚宴',
    image: '/images/services/外派調酒.png',
  },
  {
    slug: 'showgirl',
    name: 'SHOW GIRL 活動人員',
    summary: '提供展場接待、品牌推廣、頒獎與活動現場協助人員。',
    intents: '展覽、記者會、品牌活動',
    image: '/images/services/show girl.png',
  },
] as const;

export function absoluteUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  keywords = [],
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'zh_TW',
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: absoluteUrl(image), alt: `${title}－${SITE_NAME}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteUrl(image)],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_NAME,
    alternateName: [SITE_ALTERNATE_NAME, 'Bright Events Services', '境曜活動整合'],
    url: SITE_URL,
    logo: absoluteUrl('/images/logo/logo-color.png'),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: SITE_DESCRIPTION,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    taxID: SITE_TAX_ID,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '民權東路二段92巷6之1號',
      addressLocality: '中山區',
      addressRegion: '臺北市',
      postalCode: '104',
      addressCountry: 'TW',
    },
    areaServed: ['臺北市', '新北市', '桃園市', '新竹市', '臺灣'],
    sameAs: [FACEBOOK_URL, 'https://www.youtube.com/@境曜', LINE_URL],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_PHONE,
      contactType: 'customer service',
      areaServed: 'TW',
      availableLanguage: ['zh-TW'],
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: [SITE_ALTERNATE_NAME, '境曜活動整合'],
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-Hant-TW',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function serviceJsonLd(slug: string, name: string, description: string, image: string) {
  const url = absoluteUrl(`/services/${slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    url,
    image: absoluteUrl(image),
    areaServed: { '@type': 'Country', name: 'Taiwan' },
    provider: { '@id': `${SITE_URL}/#organization` },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
