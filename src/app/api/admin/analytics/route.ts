import { createSign } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

type ServiceAccountCredentials = {
  clientEmail: string;
  privateKey: string;
  privateKeyId?: string;
};

type Ga4Row = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getCredentials(): ServiceAccountCredentials | null {
  const rawJson = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as { client_email?: string; private_key?: string; private_key_id?: string };
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, '\n'),
          privateKeyId: parsed.private_key_id,
        };
      }
    } catch {
      return null;
    }
  }

  const clientEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  return clientEmail && privateKey ? { clientEmail, privateKey } : null;
}

async function getAccessToken(credentials: ServiceAccountCredentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT', ...(credentials.privateKeyId ? { kid: credentials.privateKeyId } : {}) };
  const claims = {
    iss: credentials.clientEmail,
    scope: GA4_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claims))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${base64Url(signer.sign(credentials.privateKey))}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });
  const body = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !body.access_token) throw new Error(body.error_description || '無法取得 GA4 存取權杖');
  return body.access_token;
}

async function runReport(accessToken: string, propertyId: string, body: Record<string, unknown>) {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const result = await response.json() as { rows?: Ga4Row[]; error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message || '無法讀取 GA4 報表');
  return result.rows || [];
}

function numericValue(row?: Ga4Row) {
  return Number(row?.metricValues?.[0]?.value || 0);
}

function buildMonthKeys() {
  const current = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(current.getFullYear(), current.getMonth() - (11 - index), 1);
    return {
      key: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: `${date.getMonth() + 1}月`,
    };
  });
}

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const propertyId = process.env.GA4_PROPERTY_ID?.trim().replace(/^properties\//, '');
  const credentials = getCredentials();
  if (!propertyId || !credentials) {
    return NextResponse.json({
      configured: false,
      error: '尚未完成 GA4 Data API 設定',
    }, { status: 503 });
  }

  try {
    const accessToken = await getAccessToken(credentials);
    const [overviewRows, sourceRows, monthlyRows, pageRows] = await Promise.all([
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }],
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        limit: '100',
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: '11monthsAgo', endDate: 'today' }],
        dimensions: [{ name: 'yearMonth' }],
        metrics: [{ name: 'screenPageViews' }],
        limit: '24',
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: '5',
      }),
    ]);

    const sourceSessions = sourceRows.reduce<Record<string, number>>((totals, row) => {
      const source = (row.dimensionValues?.[0]?.value || '').toLowerCase();
      const sessions = numericValue(row);
      if (source.includes('google')) totals.google += sessions;
      if (source.includes('yahoo')) totals.yahoo += sessions;
      if (source.includes('youtube')) totals.youtube += sessions;
      return totals;
    }, { google: 0, yahoo: 0, youtube: 0 });

    const monthlyTotals = new Map(monthlyRows.map(row => [row.dimensionValues?.[0]?.value || '', numericValue(row)]));
    const overview = overviewRows[0];

    return NextResponse.json({
      configured: true,
      period: '最近 30 天',
      overview: {
        pageViews: numericValue(overview),
        activeUsers: Number(overview?.metricValues?.[1]?.value || 0),
        sessions: Number(overview?.metricValues?.[2]?.value || 0),
      },
      sources: sourceSessions,
      monthly: buildMonthKeys().map(month => ({ label: month.label, pageViews: monthlyTotals.get(month.key) || 0 })),
      topPages: pageRows.map(row => ({
        path: row.dimensionValues?.[0]?.value || '/',
        pageViews: numericValue(row),
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GA4 analytics error:', error);
    return NextResponse.json({
      configured: true,
      error: 'GA4 資料暫時無法讀取，請確認服務帳戶權限與 Data API 設定。',
    }, { status: 502 });
  }
}
