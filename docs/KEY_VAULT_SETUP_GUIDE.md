# Azure Key Vault Setup Guide for Virpal-App

## 🔐 **Secure Credential Management with Azure Key Vault**

This guide implements Azure security best practices for credential management in the Virpal application.

## **Current Configuration Status**

### ✅ **Verified Components**
- **Key Vault**: `virpal-key-vault` (Southeast Asia)
- **RBAC**: Enabled for fine-grained access control
- **Azure Functions**: Secure proxy with Managed Identity
- **Network Access**: Configured for development access

### 🎯 **Best Practices Applied**

#### **1. Authentication & Authorization**
```typescript
// Managed Identity Authentication (No hardcoded credentials)
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(KEY_VAULT_URL, credential);
```

#### **2. Secure Secret Management**
- **No fallback values** for sensitive credentials
- **Key Vault-only** access for Azure Speech Service
- **Input validation** and sanitization
- **Rate limiting** protection

#### **3. Error Handling & Monitoring**
- **Request ID tracking** for audit trails
- **Structured logging** without credential exposure
- **Graceful degradation** with Web Speech API fallback

## **Required Key Vault Secrets**

### **Azure Speech Service Secrets**
```bash
# Add these secrets to your Key Vault:
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-speech-service-key" --value "YOUR_ACTUAL_SPEECH_KEY"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-speech-service-region" --value "eastus"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-speech-service-endpoint" --value "https://eastus.api.cognitive.microsoft.com/"
```

### **Optional: Azure OpenAI Secrets** (if using)
```bash
az keyvault secret set --vault-name "virpal-key-vault" --name "AZURE-OPENAI-API-KEY" --value "YOUR_OPENAI_KEY"
az keyvault secret set --vault-name "virpal-key-vault" --name "AZURE-OPENAI-ENDPOINT" --value "YOUR_ENDPOINT"
```

## **Security Configuration**

### **1. RBAC Permissions** ✅
Your Key Vault uses RBAC for secure access control:
- **Key Vault Secrets User**: For application access
- **Key Vault Secrets Officer**: For secret management

### **2. Network Security**
```bash
# Optional: Restrict network access (for production)
az keyvault network-rule add --vault-name "virpal-key-vault" --ip-address "YOUR_OFFICE_IP"
az keyvault update --name "virpal-key-vault" --default-action Deny
```

### **3. Access Policies**
Your current configuration:
- **Service Principal Access**: Full permissions for development
- **Tenant**: `virpalapp.onmicrosoft.com`

## **Application Configuration**

### **1. Environment Variables (No Credentials)**
```bash
# .env file - Configuration only, no secrets
KEY_VAULT_URL=https://your-key-vault-name.vault.azure.net/
AZURE_TENANT_ID=virpalapp.onmicrosoft.com
```

### **2. Frontend Key Vault Service**
```typescript
// Key Vault-only mode for sensitive credentials
const isAzureSpeechSecret = secretName.includes('azure-speech-service');
if (isAzureSpeechSecret) {
  // Force Key Vault access - no fallbacks
  return await this.getFromKeyVault(secretName);
}
```

### **3. Azure Functions Proxy**
```typescript
// Secure proxy with authentication
const authResult = await validateAuthentication(request, context, requestId);
if (!authResult.isAuthenticated) {
  return { status: 401, error: 'Authentication required' };
}
```

## **Deployment Best Practices**

### **1. Development Setup**
```powershell
# Sign in to Azure
az login

# Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify Key Vault access
az keyvault secret list --vault-name "virpal-key-vault" --query "[].name"
```

### **2. Production Considerations**
- **Managed Identity**: Use for Azure-hosted applications
- **Network Restrictions**: Limit access to specific IP ranges
- **Secret Rotation**: Implement automatic rotation policies
- **Monitoring**: Enable Key Vault logging and alerts

### **3. CI/CD Integration**
```yaml
# Azure DevOps/GitHub Actions
- task: AzureKeyVault@2
  inputs:
    azureSubscription: 'YOUR_SERVICE_CONNECTION'
    KeyVaultName: 'virpal-key-vault'
    SecretsFilter: 'azure-speech-service-*'
```

## **Troubleshooting**

### **Common Issues**

#### **1. Authentication Failures**
```bash
# Check current authentication
az account show

# Re-authenticate if needed
az login --tenant virpalapp.onmicrosoft.com
```

#### **2. Permission Issues**
```bash
# Check Key Vault permissions
az keyvault show --name "virpal-key-vault" --query "properties.accessPolicies"

# Verify RBAC assignments
az role assignment list --scope "/subscriptions/YOUR_SUB/resourceGroups/YOUR_RG/providers/Microsoft.KeyVault/vaults/virpal-key-vault"
```

#### **3. Secret Not Found**
```bash
# List all secrets
az keyvault secret list --vault-name "virpal-key-vault"

# Check specific secret
az keyvault secret show --vault-name "virpal-key-vault" --name "azure-speech-service-key"
```

## **Security Checklist**

- [ ] **No hardcoded credentials** in source code
- [ ] **Key Vault-only access** for sensitive secrets
- [ ] **Managed Identity authentication** configured
- [ ] **RBAC permissions** properly assigned
- [ ] **Rate limiting** enabled in Azure Functions
- [ ] **Input validation** implemented
- [ ] **Audit logging** enabled
- [ ] **Network restrictions** configured (production)
- [ ] **Secret rotation** policies defined

## **Monitoring & Alerts**

### **Key Metrics to Monitor**
- Key Vault access attempts
- Authentication failures
- Secret access patterns
- Azure Functions execution metrics

### **Recommended Alerts**
- Unauthorized access attempts
- Failed secret retrievals
- Rate limit violations
- Service availability issues

---

**✅ Your application now follows Azure security best practices for credential management!**
