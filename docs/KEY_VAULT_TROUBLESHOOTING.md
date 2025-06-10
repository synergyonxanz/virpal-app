# Key Vault Connection Troubleshooting Guide

## 🔧 Quick Fix Steps

### 1. Start Azure Functions
```bash
# Terminal 1: Start Azure Functions
npm run watch

# Terminal 2: Start frontend (after functions are running)
npm run dev
```

### 2. Test Key Vault Connection

Open browser console and run:
```javascript
// Quick health check
await KeyVaultTester.runTests()

// Test specific secret
await KeyVaultTester.testSecret('azure-speech-service-key')

// Reset service if needed
KeyVaultTester.resetService()
```

## 🔍 Common Issues & Solutions

### Issue 1: "Failed to fetch" Error
**Symptoms:**
- Network errors when accessing Key Vault
- "ECONNREFUSED" errors

**Solutions:**
```bash
# 1. Check if Azure Functions is running
curl http://localhost:7071/api/get-secret?name=health-check

# 2. Restart Azure Functions
npm run watch

# 3. Check Function URL in environment
echo $VITE_AZURE_FUNCTION_ENDPOINT
```

### Issue 2: CORS Errors
**Symptoms:**
- "Access to fetch blocked by CORS policy"
- Preflight request failures

**Solutions:**
1. Check `host.json` CORS configuration
2. Verify frontend origin matches allowed origins
3. Clear browser cache and restart

### Issue 3: Authentication Failures
**Symptoms:**
- 401/403 errors from Key Vault
- "Authentication required" messages

**Solutions:**
```bash
# 1. Check Azure CLI authentication
az account show

# 2. Re-authenticate if needed
az login --tenant virpalapp.onmicrosoft.com

# 3. Verify Key Vault permissions
az keyvault show --name virpal-key-vault
```

### Issue 4: Secrets Not Found
**Symptoms:**
- "Secret does not exist" errors
- Null values returned

**Solutions:**
```bash
# 1. List all secrets in Key Vault
az keyvault secret list --vault-name virpal-key-vault

# 2. Check specific secret
az keyvault secret show --vault-name virpal-key-vault --name azure-speech-service-key

# 3. Create missing secrets
az keyvault secret set --vault-name virpal-key-vault --name azure-speech-service-key --value "YOUR_KEY"
```

## 🚀 Development Workflow

### Step 1: Environment Setup
```bash
# 1. Copy environment file
cp .env.development .env

# 2. Install dependencies
npm install

# 3. Build functions
npm run build:functions
```

### Step 2: Start Services
```bash
# Terminal 1: Azure Functions (must start first)
npm run watch

# Wait for "Host started" message, then:

# Terminal 2: Frontend
npm run dev
```

### Step 3: Test Connection
```javascript
// In browser console
await KeyVaultTester.runTests()
```

## 📊 Expected Test Results

### ✅ Healthy System
```
1. ✅ Service Configuration: Service configured. Function URL: http://localhost:7071
2. ✅ Azure Function Health: Azure Function is accessible (status: 400)
3. ✅ Secret Access: azure-speech-service-key: Secret retrieved successfully (length: 32)
4. ✅ Secret Access: azure-speech-service-region: Secret retrieved successfully (length: 13)
5. ✅ Invalid Secret Handling: Invalid secret handled gracefully (returned null)
6. ✅ Secret Access: OPENAI-API-KEY: Secret retrieved successfully (length: 51)

Overall Status: ✅ PASS
```

### ⚠️ Development Mode (With Warnings)
```
1. ✅ Service Configuration: Service configured
2. ✅ Azure Function Health: Azure Function is accessible
3. ⚠️ Secret Access: azure-speech-service-key: Secret not found (using fallback if available)
4. ⚠️ Secret Access: azure-speech-service-region: Secret not found (using fallback if available)
5. ✅ Invalid Secret Handling: Invalid secret handled gracefully
6. ✅ Secret Access: OPENAI-API-KEY: Secret retrieved successfully

Overall Status: ⚠️ WARNINGS
```

### ❌ System Issues
```
1. ❌ Service Configuration: Frontend Key Vault Service is not configured
2. ❌ Azure Function Health: Cannot connect to Azure Function - check if it's running
3. ❌ Secret Access: Failed to retrieve secret: Failed to fetch

Overall Status: ❌ FAIL
```

## 🔄 Reset & Retry

If you encounter persistent issues:

```bash
# 1. Stop all processes (Ctrl+C in both terminals)

# 2. Clear caches
npm run clean:dist

# 3. Restart everything
npm run build:functions
npm run watch    # Terminal 1
npm run dev      # Terminal 2 (after functions start)

# 4. Test again
# In browser console:
KeyVaultTester.resetService()
await KeyVaultTester.runTests()
```

## 🔐 Security Notes

### Development Mode
- Authentication is **optional** for localhost
- Fallback values used for non-sensitive secrets
- Speech Service secrets **require** Key Vault access

### Production Mode
- Authentication is **required**
- All secrets must come from Key Vault
- No fallback values in production

## 📞 Support

If issues persist:

1. Check Azure Function logs for detailed errors
2. Verify Azure CLI authentication: `az account show`
3. Test Key Vault access directly: `az keyvault secret list --vault-name virpal-key-vault`
4. Review the [Key Vault Setup Guide](./KEY_VAULT_SETUP_GUIDE.md)

## 🛠️ Debug Commands

```bash
# Check environment variables
env | grep VITE_

# Test Azure Function directly
curl "http://localhost:7071/api/get-secret?name=azure-speech-service-key"

# Check Azure CLI status
az account show --output table

# List Key Vault secrets
az keyvault secret list --vault-name virpal-key-vault --output table

# Test specific secret
az keyvault secret show --vault-name virpal-key-vault --name azure-speech-service-key
```
