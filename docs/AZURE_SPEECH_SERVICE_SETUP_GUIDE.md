# Azure Speech Service Setup Guide

## 🎤 Panduan Setup Azure Speech Service

Azure Speech Service menyediakan kemampuan Text-to-Speech (TTS) berkualitas tinggi dengan neural voice untuk aplikasi VIRPAL. Service ini menggunakan voice `en-US-Brian:DragonHDLatestNeural` untuk pengalaman audio yang optimal.

## 🔧 Konfigurasi Dasar

### 1. Membuat Azure Speech Service Resource

```bash
# Login ke Azure
az login

# Buat Speech Service resource
az cognitiveservices account create \
  --name "virpal-speech" \
  --resource-group "virpal-rg" \
  --location "eastus" \
  --kind "SpeechServices" \
  --sku "S0" \
  --yes
```

### 2. Verifikasi Resource

```bash
# Cek status resource
az cognitiveservices account show \
  --name "virpal-speech" \
  --resource-group "virpal-rg" \
  --query "{name:name,location:location,sku:sku.name,endpoint:properties.endpoint}"
```

## 🔐 Konfigurasi Keamanan

### 1. Simpan Kredensial di Key Vault

```bash
# Dapatkan API key dan region
SPEECH_KEY=$(az cognitiveservices account keys list --name "virpal-speech" --resource-group "virpal-rg" --query "key1" -o tsv)
SPEECH_REGION=$(az cognitiveservices account show --name "virpal-speech" --resource-group "virpal-rg" --query "location" -o tsv)
SPEECH_ENDPOINT=$(az cognitiveservices account show --name "virpal-speech" --resource-group "virpal-rg" --query "properties.endpoint" -o tsv)

# Simpan ke Key Vault (WAJIB - tidak ada fallback)
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-speech-service-key" --value "$SPEECH_KEY"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-speech-service-region" --value "$SPEECH_REGION"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-speech-service-endpoint" --value "$SPEECH_ENDPOINT"
```

### 2. Konfigurasi Managed Identity

```bash
# Berikan akses Speech Service ke Function App
FUNCTION_PRINCIPAL_ID=$(az functionapp identity show --name "virpal-functions" --resource-group "virpal-rg" --query "principalId" -o tsv)

az role assignment create \
  --role "Cognitive Services Speech User" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.CognitiveServices/accounts/virpal-speech"
```

## ⚙️ Konfigurasi Aplikasi

### 1. Speech SDK Configuration

```typescript
// src/services/azureSpeechService.ts
const speechConfig = {
  voiceName: 'en-US-Brian:DragonHDLatestNeural',
  language: 'en-US',
  outputFormat:
    SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3,
  connectionTimeout: 10000,
  readTimeout: 30000,
};
```

### 2. Audio Context Management

```typescript
// Mengelola AudioContext untuk browser autoplay policy
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Resume context jika suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}
```

### 3. Retry Logic Implementation

```typescript
// Implementasi retry dengan exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 300
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;

      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

## 🚀 Best Practices

### 1. Voice Quality Optimization

```typescript
// Konfigurasi optimal untuk kualitas audio
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
speechConfig.speechSynthesisOutputFormat =
  SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;
speechConfig.speechSynthesisVoiceName = 'en-US-Brian:DragonHDLatestNeural';

// Neural voice untuk kualitas terbaik
speechConfig.setProperty(
  SpeechSDK.PropertyId.SpeechServiceConnection_SynthVoice,
  'en-US-Brian:DragonHDLatestNeural'
);
```

### 2. Performance Optimization

```typescript
// Connection pooling dan reuse
let synthesizer: SpeechSDK.SpeechSynthesizer | null = null;

async function getSynthesizer(): Promise<SpeechSDK.SpeechSynthesizer> {
  if (!synthesizer) {
    const speechConfig = await createSpeechConfig();
    synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
  }
  return synthesizer;
}

