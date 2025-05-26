-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view any profile
CREATE POLICY "Allow users to view any profile" ON public.profiles
  FOR SELECT USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert only their own profile
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS for logos table
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

-- Create policies for logos table
-- Anyone can view logos
CREATE POLICY "Anyone can view logos" ON public.logos
  FOR SELECT USING (true);

-- Only authenticated users can insert logos
CREATE POLICY "Authenticated users can insert logos" ON public.logos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only the creator or admin can update logos
CREATE POLICY "Users can update their own logos" ON public.logos
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE id = auth.uid()
  ));

-- Only the creator or admin can delete logos
CREATE POLICY "Users can delete their own logos" ON public.logos
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE id = auth.uid()
  ));
