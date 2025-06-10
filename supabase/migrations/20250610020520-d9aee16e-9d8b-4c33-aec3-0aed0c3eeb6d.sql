
-- Add feature flags and onboarding state to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS feature_guided_conversation BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS feature_wisdom_library BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS first_chat_completed BOOLEAN DEFAULT FALSE;

-- Create table for storing personalized insights
CREATE TABLE IF NOT EXISTS public.personalized_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_text TEXT NOT NULL,
  generated_from_themes TEXT[], -- Array of conversation themes this insight was generated from
  conversation_context TEXT, -- Summary of conversation context
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user's saved insights (both generic and personalized)
CREATE TABLE IF NOT EXISTS public.saved_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_text TEXT NOT NULL,
  insight_type VARCHAR(50) NOT NULL DEFAULT 'generic', -- 'generic' or 'personalized'
  personalized_insight_id UUID REFERENCES public.personalized_insights(id) ON DELETE CASCADE,
  user_notes TEXT, -- User's personal reflection on this insight
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for personalized_insights
ALTER TABLE public.personalized_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personalized insights" 
  ON public.personalized_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personalized insights" 
  ON public.personalized_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personalized insights" 
  ON public.personalized_insights 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personalized insights" 
  ON public.personalized_insights 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for saved_insights
ALTER TABLE public.saved_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved insights" 
  ON public.saved_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved insights" 
  ON public.saved_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved insights" 
  ON public.saved_insights 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved insights" 
  ON public.saved_insights 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personalized_insights_user_id ON public.personalized_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_insights_user_id ON public.saved_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_insights_type ON public.saved_insights(insight_type);
