// API configuration
// In development: uses localhost:8000 (default)
// In production: uses VITE_API_URL from Vercel environment variables
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
