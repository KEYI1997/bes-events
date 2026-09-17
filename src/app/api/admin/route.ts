import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { verifyAdminRequest } from '@/lib/adminAuth';

// 簡易密碼驗證（header: x-admin-password）
async function verifyAdmin(request: NextRequest) {
  return verifyAdminRequest(request);
}

const PAGE_SIZE_MAX = 100;
const DEFAULT_PAGE_SIZE = 50;
const PAGINATED_TABLES = new Set(['contacts', 'orders', 'customers']);

function toPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function searchTerm(value: string | null) {
  return (value || '').trim().replace(/[(),.%_]/g, ' ');
}

// GET /api/admin?table=xxx
export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const table = request.nextUrl.searchParams.get("table");
  if (!table) {
    return NextResponse.json({ error: "缺少 table 參數" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const calendarStart = request.nextUrl.searchParams.get('calendarStart');
  const calendarEnd = request.nextUrl.searchParams.get('calendarEnd');
  if (table === 'orders' && calendarStart && calendarEnd) {
    const calendarRows: unknown[] = [];
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', '已取消')
        .lte('borrow_date', calendarEnd)
        .gte('return_date', calendarStart)
        .order('borrow_date', { ascending: true })
        .range(offset, offset + 999);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const rows = data || [];
      calendarRows.push(...rows);
      if (rows.length < 1000) break;
      offset += 1000;
    }
    return NextResponse.json({ data: calendarRows });
  }

  const pageParam = request.nextUrl.searchParams.get('page');

  if (pageParam) {
    if (!PAGINATED_TABLES.has(table)) {
      return NextResponse.json({ error: '此資料表不支援分頁讀取' }, { status: 400 });
    }

    const page = toPositiveInteger(pageParam, 1);
    const pageSize = Math.min(toPositiveInteger(request.nextUrl.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE), PAGE_SIZE_MAX);
    const from = (page - 1) * pageSize;
    const status = request.nextUrl.searchParams.get('status');
    const serviceType = request.nextUrl.searchParams.get('serviceType');
    const productId = request.nextUrl.searchParams.get('productId');
    const keyword = searchTerm(request.nextUrl.searchParams.get('search'));
    let query = supabase.from(table).select('*', { count: 'exact' });

    if (table === 'contacts') {
      if (status === 'pending') query = query.or('status.is.null,status.eq.pending');
      if (status === 'replied' || status === 'converted') query = query.eq('status', status);
      if (serviceType && serviceType !== 'all') query = query.eq('service_type', serviceType);

      const contactSort = request.nextUrl.searchParams.get('sort');
      const ascending = contactSort === 'oldest' || contactSort === 'event_date_asc';
      const sortColumn = contactSort?.startsWith('event_date') ? 'event_date' : 'created_at';
      const { data, error, count } = await query
        .order(sortColumn, { ascending, nullsFirst: false })
        .range(from, from + pageSize - 1);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const { count: unreadCount, error: unreadError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      if (unreadError) return NextResponse.json({ error: unreadError.message }, { status: 500 });
      return NextResponse.json({ data: data || [], count: count || 0, unreadCount: unreadCount || 0, page, pageSize });
    }

    if (table === 'orders') {
      if (status && status !== 'all') query = query.eq('status', status);
      if (productId && productId !== 'all') query = query.eq('product_id', productId);
      if (keyword) query = query.or(`customer_name.ilike.%${keyword}%,event_name.ilike.%${keyword}%`);

      const orderSort = request.nextUrl.searchParams.get('sort');
      const allowedSorts = new Set(['borrow_date', 'return_date', 'customer_name', 'created_at']);
      const sortColumn = allowedSorts.has(orderSort || '') ? orderSort! : 'borrow_date';
      const ascending = request.nextUrl.searchParams.get('direction') === 'asc';
      const { data, error, count } = await query
        .order(sortColumn, { ascending, nullsFirst: false })
        .range(from, from + pageSize - 1);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const phones = [...new Set((data || []).map(order => order.customer_phone).filter(Boolean))];
      const { data: boundCustomers, error: customerError } = phones.length > 0
        ? await supabase.from('customers').select('phone').in('phone', phones).not('line_user_id', 'is', null)
        : { data: [], error: null };
      if (customerError) return NextResponse.json({ error: customerError.message }, { status: 500 });
      const customerBindings = Object.fromEntries((boundCustomers || []).map(customer => [customer.phone, true]));
      return NextResponse.json({ data: data || [], count: count || 0, customerBindings, page, pageSize });
    }

    if (keyword) query = query.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,line_display_name.ilike.%${keyword}%`);
    const { data, error, count } = await query
      .order('updated_at', { ascending: false, nullsFirst: false })
      .range(from, from + pageSize - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { count: boundCount, error: boundError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .not('line_user_id', 'is', null);
    if (boundError) return NextResponse.json({ error: boundError.message }, { status: 500 });
    return NextResponse.json({ data: data || [], count: count || 0, boundCount: boundCount || 0, page, pageSize });
  }

  // 舊頁面維持原有回傳格式，但在伺服器逐頁讀取，避免 Supabase 單次上限截斷資料。
  const allRows: unknown[] = [];
  let offset = 0;
  let sortColumn = 'created_at';
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(sortColumn, { ascending: sortColumn === 'id' })
      .range(offset, offset + 999);

    if (error && sortColumn === 'created_at' && error.message.includes('created_at')) {
      sortColumn = 'id';
      offset = 0;
      allRows.length = 0;
      continue;
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = data || [];
    allRows.push(...rows);
    if (rows.length < 1000) break;
    offset += 1000;
  }

  return NextResponse.json({ data: allRows });
}
// POST /api/admin - 新增
export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { table, record } = await request.json();
  const supabase = getServiceClient();
  const normalizedRecord = table === 'cases' ? { ...record, event_date: record.event_date || null, activity_date: record.activity_date || null } : record;
  const { data, error } = await supabase.from(table).insert(normalizedRecord).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// PUT /api/admin - 更新
export async function PUT(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { table, id, record } = await request.json();
  const supabase = getServiceClient();
  const normalizedRecord = table === 'cases' ? { ...record, event_date: record.event_date || null, activity_date: record.activity_date || null } : record;
  const { data, error } = await supabase
    .from(table)
    .update(normalizedRecord)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/admin - 刪除
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { table, id } = await request.json();
  const supabase = getServiceClient();
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
