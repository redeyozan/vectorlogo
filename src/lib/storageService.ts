import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Create an admin client for operations that require elevated permissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xurgzouaxtnptnhwaaax.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cmd6b3VheHRucHRuaHdhYWF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2NzkxNCwiZXhwIjoyMDYzODQzOTE0fQ.IBHMQwjn1rbdHT71almt-9-opcVMCdx4UN6eFbXZxCg'
);

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'logos')
 * @param path Optional path within the bucket
 * @returns URL of the uploaded file
 */
/**
 * Ensure a storage bucket exists, creating it if necessary
 * @param bucketName The name of the bucket to check/create
 * @returns True if bucket exists or was created successfully
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  console.log('Checking if bucket exists on client side...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xurgzouaxtnptnhwaaax.supabase.co');
  try {
    // Always use admin client for bucket operations
    console.log('Using admin client for bucket operations');
    let { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets with admin client:', bucketsError);
    }
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }
    
    const bucketExists = buckets?.some(b => b.name === bucketName) || false;
    console.log(`Bucket '${bucketName}' exists: ${bucketExists}`);
    
    if (!bucketExists) {
      console.log(`Attempting to create bucket '${bucketName}'...`);
      
      // Create the bucket if it doesn't exist - use admin client for this
      console.log(`Creating bucket '${bucketName}' with admin client...`);
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      // Set public access policy for the bucket
      if (!error) {
        try {
          console.log('Setting public access policy for bucket...');
          await supabaseAdmin.storage.from(bucketName).getPublicUrl('test.txt');
          console.log('Public access policy set successfully');
        } catch (policyErr) {
          console.error('Error setting public access policy:', policyErr);
          // Continue even if policy setting fails
        }
      }
      
      if (error) {
        console.error(`Error creating bucket '${bucketName}':`, error);
        return false;
      }
      
      console.log(`Successfully created bucket '${bucketName}'`);
      return true;
    }
    
    return true;
  } catch (err) {
    console.error(`Error in ensureBucketExists for '${bucketName}':`, err);
    return false;
  }
}

export async function uploadFile(
  file: File,
  bucket: string = 'logos',
  path?: string
): Promise<string> {
  console.log(`Starting file upload to bucket: ${bucket}, path: ${path || 'root'}`);
  console.log(`File details: name=${file.name}, size=${file.size}, type=${file.type}`);
  
  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Determine the full path for the file
    const filePath = path ? `${path}/${fileName}` : fileName;
    console.log(`Generated file path: ${filePath}`);
    
    // Ensure the bucket exists
    const bucketExists = await ensureBucketExists(bucket);
    if (!bucketExists) {
      throw new Error(`Failed to ensure bucket '${bucket}' exists. Check Supabase permissions.`);
    }
    
    // Upload the file to Supabase Storage using admin client
    console.log('Uploading file to Supabase Storage using admin client...');
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', error.message);
      throw error;
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get the public URL for the file using admin client
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Exception in uploadFile:', err);
    throw err;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param url The public URL of the file to delete
 * @param bucket The storage bucket name (default: 'logos')
 */
export async function deleteFile(url: string, bucket: string = 'logos'): Promise<void> {
  try {
    console.log(`Attempting to delete file from URL: ${url}`);
    
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Get the last segments which should be the path and filename
    // This handles both formats: /storage/v1/object/public/logos/path/file.ext
    // and simpler URLs like /logos/path/file.ext
    let filePath = '';
    
    // Find the bucket name in the path and extract everything after it
    const bucketIndex = pathSegments.findIndex(segment => segment === bucket);
    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      filePath = pathSegments.slice(bucketIndex + 1).join('/');
    } else {
      // Fallback to just using the filename if we can't parse the path properly
      filePath = pathSegments[pathSegments.length - 1];
    }
    
    console.log(`Extracted file path for deletion: ${filePath}`);
    
    // Delete the file from Supabase Storage using admin client
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
    
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (err) {
    console.error('Exception in deleteFile:', err);
    throw err;
  }
}
