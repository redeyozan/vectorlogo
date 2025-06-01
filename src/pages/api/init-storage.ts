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
    // Check if the logos bucket already exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to list storage buckets',
        details: bucketsError
      });
    }

    const logosBucketExists = buckets.some(bucket => bucket.name === 'logos');
    let bucketCreated = false;

    // Create the logos bucket if it doesn't exist
    if (!logosBucketExists) {
      const { data, error: createError } = await supabaseAdmin.storage.createBucket('logos', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create logos bucket',
          details: createError
        });
      }
      
      bucketCreated = true;
    }

    // Set up public access policy for the logos bucket
    // Use RPC to create policy since direct method might not be available in all Supabase versions
    const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'logos',
      policy_name: 'public-read',
      definition: "role = '*'", // Apply to all users
      operation: 'SELECT' // For read operations
    });

    if (policyError) {
      console.error('Error setting up public access policy:', policyError);
      // Continue with setup even if this fails
    }

    // Create folders for different file types
    if (bucketCreated) {
      try {
        await Promise.all([
          supabaseAdmin.storage.from('logos').upload('png/.gitkeep', new Blob([''])),
          supabaseAdmin.storage.from('logos').upload('svg/.gitkeep', new Blob(['']))
        ]);
      } catch (folderError) {
        console.error('Error creating folders:', folderError);
        // Continue even if folder creation fails
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Storage setup completed successfully',
      bucketCreated,
      bucketExists: logosBucketExists
    });
  } catch (error) {
    console.error('Error setting up storage:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to set up storage',
      details: error
    });
  }
}
