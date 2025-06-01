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
    // Check database connection
    const { data: tables, error: tablesError } = await supabaseAdmin.from('logos').select('count');
    
    if (tablesError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to connect to database',
        details: tablesError
      });
    }

    // Try to insert a test logo if requested
    if (req.body.testInsert) {
      const testLogo = {
        name: 'Test Logo ' + new Date().toISOString(),
        category: 'Test',
        description: 'Test logo for database check',
        png_url: 'https://example.com/test.png',
        svg_url: 'https://example.com/test.svg',
        user_id: req.body.userId || null
      };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('logos')
        .insert([testLogo])
        .select();

      if (insertError) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to insert test logo',
          details: insertError,
          connectionOk: true
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Database connection and insert test successful',
        insertedLogo: insertData
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to check database',
      details: error
    });
  }
}
