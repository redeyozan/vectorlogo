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

  const results: any = {
    database: { status: 'unknown' },
    storage: { status: 'unknown' },
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing'
    }
  };

  // Test database connection
  try {
    // Try to query the logos table
    const { data: logos, error } = await supabaseAdmin
      .from('logos')
      .select('count')
      .limit(1);
    
    if (error) {
      results.database = {
        status: 'error',
        message: error.message,
        details: error
      };
    } else {
      results.database = {
        status: 'success',
        message: 'Successfully connected to database',
        data: logos
      };
    }
  } catch (err: any) {
    results.database = {
      status: 'error',
      message: err.message,
      details: err
    };
  }

  // Test storage connection
  try {
    // List buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      results.storage = {
        status: 'error',
        message: bucketsError.message,
        details: bucketsError
      };
    } else {
      // Check if logos bucket exists
      const logosBucket = buckets.find(bucket => bucket.name === 'logos');
      
      if (logosBucket) {
        // Try to list files in the logos bucket
        const { data: files, error: filesError } = await supabaseAdmin.storage
          .from('logos')
          .list();
        
        if (filesError) {
          results.storage = {
            status: 'partial',
            message: 'Bucket exists but could not list files',
            bucketDetails: logosBucket,
            error: filesError
          };
        } else {
          results.storage = {
            status: 'success',
            message: 'Successfully connected to storage',
            bucketDetails: logosBucket,
            files: files
          };
        }
      } else {
        results.storage = {
          status: 'partial',
          message: 'Storage is working but logos bucket does not exist',
          availableBuckets: buckets.map(b => b.name)
        };
      }
    }
  } catch (err: any) {
    results.storage = {
      status: 'error',
      message: err.message,
      details: err
    };
  }

  return res.status(200).json(results);
}
