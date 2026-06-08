import { config } from './config';

// Simple function to test environment configuration
export function testApiConfiguration() {
  console.log('🧪 Testing API Configuration...');
  
  const results = {
    environment: {
      isDev: config.isDev,
      isProd: config.isProd,
      mode: import.meta.env.MODE
    },
    envVars: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL
    },
    config: {
      apiBaseUrl: config.api.baseUrl,
      devBackendUrl: config.dev.backendUrl,
      debugEnabled: config.features.debug
    }
  };
  
  console.table(results.environment);
  console.table(results.envVars);
  console.table(results.config);
  
  // Test URL construction
  const testPath = '/api/user/login';
  let testUrl = '';
  
  const backendUrl = config.api.baseUrl || config.dev.backendUrl;
  const cleanPath = testPath.startsWith('/api') ? testPath.substring(4) : testPath;
  testUrl = `${backendUrl}/api${cleanPath}`;
  
  console.log('🎯 Test URL would be:', testUrl);
  
  return results;
}

// Call this function to test configuration
if (typeof window !== 'undefined') {
  (window as any).testApiConfig = testApiConfiguration;
  console.log('💡 Run testApiConfig() in console to test configuration');
}
