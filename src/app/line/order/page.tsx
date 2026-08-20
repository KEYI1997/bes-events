import type { Metadata } from 'next';
import LineOrderForm from '@/components/LineOrderForm';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新增訂單 | 境曜有限公司',
  description: '從 LINE 圖文選單快速選擇境曜活動服務與產品。',
  robots: { index: false, follow: false },
};

export default async function LineOrderPage() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  return <LineOrderForm products={(data || []) as Product[]} />;
}
