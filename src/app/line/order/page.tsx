import type { Metadata } from 'next';
import LineOrderForm from '@/components/LineOrderForm';
import { getServiceClient, supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { parseLineOrderToken } from '@/lib/lineOrderToken';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新增訂單 | 境曜有限公司',
  description: '從 LINE 圖文選單快速選擇境曜活動服務與產品。',
  robots: { index: false, follow: false },
};

export default async function LineOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const lineUserId = parseLineOrderToken(token);
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  let boundCustomer: { name?: string | null; phone?: string | null } | null = null;
  if (lineUserId) {
    const { data: customer } = await getServiceClient()
      .from('customers')
      .select('name, phone')
      .eq('line_user_id', lineUserId)
      .maybeSingle();
    boundCustomer = customer;
  }

  return (
    <LineOrderForm
      products={(data || []) as Product[]}
      initialCustomer={{
        name: boundCustomer?.name || '',
        phone: boundCustomer?.phone || '',
      }}
    />
  );
}
