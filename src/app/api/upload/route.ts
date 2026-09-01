import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "uploads";

  if (!file) {
    return NextResponse.json({ error: "未提供檔案" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  // AI 檔案上傳到 ai-files bucket，其他上傳到 images bucket
  const isAiFile = ['ai', 'eps'].includes((fileExt || '').toLowerCase()) || folder === 'ai-files';
  const bucket = isAiFile ? 'ai-files' : 'images';

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
