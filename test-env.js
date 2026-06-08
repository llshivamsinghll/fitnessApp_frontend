import { config } from './src/lib/config.js';

console.log('Environment Test Results');
console.log('================================');

console.log('\nRaw Environment Variables:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

console.log('\nProcessed Configuration:');
console.log('API Base URL:', config.api.baseUrl);
console.log('Backend URL:', config.dev.backendUrl);
console.log('Is Development:', config.isDev);
console.log('Is Production:', config.isProd);
console.log('Debug Enabled:', config.features.debug);

const expectedHost = import.meta.env.DEV
  ? 'localhost:10000'
  : 'fitness-backend-jkfm.onrender.com';

console.log('\nExpected URL:');
console.log(
  import.meta.env.DEV
    ? 'Development requests should go to: http://localhost:10000'
    : 'Production requests should go to: https://fitness-backend-jkfm.onrender.com'
);

if (config.api.baseUrl.includes(expectedHost)) {
  console.log('Configuration is correct.');
} else {
  console.log('Configuration is wrong.');
  console.log('Current baseUrl:', config.api.baseUrl);
}
