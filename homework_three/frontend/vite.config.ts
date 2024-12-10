import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 3000,        // Ensure this matches Docker port mapping
    strictPort: true,  // Fail if port is in use
    hmr: {
      host: 'localhost',  // Adjust based on your network setup
      protocol: 'ws',     // WebSocket protocol
      port: 3000,         // HMR port (same as dev server)
    },
  },
});