import type { ChatMessage } from '../types';

// Welcome message untuk VIRPAL
export const WELCOME_MESSAGE: ChatMessage = {
  id: `virpal-welcome-${Date.now()}`,
  sender: 'virpal',
  text: 'Halo! Aku VIRPAL, teman virtual yang siap mendengarkan. Apa yang ada di pikiranmu hari ini?',
  timestamp: new Date(),
};

// System prompt untuk Azure OpenAI
export const SYSTEM_PROMPT = "Kamu adalah asisten virtual yang ramah dan membantu.";

// Error message ketika ada gangguan
export const ERROR_MESSAGE = 'Ups, sepertinya ada sedikit gangguan di jaringanku. Bisa coba ulangi lagi?';

// Styles untuk komponen
export const APP_STYLES = {
  backgroundColor: 'var(--virpal-neutral-lightest)',
  color: 'var(--virpal-neutral-default)',
};

export const HEADER_STYLES = {
  backgroundColor: 'var(--virpal-accent)',
  borderBottomColor: 'var(--virpal-neutral-lighter)',
};

export const VIRPAL_NAME_STYLES = {
  color: 'var(--virpal-primary)',
};

export const ONLINE_STATUS_STYLES = {
  color: 'green',
};

export const CHAT_AREA_STYLES = {
  backgroundColor: 'var(--virpal-neutral-lightest)',
};

export const FOOTER_TEXT_STYLES = {
  color: 'var(--virpal-neutral-dark)',
};

export const CONTAINER_BORDER_STYLES = {
  borderColor: 'var(--virpal-primary_opacity_30, rgba(121, 80, 242, 0.3))',
};