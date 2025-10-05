// Quick test to verify environment variables
console.log('🔍 Environment Variable Test:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_ENABLE_DEBUG:', import.meta.env.VITE_ENABLE_DEBUG);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('MODE:', import.meta.env.MODE);

// Test the config
import { config } from './src/lib/config';
console.log('📋 Config Test:', {
  baseUrl: config.api.baseUrl,
  isDev: config.isDev,
  isProd: config.isProd,
  debug: config.features.debug
});