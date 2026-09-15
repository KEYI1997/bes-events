-- 本地瀏覽紀錄與資料庫端統計。請透過 /api/migrate 套用，或直接在 Supabase SQL Editor 執行。
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL CHECK (char_length(path) <= 512),
  session_id text NOT NULL CHECK (char_length(session_id) <= 100),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_created_at_idx ON page_views (path, created_at DESC);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION page_view_daily_counts(days integer DEFAULT 30)
RETURNS TABLE(day date, views bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT created_at::date AS day, COUNT(*)::bigint AS views
  FROM page_views
  WHERE created_at >= (CURRENT_DATE - GREATEST(days, 1))
  GROUP BY created_at::date
  ORDER BY day ASC;
$$;

CREATE OR REPLACE FUNCTION page_view_monthly_counts(months integer DEFAULT 12)
RETURNS TABLE(month text, views bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*)::bigint AS views
  FROM page_views
  WHERE created_at >= (date_trunc('month', CURRENT_DATE) - ((GREATEST(months, 1) - 1) * INTERVAL '1 month'))
  GROUP BY date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at) ASC;
$$;
