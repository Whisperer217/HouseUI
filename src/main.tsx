import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 40px; font-family: system-ui; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ Configuration Error</h1>
      <p style="margin-bottom: 15px; font-size: 16px;">Missing Supabase environment variables.</p>
      <p style="margin-bottom: 20px;">Please set the following in your Vercel project settings:</p>
      <ul style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <li style="margin: 10px 0;"><strong>VITE_SUPABASE_URL</strong>: ${supabaseUrl || 'NOT SET'}</li>
        <li style="margin: 10px 0;"><strong>VITE_SUPABASE_ANON_KEY</strong>: ${supabaseKey ? 'SET' : 'NOT SET'}</li>
      </ul>
      <p>Go to: <strong>Vercel Dashboard → Your Project → Settings → Environment Variables</strong></p>
    </div>
  `;
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
