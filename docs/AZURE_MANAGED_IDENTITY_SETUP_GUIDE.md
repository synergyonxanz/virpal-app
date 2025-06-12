# Azure Managed Identity Setup Guide

## 🔐 Panduan Setup Azure Managed Identity

Azure Managed Identity menyediakan identity yang dikelola Azure untuk aplikasi VIRPAL, memungkinkan akses aman ke layanan Azure lainnya tanpa perlu menyimpan credentials dalam kode. Service ini menggunakan System-assigned Managed Identity untuk Azure Functions.

## 🔧 Konfigurasi Dasar

### 1. Enable System-assigned Managed Identity

```bash
# Login ke Azure
az login

# Enable system-assigned managed identity untuk Function App
az functionapp identity assign \
  --name "virpal-functions" \
  --resource-group "virpal-rg"

# Dapatkan Principal ID untuk role assignments
FUNCTION_PRINCIPAL_ID=$(az functionapp identity show \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --query "principalId" -o tsv)

echo "Function App Principal ID: $FUNCTION_PRINCIPAL_ID"
```

### 2. Verifikasi Managed Identity

```bash
# Check managed identity status
az functionapp identity show \
  --name "virpal-functions" \
  --resource-group "virpal-rg" \
  --query "{principalId:principalId,tenantId:tenantId,type:type}"
```

## 🔐 Konfigurasi Role Assignments

### 1. Key Vault Access

```bash
# Berikan akses Key Vault Secrets User
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.KeyVault/vaults/virpal-key-vault"

# Verifikasi role assignment
az role assignment list \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --output table
```

### 2. Azure OpenAI Access

```bash
# Berikan akses Cognitive Services OpenAI User
az role assignment create \
  --role "Cognitive Services OpenAI User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.CognitiveServices/accounts/virpal-openai"
```

### 3. Azure Speech Service Access

```bash
# Berikan akses Cognitive Services Speech User
az role assignment create \
  --role "Cognitive Services Speech User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.CognitiveServices/accounts/virpal-speech"
```

### 4. Azure Cosmos DB Access

```bash
# Berikan akses Cosmos DB Built-in Data Contributor
az role assignment create \
  --role "Cosmos DB Built-in Data Contributor" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.DocumentDB/databaseAccounts/virpal-cosmos"
```

## ⚙️ Implementasi dalam Kode

### 1. DefaultAzureCredential Configuration

```typescript
// src/services/azureKeyVaultService.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

class AzureKeyVaultService {
  private secretClient: SecretClient | null = null;
  private keyVaultUrl: string;
  private credential: DefaultAzureCredential;

  constructor() {
    this.keyVaultUrl = process.env['KEY_VAULT_URL'] || '';

    // Initialize DefaultAzureCredential dengan proper options
    const azureClientId = process.env['AZURE_CLIENT_ID'];

    if (azureClientId) {
      // User-assigned managed identity
      this.credential = new DefaultAzureCredential({
        managedIdentityClientId: azureClientId,
      });
    } else {
      // System-assigned managed identity (default)
      this.credential = new DefaultAzureCredential();
    }

    if (this.keyVaultUrl) {
      this.secretClient = new SecretClient(this.keyVaultUrl, this.credential);
    }
  }

  async getSecret(secretName: string): Promise<string | null> {
    try {
      if (!this.secretClient) {
        throw new Error('Key Vault client not initialized');
      }

      const secret = await this.secretClient.getSecret(secretName);
      return secret.value || null;
    } catch (error) {
      console.error(`Failed to get secret ${secretName}:`, error);
      return null;
    }
  }
}
```

### 2. Authentication Chain Priority

```typescript
// DefaultAzureCredential authentication chain:
// 1. Environment Variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
// 2. Managed Identity (System-assigned atau User-assigned)
// 3. Azure CLI (untuk local development)
// 4. Visual Studio Code (untuk local development)
// 5. Azure PowerShell (untuk local development)

const credential = new DefaultAzureCredential({
  // Options untuk fine-tune authentication
  managedIdentityClientId: process.env['AZURE_CLIENT_ID'], // Optional untuk user-assigned
  tenantId: process.env['AZURE_TENANT_ID'], // Optional untuk multi-tenant
  additionallyAllowedTenants: ['*'], // Allow cross-tenant authentication

  // Exclude tertentu credentials untuk debugging
  excludeEnvironmentCredential: false,
  excludeManagedIdentityCredential: false,
  excludeAzureCliCredential: false,
  excludeVisualStudioCodeCredential: false,
});
```

