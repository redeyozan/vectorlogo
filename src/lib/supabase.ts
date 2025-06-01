import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xurgzouaxtnptnhwaaax.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cmd6b3VheHRucHRuaHdhYWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjc5MTQsImV4cCI6MjA2Mzg0MzkxNH0.dnm5KYWDlBTye4kqCW8Z8CHjQlItaYxa6JMfl0RwDX8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