// Cleanup resources
function cleanupSynthesizer() {
  if (synthesizer) {
    synthesizer.close();
    synthesizer = null;
  }
}
```

### 3. Error Handling

```typescript
// Comprehensive error handling
async function playTTS(text: string): Promise<boolean> {
  try {
    const synthesizer = await getSynthesizer();

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (
            result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
          ) {
            resolve(true);
          } else {
            reject(
              new Error(`Speech synthesis failed: ${result.errorDetails}`)
            );
          }
        },
        (error) => reject(error)
      );
    });
  } catch (error) {
    logger.error('TTS playback failed:', error);
    return false;
  }
}
```

## 📊 Monitoring

### 1. Key Metrics

- **Synthesis Success Rate**: Tingkat keberhasilan TTS
- **Audio Quality**: Feedback kualitas suara
- **Latency**: Waktu respons synthesis
- **Usage**: Character count dan request frequency

### 2. Performance Logging

```typescript
// Log metrics untuk monitoring
function logSpeechMetrics(
  text: string,
  duration: number,
  success: boolean,
  errorInfo?: string
) {
  const metrics = {
    textLength: text.length,
    synthesisTime: duration,
    success,
    timestamp: new Date().toISOString(),
    voice: 'en-US-Brian:DragonHDLatestNeural',
  };

  if (!success && errorInfo) {
    metrics.error = errorInfo;
  }

  logger.info('Speech synthesis metrics', metrics);
}
```

### 3. Azure Monitor Integration

```bash
# Enable diagnostic settings untuk Speech Service
az monitor diagnostic-settings create \
  --name "virpal-speech-diagnostics" \
  --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.CognitiveServices/accounts/virpal-speech" \
  --logs '[{"category":"Audit","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]' \
  --workspace "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.OperationalInsights/workspaces/virpal-logs"
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Audio Context Suspended

```typescript
// Solusi: Resume audio context pada user interaction
function unlockAudioContext() {
  const audioContext = getAudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      logger.debug('Audio context resumed successfully');
    });
  }
}
```

#### 2. Network Timeout

```typescript
// Solusi: Adjust timeout settings
speechConfig.setProperty(
  SpeechSDK.PropertyId.SpeechServiceConnection_ConnectTimeout,
  '10000'
);
speechConfig.setProperty(
  SpeechSDK.PropertyId.SpeechServiceConnection_ReadTimeout,
  '30000'
);
```

#### 3. Voice Not Available

```typescript
// Solusi: Fallback ke voice standard
const fallbackVoice = 'en-US-AriaNeural';
if (error.message.includes('voice not found')) {
  speechConfig.speechSynthesisVoiceName = fallbackVoice;
}
```

#### 4. Key Vault Access Issues

```typescript
// Solusi: Verify authentication dan permissions
async function validateSpeechCredentials(): Promise<boolean> {
  try {
    const key = await frontendKeyVaultService.getSecret(
      'azure-speech-service-key'
    );
    const region = await frontendKeyVaultService.getSecret(
      'azure-speech-service-region'
    );

    return !!(key && region && key.trim() !== '' && region.trim() !== '');
  } catch (error) {
    logger.error('Speech credentials validation failed:', error);
    return false;
  }
}
```

## 🎯 Validasi Setup

### Test Speech Service

```typescript
// Test Azure Speech Service connectivity
async function testSpeechService(): Promise<boolean> {
  try {
    // Load credentials
    const credentialsValid = await loadAzureSpeechCredentials();
    if (!credentialsValid) {
      throw new Error('Invalid speech credentials');
    }

    // Test synthesis
    const synthesizer = await initializeSynthesizer();
    if (!synthesizer) {
      throw new Error('Failed to initialize synthesizer');
    }

    // Quick test synthesis
    await playAzureTTS('Test message');

    logger.info('✅ Azure Speech Service test successful');
    return true;
  } catch (error) {
    logger.error('❌ Azure Speech Service test failed:', error);
    return false;
  }
}
```

### Browser Console Testing

```javascript
// Test di browser console
await testSpeechService();

// Test specific voice
await playAzureTTS(
  'Hello, this is a test of the Azure Speech Service with Brian neural voice.'
);

// Check service status
console.log('Speech Service Available:', isAzureSpeechServiceAvailable());
```

## 📋 Security Checklist

- [ ] ✅ **API Key stored in Key Vault only** - Tidak ada fallback untuk production
- [ ] ✅ **Managed Identity configured** untuk Function App access
- [ ] ✅ **No credentials in source code** - Semua credentials dari Key Vault
- [ ] ✅ **HTTPS only connections** untuk semua API calls
- [ ] ✅ **Audit logging enabled** untuk monitoring access
- [ ] ✅ **Rate limiting implemented** untuk prevent abuse

---

**✅ Azure Speech Service siap memberikan pengalaman TTS berkualitas tinggi dengan keamanan enterprise-grade!**
