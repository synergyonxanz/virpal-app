# Azure TTS Integration Testing

This document provides instructions for testing the Text-to-Speech (TTS) integration with Azure Speech Services.

## Prerequisites

- Azure subscription with Speech Services resource
- Key Vault configured with the following secrets:
  - `azure-speech-service-key`: Your Speech Services API key
  - `azure-speech-service-region`: Your Speech Services region (e.g., eastus)

## Local Testing

1. Start the Azure Functions backend:
   ```
   cd virpal-app
   npm run functions:start
   ```

2. Open the TTS test page:
   ```
   cd src
   npx vite serve tts-test.html --port 5173
   ```

3. Navigate to http://localhost:5173/tts-test.html in your browser

4. Click on the "Test TTS" button to verify speech synthesis is working

## Troubleshooting

### CORS Issues

If you see CORS errors in the console, verify:
1. The CORS configuration in `host.json` includes your frontend origin
2. The Azure Functions are running on the expected port (default: 7071)

### Authentication Issues

If authentication fails:
1. Verify your Key Vault URL in `local.settings.json`
2. Make sure you're logged in with Azure CLI: `az login`
3. Check that your account has access to the Key Vault

### Audio Issues

If no audio plays:
1. Ensure audio is not muted in your system
2. Check that the browser supports Web Audio API
3. Some browsers require user interaction before audio can play - click somewhere on the page

## Voice Configuration

The default voice is set to `en-US-JennyNeural`. You can change this by modifying the `azureSpeechService.ts` file:

```typescript
const speakConfig = sdk.SpeechConfig.fromSubscription(credentials.apiKey, credentials.region);
speakConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; // Change this to your preferred voice
```

Available voices can be found in the [Azure Speech Service voice list](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#neural-voices).
