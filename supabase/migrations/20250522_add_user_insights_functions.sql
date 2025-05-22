
-- Function to get a user's insight record
CREATE OR REPLACE FUNCTION get_user_insight(user_uuid UUID)
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  last_shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ui.id, ui.user_id, ui.last_shown_at, ui.created_at
  FROM public.user_insights ui
  WHERE ui.user_id = user_uuid;
END;
$$;

-- Function to upsert a user insight record
CREATE OR REPLACE FUNCTION upsert_user_insight(user_uuid UUID, shown_at TIMESTAMPTZ)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_insights (user_id, last_shown_at)
  VALUES (user_uuid, shown_at)
  ON CONFLICT (user_id)
  DO UPDATE SET
    last_shown_at = excluded.last_shown_at;
END;
$$;
