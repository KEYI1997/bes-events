import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// 取得目前有效密碼（優先從 Supabase 讀取，沒有則用環境變數）
async function getCurrentPassword() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "admin_password")
      .single();
    
    if (data?.value) {
      return data.value;
    }
  } catch {
    // 忽略錯誤，fallback 到環境變數
  }
  return process.env.ADMIN_PASSWORD || '';
}

export async function POST(request: NextRequest) {
  const headerPassword = request.headers.get("x-admin-password");
  const currentPassword = await getCurrentPassword();

  // 驗證目前密碼
  if (headerPassword !== currentPassword) {
    return NextResponse.json({ error: "目前密碼不正確" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword: inputCurrentPwd, newPassword } = body;

    // 再次驗證輸入的目前密碼
    if (inputCurrentPwd !== currentPassword) {
      return NextResponse.json({ error: "目前密碼不正確" }, { status: 401 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "新密碼至少需要 6 個字元" }, { status: 400 });
    }

    // 儲存新密碼到 Supabase
    const supabase = getServiceClient();
    
    // 檢查是否已有 admin_password 記錄
    const { data: existing } = await supabase
      .from("site_content")
      .select("id")
      .eq("key", "admin_password")
      .single();

    if (existing) {
      // 更新
      const { error } = await supabase
        .from("site_content")
        .update({ value: newPassword, updated_at: new Date().toISOString() })
        .eq("key", "admin_password");
      
      if (error) {
        console.error("Update password error:", error);
        return NextResponse.json({ error: "密碼更新失敗" }, { status: 500 });
      }
    } else {
      // 新增
      const { error } = await supabase
        .from("site_content")
        .insert({ key: "admin_password", value: newPassword });
      
      if (error) {
        console.error("Insert password error:", error);
        return NextResponse.json({ error: "密碼更新失敗" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "密碼已成功變更" });
  } catch (err) {
    console.error("change-password error:", err);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}
