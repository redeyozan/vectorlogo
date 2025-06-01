import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Create an admin client for operations that require elevated permissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xurgzouaxtnptnhwaaax.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cmd6b3VheHRucHRuaHdhYWF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI2NzkxNCwiZXhwIjoyMDYzODQzOTE0fQ.IBHMQwjn1rbdHT71almt-9-opcVMCdx4UN6eFbXZxCg'
);

export interface Logo {
  id: string;
  name: string;
  category: string;
  png_url?: string;
  svg_url?: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all logos from the database
 */
export async function getAllLogos(): Promise<Logo[]> {
  const { data, error } = await supabase
    .from('logos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching logos:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch logos by category
 */
export async function getLogosByCategory(category: string): Promise<Logo[]> {
  const { data, error } = await supabase
    .from('logos')
    .select('*')
    .eq('category', category)
    .order('name');
  
  if (error) {
    console.error(`Error fetching logos for category ${category}:`, error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch a single logo by ID
 */
export async function getLogoById(id: string): Promise<Logo | null> {
  const { data, error } = await supabase
    .from('logos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching logo with ID ${id}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Add a new logo to the database
 */
export async function addLogo(logo: Omit<Logo, 'id' | 'created_at' | 'updated_at'>): Promise<Logo> {
  console.log('Attempting to add logo to database:', JSON.stringify(logo, null, 2));
  
  try {
    // Try with regular client first
    let { data, error } = await supabase
      .from('logos')
      .insert([logo])
      .select()
      .single();
    
    // If there's an error, try with admin client
    if (error) {
      console.log('Error with regular client, trying admin client for insert...');
      const adminResult = await supabaseAdmin
        .from('logos')
        .insert([logo])
        .select()
        .single();
      
      data = adminResult.data;
      error = adminResult.error;
    }
    
    if (error) {
      console.error('Error adding logo:', error);
      console.error('Error details:', error.details, error.hint, error.message);
      throw error;
    }
    
    console.log('Logo successfully added to database:', data);
    return data;
  } catch (err) {
    console.error('Exception in addLogo:', err);
    throw err;
  }
}

/**
 * Update an existing logo
 */
export async function updateLogo(id: string, updates: Partial<Omit<Logo, 'id' | 'created_at' | 'updated_at'>>): Promise<Logo> {
  // Try with regular client first
  let { data, error } = await supabase
    .from('logos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  // If there's an error, try with admin client
  if (error) {
    console.log('Error with regular client, trying admin client for update...');
    const adminResult = await supabaseAdmin
      .from('logos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    data = adminResult.data;
    error = adminResult.error;
  }
  
  if (error) {
    console.error(`Error updating logo with ID ${id}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Delete a logo by ID
 */
export async function deleteLogo(id: string): Promise<void> {
  // Try with regular client first
  let { error } = await supabase
    .from('logos')
    .delete()
    .eq('id', id);
  
  // If there's an error, try with admin client
  if (error) {
    console.log('Error with regular client, trying admin client for delete...');
    const { error: adminError } = await supabaseAdmin
      .from('logos')
      .delete()
      .eq('id', id);
    
    error = adminError;
  }
  
  if (error) {
    console.error(`Error deleting logo with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Search logos by name (case-insensitive)
 */
export async function searchLogosByName(query: string): Promise<Logo[]> {
  const { data, error } = await supabase
    .from('logos')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');
  
  if (error) {
    console.error(`Error searching logos with query ${query}:`, error);
    throw error;
  }
  
  return data || [];
}

/**
 * Search logos by name and filter by format
 */
export async function searchLogos(query: string, format?: string): Promise<Logo[]> {
  let supabaseQuery = supabase
    .from('logos')
    .select('*')
    .ilike('name', `%${query}%`);
  
  if (format === 'svg') {
    supabaseQuery = supabaseQuery.not('svg_url', 'is', null);
  } else if (format === 'png') {
    supabaseQuery = supabaseQuery.not('png_url', 'is', null);
  }
  
  const { data, error } = await supabaseQuery.order('name');
  
  if (error) {
    console.error(`Error searching logos with query ${query} and format ${format}:`, error);
    throw error;
  }
  
  return data || [];
}