### 3. Cosmos DB dengan Managed Identity

```typescript
// src/services/azureCosmosDbService.ts
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

class AzureCosmosDbService {
  private client: CosmosClient | null = null;
  private credential: DefaultAzureCredential;

  constructor() {
    this.credential = new DefaultAzureCredential();
  }

  async initializeClient(): Promise<void> {
    if (!this.config?.endpoint) {
      throw new Error('Cosmos DB endpoint not configured');
    }

    // Use managed identity untuk authentication
    this.client = new CosmosClient({
      endpoint: this.config.endpoint,
      aadCredentials: this.credential, // Managed Identity authentication
      connectionPolicy: {
        connectionMode: ConnectionMode.Direct,
        requestTimeout: 10000,
      },
      consistencyLevel: 'Session',
    });
  }
}
```

## 🚀 Best Practices

### 1. Credential Chain Optimization

```typescript
// Optimize credential chain untuk production
const productionCredential = new DefaultAzureCredential({
  // Disable local development credentials di production
  excludeAzureCliCredential: true,
  excludeVisualStudioCodeCredential: true,
  excludeAzurePowerShellCredential: true,

  // Focus pada managed identity dan environment variables
  excludeEnvironmentCredential: false,
  excludeManagedIdentityCredential: false,
});
```

### 2. Error Handling untuk Authentication

```typescript
// Robust error handling untuk credential failures
async function authenticateWithRetry<T>(
  operation: (credential: DefaultAzureCredential) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const credential = new DefaultAzureCredential();
      return await operation(credential);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof AuthenticationError) {
        // Authentication errors biasanya tidak recoverable
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

### 3. Token Caching

```typescript
// Token caching untuk performance optimization
class ManagedIdentityTokenCache {
  private tokenCache = new Map<
    string,
    {
      token: string;
      expiresAt: number;
    }
  >();

  async getToken(
    resource: string,
    credential: DefaultAzureCredential
  ): Promise<string> {
    const cached = this.tokenCache.get(resource);

    // Check if token masih valid (dengan 5 menit buffer)
    if (cached && Date.now() < cached.expiresAt - 300000) {
      return cached.token;
    }

    // Get fresh token
    const tokenResponse = await credential.getToken(resource);

    this.tokenCache.set(resource, {
      token: tokenResponse.token,
      expiresAt: tokenResponse.expiresOnTimestamp,
    });

    return tokenResponse.token;
  }
}
```

## 📊 Monitoring

### 1. Authentication Monitoring

```typescript
// Monitor managed identity authentication
function logAuthenticationAttempt(
  resource: string,
  success: boolean,
  error?: Error,
  duration?: number
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    resource,
    success,
    duration,
    authMethod: 'ManagedIdentity',
    errorCode: error?.message || null,
  };

  console.log('Auth attempt:', JSON.stringify(logEntry));

  // Send to monitoring service
  if (process.env['APPLICATIONINSIGHTS_CONNECTION_STRING']) {
    // Track custom metric
    trackAuthenticationMetric(logEntry);
  }
}
```

### 2. Token Usage Analytics

```typescript
// Track token usage patterns
class TokenAnalytics {
  private usageStats = new Map<
    string,
    {
      requestCount: number;
      lastUsed: Date;
      avgDuration: number;
    }
  >();

  recordTokenUsage(resource: string, duration: number) {
    const stats = this.usageStats.get(resource) || {
      requestCount: 0,
      lastUsed: new Date(),
      avgDuration: 0,
    };

    stats.requestCount++;
    stats.lastUsed = new Date();
    stats.avgDuration = (stats.avgDuration + duration) / 2;

    this.usageStats.set(resource, stats);
  }

