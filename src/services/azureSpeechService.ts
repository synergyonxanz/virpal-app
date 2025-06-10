/**
 * Azure Speech Service Integration
 * 
 * This module provides Text-to-Speech (TTS) functionality using Azure Cognitive Services Speech SDK
 * with secure credential management via Azure Key Vault and Managed Identity.
 * 
 * Features:
 * - High-quality Neural TTS with en-US-Brian:DragonHDLatestNeural voice
 * - Secure credential management through Azure Key Vault and Managed Identity
 * - Automatic retry with exponential backoff for transient errors
 * - Performance metrics and logging
 * - AudioContext management for browser autoplay policy
 * - Fallback to Web Speech API when Azure credentials are not available
 * 
 * Configuration:
 * - Credentials are securely stored in Azure Key Vault:
 *   azure-speech-service-key: Your Azure Speech Service key
 *   azure-speech-service-region: Your Azure region (e.g., southeastasia)
 *   azure-speech-service-endpoint: (Optional) Custom endpoint URL
 * - Authentication via Managed Identity (no hardcoded credentials)
 *  * Usage:
 * ```typescript
 * import { playAzureTTS, stopAzureTTS, unlockAudioContext, initializeTTSService } from './services/azureSpeechService';
 * import { logger } from '../utils/logger';
 * 
 * // Initialize TTS service (loads credentials from Key Vault)
 * await initializeTTSService();
 * 
 * // Initialize audio context on user interaction (e.g., button click)
 * unlockAudioContext();
 * 
 * // Play speech
 * playAzureTTS("Hello, how are you today?")
 *   .then(() => logger.debug("Speech completed"))
 *   .catch(() => logger.error("Speech failed"));
 * 
 * // Stop ongoing speech
 * stopAzureTTS();
 * ```
 * 
 * @see https://learn.microsoft.com/azure/cognitive-services/speech-service/
 */

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { frontendKeyVaultService } from './frontendKeyVaultService';
import { authService } from './authService';

// KONFIGURASI - Kredensial diambil secara aman dari Azure Key Vault via Azure Functions
// Menggunakan frontend service yang memanggil Azure Functions sebagai proxy
let AZURE_SPEECH_KEY: string | null = null;
let AZURE_SPEECH_REGION: string | null = null;
let AZURE_SPEECH_ENDPOINT: string | null = null;

// Cache flag to prevent repeated credential loading
let credentialsLoaded = false;
let credentialsLoadPromise: Promise<boolean> | null = null;

// Voice configuration - menggunakan voice neural berkualitas tinggi
const VOICE_NAME = "en-US-Brian:DragonHDLatestNeural"; // High-quality neural voice
const VOICE_LANGUAGE = "en-US"; // Bahasa untuk voice yang dipilih

let synthesizer: SpeechSDK.SpeechSynthesizer | null = null;
let audioContext: AudioContext | null = null; // Untuk mengelola AudioContext

/**
 * Import centralized logger utility for secure and consistent logging
 */
import { logger } from '../utils/logger';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Gets or creates an AudioContext instance
 * Handles cross-browser compatibility and autoplay policy restrictions
 */
function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    logger.debug("Created new AudioContext");
  }
  
  // Resume context if suspended (due to browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => logger.error("Error resuming AudioContext"));
  }
  
  return audioContext;
}


/**
 * Load Azure Speech Service credentials secara aman dari Azure Key Vault
 * Menggunakan Managed Identity untuk autentikasi
 * Uses caching to prevent repeated credential loading
 */
