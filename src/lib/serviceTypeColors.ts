// 服務類型顏色對照表
// 用於後台行事曆和諮詢紀錄中，以顏色區分不同服務類型

export interface ServiceTypeColor {
  bg: string;       // 背景色（含透明度）
  text: string;     // 文字顏色
  dot: string;      // 圓點/標記色（行事曆用）
}

export const SERVICE_TYPE_COLORS: Record<string, ServiceTypeColor> = {
  '啟動儀式': {
    bg: '#E8443820',
    text: '#E84438',
    dot: '#E84438',
  },
  '燈光音響舞台': {
    bg: '#2563EB20',
    text: '#2563EB',
    dot: '#2563EB',
  },
  '專案企劃': {
    bg: '#7C3AED20',
    text: '#7C3AED',
    dot: '#7C3AED',
  },
  '外派調酒': {
    bg: '#D9770620',
    text: '#D97706',
    dot: '#D97706',
  },
  'Show Girl': {
    bg: '#EC489920',
    text: '#EC4899',
    dot: '#EC4899',
  },
  '其他': {
    bg: '#6B728020',
    text: '#6B7280',
    dot: '#6B7280',
  },
};

// 取得服務類型顏色，若找不到則使用預設顏色
export function getServiceTypeColor(serviceType: string | undefined | null): ServiceTypeColor {
  if (!serviceType) return SERVICE_TYPE_COLORS['其他'];
  return SERVICE_TYPE_COLORS[serviceType] || SERVICE_TYPE_COLORS['其他'];
}

// 根據產品的 category 取得顏色（行事曆用）
export function getCategoryColor(category: string | undefined | null): ServiceTypeColor {
  if (!category) return SERVICE_TYPE_COLORS['其他'];
  return SERVICE_TYPE_COLORS[category] || SERVICE_TYPE_COLORS['其他'];
}
