
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // Ép buộc chạy port 5173 để khớp với Supabase Redirect
    strictPort: true, // Nếu port 5173 bận, sẽ báo lỗi thay vì nhảy sang 5174
    host: true,       // Mở kết nối mạng (Fix lỗi localhost connection refused)
  },
});
