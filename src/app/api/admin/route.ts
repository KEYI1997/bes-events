import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// 簡易密碼驗證（header: x-admin-password）
function verifyAdmin(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}

// GET /api/admin?table=xxx
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const table = request.nextUrl.searchParams.get("table");
  if (!table) {
    return NextResponse.json({ error: "缺少 table 參數" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/admin - 新增
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
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
  if (!verifyAdmin(request)) {
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
  if (!verifyAdmin(request)) {
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
