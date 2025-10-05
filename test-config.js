import { config } from './src/lib/config.js';

console.log('🔧 Configuration Test:');
console.log('Current config:', {
  isDev: config.isDev,
  isProd: config.isProd,
  baseUrl: config.api.baseUrl,
  backendUrl: config.dev.backendUrl,
  debug: config.features.debug
});

console.log('\n📊 Environment Variables:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);