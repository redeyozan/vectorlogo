import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin key for full access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin.rpc(
      'execute_sql',
      {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'logos'
          ORDER BY ordinal_position;
        `
      }
    );

    if (tableError) {
      return res.status(500).json({
        error: 'Failed to get table structure',
        details: tableError
      });
    }

    // Get sample logo data
    const { data: logos, error: logosError } = await supabaseAdmin
      .from('logos')
      .select('*')
      .limit(5);

    if (logosError) {
      return res.status(500).json({
        error: 'Failed to get logos',
        details: logosError
      });
    }

    // Check RLS policies
    const { data: policies, error: policiesError } = await supabaseAdmin.rpc(
      'execute_sql',
      {
        sql: `
          SELECT polname, polpermissive, polroles, polcommand, polqual
          FROM pg_policy
          WHERE polrelid = 'public.logos'::regclass;
        `
      }
    );

    if (policiesError) {
      return res.status(500).json({
        error: 'Failed to get RLS policies',
        details: policiesError
      });
    }

    return res.status(200).json({
      tableStructure: tableInfo,
      sampleLogos: logos,
      rlsPolicies: policies,
      hasUserIdColumn: tableInfo.some((col: any) => col.column_name === 'user_id'),
      message: 'Table structure and sample data retrieved successfully'
    });
  } catch (err) {
    console.error('Error checking logos table:', err);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      details: err
    });
  }
}
