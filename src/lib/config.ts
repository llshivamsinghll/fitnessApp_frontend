// Configuration utility to centralize environment variable access

export const config = {
  // App Configuration
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'FitAI - Your Professional AI Fitness Assistant',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Get personalized workout plans and nutrition guidance powered by artificial intelligence',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:10000' : ''),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '120000'),
  },

  // Development Configuration
  dev: {
    port: parseInt(import.meta.env.VITE_DEV_PORT || '8080'),
    host: import.meta.env.VITE_DEV_HOST || '::',
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000',
  },

  // Authentication Configuration
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
    sessionTimeout: import.meta.env.VITE_SESSION_TIMEOUT || '24h',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
  },

  // External Services
  external: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  },

  // Environment Checks
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  isSSR: import.meta.env.SSR,
} as const;

// Debug configuration when debug is enabled (dev or prod)
if (config.features.debug) {
  console.log('🔧 App Configuration:', {
    ...config,
    env: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE
    }
  });
}

export default config;
