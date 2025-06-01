import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin key for full access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user_id column exists
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc(
      'get_columns',
      { table_name: 'logos' }
    );

    if (columnsError) {
      return res.status(500).json({
        error: 'Failed to check columns',
        details: columnsError
      });
    }

    // Check if user_id column exists
    const userIdColumnExists = columns.some((col: any) => col.column_name === 'user_id');

    if (userIdColumnExists) {
      return res.status(200).json({
        message: 'user_id column already exists',
        success: true,
        alreadyExists: true
      });
    }

    // Add user_id column if it doesn't exist
    const { error: alterTableError } = await supabaseAdmin.rpc(
      'execute_sql',
      {
        sql: `
          ALTER TABLE public.logos 
          ADD COLUMN user_id UUID REFERENCES auth.users(id);
          
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
        `
      }
    );

    if (alterTableError) {
      return res.status(500).json({
        error: 'Failed to add user_id column',
        details: alterTableError
      });
    }

    return res.status(200).json({
      message: 'Successfully added user_id column to logos table',
      success: true
    });
  } catch (err) {
    console.error('Error adding user_id column:', err);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      details: err
    });
  }
}
