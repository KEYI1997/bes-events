export type ServiceKey =
  | 'ai-interactive-props'
  | 'event-package'
  | 'opening-ceremony'
  | 'special-effects'
  | 'stage-production'
  | 'bartending'
  | 'showgirl'
  | 'other';

export type ProductCategory =
  | 'AI互動道具'
  | '專案企劃'
  | '啟動儀式'
  | '活動特效'
  | '燈光音響舞台'
  | '外派調酒'
  | 'Show Girl';

export type ServiceDefinition = {
  key: ServiceKey;
  label: string;
  aliases: string[];
  productCategories: ProductCategory[];
  quantityLabel: string;
  eventNameLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  notePlaceholder: string;
};

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    key: 'ai-interactive-props',
    label: 'AI 互動道具',
    aliases: ['AI互動道具', 'AI 互動道具'],
    productCategories: ['AI互動道具'],
    quantityLabel: '道具數量',
    eventNameLabel: '活動／專案名稱',
    startDateLabel: '使用開始日',
    endDateLabel: '使用結束日',
    notePlaceholder: '互動方式、場地網路、螢幕尺寸或其他技術需求',
  },
  {
    key: 'event-package',
    label: '活動策劃統包',
    aliases: ['活動策劃統包', '專案企劃'],
    productCategories: ['專案企劃'],
    quantityLabel: '場次',
    eventNameLabel: '活動名稱',
    startDateLabel: '活動開始日',
    endDateLabel: '活動結束日',
    notePlaceholder: '活動規模、預估人數、場地、流程與希望包含的服務',
  },
  {
    key: 'opening-ceremony',
    label: '啟動儀式',
    aliases: ['啟動儀式'],
    productCategories: ['啟動儀式'],
    quantityLabel: '設備數量',
    eventNameLabel: '典禮名稱',
    startDateLabel: '進場／使用日',
    endDateLabel: '撤場／歸還日',
    notePlaceholder: '啟動形式、貴賓人數、舞台尺寸、進撤場時間',
  },
  {
    key: 'special-effects',
    label: '活動特效',
    aliases: ['活動特效'],
    productCategories: ['活動特效'],
    quantityLabel: '特效設備數量',
    eventNameLabel: '活動名稱',
    startDateLabel: '施作開始日',
    endDateLabel: '施作結束日',
    notePlaceholder: '特效類型、施放次數、場地限制與預計施放時間點',
  },
  {
    key: 'stage-production',
    label: '燈光音響舞台',
    aliases: ['燈光音響舞台'],
    productCategories: ['燈光音響舞台'],
    quantityLabel: '設備／組數',
    eventNameLabel: '活動名稱',
    startDateLabel: '進場搭設日',
    endDateLabel: '撤場日',
    notePlaceholder: '場地尺寸、觀眾人數、演出內容、燈光音響與舞台需求',
  },
  {
    key: 'bartending',
    label: '外派調酒',
    aliases: ['外派調酒'],
    productCategories: ['外派調酒'],
    quantityLabel: '預估人數',
    eventNameLabel: '活動名稱',
    startDateLabel: '服務開始日',
    endDateLabel: '服務結束日',
    notePlaceholder: '賓客人數、服務時段、酒單偏好、場地設備與禁忌',
  },
  {
    key: 'showgirl',
    label: 'SHOW GIRL',
    aliases: ['SHOW GIRL', 'Show Girl', 'showgirl'],
    productCategories: ['Show Girl'],
    quantityLabel: '人員數',
    eventNameLabel: '活動／展場名稱',
    startDateLabel: '服務開始日',
    endDateLabel: '服務結束日',
    notePlaceholder: '工作內容、服裝、服務時段、地點與人員條件',
  },
  {
    key: 'other',
    label: '其他',
    aliases: ['其他'],
    productCategories: [],
    quantityLabel: '數量／人數',
    eventNameLabel: '活動名稱',
    startDateLabel: '開始日',
    endDateLabel: '結束日',
    notePlaceholder: '請說明需求內容、預算、場地與其他注意事項',
  },
];

export const PRODUCT_CATEGORIES = SERVICE_DEFINITIONS.flatMap(service => service.productCategories);
// 「燈光音響舞台」仍保留於產品與後台分類，但不提供於聯絡表單的服務類型選項。
export const CONTACT_SERVICE_TYPES = SERVICE_DEFINITIONS
  .filter(service => service.key !== 'stage-production')
  .map(service => service.label);

export function getServiceDefinition(value?: string | null): ServiceDefinition {
  const normalized = (value || '').replace(/\s+/g, '').toLowerCase();
  return SERVICE_DEFINITIONS.find(service =>
    [service.label, ...service.aliases].some(alias => alias.replace(/\s+/g, '').toLowerCase() === normalized)
  ) || SERVICE_DEFINITIONS[SERVICE_DEFINITIONS.length - 1];
}
