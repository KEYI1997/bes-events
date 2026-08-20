// src/lib/types.ts

export interface Product {
  id: string;
  name: string;
  category: 'AI互動道具' | '專案企劃' | '啟動儀式' | '活動特效' | '燈光音響舞台' | '外派調酒' | 'Show Girl';
  description?: string;
  service_content: string;
  notice: string;
  image_url?: string;
  image_urls: string[];
  size_image_urls: string[];
  ai_file_url: string;
  youtube_url: string;
  price_note: string;
  stock: number;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  borrow_date: string;
  return_date: string;
  event_name: string;
  note: string;
  status: '已預約' | '出借中' | '已歸還' | '已取消';
  order_code?: string;        // 訂單碼，例如 BES-20260811-001
  line_user_id?: string;      // LINE User ID（客戶綁定後填入）
  line_display_name?: string; // LINE 顯示名稱
  created_at: string;
  // joined
  product?: Product;
}

export interface Case {
  id: string;
  title: string;
  category: '開幕典禮' | '記者會' | '新品發表會' | '展覽攤位' | '政府活動' | '春酒尾牙' | '典禮節慶';
  description: string;
  image_url: string;
  client_name: string;
  event_date: string;
  service_type: string;
  sort_order: number;
  visible: boolean;
  created_at: string;
}

export interface ShowGirl {
  id: string;
  name: string;
  image_url: string;
  height: number;
  measurements: string;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  logo_url: string;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  text: string;
  rating: number;
  author: string;
  company: string;
  visible: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  service_type: string;
  description: string;
  event_date: string;
  event_end_date: string;
  read: boolean;
  status?: 'pending' | 'replied' | 'converted';  // 訂單/諮詢確認中 | 已回覆・未成立訂單 | 已轉訂單
  staff_note?: string;  // 工作人員備註
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  visible: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  line_user_id?: string;
  line_display_name?: string;
  line_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}
