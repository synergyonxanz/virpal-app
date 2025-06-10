import React from 'react';
import type { ChatHistory } from '../types';
import ChatBubble from './ChatBubble';

interface HistoryDetailProps {
  selectedDate: Date;
  chatHistory: ChatHistory | null;
  onLoadHistory: (history: ChatHistory) => void;
  onDeleteHistory: (date: string) => void;
}

const HistoryDetail: React.FC<HistoryDetailProps> = ({
  selectedDate,
  chatHistory,
  onLoadHistory,
  onDeleteHistory
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLoadHistory = () => {
    if (chatHistory) {
      onLoadHistory(chatHistory);
    }
  };

  const handleDeleteHistory = () => {
    if (chatHistory && window.confirm('Hapus history chat ini?')) {
      onDeleteHistory(chatHistory.date);
    }  };  return (
    <div className="rounded-lg p-3 shadow-sm border h-full overflow-auto theme-transition" style={{ backgroundColor: 'var(--virpal-content-bg)' }}>
      <div className="mb-3 theme-transition">        <h3 className="font-semibold text-base mb-1 theme-transition" style={{ color: 'var(--virpal-neutral-default)' }}>
          Detail History
        </h3>
        <p className="text-xs theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>
          {formatDate(selectedDate)}
        </p>
      </div>

      {chatHistory ? (        <div className="theme-transition">
          {/* Summary */}
          <div className="mb-3 p-2 rounded-lg theme-transition" style={{ backgroundColor: 'var(--virpal-accent)' }}>            <h4 className="text-xs font-medium mb-1 theme-transition" style={{ color: 'var(--virpal-neutral-default)' }}>Ringkasan</h4>
            <p className="text-xs theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>
              {chatHistory.summary}
            </p>
            <p className="text-xs mt-1 theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>
              {chatHistory.messages.length} pesan
            </p>
          </div>

          {/* Preview messages (first 2) */}
          <div className="mb-3 theme-transition">            <h4 className="text-xs font-medium mb-2 theme-transition" style={{ color: 'var(--virpal-neutral-default)' }}>Preview Pesan</h4>
            <div className="max-h-32 overflow-y-auto theme-transition">
              {chatHistory.messages.slice(0, 2).map((message) => (
                <div key={message.id} className="mb-1 theme-transition">
                  <ChatBubble message={message} />
                </div>
              ))}
              {chatHistory.messages.length > 2 && (
                <p className="text-xs text-center theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>
                  +{chatHistory.messages.length - 2} pesan lainnya
                </p>
              )}
            </div>
          </div>          {/* Action buttons */}
          <div className="flex gap-2 theme-transition">            <button
              onClick={handleLoadHistory}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg text-white font-medium transition-opacity theme-transition"
              style={{ 
                backgroundColor: 'var(--virpal-primary)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary-hover)';
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary-active)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--virpal-primary-hover)';
              }}
            >
              Muat History
            </button>            <button
              onClick={handleDeleteHistory}
              className="px-2 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 transition-colors theme-transition"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(254, 242, 242)';
                e.currentTarget.style.borderColor = 'rgb(252, 165, 165)';
                e.currentTarget.style.color = 'rgb(185, 28, 28)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgb(252, 165, 165)';
                e.currentTarget.style.color = 'rgb(220, 38, 38)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(255, 228, 230)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(254, 242, 242)';
              }}
            >
              Hapus
            </button>
          </div>
        </div>      ) : (
        <div className="text-center py-6 theme-transition">
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center theme-transition"
            style={{ backgroundColor: 'var(--virpal-accent)' }}
          >
            <span className="text-lg">📅</span>
          </div>
          <p className="text-xs theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>
            Tidak ada history chat untuk tanggal ini
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryDetail;