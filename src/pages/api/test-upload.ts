import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xurgzouaxtnptnhwaaax.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cmd6b3VheHRucHRuaHdhYWF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2NzkxNCwiZXhwIjoyMDYzODQzOTE0fQ.IBHMQwjn1rbdHT71almt-9-opcVMCdx4UN6eFbXZxCg'
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = new formidable.IncomingForm();
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Log the received data
    console.log('Received form data:', { fields });
    console.log('Received files:', Object.keys(files));

    // Ensure the logos bucket exists
    await ensureBucket('logos');

    const results = {
      storage: { success: false, urls: { png: '', svg: '' } },
      database: { success: false, logo: null }
    };

    // Upload files to storage
    if (files.png && files.svg) {
      // Upload PNG file
      const pngFile = files.png as formidable.File;
      const pngPath = pngFile.filepath;
      const pngContent = fs.readFileSync(pngPath);
      const pngFileName = `test_${Date.now()}.png`;
      
      const pngUploadResult = await supabaseAdmin.storage
        .from('logos')
        .upload(`png/${pngFileName}`, pngContent, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (pngUploadResult.error) {
        console.error('PNG upload error:', pngUploadResult.error);
        return res.status(500).json({ 
          error: 'Failed to upload PNG file', 
          details: pngUploadResult.error 
        });
      }

      // Get PNG URL
      const { data: pngUrlData } = supabaseAdmin.storage
        .from('logos')
        .getPublicUrl(`png/${pngFileName}`);
      
      results.storage.urls.png = pngUrlData.publicUrl;
      
      // Upload SVG file
      const svgFile = files.svg as formidable.File;
      const svgPath = svgFile.filepath;
      const svgContent = fs.readFileSync(svgPath);
      const svgFileName = `test_${Date.now()}.svg`;
      
      const svgUploadResult = await supabaseAdmin.storage
        .from('logos')
        .upload(`svg/${svgFileName}`, svgContent, {
          contentType: 'image/svg+xml',
          upsert: true
        });
      
      if (svgUploadResult.error) {
        console.error('SVG upload error:', svgUploadResult.error);
        return res.status(500).json({ 
          error: 'Failed to upload SVG file', 
          details: svgUploadResult.error 
        });
      }

      // Get SVG URL
      const { data: svgUrlData } = supabaseAdmin.storage
        .from('logos')
        .getPublicUrl(`svg/${svgFileName}`);
      
      results.storage.urls.svg = svgUrlData.publicUrl;
      results.storage.success = true;

      // Insert into database
      const logoData = {
        name: fields.name?.[0] || 'Test Logo',
        category: fields.category?.[0] || 'Test',
        description: fields.description?.[0] || 'Test logo uploaded via API',
        png_url: results.storage.urls.png,
        svg_url: results.storage.urls.svg,
        user_id: fields.user_id?.[0] || null
      };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('logos')
        .insert([logoData])
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return res.status(500).json({
          storage: results.storage,
          database: { 
            success: false, 
            error: insertError 
          }
        });
      }

      results.database.success = true;
      results.database.logo = insertData[0];
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in test-upload API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}

// Helper function to ensure bucket exists
async function ensureBucket(bucketName: string) {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}
