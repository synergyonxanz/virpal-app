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

import React from 'react';

/**
 * Cloud Sync Status Indicator Component
 *
 * Displays the current cloud synchronization status with proper visual feedback.
 * Applies Virpal color scheme and follows accessibility best practices.
 *
 * Features:
 * - Real-time sync status updates
 * - Accessible tooltips and ARIA labels
 * - Visual indicators for different states
 * - Responsive design with Virpal theme
 */
export type CloudSyncStatus =
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'local-only';

interface CloudSyncIndicatorProps {
  status: CloudSyncStatus;
  isAuthenticated: boolean;
  className?: string;
}

const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({
  status,
  isAuthenticated,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: '🔄',
          text: 'Checking...',
          color: 'var(--virpal-warning)',
          bgColor: 'var(--virpal-accent)',
          title: 'Checking cloud sync status',
        };
      case 'available':
        return {
          icon: '☁️',
          text: 'Cloud Active',
          color: 'var(--virpal-success)',
          bgColor: 'var(--virpal-accent)',
          title: 'Cloud sync is active and available',
        };
      case 'unavailable':
        return {
          icon: '☁️',
          text: 'Cloud Unavailable',
          color: 'var(--virpal-danger)',
          bgColor: 'var(--virpal-accent)',
          title: 'Cloud sync is temporarily unavailable',
        };
      case 'local-only':
      default:
        return {
          icon: '☁️',
          text: isAuthenticated ? 'Local Only' : 'Guest Mode',
          color: 'var(--virpal-neutral-dark)',
          bgColor: 'var(--virpal-neutral-lighter)',
          title: isAuthenticated
            ? 'Using local storage only - cloud sync disabled'
            : 'Guest mode - sign in to enable cloud sync',
        };
    }
  };

  const config = getStatusConfig();
  const isInactive = status === 'local-only' || status === 'unavailable';

  return (
    <div
      className={`cloud-sync-indicator ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bgColor,
        borderRadius: '8px',
        border: '1px solid var(--virpal-neutral-lighter)',
        transition: 'all 0.2s ease',
        cursor: 'help',
        userSelect: 'none',
        opacity: isInactive ? 0.8 : 1,
      }}
      title={config.title}
      aria-label={config.title}
      role="status"
      aria-live="polite"
    >
      <span
        style={{
          fontSize: '0.85em',
          opacity: isInactive ? 0.6 : 1,
          filter: isInactive ? 'grayscale(0.5)' : 'none',
        }}
        aria-hidden="true"
      >
        {config.icon}
      </span>
      <span style={{ lineHeight: 1 }}>{config.text}</span>
      {status === 'local-only' && !isAuthenticated && (
        <span
          style={{
            fontSize: '0.65rem',
            opacity: 0.7,
            marginLeft: '2px',
          }}
          aria-hidden="true"
        >
          (Sign in)
        </span>
      )}
    </div>
  );
};

export default CloudSyncIndicator;
