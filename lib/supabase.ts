
import { createClient } from '@supabase/supabase-js';

// THÔNG TIN CẤU HÌNH SUPABASE
// Bạn lấy các thông tin này tại: Supabase Dashboard -> Project Settings -> API

const supabaseUrl = 'https://rlzwmldvrxdlvosottrt.supabase.co';

// QUAN TRỌNG: Thay thế chuỗi bên dưới bằng "anon" public key của bạn (bắt đầu bằng eyJ...)
// Key hiện tại 'sb_publishable...' có vẻ không đúng định dạng chuẩn của Supabase.
const supabaseKey = 'sb_publishable_Xnb9fZ85X_em1AggmXf8qA_rJxG8asd'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
