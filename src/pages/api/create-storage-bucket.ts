import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  try {
    // Create a Supabase client with the service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the 'logos' bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const logosBucketExists = buckets.some(bucket => bucket.name === 'logos');
    
    if (!logosBucketExists) {
      // Create the 'logos' bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket('logos', {
        public: true,  // Make the bucket public
        fileSizeLimit: 5242880,  // 5MB limit
      });
      
      if (error) {
        throw error;
      }
      
      // Create folders for different file types
      await Promise.all([
        supabase.storage.from('logos').upload('png/.gitkeep', new Blob([''])),
        supabase.storage.from('logos').upload('svg/.gitkeep', new Blob(['']))
      ]);
      
      return res.status(200).json({ message: 'Storage bucket created successfully', data });
    }
    
    return res.status(200).json({ message: 'Storage bucket already exists' });
    
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return res.status(500).json({ error: 'Failed to create storage bucket' });
  }
}
