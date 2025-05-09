import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://puryyzvcuodyaojskzbc.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cnl5enZjdW9keWFvanNremJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTk3NjAsImV4cCI6MjA2MjI5NTc2MH0.9xyxxNF1AMDL1hhVAMHzHZx76Nhpz8UTr-K80ol8c3E';
export const SUPABASE_BUCKET_NAME = 'gallery';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);