import type { ChatMessage, AvatarExpression } from '../types';
import { getAzureOpenAICompletion } from '../services/azureFunctionService';
import { playAzureTTS } from '../services/azureSpeechService';
import { SYSTEM_PROMPT } from './constants';
import { createUserMessage, createVirpalMessage, createErrorMessage, determineExpressionFromResponse } from './helpers';

// Interface untuk callback functions
interface MessageHandlerCallbacks {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsVirpalTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setVirpalExpression: React.Dispatch<React.SetStateAction<AvatarExpression>>;
  enableTTS?: boolean; // Optional TTS support
}

// Handler untuk menangani pengiriman pesan user
export const handleUserSendMessage = async (
  messageText: string,
  messages: ChatMessage[],
  callbacks: MessageHandlerCallbacks
) => {
  const { setMessages, setIsVirpalTyping, setVirpalExpression, enableTTS = false } = callbacks;
  
  const newUserMessage = createUserMessage(messageText);
  
  setMessages((prev) => [...prev, newUserMessage]);
  
  setIsVirpalTyping(true);
  setVirpalExpression('thinking');

  try {    const aiResponseText = await getAzureOpenAICompletion(messageText, {
      systemPrompt: SYSTEM_PROMPT,
      messageHistory: messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    });const virpalResponseMessage = createVirpalMessage(aiResponseText);
    
    setMessages((prev) => [...prev, virpalResponseMessage]);
    
    setVirpalExpression(determineExpressionFromResponse(aiResponseText));

    // Play TTS if enabled
    if (enableTTS) {
      try {
        await playAzureTTS(aiResponseText);    } catch (ttsError) {
      // TTS failure shouldn't break the chat experience
    }
    }
  } catch (error) {
    const errorMessage = createErrorMessage();
    setMessages((prev) => [...prev, errorMessage]);
    setVirpalExpression('sad');
  } finally {
    setIsVirpalTyping(false);
  }
};