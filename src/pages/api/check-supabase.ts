import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xurgzouaxtnptnhwaaax.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cmd6b3VheHRucHRuaHdhYWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjc5MTQsImV4cCI6MjA2Mzg0MzkxNH0.dnm5KYWDlBTye4kqCW8Z8CHjQlItaYxa6JMfl0RwDX8';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('_dummy_query').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means relation doesn't exist, which is fine for this test
      throw error;
    }
    
    return res.status(200).json({ success: true, message: 'Supabase connection successful' });
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to Supabase', 
      error: error.message 
    });
  }
}
