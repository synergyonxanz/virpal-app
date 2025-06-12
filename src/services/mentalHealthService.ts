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

import { getMentalHealthChatCompletion } from './azureOpenAIService';

// Mental Health Service Types
export interface MentalHealthContext {
  userId?: string;
  currentMood?: string;
  recentAssessment?: any;
  riskLevel?: 'low' | 'medium' | 'high';
  previousCrises?: number;
}

export interface CrisisDetectionResult {
  isCrisis: boolean;
  confidenceLevel: number;
  crisisType?:
    | 'suicidal'
    | 'severe_depression'
    | 'gambling_addiction'
    | 'anxiety_attack'
    | undefined;
  immediateActions: string[];
  recommendedResources: string[];
}

export interface MentalHealthResponse {
  response: string;
  crisisDetected: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedResources: string[];
}

/**
 * Mental Health Service (Simplified for Hackathon)
 * Provides AI-powered mental health support with crisis detection
 */
export class MentalHealthService {
  private mentalHealthSystemPrompt = `Anda adalah VirPal, asisten AI khusus kesehatan mental untuk masyarakat Indonesia.

KONTEKS HACKATHON: elevAIte with Dicoding 2025 - SDG 3 (Good Health and Well-being)
FOKUS: Kesehatan mental dan pencegahan kecanduan judi online

PANDUAN RESPONS:
1. Berikan dukungan empatis dalam bahasa Indonesia
2. Prioritaskan keselamatan pengguna
3. Berikan saran praktis untuk kesehatan mental
4. Kenali tanda-tanda krisis mental
5. Fokus pada pencegahan kecanduan judi online
6. Promosikan gaya hidup sehat

TANDA KRISIS YANG HARUS DIPERHATIKAN:
- Pikiran atau ucapan tentang bunuh diri
- Depresi berat dan putus asa
- Kecanduan judi yang merusak
- Serangan panik atau kecemasan ekstrem

RESPONS KRISIS:
- Berikan dukungan segera
- Arahkan ke hotline krisis Indonesia
- Sarankan mencari bantuan profesional
- Jangan tinggalkan pengguna sendirian

Selalu prioritaskan keselamatan dan well-being pengguna.`;

  /**
   * Detect potential mental health crisis from user message
   */
  detectCrisis(message: string): CrisisDetectionResult {
    const normalizedMessage = message.toLowerCase();

    // Crisis keywords detection
    const suicidalKeywords = [
      'bunuh diri',
      'mengakhiri hidup',
      'tidak ingin hidup',
      'ingin mati',
    ];
    const gamblingKeywords = [
      'judi',
      'betting',
      'taruhan',
      'buntung',
      'kalah judi',
      'hutang judi',
    ];
    const depressionKeywords = [
      'putus asa',
      'tidak ada harapan',
      'hidup sia-sia',
      'depresi berat',
    ];
    const anxietyKeywords = [
      'panik',
      'cemas berlebihan',
      'takut berlebihan',
      'serangan panik',
    ];

    let isCrisis = false;
    let crisisType: CrisisDetectionResult['crisisType'] | undefined;
    let confidenceLevel = 0;

    // Check for suicidal thoughts
    if (
      suicidalKeywords.some((keyword) => normalizedMessage.includes(keyword))
    ) {
      isCrisis = true;
      crisisType = 'suicidal';
      confidenceLevel = 0.9;
    }
    // Check for gambling addiction
    else if (
      gamblingKeywords.some((keyword) => normalizedMessage.includes(keyword))
    ) {
      isCrisis = true;
      crisisType = 'gambling_addiction';
      confidenceLevel = 0.8;
    }
    // Check for severe depression
    else if (
      depressionKeywords.some((keyword) => normalizedMessage.includes(keyword))
    ) {
      isCrisis = true;
      crisisType = 'severe_depression';
      confidenceLevel = 0.7;
    }
    // Check for anxiety attacks
    else if (
      anxietyKeywords.some((keyword) => normalizedMessage.includes(keyword))
    ) {
      isCrisis = true;
      crisisType = 'anxiety_attack';
      confidenceLevel = 0.6;
    }
    return {
      isCrisis,
      confidenceLevel,
      crisisType: isCrisis && crisisType ? crisisType : undefined,
      immediateActions:
        isCrisis && crisisType ? this.getCrisisActions(crisisType) : [],
      recommendedResources: this.getRecommendedResources(crisisType),
    };
  }