async function loadAzureSpeechCredentials(): Promise<boolean> {
  logger.debug(`loadAzureSpeechCredentials called - credentialsLoaded: ${credentialsLoaded}, promiseExists: ${!!credentialsLoadPromise}`);
  
  // Return cached result if already loaded
  if (credentialsLoaded) {
    logger.debug("Using cached Azure Speech Service credentials");
  return true;
  }

  // If loading is already in progress, wait for it
  if (credentialsLoadPromise) {
    logger.debug("Waiting for ongoing credential loading");
    return await credentialsLoadPromise;
  }
    // Start credential loading process
  credentialsLoadPromise = (async () => {
    try {
      logger.debug("Loading Azure Speech Service credentials from Key Vault");
      
      // Check if authentication is ready before attempting to load credentials
      if (!authService.isSafelyAuthenticated()) {
        logger.debug("Authentication not ready yet, attempting to initialize...");
        
        // Wait a bit for authentication to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!authService.isSafelyAuthenticated()) {
          logger.warn("Authentication still not ready - proceeding without auth (may use fallback)");
        }
      }
        // Load semua credentials secara paralel untuk performa yang lebih baik
      // Use refreshSecret to bypass any cached null values
      const [speechKey, speechRegion, speechEndpoint] = await Promise.all([
        frontendKeyVaultService.refreshSecret('azure-speech-service-key'),
        frontendKeyVaultService.refreshSecret('azure-speech-service-region'),
        frontendKeyVaultService.refreshSecret('azure-speech-service-endpoint')
      ]);

      // Validate credentials - check for meaningful values, not just existence
      const validKey = speechKey && speechKey.trim() !== '' && !speechKey.includes('your-speech-service-key-here');
      const validRegion = speechRegion && speechRegion.trim() !== '';
      
      if (!validKey || !validRegion) {
        logger.warn("Invalid or missing Azure Speech Service credentials", { 
          hasKey: !!speechKey, 
          hasRegion: !!speechRegion,
          keyValid: validKey,
          regionValid: validRegion
        });
        credentialsLoadPromise = null; // Allow retry on next call
        return false;
      }

      AZURE_SPEECH_KEY = speechKey;
      AZURE_SPEECH_REGION = speechRegion;
      AZURE_SPEECH_ENDPOINT = speechEndpoint; // Optional, bisa null

      credentialsLoaded = true;
      logger.debug("Azure Speech Service credentials loaded and cached successfully");
      
      return true;
    } catch (error) {
      logger.error("Failed to load Azure Speech Service credentials");
      credentialsLoadPromise = null; // Allow retry on next call
      return false;
    }
  })();

  return await credentialsLoadPromise;
}

async function initializeSynthesizer(): Promise<SpeechSDK.SpeechSynthesizer | null> {
  // Load credentials dari Key Vault terlebih dahulu (with caching)
  const credentialsSuccess = await loadAzureSpeechCredentials();
  
  // Enhanced validation to prevent initialization with placeholder/invalid keys
  const hasValidKey = AZURE_SPEECH_KEY && 
                     AZURE_SPEECH_KEY.trim() !== '' && 
                     !AZURE_SPEECH_KEY.includes('your-speech-service-key-here') &&
                     !AZURE_SPEECH_KEY.includes('placeholder');
  const hasValidRegion = AZURE_SPEECH_REGION && AZURE_SPEECH_REGION.trim() !== '';
  
  if (!credentialsSuccess || !hasValidKey || !hasValidRegion) {
    logger.debug("Azure Speech configuration not available or invalid, will use fallback", {
      credentialsSuccess,
      hasValidKey,
      hasValidRegion
    });
    // Clear any existing synthesizer since credentials are invalid
    if (synthesizer) {
      synthesizer.close();
      synthesizer = null;
    }
    return null;
  }

  try {
    // Log initialization without sensitive details
    logger.debug("Initializing Azure Speech Synthesizer");
      
    // Create speech config dengan Key Vault credentials
    const speechConfig = AZURE_SPEECH_ENDPOINT 
      ? SpeechSDK.SpeechConfig.fromEndpoint(new URL(AZURE_SPEECH_ENDPOINT), AZURE_SPEECH_KEY!)
      : SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY!, AZURE_SPEECH_REGION!);
    
    // Configure untuk kualitas audio terbaik
    speechConfig.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;
    
    // Set voice yang dikonfigurasi
    speechConfig.speechSynthesisVoiceName = VOICE_NAME;
    speechConfig.speechSynthesisLanguage = VOICE_LANGUAGE;

    // Add connection resilience settings - menggunakan property yang tersedia
    speechConfig.setProperty("SpeechServiceConnection_SendTimeoutMs", "10000");
    speechConfig.setProperty("SpeechServiceConnection_ReadTimeoutMs", "10000");

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();

    if (synthesizer) {
      try {
        // Close existing synthesizer sebelum membuat yang baru
        synthesizer.close();
      } catch (closeError) {
        logger.warn("Error closing previous synthesizer instance");
      }
    }
    
    synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    logger.debug("Azure Speech Synthesizer initialized successfully");
    return synthesizer;

  } catch (error) {
    logger.error("Failed to initialize Azure Speech Synthesizer");
    return null;
  }
}

