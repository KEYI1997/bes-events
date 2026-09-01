import { getServiceClient } from '@/lib/supabase';

export async function getCurrentAdminPassword() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (data?.value) return data.value;
  } catch {
    // 資料庫暫時無法連線時，仍可使用部署環境設定的預設備援密碼。
  }

  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
}

export async function verifyAdminPassword(password: string | null) {
  return Boolean(password) && password === await getCurrentAdminPassword();
}

export async function verifyAdminRequest(request: Request) {
  return verifyAdminPassword(request.headers.get('x-admin-password'));
}