  /**
   * Get immediate crisis actions
   */
  private getCrisisActions(
    crisisType: NonNullable<CrisisDetectionResult['crisisType']>
  ): string[] {
    const baseActions = [
      'Tetap tenang dan ambil napas dalam-dalam',
      'Hubungi seseorang yang Anda percayai',
      'Jangan sendirian saat ini',
    ];

    switch (crisisType) {
      case 'suicidal':
        return [
          ...baseActions,
          'Segera hubungi hotline krisis: 119 ext 8',
          'Kunjungi UGD rumah sakit terdekat',
          'Hubungi keluarga atau teman terdekat',
        ];
      case 'gambling_addiction':
        return [
          ...baseActions,
          'Blokir semua aplikasi judi di ponsel',
          'Berikan kendali keuangan kepada keluarga',
          'Hubungi konselor kecanduan',
        ];
      case 'severe_depression':
        return [
          ...baseActions,
          'Cari bantuan psikolog atau psikiater',
          'Jangan buat keputusan penting hari ini',
          'Lakukan aktivitas kecil yang menyenangkan',
        ];
      case 'anxiety_attack':
        return [
          ...baseActions,
          'Praktikkan teknik pernapasan 4-7-8',
          'Fokus pada 5 hal yang bisa Anda lihat',
          'Duduk atau berbaring di tempat yang aman',
        ];
      default:
        return baseActions;
    }
  }

  /**
   * Get recommended resources
   */
  private getRecommendedResources(
    crisisType?: CrisisDetectionResult['crisisType']
  ): string[] {
    const baseResources = [
      '🏥 Hotline Krisis Indonesia: 119 ext 8',
      '📞 Halo Kemkes: 1500-567 (24/7)',
      '💙 Into the Light: @intothelightid',
      '🏥 Rumah Sakit Jiwa terdekat',
    ];

    if (!crisisType) return baseResources;

    switch (crisisType) {
      case 'gambling_addiction':
        return [
          ...baseResources,
          '🎯 Yayasan Peduli Gangguan Sosial',
          '📱 Aplikasi: Quit Gambling',
          '🏥 Klinik Kecanduan Behavioral',
        ];
      case 'suicidal':
      case 'severe_depression':
        return [
          ...baseResources,
          '💚 Save Yourselves: 081-1-1111-113',
          '🏥 RSJ Marzoeki Mahdi Bogor',
          '🏥 RSJ Soeharto Heerdjan Jakarta',
        ];
      case 'anxiety_attack':
        return [
          ...baseResources,
          '🧘 Aplikasi Rileks: Headspace, Calm',
          '📱 Aplikasi: Sanvello, MindShift',
          '🏥 Puskesmas dengan layanan keswa',
        ];
      default:
        return baseResources;
    }
  }
  /**
   * Generate mental health response (simplified)
   */
  async generateResponse(message: string): Promise<MentalHealthResponse> {
    try {
      // Detect crisis first
      const crisisResult = this.detectCrisis(message);

      // Prepare context prompt
      let contextPrompt = this.mentalHealthSystemPrompt;

      if (crisisResult.isCrisis) {
        contextPrompt += `\n\nALERT KRISIS TERDETEKSI: ${
          crisisResult.crisisType
        }
Confidence: ${(crisisResult.confidenceLevel * 100).toFixed(0)}%
Prioritaskan keselamatan pengguna dalam respons Anda.`;
      }
      const response = await getMentalHealthChatCompletion(message, {
        currentMood: 'unknown',
        riskLevel: crisisResult.isCrisis ? 'high' : 'low',
        previousCrises: 0,
      });

      return {
        response,
        crisisDetected: crisisResult.isCrisis,
        riskLevel: crisisResult.isCrisis ? 'high' : 'low',
        recommendedResources: crisisResult.recommendedResources,
      };
    } catch (error) {
      console.error('Mental health response generation failed:', error);

      // Fallback response
      const fallbackResponses = [
        'Saya memahami Anda sedang mengalami kesulitan. Meskipun saya tidak dapat memberikan respons lengkap saat ini, ingatlah bahwa Anda tidak sendirian.',
        'Terima kasih telah berbagi dengan saya. Jika Anda merasa dalam krisis, silakan hubungi hotline krisis 119 ext 8.',
        'Saya di sini untuk mendengarkan Anda. Untuk bantuan lebih lanjut, pertimbangkan untuk menghubungi profesional kesehatan mental.',
      ];
      const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
      return {
        response:
          fallbackResponses[randomIndex] ||
          'Maaf, terjadi kesalahan. Silakan coba lagi.',
        crisisDetected: false,
        riskLevel: 'medium',
        recommendedResources: this.getRecommendedResources(),
      };
    }
  }
}

// Export singleton instance
export const mentalHealthService = new MentalHealthService();