/**
 * Implements retry logic with exponential backoff for transient errors
 * @param operation Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 300
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this is a transient error that can be retried
      const isTransient = lastError.message.includes('network') || 
                          lastError.message.includes('timeout') ||
                          lastError.message.includes('429') || // Rate limiting
                          lastError.message.includes('503'); // Service unavailable
      
      if (!isTransient || attempt >= maxRetries - 1) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 100;
      logger.debug(`Retrying operation (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Unknown error during retry operation');
}

/**
 * Logs minimal metrics about speech synthesis for monitoring and performance analysis
 * Records only non-sensitive performance data to help diagnose issues
 */
function logSpeechMetrics(text: string, duration: number, success: boolean, errorInfo?: string) {
  // Only log essential information, never log actual speech text content
  const characterCount = text.length;
  
  if (success) {
    logger.debug('Speech synthesis completed', { 
      characterCount,
      durationMs: duration
    });
  } else {
    logger.warn('Speech synthesis failed', { 
      characterCount,
      durationMs: duration,
      errorCategory: errorInfo ? 'API error' : 'Unknown error'
    });
  }

  // For production, these metrics should be sent to Azure Application Insights
  // with additional context like browser/OS but never with actual text content
}

/**
 * Memainkan teks sebagai suara menggunakan Azure Text-to-Speech dengan retry logic.
 * @param textToSpeak Teks yang akan diucapkan.
 */
export async function playAzureTTS(textToSpeak: string): Promise<void> {
  // Validate input text
  const trimmedText = textToSpeak?.trim();
  if (!trimmedText || trimmedText.length < 2) {
    logger.warn('TTS skipped: Text too short or empty', { 
      originalLength: textToSpeak?.length || 0, 
      trimmedLength: trimmedText?.length || 0,
      text: JSON.stringify(textToSpeak) // Safe to log short/empty text
    });
    return;
  }
  // Log the TTS request without exposing text content - only log character count for performance metrics
  logger.debug('Starting speech synthesis', { characterCount: trimmedText.length });
  
  // Always check if we should use Azure or fallback - don't reuse invalid synthesizer
  const currentSynthesizer = await initializeSynthesizer();
  if (!currentSynthesizer) {
    logger.warn("Azure Speech Synthesizer not available. Falling back to Web Speech API.");
    // Fallback ke Web Speech API jika Azure tidak terkonfigurasi
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = VOICE_LANGUAGE;
      
      // Tunggu voices siap jika belum
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        await new Promise(resolve => window.speechSynthesis.onvoiceschanged = resolve);
      }
      
      // Cari voice yang cocok
      const compatibleVoice = window.speechSynthesis.getVoices().find(voice => 
        voice.lang.startsWith('en-US') || voice.lang === VOICE_LANGUAGE
      );
      if (compatibleVoice) {
        utterance.voice = compatibleVoice;
      }
      
      const startTime = Date.now();
      window.speechSynthesis.speak(utterance);
      
      return new Promise<void>((resolve, reject) => {        utterance.onend = () => {
          const duration = Date.now() - startTime;
          logSpeechMetrics(textToSpeak, duration, true);
          resolve();
        };
        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          const duration = Date.now() - startTime;
          const errorType = event.error || "unknown";
          logger.error(`Web Speech API error: ${errorType}`);
          logSpeechMetrics(textToSpeak, duration, false, "Web Speech API error");
          reject(new Error(`Speech synthesis failed: ${errorType}`));
        };
      });
    } else {
      logger.error("Speech synthesis not available - neither Azure nor Web Speech API is supported");
      return Promise.reject(new Error("TTS not available."));
    }
  }
  // Pastikan AudioContext di-resume sebelum speak
  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume().catch(() => logger.error("Error resuming AudioContext before speech playback"));
  }

  const startTime = Date.now();

  // Implement retry logic untuk Azure speech synthesis
  return retryOperation(() => {
    return new Promise((resolve, reject) => {      currentSynthesizer.speakTextAsync(
        trimmedText,
        (result: SpeechSDK.SpeechSynthesisResult) => {
          const duration = Date.now() - startTime;
          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            logSpeechMetrics(trimmedText, duration, true);
            resolve();
          } else {
            const reasonCode = SpeechSDK.ResultReason[result.reason] || "Unknown";
            logger.error(`TTS Error: Synthesis failed with reason ${reasonCode}`);
            logSpeechMetrics(trimmedText, duration, false, `Reason: ${reasonCode}`);
            reject(new Error("Speech synthesis failed"));
          }
        },        (_: string) => {
          const duration = Date.now() - startTime;
          logger.error('TTS General Error');
          logSpeechMetrics(trimmedText, duration, false, "Azure SDK error");
          reject(new Error("Speech synthesis failed"));
        }
      );
    });
  });
}

