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
      throw bucketsError;
    }

    const logosBucketExists = buckets.some(bucket => bucket.name === 'logos');

    // Create the logos bucket if it doesn't exist
    if (!logosBucketExists) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket('logos', {
        public: true, // Make files publicly accessible
        fileSizeLimit: 10485760, // 10MB limit
      });

      if (createBucketError) {
        throw createBucketError;
      }
    }

    // Create subdirectories for different file types
    // Note: Supabase doesn't have a direct way to create folders, but we can simulate them
    // by uploading and then deleting a placeholder file
    const directories = ['png', 'svg'];
    
    for (const dir of directories) {
      // Create a placeholder file to establish the directory
      const placeholderFile = new Uint8Array([]);
      const placeholderPath = `${dir}/.placeholder`;
      
      // Upload the placeholder file
      const { error: uploadError } = await supabaseAdmin.storage
        .from('logos')
        .upload(placeholderPath, placeholderFile, {
          upsert: true
        });
      
      if (uploadError && uploadError.message !== 'The resource already exists') {
        console.error(`Error creating ${dir} directory:`, uploadError);
        // Continue with setup even if this fails
      }
    }

    // Set up public access policies for the logos bucket
    const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'logos',
      policy_name: 'Public Access',
      definition: 'true', // Allow public access to all files
      operation: 'SELECT' // For read operations
    });

    if (policyError) {
      console.error('Error setting up public access policy:', policyError);
      // Continue with setup even if this fails
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Storage setup completed successfully',
      bucketCreated: !logosBucketExists
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

// Helper function to create storage policies
async function createStoragePolicy(bucketName: string, policyName: string, definition: string, operation: string) {
  try {
    const { error } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: bucketName,
      policy_name: policyName,
      definition: definition,
      operation: operation
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error creating ${policyName} policy:`, error);
    return { success: false, error };
  }
}
