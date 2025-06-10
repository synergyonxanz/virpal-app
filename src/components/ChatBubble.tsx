import React from 'react';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Gaya dasar untuk semua bubble
  const baseBubbleClasses = "max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-xl shadow-md break-words text-sm";

  // Gaya spesifik berdasarkan pengirim menggunakan CSS Variables
  const bubbleStyle = isUser
    ? {
        backgroundColor: 'var(--virpal-primary)',
        color: 'white', // Untuk kontras dengan --virpal-primary
      }
    : {
        backgroundColor: 'var(--virpal-neutral-lighter)',
        color: 'var(--virpal-neutral-default)',
        // border: '1px solid var(--virpal-neutral-lighter)' // Jika ingin border tipis
      };

  // const bubbleAlignmentClasses = isUser
  //   ? 'justify-end rounded-br-none'
  //   : 'justify-start rounded-bl-none';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${baseBubbleClasses} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}
        style={bubbleStyle}
      >
        <p>{message.text}</p>
        {/* Opsional: Timestamp, bisa ditambahkan di sini jika perlu */}
        {/* <span className="text-xs opacity-70 block mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span> */}
      </div>
    </div>
  );
};

export default ChatBubble;