// API configuration
// In development: uses localhost:8000 (default)
// In production: uses VITE_API_URL from Vercel environment variables
const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE = raw.replace(/\/+$/, ''); // strip trailing slash
