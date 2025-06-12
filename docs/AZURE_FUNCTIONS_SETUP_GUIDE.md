# Azure Functions Setup Guide

## ⚡ Panduan Setup Azure Functions

Azure Functions menyediakan serverless compute platform untuk aplikasi VIRPAL sebagai backend API dan proxy untuk mengakses layanan Azure lainnya. Functions ini menangani chat completion, Key Vault access, dan authentication middleware.

## 🔧 Konfigurasi Dasar

### 1. Membuat Azure Functions App

```bash
# Login ke Azure
az login

# Buat storage account untuk Functions
az storage account create \
  --name "virpalfunctionsstorage" \
  --resource-group "virpal-rg" \
  --location "eastus" \
  --sku "Standard_LRS" \
  --kind "StorageV2"

# Buat Function App
az functionapp create \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --storage-account "virpalfunctionsstorage" \
  --consumption-plan-location "eastus" \
  --runtime "node" \
  --runtime-version "18" \
  --functions-version "4" \
  --os-type "Linux"
```

### 2. Enable Managed Identity

```bash
# Enable system-assigned managed identity
az functionapp identity assign \
  --name "virpal-functions" \
  --resource-group "virpal-rg"

# Dapatkan principal ID untuk role assignments
FUNCTION_PRINCIPAL_ID=$(az functionapp identity show --name "virpal-functions" --resource-group "virpal-rg" --query "principalId" -o tsv)
echo "Function Principal ID: $FUNCTION_PRINCIPAL_ID"
```

## 🔐 Konfigurasi Keamanan

### 1. Key Vault Access

```bash
# Berikan akses ke Key Vault
az keyvault set-policy \
  --name "virpal-key-vault" \
  --object-id "$FUNCTION_PRINCIPAL_ID" \
  --secret-permissions get list

# Atau menggunakan RBAC (recommended)
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.KeyVault/vaults/virpal-key-vault"
```

### 2. CORS Configuration

```bash
# Configure CORS untuk development
az functionapp cors add \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --allowed-origins "http://localhost:5173" "http://localhost:3000"

# Configure CORS untuk production
az functionapp cors add \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --allowed-origins "https://your-production-domain.com"
```

### 3. Application Settings

```bash
# Set Key Vault URL
az functionapp config appsettings set \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --settings "KEY_VAULT_URL=https://virpal-key-vault.vault.azure.net/"

# Set Node environment
az functionapp config appsettings set \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --settings "NODE_ENV=production"
```

## ⚙️ Konfigurasi Local Development

### 1. Local Settings

```json
// local.settings.json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "KEY_VAULT_URL": "https://virpal-key-vault.vault.azure.net/",
    "NODE_ENV": "development"
  },
  "Host": {
    "CORS": {
      "allowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
      "allowedHeaders": ["Content-Type", "Authorization", "Accept"],
      "supportCredentials": true
    }
  }
}
```

### 2. Host Configuration

```json
// host.json
{
  "version": "2.0",
  "functionTimeout": "00:05:00",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "http": {
    "routePrefix": "api"
  }
}
```

## 🚀 Function Implementation

### 1. Chat Completion Function

```typescript
// src/functions/chat-completion.ts
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { keyVaultService } from '../services/azureKeyVaultService';

export async function chatCompletion(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = context.invocationId;

  try {
    // Validate authentication
    const authResult = await validateAuthentication(
      request,
      context,
      requestId
    );
    if (!authResult.isAuthenticated) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required', requestId },
      };
    }

    // Get configuration from Key Vault
    const config = await getConfiguration(context);
    if (!config) {
      return {
        status: 500,
        jsonBody: { error: 'Service configuration unavailable', requestId },
      };
    }

    // Process chat completion
    const result = await processOpenAIRequest(request, config, context);

    return {
      status: 200,
      jsonBody: { success: true, data: result, requestId },
    };
  } catch (error) {
    context.error('Chat completion error:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        requestId,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

app.http('chat-completion', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: chatCompletion,
});
```

### 2. Get Secret Function

```typescript
// src/functions/get-secret.ts
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { keyVaultService } from '../services/azureKeyVaultService';

const ALLOWED_SECRETS = [
  'azure-speech-service-key',
  'azure-speech-service-region',
  'azure-openai-api-key',
  'azure-openai-endpoint',
] as const;

export async function getSecret(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const requestId = context.invocationId;

  try {
    // Validate authentication
    const authResult = await validateAuthentication(
      request,
      context,
      requestId
    );
    if (!authResult.isAuthenticated) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required', requestId },
      };
    }

    // Get secret name from query
    const secretName = request.query.get('name');
    if (!secretName || !ALLOWED_SECRETS.includes(secretName as any)) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid secret name', requestId },
      };
    }

    // Retrieve secret from Key Vault
    const secretValue = await keyVaultService.getSecret(secretName);
    if (!secretValue) {
      return {
        status: 404,
        jsonBody: { error: 'Secret not found', requestId },
      };
    }

    return {
      status: 200,
      jsonBody: { success: true, data: { value: secretValue }, requestId },
    };
  } catch (error) {
    context.error('Get secret error:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Internal server error',
        requestId,
      },
    };
  }
}

app.http('get-secret', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getSecret,
});
```

