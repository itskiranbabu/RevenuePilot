import { createClient } from '@supabase/supabase-js';

// Configuration with provided credentials
const supabaseUrl = process.env.SUPABASE_URL || "https://hqurxxzpljqensduuekw.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdXJ4eHpwbGpxZW5zZHV1ZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTE3MDMsImV4cCI6MjA4MDQyNzcwM30.2NKXaS53eWUTel6jNZAd7r8eHZ0YVnVhrECm1Ve2yWw";

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);