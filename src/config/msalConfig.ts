/**
 * MSAL Configuration for Azur// Authority URL για Azure Entra External ID (CIAM)
// For CIAM, the correct format is: https://yourtenant.ciamlogin.com/yourtenant.onmicrosoft.com/
const authority = `https://${tenantDomain}/${tenantName}.onmicrosoft.com/`;ntra External ID
 * 
 * Konfigurasi untuk Azure Microsoft Entra External ID authentication
 * menggunakan Microsoft Authentication Library (MSAL) untuk React
 * 
 * Best Practices Applied:
 * - Environment-based configuration
 * - Secure token handling
 * - Proper scope configuration
 * - B2C user flow integration
 * - Cache optimization
 */

import { LogLevel } from '@azure/msal-browser';
import { logger } from '../utils/logger';
import type { Configuration, PopupRequest, SilentRequest } from '@azure/msal-browser';

// Environment variables dengan fallback values
const clientId = import.meta.env['VITE_MSAL_CLIENT_ID'] || '';
const tenantName = import.meta.env['VITE_TENANT_NAME'] || '';
const tenantDomain = import.meta.env['VITE_TENANT_DOMAIN'] || '';
const userFlowName = import.meta.env['VITE_USER_FLOW_NAME'] || '';
const backendScope = import.meta.env['VITE_BACKEND_SCOPE'] || '';

// Validasi environment variables
if (!clientId || !tenantName || !tenantDomain || !userFlowName || !backendScope) {
  logger.error('Missing required MSAL environment variables');
  logger.error('Configuration validation failed', {
    hasClientId: !!clientId,
    hasTenantName: !!tenantName,
    hasTenantDomain: !!tenantDomain,
    hasUserFlowName: !!userFlowName,
    hasBackendScope: !!backendScope
  });
  throw new Error('Missing required MSAL configuration');
}

// Authority URL untuk Azure Entra External ID (CIAM)
// For CIAM, the correct format is: https://yourtenant.ciamlogin.com/yourtenant.onmicrosoft.com/
// User flow is specified in extraQueryParameters instead of authority URL
const authority = `https://${tenantDomain}/${tenantName}.onmicrosoft.com/`;

// Redirect URIs
const redirectUri = window.location.origin;
const postLogoutRedirectUri = window.location.origin;

/**
 * MSAL Configuration Object
 * Konfigurasi utama untuk MSAL instance
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: authority,
    knownAuthorities: [tenantDomain], // Use CIAM domain
    redirectUri: redirectUri,
    postLogoutRedirectUri: postLogoutRedirectUri,
    navigateToLoginRequestUrl: false, // Prevent redirect loops
    clientCapabilities: ['CP1'], // Required for CIAM
  },
  cache: {
    cacheLocation: 'localStorage', // or 'sessionStorage'
    storeAuthStateInCookie: false, // Set to true for IE11 compatibility
    secureCookies: window.location.protocol === 'https:', // Secure cookies untuk production
    temporaryCacheLocation: 'sessionStorage', // Meningkatkan keamanan untuk temporary cache
  },  system: {    loggerOptions: {
      loggerCallback: (level, _message, containsPii) => {
        if (containsPii) return; // Skip PII logs completely
        
        // Use centralized logger with secure message handling
        if (level === LogLevel.Error) {
          logger.error('MSAL Error occurred');
        } else if (level === LogLevel.Warning && import.meta.env.DEV) {
          logger.warn('MSAL Warning occurred');
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
    },
    windowHashTimeout: 60000, // Increase timeout for popup windows
    iframeHashTimeout: 6000,
  },
};

/**
 * Scopes untuk akses ke backend API
 */
export const apiScopes = [backendScope];

/**
 * Default scopes yang selalu diminta
 */
export const defaultScopes = ['openid'];

/**
 * Login Request Configuration
 * Konfigurasi untuk login popup
 */
export const loginRequest: PopupRequest = {
  scopes: [...defaultScopes, ...apiScopes],
  prompt: 'select_account', // Use select_account instead of login for better UX
  extraQueryParameters: {
    p: userFlowName, // Specify the user flow for CIAM
  },
  // Add popup window configuration for better CIAM compatibility
  popupWindowAttributes: {
    popupSize: {
      height: 500, // Adjusted height for better fit
      width: 596.99999, // Adjusted width for better fit
    }
  }
};

/**
 * Silent Token Request Configuration
 * Konfigurasi untuk silent token acquisition
 */
export const silentRequest: SilentRequest = {
  scopes: [...defaultScopes, ...apiScopes],
  forceRefresh: false, // Set to true to force refresh
  extraQueryParameters: {
    p: userFlowName, // Specify the user flow for CIAM
  },
};

/**
 * Logout Request Configuration
 */
export const logoutRequest = {
  postLogoutRedirectUri: postLogoutRedirectUri,
};

/**
 * Graph API Scopes (jika diperlukan)
 */
export const graphScopes = ['User.Read'];

/**
 * Protected Resources Configuration
 * Konfigurasi untuk resource yang dilindungi
 */
export const protectedResources = {
  virpalApi: {
    endpoint: import.meta.env.VITE_AZURE_FUNCTION_ENDPOINT || '',
    scopes: apiScopes,
  },
} as const;

/**
 * Navigation client untuk custom navigation behavior
 */
export const navigationClient = {
  navigateToLoginRequestUrl: false,
};

/**
 * Helper function untuk validasi konfigurasi
 */
export const validateMsalConfig = (): boolean => {
  try {
    const requiredFields = {
      clientId,
      tenantName,
      userFlowName,
      backendScope,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        logger.error(`Missing required MSAL config field: ${key}`);
        return false;
      }
    }    // Validasi format authority URL untuk CIAM
    const url = new URL(authority);
    if (!url.hostname.includes('.ciamlogin.com')) {
      logger.error('Invalid authority URL format for CIAM');
      return false;
    }

    // Verify authority doesn't include the user flow (should be in extraQueryParameters)
    if (url.pathname.includes(userFlowName)) {
      logger.error('User flow should not be in authority URL for CIAM');
      return false;
    }

    return true;
  } catch (error) {
    logger.error('MSAL config validation error');
    return false;
  }
};

/**
 * Development helper untuk debugging - Note: Only use in development
 */
export const msalDebugInfo = {
  environment: import.meta.env.MODE,
  hasClientId: !!clientId,
  hasAuthority: !!authority,
  hasRedirectUri: !!redirectUri,
  scopeCount: apiScopes.length,
};

// Only log configuration in development mode with minimal output
if (import.meta.env.DEV) {
  logger.info('MSAL Configuration loaded');
}
