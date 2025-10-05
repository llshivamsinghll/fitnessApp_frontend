import { config } from './src/lib/config.js';

console.log('🔧 Environment Test Results:');
console.log('================================');

console.log('\n📊 Raw Environment Variables:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

console.log('\n⚙️ Processed Configuration:');
console.log('API Base URL:', config.api.baseUrl);
console.log('Backend URL:', config.dev.backendUrl);
console.log('Is Development:', config.isDev);
console.log('Is Production:', config.isProd);
console.log('Debug Enabled:', config.features.debug);

console.log('\n✅ Expected URLs:');
console.log('All requests should go to: https://fitness-backend-jkfm.onrender.com');

if (config.api.baseUrl.includes('fitness-backend-jkfm.onrender.com')) {
  console.log('✅ Configuration is CORRECT!');
} else {
  console.log('❌ Configuration is WRONG!');
  console.log('Current baseUrl:', config.api.baseUrl);
}