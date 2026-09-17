import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const results = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('read', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['已預約', '出借中']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['已歸還', '已結案']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', '已取消'),
  ]);
  const error = results.find(result => result.error)?.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const [products, cases, contacts, clients, unread, read, orders, processing, completed, cancelled] = results;
  return NextResponse.json({
    counts: { products: products.count || 0, cases: cases.count || 0, contacts: contacts.count || 0, clients: clients.count || 0 },
    contacts: { total: contacts.count || 0, unread: unread.count || 0, read: read.count || 0 },
    orders: { total: orders.count || 0, processing: processing.count || 0, completed: completed.count || 0, cancelled: cancelled.count || 0 },
  });
}
