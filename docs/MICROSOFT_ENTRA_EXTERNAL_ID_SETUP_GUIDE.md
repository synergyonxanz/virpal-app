# Microsoft Entra External ID Setup Guide

## 🔐 Panduan Setup Microsoft Entra External ID

Microsoft Entra External ID (sebelumnya Azure AD B2C) menyediakan identity and access management untuk aplikasi VIRPAL dengan user flows yang disesuaikan untuk external users. Service ini menangani authentication, user registration, dan profile management.

## 🔧 Konfigurasi Dasar

### 1. Membuat External ID Tenant

```bash
# Login ke Azure
az login

# Create resource group untuk External ID
az group create --name "virpal-identity-rg" --location "global"

# Create External ID tenant (melalui Azure Portal)
# 1. Browse ke Azure Portal > Microsoft Entra External ID
# 2. Create new External ID tenant
# 3. Pilih nama: virpalapp
# 4. Domain: virpalapp.onmicrosoft.com
```

### 2. Konfigurasi Custom Domain (Opsional)

```bash
# Add custom domain
az ad domain add --domain-name "auth.virpal.com"

# Verify domain ownership
az ad domain verify --domain-name "auth.virpal.com"
```

## 🔐 Konfigurasi Application Registration

### 1. Register Application

```bash
# Switch ke External ID tenant
az login --tenant "virpalapp.onmicrosoft.com"

# Create app registration
az ad app create \
  --display-name "VIRPAL App" \
  --sign-in-audience "AzureADandPersonalMicrosoftAccount" \
  --web-redirect-uris "http://localhost:5173" "https://your-production-domain.com" \
  --public-client-redirect-uris "http://localhost:5173/redirect"

# Dapatkan Application ID
APP_ID=$(az ad app list --display-name "VIRPAL App" --query "[0].appId" -o tsv)
echo "Application ID: $APP_ID"
```

### 2. Configure API Permissions

```bash
# Add Microsoft Graph permissions
az ad app permission add \
  --id "$APP_ID" \
  --api "00000003-0000-0000-c000-000000000000" \
  --api-permissions "e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope"

# Grant admin consent
az ad app permission admin-consent --id "$APP_ID"
```

### 3. Configure Authentication

```bash
# Enable implicit flow (untuk SPA)
az ad app update --id "$APP_ID" \
  --set "spa.redirectUris=[\"http://localhost:5173\",\"https://your-production-domain.com\"]"

# Set logout URL
az ad app update --id "$APP_ID" \
  --set "web.logoutUrl=\"http://localhost:5173/logout\""
```

## ⚙️ User Flow Configuration

### 1. Create Sign-up/Sign-in User Flow

```json
// User flow configuration (via Azure Portal)
{
  "name": "B2C_1_signupsignin_virpal",
  "type": "signUpOrSignIn",
  "identityProviders": ["Email"],
  "userAttributes": ["Email Address", "Display Name", "Given Name", "Surname"],
  "applicationClaims": [
    "Email Addresses",
    "Display Name",
    "Given Name",
    "Surname",
    "User's Object ID"
  ],
  "pageLayoutVersion": "2.1.4",
  "localAccountSignUpEnabled": true
}
```

### 2. Customize User Interface

```html
<!-- Custom page template -->
<!DOCTYPE html>
<html>
  <head>
    <title>VIRPAL - Sign In</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://your-cdn.com/virpal-auth.css" />
  </head>
  <body>
    <div class="container">
      <div class="brand-logo">
        <img src="https://your-cdn.com/virpal-logo.png" alt="VIRPAL" />
      </div>
      <div id="api"></div>
    </div>
  </body>
</html>
```

## 🔐 Konfigurasi Aplikasi

### 1. MSAL Configuration

```typescript
// src/config/msalConfig.ts
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.VITE_MSAL_CLIENT_ID,
    authority: 'https://virpalapp.ciamlogin.com/virpalapp.onmicrosoft.com/',
    knownAuthorities: ['virpalapp.ciamlogin.com'],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
    clientCapabilities: ['CP1'],
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
    secureCookies: window.location.protocol === 'https:',
    temporaryCacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) {
          logger.error('MSAL Error occurred');
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
  },
};
```

### 2. Authentication Service

```typescript
// src/services/authService.ts
class AuthenticationService {
  private msalInstance: PublicClientApplication;
  private currentAccount: AccountInfo | null = null;

  constructor() {
    if (!validateMsalConfig()) {
      throw new Error('Invalid MSAL configuration');
    }

    this.msalInstance = new PublicClientApplication(msalConfig);
    this.initializationPromise = this.initializeMsal();
  }

  async loginWithPopup(): Promise<ExtendedAuthResult> {
    try {
      this.metrics.loginAttempts++;

      const response = await this.msalInstance.loginPopup(loginRequest);

      if (response.account) {
        this.currentAccount = response.account;
        this.msalInstance.setActiveAccount(response.account);
        this.metrics.successfulLogins++;

        return this.mapToExtendedResult(response);
      }

      throw new Error('Login failed - no account returned');
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.currentAccount) return null;

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...silentRequest,
        account: this.currentAccount,
      });

      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback ke popup
        const response = await this.msalInstance.acquireTokenPopup(
          loginRequest
        );
        return response.accessToken;
      }
      throw error;
    }
  }
}
```

### 3. Environment Variables

