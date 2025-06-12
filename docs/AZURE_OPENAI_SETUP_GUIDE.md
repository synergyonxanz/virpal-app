# Azure OpenAI Setup Guide

## 📖 Panduan Setup Azure OpenAI Service OpenAI Service

Azure OpenAI Service menyediakan kemampuan AI generatif dengan model gpt-4o-mini untuk fungsi chat completion dalam aplikasi VIRPAL. Service ini terintegrasi dengan Azure Key Vault untuk keamanan kredensial.

## 🔧 Konfigurasi Dasar

### 1. Membuat Azure OpenAI Resource

```bash
# Login ke Azure
az login

# Buat resource group (jika belum ada)
az group create --name "virpal-rg" --location "eastus"

# Buat Azure OpenAI service
az cognitiveservices account create \
  --name "virpal-openai" \
  --resource-group "virpal-rg" \
  --location "eastus" \
  --kind "OpenAI" \
  --sku "S0" \
  --yes
```

### 2. Deploy Model GPT-4o-mini

```bash
# Deploy model GPT-4o-mini
az cognitiveservices account deployment create \
  --name "virpal-openai" \
  --resource-group "virpal-rg" \
  --deployment-name "gpt-4o-mini" \
  --model-name "gpt-4o-mini" \
  --model-version "2024-07-18" \
  --model-format "OpenAI" \
  --sku-capacity 10 \
  --sku-name "Standard"
```

## 🔐 Konfigurasi Keamanan

### 1. Simpan Kredensial di Key Vault

```bash
# Dapatkan endpoint dan API key
OPENAI_ENDPOINT=$(az cognitiveservices account show --name "virpal-openai" --resource-group "virpal-rg" --query "properties.endpoint" -o tsv)
OPENAI_KEY=$(az cognitiveservices account keys list --name "virpal-openai" --resource-group "virpal-rg" --query "key1" -o tsv)

# Simpan ke Key Vault
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-openai-endpoint" --value "$OPENAI_ENDPOINT"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-openai-api-key" --value "$OPENAI_KEY"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-openai-deployment-name" --value "gpt-4o-mini"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-openai-api-version" --value "2024-10-21"
```

### 2. Konfigurasi Managed Identity

```bash
# Berikan akses Azure OpenAI ke Function App
FUNCTION_PRINCIPAL_ID=$(az functionapp identity show --name "virpal-functions" --resource-group "virpal-rg" --query "principalId" -o tsv)

az role assignment create \
  --role "Cognitive Services OpenAI User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.CognitiveServices/accounts/virpal-openai"
```

## ⚙️ Konfigurasi Aplikasi

### 1. Environment Variables (Development)

```bash
# .env file - Hanya untuk development
VITE_AZURE_OPENAI_ENDPOINT=https://virpal-openai.openai.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-development-key
```

### 2. Konfigurasi Azure Functions

```typescript
// src/functions/chat-completion.ts
const config = {
  endpoint: await keyVaultService.getSecret('azure-openai-endpoint'),
  apiKey: await keyVaultService.getSecret('azure-openai-api-key'),
  deploymentName: await keyVaultService.getSecret(
    'azure-openai-deployment-name'
  ),
  apiVersion: await keyVaultService.getSecret('azure-openai-api-version'),
};
```

## 🚀 Best Practices

### 1. Rate Limiting dan Quota

```typescript
// Implementasi retry dengan exponential backoff
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
```

### 2. Content Filtering

```typescript
// Konfigurasi content filtering
const requestConfig = {
  content_filter_level: 'medium',
  max_tokens: 1000,
  temperature: 0.7,
  top_p: 0.9,
};
```

### 3. Monitoring dan Logging

```typescript
// Log metrics tanpa expose sensitive data
logger.info('OpenAI request completed', {
  model: deploymentName,
  tokens: response.usage?.total_tokens,
  duration: Date.now() - startTime,
});
```

## 📊 Monitoring

### 1. Key Metrics

- **Token Usage**: Monitor penggunaan token harian
- **Request Latency**: Waktu respons API calls
- **Error Rate**: Tingkat error dan retry
- **Cost**: Biaya berdasarkan token consumption

### 2. Azure Monitor Setup

```bash
# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name "virpal-openai-diagnostics" \
  --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.CognitiveServices/accounts/virpal-openai" \
  --logs '[{"category":"Audit","enabled":true},{"category":"RequestResponse","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]' \
  --workspace "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.OperationalInsights/workspaces/virpal-logs"
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Rate Limiting (429 Error)

```typescript
// Solusi: Implementasi backoff strategy
if (error.status === 429) {
  const retryAfter = error.headers['retry-after'] || 60;
  await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
}
```

#### 2. Content Filter Rejection

```typescript
// Solusi: Review dan adjust content
if (error.code === 'content_filter') {
  logger.warn('Content filtered by Azure OpenAI policy');
  // Implementasi fallback atau content modification
}
```

#### 3. Token Limit Exceeded

```typescript
// Solusi: Chunk text atau reduce context
if (error.code === 'context_length_exceeded') {
  // Split content into smaller chunks
  const chunks = splitTextIntoChunks(text, MAX_TOKENS);
}
```

## 🎯 Validasi Setup

### Test Connection

```typescript
// Test Azure OpenAI connectivity
async function testOpenAIConnection() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello, test message' }],
      max_tokens: 10,
    });

    console.log('✅ Azure OpenAI connection successful');
    return true;
  } catch (error) {
    console.error('❌ Azure OpenAI connection failed:', error);
    return false;
  }
}
```

---

**✅ Azure OpenAI Service siap digunakan dengan konfigurasi keamanan dan monitoring yang optimal!**
