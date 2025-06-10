import type { OpenAIChatMessage } from '../types';
import { logger } from '../utils/logger';

// KONFIGURASI - SEKARANG MENGGUNAKAN AZURE FUNCTION SEBAGAI PROXY
// Frontend tidak lagi langsung berkomunikasi dengan Azure OpenAI
// Semua request diarahkan melalui Azure Function yang aman
const AZURE_FUNCTION_ENDPOINT = import.meta.env.VITE_AZURE_FUNCTION_ENDPOINT || "http://localhost:7071/api/chat-completion";

interface GetAzureOpenAICompletionOptions {
  systemPrompt?: string;
  messageHistory?: OpenAIChatMessage[]; // Untuk konteks percakapan
  temperature?: number;
  maxTokens?: number;
}

/**
 * Mengirim permintaan ke Azure Function yang akan meneruskan ke Azure OpenAI Service.
 * Frontend tidak lagi memiliki akses langsung ke API key - semua melalui backend yang aman.
 * @param userInput Teks input dari pengguna.
 * @param options Opsi tambahan seperti system prompt, histori pesan, dll.
 * @returns Teks respons dari AI.
 */
export async function getAzureOpenAICompletion(
  userInput: string,
  options: GetAzureOpenAICompletionOptions = {}
): Promise<string> {  if (!AZURE_FUNCTION_ENDPOINT) {
    logger.warn('Azure Function endpoint is not configured');
    await new Promise(resolve => setTimeout(resolve, 700));
    return `Konfigurasi Azure Function belum lengkap. Kamu bilang: "${userInput}"`;
  }
  const payload = {
    userInput,
    systemPrompt: options.systemPrompt,
    messageHistory: options.messageHistory,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 200
  };

  try {
    // Kirim request ke Azure Function yang akan meneruskan ke Azure OpenAI
    const response = await fetch(AZURE_FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('Azure Function API Error', { status: response.status });
      throw new Error(`Azure Function API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();    if (data.response) {
      return data.response.trim();
    } else {
      logger.error('Invalid response structure from Azure Function');
      throw new Error('Invalid response structure from Azure Function.');
    }  } catch (error) {
    logger.error('Failed to fetch AI completion via Azure Function');
    // Mengembalikan pesan error yang lebih ramah pengguna atau fallback
    return "Maaf, aku sedang mengalami sedikit kesulitan untuk merespons saat ini. Coba lagi nanti ya.";
  }
}