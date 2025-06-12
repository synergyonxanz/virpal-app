/**
 * VirPal App - AI Assistant with Azure Functions
 * Copyright (c) 2025 Achmad Reihan Alfaiz. All rights reserved.
 *
 * This file is part of VirPal App, a proprietary software application.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This source code is the exclusive property of Achmad Reihan Alfaiz.
 * No part of this software may be reproduced, distributed, or transmitted
 * in any form or by any means, including photocopying, recording, or other
 * electronic or mechanical methods, without the prior written permission
 * of the copyright holder, except in the case of brief quotations embodied
 * in critical reviews and certain other noncommercial uses permitted by
 * copyright law.
 *
 * For licensing inquiries: reihan3000@gmail.com
 */

import React, { useEffect, useRef, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  onShowAbout: () => void;
  onShowSubscription: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewChat,
  onToggleHistory,
  isHistoryOpen,
  onShowAbout,
  onShowSubscription,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsClosing, setIsSettingsClosing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('Sistem');
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const themeHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const themeAreaRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    { label: 'Sistem', value: 'system' },
    { label: 'Terang', value: 'light' },
    { label: 'Gelap', value: 'dark' },
  ];
  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    handleCloseSettings();
  };

  const handleThemeHover = (show: boolean) => {
    if (themeHoverTimeoutRef.current) {
      clearTimeout(themeHoverTimeoutRef.current);
      themeHoverTimeoutRef.current = null;
    }

    if (show) {
      setShowThemeOptions(true);
    } else {
      // Delay sebelum menutup untuk memberikan waktu mouse bergerak
      themeHoverTimeoutRef.current = setTimeout(() => {
        setShowThemeOptions(false);
      }, 100);
    }
  };

  const handleCloseSettings = () => {
    if (themeHoverTimeoutRef.current) {
      clearTimeout(themeHoverTimeoutRef.current);
      themeHoverTimeoutRef.current = null;
    }
    setIsSettingsClosing(true);
    setShowThemeOptions(false);
    setTimeout(() => {
      setIsSettingsOpen(false);
      setIsSettingsClosing(false);
    }, 200); // Delay yang sama dengan durasi animasi slideOutToBottom
  };

  const handleToggleSettings = () => {
    if (isSettingsOpen) {
      handleCloseSettings();
    } else {
      setIsSettingsOpen(true);
    }
  }; // Handle click outside to close settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        if (isSettingsOpen && !isSettingsClosing) {
          handleCloseSettings();
        }
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen, isSettingsClosing]); // Initialize system theme on component mount and listen for system changes
  useEffect(() => {
    const applySystemTheme = () => {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };

    // Apply system theme immediately on mount (since default is 'Sistem')
    applySystemTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      // Only apply system theme changes if current theme is 'Sistem'
      if (currentTheme === 'Sistem') {
        applySystemTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [currentTheme]);

  // Apply theme changes when currentTheme changes manually
  useEffect(() => {
    if (currentTheme === 'Gelap') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (currentTheme === 'Terang') {
      document.documentElement.removeAttribute('data-theme');
    } else if (currentTheme === 'Sistem') {
      // Apply current system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, [currentTheme]);
  return (
    <div
      className="sidebar-element fixed left-0 top-0 h-full w-full max-w-[90%] sm:max-w-64 md:max-w-64 shadow-2xl z-50 border-r flex flex-col"
      style={{
        backgroundColor: 'var(--virpal-sidebar-bg)',
        borderRightColor: 'var(--virpal-neutral-lighter)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      {/* Header dengan Logo dan tombol tutup */}
      <div className="p-4 flex items-center justify-between theme-transition">
        {' '}
        <div className="flex items-center theme-transition">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 theme-transition"
            style={{ backgroundColor: 'var(--virpal-secondary)' }}
          >
            V
          </div>
          <h1
            className="font-bold text-xl theme-transition"
            style={{ color: 'var(--virpal-sidebar-text)' }}
          >
            VIRPAL
          </h1>
        </div>{' '}
        <button
          onClick={onToggle}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg transition-colors theme-transition"
          style={{
            backgroundColor: 'var(--virpal-secondary)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-secondary-hover)';
            e.currentTarget.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-secondary)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-secondary-active)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-secondary-hover)';
          }}
          title="Tutup Sidebar"
        >
          ←
        </button>
      </div>{' '}
      {/* Menu Items */}
      <div className="p-4 flex flex-col gap-2 theme-transition">
        {' '}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition"
          style={{
            backgroundColor: 'var(--virpal-sidebar-bg)',
            color: 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
            e.currentTarget.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-sidebar-bg)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
        >
          {' '}
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: 'var(--virpal-neutral-lighter)',
              color: 'var(--virpal-sidebar-text)',
            }}
          >
            +
          </span>
          Chat Baru{' '}
        </button>{' '}
        <button
          onClick={onToggleHistory}
          className={`w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition`}
          style={{
            backgroundColor: isHistoryOpen
              ? 'var(--virpal-accent)'
              : 'var(--virpal-sidebar-bg)',
            color: isHistoryOpen
              ? 'var(--virpal-primary)'
              : 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.cursor = 'pointer';
            if (!isHistoryOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-hover)';
            } else {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isHistoryOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-bg)';
            } else {
              e.currentTarget.style.backgroundColor = 'var(--virpal-accent)';
            }
          }}
          onMouseDown={(e) => {
            if (!isHistoryOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-hover)';
            } else {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-accent-active)';
            }
          }}
          onMouseUp={(e) => {
            if (!isHistoryOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-hover)';
            } else {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-accent-hover)';
            }
          }}
        >
          {' '}
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: isHistoryOpen
                ? 'var(--virpal-primary)'
                : 'var(--virpal-neutral-lighter)',
              color: isHistoryOpen ? 'white' : 'var(--virpal-sidebar-text)',
              opacity: isHistoryOpen ? '0.8' : '1',
            }}
          >
            {' '}
            📅
          </span>
          Buka History{' '}
        </button>
        {/* Fitur Mental Health */}
        <div className="mt-4 mb-2">
          <h3
            className="text-sm font-semibold px-3 py-1 theme-transition"
            style={{ color: 'var(--virpal-primary)' }}
          >
            Fitur Utama
          </h3>
        </div>
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('virpal:setView', { detail: 'chat' })
            )
          }
          className="w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition"
          style={{
            backgroundColor: 'var(--virpal-sidebar-bg)',
            color: 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-sidebar-bg)';
          }}
        >
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: 'var(--virpal-neutral-lighter)',
              color: 'var(--virpal-sidebar-text)',
            }}
          >
            💬
          </span>
          AI Chat Support
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('virpal:setView', { detail: 'mood' })
            )
          }
          className="w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition"
          style={{
            backgroundColor: 'var(--virpal-sidebar-bg)',
            color: 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-sidebar-bg)';
          }}
        >
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: 'var(--virpal-neutral-lighter)',
              color: 'var(--virpal-sidebar-text)',
            }}
          >
            📊
          </span>
          Mood Tracker
        </button>
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('virpal:setView', { detail: 'assessment' })
            )
          }
          className="w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition"
          style={{
            backgroundColor: 'var(--virpal-sidebar-bg)',
            color: 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-sidebar-bg)';
          }}
        >
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: 'var(--virpal-neutral-lighter)',
              color: 'var(--virpal-sidebar-text)',
            }}
          >
            🎯
          </span>
          Risk Assessment
        </button>
        <button
          onClick={onShowSubscription}
          className="w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition"
          style={{
            backgroundColor: 'var(--virpal-sidebar-bg)',
            color: 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
            e.currentTarget.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-sidebar-bg)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--virpal-sidebar-hover)';
          }}
        >
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: 'var(--virpal-neutral-lighter)',
              color: 'var(--virpal-sidebar-text)',
            }}
          >
            ⭐
          </span>
          Langganan
        </button>
      </div>{' '}
      {/* Settings Button - hanya tampil saat sidebar terbuka */}
      <div className="mt-auto p-4 relative theme-transition" ref={settingsRef}>
        {' '}
        {/* Dropup Menu */}
        {(isSettingsOpen || isSettingsClosing) && (
          <div
            className="absolute bottom-20 left-4 right-4 rounded-lg shadow-lg border z-50 theme-transition"
            style={{
              backgroundColor: 'var(--virpal-sidebar-bg)',
              borderColor: 'var(--virpal-neutral-lighter)',
              animation: isSettingsClosing
                ? 'slideOutToBottom 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'slideInFromBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'bottom center',
            }}
          >
            {' '}
            <div className="p-2 relative theme-transition">
              {/* Tema dengan container yang extended untuk menutupi gap */}{' '}
              <div
                ref={themeAreaRef}
                className="relative theme-transition"
                onMouseEnter={() => handleThemeHover(true)}
                onMouseLeave={() => handleThemeHover(false)}
              >
                {' '}
                <div
                  className="text-xs font-medium px-2 py-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-between relative theme-trigger theme-transition"
                  style={{ color: 'var(--virpal-sidebar-text)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'var(--virpal-sidebar-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>Tema</span>
                  <span>▶</span>
                </div>
                {/* Submenu Tema - muncul ke kanan dengan area yang extended */}
                {showThemeOptions && !isSettingsClosing && (
                  <div
                    data-submenu="theme"
                    className="absolute left-56 -top-2 min-w-32 rounded-lg shadow-lg border z-60 theme-transition"
                    style={{
                      backgroundColor: 'var(--virpal-sidebar-bg)',
                      borderColor: 'var(--virpal-neutral-lighter)',
                      animation:
                        'slideInFromLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      marginLeft: '-2px', // Overlap sedikit untuk menghilangkan gap
                    }}
                  >
                    <div className="p-1">
                      {themeOptions.map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => handleThemeChange(option.label)}
                          className="w-full text-left px-3 py-2 rounded text-sm transition-all duration-200 flex items-center justify-between theme-transition"
                          style={{
                            backgroundColor:
                              currentTheme === option.label
                                ? 'var(--virpal-accent)'
                                : 'transparent',
                            color:
                              currentTheme === option.label
                                ? 'var(--virpal-primary)'
                                : 'var(--virpal-sidebar-text)',
                            cursor: 'pointer',
                            animationDelay: `${index * 30}ms`,
                            animation: 'fadeInScale 0.15s ease-out forwards',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.cursor = 'pointer';
                            if (currentTheme !== option.label) {
                              e.currentTarget.style.backgroundColor =
                                'var(--virpal-sidebar-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentTheme !== option.label) {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                            }
                          }}
                          onMouseDown={(e) => {
                            if (currentTheme !== option.label) {
                              e.currentTarget.style.backgroundColor =
                                'var(--virpal-accent-active)';
                            }
                          }}
                          onMouseUp={(e) => {
                            if (currentTheme !== option.label) {
                              e.currentTarget.style.backgroundColor =
                                'var(--virpal-sidebar-hover)';
                            }
                          }}
                        >
                          <span>{option.label}</span>
                          {currentTheme === option.label && (
                            <span className="text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Tentang Kami */}
              <div
                className="text-xs font-medium px-2 py-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-between theme-transition"
                style={{ color: 'var(--virpal-sidebar-text)' }}
                onClick={() => {
                  handleCloseSettings();
                  onShowAbout();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--virpal-sidebar-hover)';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--virpal-accent-active)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--virpal-sidebar-hover)';
                }}
              >
                <span>Tentang Kami</span>
                <span>ℹ️</span>
              </div>
            </div>
          </div>
        )}
        {/* Settings Button */}
        <button
          onClick={handleToggleSettings}
          className={`w-full flex items-center gap-3 rounded-lg p-3 font-semibold text-base transition-colors theme-transition`}
          style={{
            backgroundColor: isSettingsOpen
              ? 'var(--virpal-accent)'
              : 'var(--virpal-sidebar-bg)',
            color: isSettingsOpen
              ? 'var(--virpal-primary)'
              : 'var(--virpal-sidebar-text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.cursor = 'pointer';
            if (!isSettingsOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-hover)';
            } else {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSettingsOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-bg)';
            } else {
              e.currentTarget.style.backgroundColor = 'var(--virpal-accent)';
            }
          }}
          onMouseDown={(e) => {
            if (!isSettingsOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-hover)';
            } else {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-accent-active)';
            }
          }}
          onMouseUp={(e) => {
            if (!isSettingsOpen) {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-sidebar-hover)';
            } else {
              e.currentTarget.style.backgroundColor =
                'var(--virpal-accent-hover)';
            }
          }}
        >
          <span
            className="w-8 h-8 rounded flex items-center justify-center text-xl theme-transition"
            style={{
              backgroundColor: isSettingsOpen
                ? 'var(--virpal-primary)'
                : 'var(--virpal-neutral-lighter)',
              color: isSettingsOpen ? 'white' : 'var(--virpal-sidebar-text)',
              opacity: isSettingsOpen ? '0.8' : '1',
            }}
          >
            ⚙️
          </span>
          Setelan & Bantuan
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
