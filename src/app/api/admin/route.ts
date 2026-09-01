import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { verifyAdminRequest } from '@/lib/adminAuth';

// 簡易密碼驗證（header: x-admin-password）
async function verifyAdmin(request: NextRequest) {
  return verifyAdminRequest(request);
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

  // 先嘗試用 created_at 排序，若該表無此欄位則改用 id
  let { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error && error.message.includes("created_at")) {
    const fallback = await supabase
      .from(table)
      .select("*")
      .order("id", { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/admin - 新增
export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { table, record } = await request.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase.from(table).insert(record).select().single();

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
  const { data, error } = await supabase
    .from(table)
    .update(record)
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
