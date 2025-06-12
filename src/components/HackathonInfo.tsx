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

interface HackathonInfoProps {
  className?: string;
}

const HackathonInfo: React.FC<HackathonInfoProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-lg p-6 theme-transition ${className}`}
      style={{
        background: `linear-gradient(135deg, var(--virpal-primary) 0%, var(--virpal-secondary) 100%)`,
        color: 'white',
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            🏆 VirPal - AI Mental Health Assistant
          </h1>{' '}
          <p className="opacity-80">
            elevAIte with Dicoding Hackathon 2025 | SDG 3: Good Health and
            Well-being
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-full text-center theme-transition"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <p className="text-sm font-medium">🎯 Judi Online Prevention</p>
          <p className="text-xs opacity-90">Mental Wellness Support</p>
        </div>
      </div>{' '}
      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div
          className="p-4 rounded-lg theme-transition"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <h3 className="font-semibold mb-2">🤖 AI Mental Health Support</h3>
          <p className="text-sm opacity-80">
            Dukungan kesehatan mental 24/7 dengan AI yang empatik dan responsif
            terhadap krisis
          </p>
        </div>
        <div
          className="p-4 rounded-lg theme-transition"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <h3 className="font-semibold mb-2">📊 Mood & Risk Tracking</h3>
          <p className="text-sm opacity-80">
            Monitoring mood harian dan penilaian risiko kecanduan judi online
            dengan analytics
          </p>
        </div>
        <div
          className="p-4 rounded-lg theme-transition"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <h3 className="font-semibold mb-2">🎯 Personalized Intervention</h3>
          <p className="text-sm opacity-80">
            Rekomendasi dan intervensi yang disesuaikan dengan kondisi
            individual pengguna
          </p>
        </div>
      </div>{' '}
      {/* Azure Services */}
      <div
        className="border-t pt-4"
        style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <h3 className="font-semibold mb-3">⚡ Powered by Microsoft Azure</h3>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs theme-transition"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Azure OpenAI
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs theme-transition"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Cosmos DB
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs theme-transition"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Cognitive Services
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs theme-transition"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Key Vault
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs theme-transition"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Functions
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs theme-transition"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            App Insights
          </span>
        </div>
      </div>
      {/* Submission Info */}
      <div
        className="mt-4 pt-4 text-center"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
      >
        <p className="text-sm opacity-80">
          📧 Team: VirPal Development Team | 👨‍💻 Developer: Achmad Reihan Alfaiz
        </p>
        <p className="text-xs mt-1 opacity-70">
          reihan3000@gmail.com | Submission Date: June 13, 2025
        </p>
      </div>
    </div>
  );
};

export default HackathonInfo;
