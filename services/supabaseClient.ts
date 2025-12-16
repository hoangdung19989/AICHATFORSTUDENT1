import { createClient } from '@supabase/supabase-js';
import { API_KEYS } from '../config';

const getSupabaseVar = (key: 'URL' | 'ANON_KEY'): string | undefined => {
    const constKey = `SUPABASE_${key}` as const;
    const constPlaceholder = `YOUR_SUPABASE_${key}_HERE`;
    if (API_KEYS[constKey] && API_KEYS[constKey] !== constPlaceholder) {
        return API_KEYS[constKey];
    }
    
    const viteKey = `VITE_SUPABASE_${key}`;
    const viteEnv = (import.meta as any).env?.[viteKey];
    const processEnv = (process as any).env?.[viteKey];
    
    return viteEnv || processEnv;
};

const supabaseUrl = getSupabaseVar('URL');
const supabaseAnonKey = getSupabaseVar('ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Cảnh báo: Thiếu thông tin kết nối Supabase. Hãy điền vào file config.ts hoặc cấu hình trên Vercel. Tính năng đăng nhập sẽ không hoạt động.');
}

// Cast to any to bypass type issues where SupabaseAuthClient definitions are missing methods
export const supabase: any = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);