### 3. Health Check Function

```typescript
// src/functions/health.ts
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

export async function health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        keyVault: await checkKeyVaultHealth(),
        storage: await checkStorageHealth(),
      },
    };

    return {
      status: 200,
      jsonBody: healthStatus,
    };
  } catch (error) {
    return {
      status: 503,
      jsonBody: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: health,
});
```

## 📊 Monitoring

### 1. Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app "virpal-functions-insights" \
  --location "eastus" \
  --resource-group "virpal-rg" \
  --application-type "web"

# Get instrumentation key
INSIGHTS_KEY=$(az monitor app-insights component show --app "virpal-functions-insights" --resource-group "virpal-rg" --query "instrumentationKey" -o tsv)

# Configure Function App
az functionapp config appsettings set \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$INSIGHTS_KEY"
```

### 2. Custom Metrics

```typescript
// Custom telemetry tracking
import { defaultClient } from 'applicationinsights';

function trackCustomMetric(
  name: string,
  value: number,
  properties?: Record<string, string>
) {
  if (defaultClient) {
    defaultClient.trackMetric({
      name,
      value,
      properties,
    });
  }
}

// Usage example
trackCustomMetric('ChatCompletion.Duration', duration, {
  userId: authResult.userId,
  success: 'true',
});
```

### 3. Log Analytics

```typescript
// Structured logging
function logWithContext(
  context: InvocationContext,
  level: string,
  message: string,
  data?: any
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    invocationId: context.invocationId,
    functionName: context.functionName,
    level,
    message,
    ...data,
  };

  context.log(JSON.stringify(logEntry));
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors

```bash
# Verify CORS settings
az functionapp cors show --name "virpal-functions" --resource-group "virpal-rg"

# Add missing origins
az functionapp cors add --name "virpal-functions" --resource-group "virpal-rg" --allowed-origins "https://your-domain.com"
```

#### 2. Authentication Issues

```typescript
// Debug authentication
async function debugAuthentication(request: HttpRequest) {
  const authHeader = request.headers.get('Authorization');
  const hasAuth = !!authHeader;
  const tokenPreview = authHeader
    ? authHeader.substring(0, 20) + '...'
    : 'none';

  return { hasAuth, tokenPreview };
}
```

#### 3. Key Vault Access

```bash
# Verify Function App identity
az functionapp identity show --name "virpal-functions" --resource-group "virpal-rg"

# Check Key Vault access policies
az keyvault show --name "virpal-key-vault" --query "properties.accessPolicies"
```

#### 4. Cold Start Issues

```typescript
// Minimize cold start impact
import { warmupTrigger } from '@azure/functions';

// Keep connections warm
let cachedConnections: Map<string, any> = new Map();

function getOrCreateConnection(key: string, factory: () => any) {
  if (!cachedConnections.has(key)) {
    cachedConnections.set(key, factory());
  }
  return cachedConnections.get(key);
}
```

## 🎯 Validasi Setup

### Local Testing

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Start functions locally
cd virpal-app
npm run functions:build
func host start

# Test endpoints
curl "http://localhost:7071/api/health"
curl "http://localhost:7071/api/get-secret?name=azure-speech-service-key" -H "Authorization: Bearer token"
```

### Deployment Testing

```bash
# Deploy to Azure
func azure functionapp publish "virpal-functions"

# Test deployed functions
curl "https://virpal-functions.azurewebsites.net/api/health"
```

## 📋 Performance Optimization

### 1. Connection Pooling

```typescript
// Reuse HTTP clients
import { DefaultHttpClient } from '@azure/core-http';

const httpClient = new DefaultHttpClient();

// Reuse across function invocations
function getHttpClient() {
  return httpClient;
}
```

### 2. Memory Management

```typescript
// Monitor memory usage
function logMemoryUsage(context: InvocationContext) {
  const memUsage = process.memoryUsage();
  context.log('Memory usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
  });
}
```

### 3. Caching Strategy

```typescript
// In-memory caching dengan TTL
class SimpleCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  set(key: string, value: any, ttlMs: number = 300000) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}
```

---

**✅ Azure Functions siap menyediakan serverless backend yang scalable dan secure untuk aplikasi VIRPAL!**
