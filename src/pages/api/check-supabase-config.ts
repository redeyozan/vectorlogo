import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables without exposing actual values
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const config = {
      supabaseUrl: {
        exists: !!supabaseUrl,
        value: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : null
      },
      supabaseAnonKey: {
        exists: !!supabaseAnonKey,
        value: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 3)}...` : null
      },
      supabaseServiceKey: {
        exists: !!supabaseServiceKey,
        value: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 3)}...` : null
      }
    };

    // Test Supabase connection with regular client
    let regularClientWorking = false;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    try {
      const { data, error } = await supabase.storage.listBuckets();
      regularClientWorking = !error;
    } catch (err) {
      console.error('Error testing regular client:', err);
    }

    // Test Supabase connection with admin client
    let adminClientWorking = false;
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    try {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      adminClientWorking = !error;
    } catch (err) {
      console.error('Error testing admin client:', err);
    }

    return res.status(200).json({
      config,
      regularClientWorking,
      adminClientWorking
    });
  } catch (error) {
    console.error('Error checking Supabase config:', error);
    return res.status(500).json({ error: 'Failed to check Supabase configuration' });
  }
}
