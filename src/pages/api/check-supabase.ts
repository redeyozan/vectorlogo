import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
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