/**
 * Menghentikan sintesis suara yang sedang berjalan.
 */
export function stopAzureTTS(): void {
  logger.debug("Stopping speech synthesis");
  
  if (synthesizer) {
    try {
      // Azure Speech SDK doesn't have a direct method to stop speaking in progress
      // We need to close the current synthesizer and create a new one next time
      synthesizer.close();
      synthesizer = null; // Will be re-initialized on next call
      logger.debug("Speech synthesis stopped");
    } catch (error: unknown) {
      logger.warn("Error stopping speech synthesis");
    }
  }
  
  // Fallback for Web Speech API
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      logger.debug("Web Speech API synthesis stopped");
    } catch (error) {
      logger.warn("Error stopping Web Speech API synthesis");
    }
  }
}

/**
 * Initialize TTS service - loads credentials and prepares synthesizer
 * Call this once during application startup
 * Includes retry logic for authentication timing issues
 */
export async function initializeTTSService(): Promise<boolean> {
  try {
    logger.debug("Initializing TTS Service");
    
    // Retry logic untuk mengatasi timing issue dengan MSAL initialization
    let success = false;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    while (!success && retryCount < maxRetries) {
      if (retryCount > 0) {
        logger.debug(`Retrying TTS initialization (attempt ${retryCount + 1}/${maxRetries})`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
      
      success = await loadAzureSpeechCredentials();
      retryCount++;
      
      if (!success && retryCount < maxRetries) {
        logger.debug("TTS initialization failed, will retry...");
      }
    }
    
    if (success) {
      // Pre-initialize synthesizer untuk performa yang lebih baik
      synthesizer = await initializeSynthesizer();
      logger.debug("TTS Service initialized successfully");
      console.log("✅ Azure Speech Service ready for Text-to-Speech");
    } else {
      logger.debug("TTS Service initialized without Azure Speech (fallback mode)");
      console.log("ℹ️ TTS Service running in fallback mode (Web Speech API)");
    }
    return success;
  } catch (error) {
    logger.error("Failed to initialize TTS Service");
    console.error("❌ TTS Service initialization failed:", error);
    return false;
  }
}

/**
 * Retry TTS initialization when authentication becomes available
 * Call this after user authentication is complete to enable Azure Speech Service
 */
export async function retryTTSInitialization(): Promise<boolean> {
  logger.debug("Retrying TTS initialization after authentication");
  
  // Reset credentials cache to force reload
  credentialsLoaded = false;
  credentialsLoadPromise = null;
  
  // Re-initialize TTS service
  return await initializeTTSService();
}

/**
 * Check if Azure Speech Service is available and properly configured
 */
export function isAzureSpeechServiceAvailable(): boolean {
  return credentialsLoaded && 
         synthesizer !== null && 
         AZURE_SPEECH_KEY !== null && 
         AZURE_SPEECH_REGION !== null;
}

/**
 * Unlocks AudioContext in response to user interaction
 * This should be called after a user interaction event (click, touch)
 * to bypass browser autoplay policy restrictions
 */
export function unlockAudioContext() {
    const ac = getAudioContext();
    if (ac.state === 'suspended') {
        ac.resume()
          .then(() => logger.debug("AudioContext unlocked successfully"))
          .catch(() => logger.error("Failed to unlock AudioContext"));
    } else {
        logger.debug("AudioContext already active");
    }
}