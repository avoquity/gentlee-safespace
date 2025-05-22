
-- Create table to track when insights were last shown to users
CREATE TABLE IF NOT EXISTS "user_insights" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "last_shown_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE ("user_id")
);

-- Add RLS policies
ALTER TABLE "user_insights" ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own insight records
CREATE POLICY "Users can view their own insight records"
  ON "user_insights"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to update only their own insight records
CREATE POLICY "Users can update their own insight records"
  ON "user_insights"
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own insight records
CREATE POLICY "Users can insert their own insight records"
  ON "user_insights"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
