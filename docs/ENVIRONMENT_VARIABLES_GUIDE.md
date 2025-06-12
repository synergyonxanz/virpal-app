# VirPal App - Environment Variables Documentation

## Overview
VirPal App menggunakan environment variables untuk konfigurasi yang aman dan fleksibel. Aplikasi mengikuti Azure security best practices dengan menggunakan Azure Key Vault untuk credential management.

## File Structure
```
.env.example           # Template untuk semua environment variables
.env.development       # Development environment configuration
.env.production        # Production environment configuration
.env.local.example     # Local development template
src/vite-env.d.ts     # TypeScript definitions untuk environment variables
```

## Environment Variables Categories

### 🔧 Azure Functions Configuration
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_AZURE_FUNCTION_ENDPOINT` | Primary chat completion endpoint | ✅ | `http://localhost:7071/api/chat-completion` |
| `VITE_AZURE_FUNCTION_URL` | Base Azure Functions URL | ✅ | `http://localhost:7071` |
| `VITE_AZURE_FUNCTION_ENDPOINT2` | Key Vault secrets endpoint | ✅ | `http://localhost:7071/api/get-secrets` |

### 🔐 Microsoft Entra External ID (CIAM)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_MSAL_CLIENT_ID` | Application client ID | ✅ | `f546482f-a365-4136-a917-07cac029501f` |
| `VITE_TENANT_NAME` | Azure tenant name | ✅ | `virpalapp` |
| `VITE_USER_FLOW_NAME` | B2C user flow name | ✅ | `virpal_signupsignin_v1` |
| `VITE_BACKEND_SCOPE` | API scope for authentication | ✅ | `api://backend-id/scope` |
| `VITE_TENANT_DOMAIN` | Tenant domain | ✅ | `virpalapp.ciamlogin.com` |

### 💾 Azure Cosmos DB (Development Fallback)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_AZURE_COSMOS_ENDPOINT` | Cosmos DB endpoint | ⚠️ | `https://account.documents.azure.com:443/` |
| `VITE_AZURE_COSMOS_KEY` | Cosmos DB key | ⚠️ | `primary-key-here` |
| `VITE_AZURE_COSMOS_DATABASE_NAME` | Database name | ⚠️ | `virpal-db` |
| `VITE_AZURE_COSMOS_CONNECTION_STRING` | Full connection string | ⚠️ | `AccountEndpoint=...;AccountKey=...` |

### 🤖 Azure OpenAI (Development Fallback)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | ❌ | `https://account.openai.azure.com/` |
| `VITE_AZURE_OPENAI_API_KEY` | Azure OpenAI API key | ❌ | `api-key-here` |
| `VITE_AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name | ❌ | `gpt-4` |
| `VITE_AZURE_OPENAI_API_VERSION` | API version | ❌ | `2024-08-01-preview` |

### ⚙️ Application Configuration
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_DEV_MODE` | Enable development features | ✅ | `true` |
| `NODE_ENV` | Node.js environment | ✅ | `development` |
| `VITE_APP_NAME` | Application name | ❌ | `VirPal` |
| `VITE_APP_VERSION` | Application version | ❌ | `1.0.0` |

## 🔒 Security Best Practices

### Azure Key Vault Only (NO Environment Variables)
Sensitive credentials yang TIDAK boleh ada di environment variables:
- ❌ `VITE_SPEECH_KEY` - Azure Speech Service key
- ❌ `VITE_SPEECH_REGION` - Azure Speech Service region
- ❌ `VITE_SPEECH_ENDPOINT` - Azure Speech Service endpoint

Credentials ini hanya diakses melalui Azure Key Vault dengan secrets:
- `azure-speech-service-key`
- `azure-speech-service-region`
- `azure-speech-service-endpoint`

### Development vs Production
- **Development**: Fallback values untuk non-sensitive configuration
- **Production**: Semua sensitive credentials dari Azure Key Vault
- **Local**: Azure emulators dan test credentials

## 🚀 Setup Instructions

### 1. Development Setup
```bash
# Copy template file
cp .env.example .env.development

# Edit with your values
nano .env.development

# Start Azure Functions
npm run watch

# Start frontend
npm run dev
```

### 2. Production Setup
```bash
# Copy production template
cp .env.example .env.production

# Update Azure Functions URLs
# Update with production Azure Function App name
VITE_AZURE_FUNCTION_ENDPOINT=https://your-app.azurewebsites.net/api/chat-completion

# Deploy to Azure
npm run deploy:production
```

### 3. Local Development
```bash
# Copy local template
cp .env.local.example .env.local

# Use Azure emulators when possible
# Start Cosmos DB emulator, Storage emulator, etc.
```

## 🔍 Testing Environment Variables

### Browser Console Commands
```javascript
// Test Key Vault connectivity
await KeyVaultTester.runTests()

// Check specific secret
await KeyVaultTester.testSecret('azure-speech-service-key')

// Verify configuration
frontendKeyVaultService.isConfigured()
```

### Azure Functions Testing
```bash
# Test endpoint directly
curl "http://localhost:7071/api/get-secret?name=azure-speech-service-key"

# Check health
curl "http://localhost:7071/api/health"
```

## ⚠️ Common Issues

### 1. Key Vault Connection Failures
- Verify Azure CLI authentication: `az account show`
- Check Azure Functions are running: `npm run watch`
- Test Key Vault access: `az keyvault secret list --vault-name virpal-key-vault`

### 2. CORS Errors
- Check `host.json` CORS configuration
- Verify frontend origin matches allowed origins
- Clear browser cache

### 3. Missing Environment Variables
- Check file naming: `.env.development` not `.env.dev`
- Verify VITE_ prefix for frontend variables
- Restart development server after changes

## 📚 Related Documentation
- [Azure Key Vault Setup Guide](./docs/KEY_VAULT_SETUP_GUIDE.md)
- [Azure Services Complete Setup](./docs/AZURE_SERVICES_COMPLETE_SETUP_GUIDE.md)
- [Key Vault Troubleshooting](./docs/KEY_VAULT_TROUBLESHOOTING.md)
- [Production Deployment Guide](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md)

## 🤝 Contributing
When adding new environment variables:
1. Update all template files (.env.example, etc.)
2. Add TypeScript definitions in vite-env.d.ts
3. Document in this README
4. Follow security best practices (Key Vault for sensitive data)
5. Test in both development and production environments
