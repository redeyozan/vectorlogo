-- Add user_id column to logos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'logos' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.logos ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END
$$;

-- Update RLS policies for the logos table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view logos" ON public.logos;
DROP POLICY IF EXISTS "Authenticated users can insert logos" ON public.logos;
DROP POLICY IF EXISTS "Users can update their own logos" ON public.logos;
DROP POLICY IF EXISTS "Users can delete their own logos" ON public.logos;

-- Create new policies
-- Anyone can view logos
CREATE POLICY "Anyone can view logos" ON public.logos
  FOR SELECT USING (true);

-- Only authenticated users can insert logos
CREATE POLICY "Authenticated users can insert logos" ON public.logos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only the creator or admin can update logos
CREATE POLICY "Users can update their own logos" ON public.logos
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Only the creator or admin can delete logos
CREATE POLICY "Users can delete their own logos" ON public.logos
  FOR DELETE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
    )
  );