```bash
# .env file
VITE_MSAL_CLIENT_ID=your-application-id
VITE_TENANT_NAME=virpalapp
VITE_TENANT_DOMAIN=virpalapp.ciamlogin.com
VITE_USER_FLOW_NAME=B2C_1_signupsignin_virpal
VITE_BACKEND_SCOPE=https://virpalapp.onmicrosoft.com/virpal-api/user.read
```

## 🚀 Best Practices

### 1. Token Management

```typescript
// Token caching dengan expiry check
class TokenCache {
  private cache = new Map<string, { token: string; expiry: number }>();

  set(key: string, token: string, expiresOn: Date) {
    this.cache.set(key, {
      token,
      expiry: expiresOn.getTime(),
    });
  }

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() >= cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.token;
  }
}
```

### 2. Error Handling

```typescript
// Comprehensive error handling
private handleAuthError(error: unknown): void {
  if (error instanceof BrowserAuthError) {
    switch (error.errorCode) {
      case 'user_cancelled':
        // User cancelled - tidak perlu log error
        break;
      case 'popup_window_error':
        logger.warn('Popup blocked - suggest redirect flow');
        break;
      default:
        logger.error(`Auth error: ${error.errorCode}`);
    }
  } else if (error instanceof AuthError) {
    logger.error(`MSAL error: ${error.errorCode}`);
  } else {
    logger.error('Unknown authentication error');
  }
}
```

### 3. User Profile Management

```typescript
// Extract user profile dari claims
getUserProfile(): UserProfile | null {
  if (!this.currentAccount) return null;

  return {
    id: this.currentAccount.username || this.currentAccount.homeAccountId,
    email: this.currentAccount.username,
    username: this.currentAccount.username,
    displayName: this.currentAccount.name,
    tenantId: this.currentAccount.tenantId
  };
}
```

## 📊 Monitoring

### 1. Authentication Metrics

```typescript
// Track authentication metrics
private metrics = {
  loginAttempts: 0,
  successfulLogins: 0,
  tokenRefreshCount: 0,
  silentTokenSuccess: 0,
  silentTokenFailures: 0
};

getMetrics() {
  return {
    ...this.metrics,
    successRate: this.metrics.loginAttempts > 0
      ? (this.metrics.successfulLogins / this.metrics.loginAttempts) * 100
      : 0
  };
}
```

### 2. User Journey Analytics

```typescript
// Track user authentication journey
function trackAuthEvent(event: string, properties?: Record<string, any>) {
  logger.info('Auth event', {
    event,
    timestamp: new Date().toISOString(),
    ...properties,
  });

  // Send to analytics service
  if (window.gtag) {
    window.gtag('event', event, properties);
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Issues dengan Popup

```typescript
// Solusi: Configure popup window attributes
const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile'],
  popupWindowAttributes: {
    popupSize: {
      height: 600,
      width: 500,
    },
    popupPosition: {
      top: 100,
      left: 100,
    },
  },
};
```

#### 2. Token Expiry Issues

```typescript
// Solusi: Proactive token refresh
async function ensureValidToken(): Promise<string | null> {
  const cached = this.getCachedToken();
  if (cached) return cached;

  // Token expired atau tidak ada, refresh
  try {
    return await this.getAccessToken();
  } catch (error) {
    // Force re-authentication
    await this.loginWithPopup();
    return await this.getAccessToken();
  }
}
```

#### 3. User Flow Errors

```bash
# Debug user flow issues
# 1. Check user flow configuration di Azure Portal
# 2. Verify redirect URIs
# 3. Check application permissions
az ad app show --id "$APP_ID" --query "{redirectUris:spa.redirectUris,permissions:requiredResourceAccess}"
```

#### 4. Silent Authentication Failures

```typescript
// Solusi: Fallback strategy
async function acquireTokenWithFallback(): Promise<string> {
  try {
    // Try silent first
    const response = await this.msalInstance.acquireTokenSilent(silentRequest);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Fallback ke popup
      const response = await this.msalInstance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
    throw error;
  }
}
```

## 🎯 Validasi Setup

### Test Authentication Flow

```typescript
// Test complete authentication flow
async function testAuthFlow(): Promise<boolean> {
  try {
    // Test login
    const loginResult = await authService.loginWithPopup();
    console.log('✅ Login successful:', loginResult.account?.username);

    // Test token acquisition
    const token = await authService.getAccessToken();
    console.log('✅ Token acquired:', token ? 'Yes' : 'No');

    // Test user profile
    const profile = authService.getUserProfile();
    console.log('✅ User profile:', profile);

    // Test logout
    await authService.logout();
    console.log('✅ Logout successful');

    return true;
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
    return false;
  }
}
```

### Browser Console Testing

```javascript
// Test di browser console
// Check MSAL configuration
console.log(
  'MSAL Config Valid:',
  window.authService?.getInitializationStatus()
);

// Test authentication
await window.authService?.loginWithPopup();

// Check user profile
console.log('User Profile:', window.authService?.getUserProfile());

// Test token
const token = await window.authService?.getAccessToken();
console.log('Access Token:', token ? 'Available' : 'Not available');
```

## 📋 Security Checklist

- [ ] ✅ **Application registered with correct redirect URIs**
- [ ] ✅ **User flow configured with required attributes**
- [ ] ✅ **Token caching implemented securely**
- [ ] ✅ **Silent authentication dengan fallback**
- [ ] ✅ **Proper error handling untuk auth failures**
- [ ] ✅ **HTTPS enforced untuk production**
- [ ] ✅ **Token expiry handling implemented**
- [ ] ✅ **User session management**

---

**✅ Microsoft Entra External ID siap menyediakan authentication yang secure dan user-friendly untuk aplikasi VIRPAL!**
