
-- Function to insert a letter since we can't directly access the letters table from the client
CREATE OR REPLACE FUNCTION public.insert_letter(
  user_id_param UUID,
  message_text_param TEXT,
  send_date_param TIMESTAMP WITH TIME ZONE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO public.letters (user_id, message_text, send_date)
  VALUES (user_id_param, message_text_param, send_date_param)
  RETURNING to_jsonb(letters.*) INTO result;
  
  RETURN result;
END;
$$;