  getAnalytics() {
    return Object.fromEntries(this.usageStats);
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Managed Identity Not Found

```bash
# Solusi: Verify managed identity is enabled
az functionapp identity show --name "virpal-functions" --resource-group "virpal-rg"

# Re-enable if needed
az functionapp identity assign --name "virpal-functions" --resource-group "virpal-rg"
```

#### 2. Insufficient Permissions

```bash
# Check current role assignments
az role assignment list --assignee "$FUNCTION_PRINCIPAL_ID" --output table

# Add missing permissions
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.KeyVault/vaults/virpal-key-vault"
```

#### 3. Token Acquisition Failures

```typescript
// Debug token acquisition
async function debugTokenAcquisition() {
  try {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken(
      'https://vault.azure.net/.default'
    );

    console.log('Token acquired successfully:', {
      expiresOn: new Date(tokenResponse.expiresOnTimestamp),
      tokenLength: tokenResponse.token.length,
    });
  } catch (error) {
    console.error('Token acquisition failed:', error);

    if (error instanceof AuthenticationError) {
      console.error('Authentication details:', {
        errorCode: error.errorCode,
        message: error.message,
      });
    }
  }
}
```

#### 4. Cross-tenant Issues

```typescript
// Handle multi-tenant scenarios
const credential = new DefaultAzureCredential({
  tenantId: process.env['AZURE_TENANT_ID'],
  additionallyAllowedTenants: ['*'], // Allow cross-tenant auth
  authorityHost: 'https://login.microsoftonline.com/', // Specify authority
});
```

## 🎯 Validasi Setup

### Test Managed Identity

```typescript
// Comprehensive managed identity test
async function testManagedIdentity(): Promise<boolean> {
  try {
    const credential = new DefaultAzureCredential();

    // Test Key Vault access
    const keyVaultToken = await credential.getToken(
      'https://vault.azure.net/.default'
    );
    console.log('✅ Key Vault token acquired');

    // Test Cosmos DB access
    const cosmosToken = await credential.getToken(
      'https://cosmos.azure.com/.default'
    );
    console.log('✅ Cosmos DB token acquired');

    // Test Cognitive Services access
    const cognitiveToken = await credential.getToken(
      'https://cognitiveservices.azure.com/.default'
    );
    console.log('✅ Cognitive Services token acquired');

    return true;
  } catch (error) {
    console.error('❌ Managed identity test failed:', error);
    return false;
  }
}
```

### Local Development Testing

```bash
# Test dengan Azure CLI credentials
az login --tenant "virpalapp.onmicrosoft.com"

# Verify access ke Key Vault
az keyvault secret list --vault-name "virpal-key-vault"

# Test Function App deployment
func azure functionapp publish "virpal-functions"
```

## 📋 Security Best Practices

### 1. Principle of Least Privilege

```bash
# Hanya berikan permissions yang diperlukan
# Jangan gunakan broad permissions seperti "Contributor"

# ✅ Good: Specific role untuk specific resource
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/.../providers/Microsoft.KeyVault/vaults/virpal-key-vault"

# ❌ Avoid: Broad permissions
# az role assignment create --role "Contributor" --assignee "$FUNCTION_PRINCIPAL_ID" --scope "/subscriptions/..."
```

### 2. Regular Access Review

```bash
# Regular review role assignments
az role assignment list \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --include-inherited \
  --output table

# Remove unused permissions
az role assignment delete \
  --role "Unused Role" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/..."
```

### 3. Monitor Authentication Events

```typescript
// Log authentication events untuk audit
function auditAuthenticationEvent(event: {
  principalId: string;
  resource: string;
  action: string;
  success: boolean;
  timestamp: Date;
}) {
  const auditEntry = {
    eventType: 'ManagedIdentityAuth',
    ...event,
    correlationId: generateCorrelationId(),
  };

  // Send to audit log
  console.log('AUDIT:', JSON.stringify(auditEntry));
}
```

---

**✅ Azure Managed Identity siap menyediakan authentication yang secure dan credential-free untuk akses ke layanan Azure!**
