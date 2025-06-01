import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get sample logo data to check structure
    const { data: logos, error: logosError } = await supabase
      .from('logos')
      .select('*')
      .limit(5);

    if (logosError) {
      return res.status(500).json({
        error: 'Failed to get logos',
        details: logosError
      });
    }

    // Check if any logos exist
    if (!logos || logos.length === 0) {
      return res.status(200).json({
        message: 'No logos found in the database',
        hasUserIdColumn: false,
        tableExists: true
      });
    }

    // Check if user_id column exists in the returned data
    const firstLogo = logos[0];
    const hasUserIdColumn = 'user_id' in firstLogo;

    return res.status(200).json({
      message: 'Table structure checked successfully',
      hasUserIdColumn,
      sampleLogo: firstLogo,
      columnNames: Object.keys(firstLogo),
      logoCount: logos.length
    });
  } catch (err) {
    console.error('Error checking table structure:', err);
    return res.status(500).json({
      error: 'An unexpected error occurred',
      details: err
    });
  }
}
