import { supabase } from './supabase';

export interface Logo {
  id: string;
  name: string;
  category: string;
  png_url?: string;
  svg_url?: string;
  description?: string;
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
    .order('name');
  
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
  const { data, error } = await supabase
    .from('logos')
    .insert([logo])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding logo:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update an existing logo
 */
export async function updateLogo(id: string, updates: Partial<Omit<Logo, 'id' | 'created_at' | 'updated_at'>>): Promise<Logo> {
  const { data, error } = await supabase
    .from('logos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
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
  const { error } = await supabase
    .from('logos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting logo with ID ${id}:`, error);
    throw error;
  }
}
