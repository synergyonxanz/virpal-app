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

/**
 * Hybrid Chat Storage Service for VIRPAL App
 *
 * Combines localStorage (for caching and offline access) with Azure Cosmos DB (for persistent backup)
 * Supports multiple chat sessions per day with comprehensive error handling and sync capabilities
 *
 * Features:
 * - Multiple chat sessions per day
 * - Local caching with Cosmos DB backup
 * - Automatic sync with retry logic
 * - Offline-first approach with cloud backup
 * - Session management with timestamps
 *
 * Best Practices Applied:
 * - Error handling and resilience
 * - Performance optimization with caching
 * - Data consistency between local and cloud
 * - Type safety and validation
 */

import type {
  ChatHistory,
  ChatMessage,
  ChatSession,
  DayChatHistory,
  StorageHealthStatus,
} from '../types';
import { formatDateToString } from '../utils/dateUtils';
// Import Azure Cosmos DB service for cloud storage
import { azureCosmosDbService } from './azureCosmosDbService';

import { logger } from '../utils/logger';
import { authService } from './authService';

const CHAT_HISTORY_KEY = 'virpal_chat_history_v2';
const CURRENT_SESSION_KEY = 'virpal_current_session';
const LAST_SYNC_KEY = 'virpal_last_sync';

/**
 * Hybrid Chat Storage Service Class
 * Manages both local and cloud storage for chat sessions
 */
class HybridChatStorageService {
  private currentSession: ChatSession | null = null;
  private isInitialized = false;
  private syncInProgress = false;
  private cloudConversationId: string | null = null; // Track cloud conversation ID
  private syncedMessageIds = new Set<string>(); // Track synced messages to prevent duplicates
  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Always initialize local storage first
      this.loadCurrentSession();
      this.migrateFromLegacyFormat();
      this.isInitialized = true; // Check authentication status safely
      const isAuthenticated = authService.isSafelyAuthenticated();
      if (isAuthenticated) {
        logger.once(
          'info',
          'User safely authenticated - initializing with cloud storage support'
        );

        // Ensure user exists in Cosmos DB and track login analytics
        this.ensureUserExists().catch((error) => {
          logger.debug(
            'User creation check failed during initialization',
            error
          );
        });

        // Try to sync with cloud asynchronously for authenticated users
        this.attemptCloudSync().catch((_error) => {
          logger.once(
            'info',
            'Cloud sync not available, continuing with local storage only'
          );
        });
      } else {
        logger.once(
          'info',
          'User not safely authenticated - running in local storage mode only'
        );
      }
    } catch (error) {
      logger.warn('Failed to initialize hybrid chat storage service', error);
      // Always ensure we're initialized, even if there are errors
      this.isInitialized = true;
    }
  }
  /**
   * Attempt cloud sync without blocking initialization
   */
  private async attemptCloudSync(): Promise<void> {
    try {
      // Wait a bit for MSAL to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (await this.isCloudSyncAvailable()) {
        await this.syncWithCloud();
        logger.debug('Cloud sync completed during initialization');
      }
    } catch (error) {
      logger.debug('Cloud sync not available');
    }
  }
  /**
   * Safely check if cloud sync is available
   * Implements Azure best practice for safe authentication checking
   **/
  private async isCloudSyncAvailable(): Promise<boolean> {
    try {
      // Wait for auth service initialization
      await authService.waitForInitialization();

      // Check authentication safely without calling MSAL APIs before initialization
      const isAuthenticated = authService.isSafelyAuthenticated();
      if (!isAuthenticated) {
        logger.debug('Cloud sync not available: User not safely authenticated');
        return false;
      }

      // Check if we're in development mode without Cosmos DB
      const isDevMode = import.meta.env['VITE_DEV_MODE'] === 'true';
      if (isDevMode) {
        logger.debug(
          'Development mode detected, checking Cosmos DB configuration...'
        );
      } // Verify Cosmos DB health with detailed error reporting
      const healthStatus = await azureCosmosDbService.healthCheck();
      if (!healthStatus.isInitialized) {
        if (isDevMode) {
          const reason =
            healthStatus.connectionError || 'Configuration not available';
          logger.debug(
            `Cloud sync not available in development mode: ${reason}`
          );

          // Provide specific guidance for common development issues
          if (reason.includes('Connection refused')) {
            logger.info('To enable cloud sync in development:');
            logger.info('   1. Install Azure Cosmos DB Emulator');
            logger.info(
              '   2. Start the emulator (it should run on https://localhost:8081)'
            );
            logger.info(
              '   3. Or set VITE_DEV_MODE=false to run in local-only mode'
            );
          }
        } else {
          logger.warn(
            'Cloud sync not available: Cosmos DB service health check failed',
            {
              error: healthStatus.connectionError,
              endpoint: healthStatus.endpoint,
            }
          );
        }
        return false;
      }

      logger.debug('Cloud sync is available');
      return true;
    } catch (error) {
      logger.debug('Cloud sync availability check failed', error);
      return false;
    }
  }
  /**
   * Generate session title from first user message
   */
  private generateSessionTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find((m) => m.sender === 'user')?.text;
    if (!firstUserMessage) return 'Chat Baru';

    return firstUserMessage.length > 30
      ? firstUserMessage.substring(0, 30) + '...'
      : firstUserMessage;
  }

  /**
   * Generate session summary from messages
   */
  private generateSessionSummary(messages: ChatMessage[]): string {
    const userMessages = messages.filter((m) => m.sender === 'user');
    if (userMessages.length === 0) return 'Percakapan baru';

    const firstMessage = userMessages[0]?.text;
    if (!firstMessage) return 'Percakapan baru';

    return firstMessage.length > 50
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage;
  }
  /**
   * Start a new chat session with enhanced duplicate prevention
   */
  startNewSession(): ChatSession {
    // If there's an active session with no messages, reuse it
    if (this.currentSession && this.currentSession.messages.length === 0) {
      logger.debug(`Reusing existing empty session: ${this.currentSession.id}`);
      return this.currentSession;
    }

    const now = new Date();
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const userProfile = authService.getUserProfile();
    const isAuthenticated = authService.isSafelyAuthenticated();
    const newSession: ChatSession = {
      id: sessionId,
      date: formatDateToString(now),
      startTime: now.toISOString(),
      messages: [],
      ...(isAuthenticated && userProfile?.id && { userId: userProfile.id }),
    };

    this.currentSession = newSession;
    this.saveCurrentSession();

    // Reset cloud sync tracking for new session
    this.cloudConversationId = null;
    this.syncedMessageIds.clear();

    // Track session start analytics
    if (isAuthenticated && userProfile?.email) {
      this.trackAnalytics('chat_session_started', {
        sessionId: sessionId,
        dateCreated: now.toISOString(),
      }).catch((error) => {
        logger.debug('Failed to track session start analytics', error);
      });
    }

    logger.debug(`New chat session started: ${sessionId}`);
    return newSession;
  }

  /**
   * Get current active session
   */
  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }
  /**
   * Add message to current session with comprehensive error handling
   */
  async addMessageToCurrentSession(message: ChatMessage): Promise<void> {
    if (!this.currentSession) {
      this.startNewSession();
    }

    if (this.currentSession) {
      this.currentSession.messages.push(message);

      // Update session metadata
      if (!this.currentSession.title && message.sender === 'user') {
        this.currentSession.title = this.generateSessionTitle(
          this.currentSession.messages
        );
      }

      // Save locally first (guaranteed to work)
      this.saveCurrentSession();
      await this.saveSessionToLocalHistory(this.currentSession);

      // Track analytics for message interactions
      if (message.sender === 'user') {
        await this.trackAnalytics('user_message_sent', {
          messageLength: message.text.length,
          sessionId: this.currentSession.id,
          hasTitle: !!this.currentSession.title,
        });
      } else if (message.sender === 'virpal') {
        await this.trackAnalytics('assistant_response_generated', {
          messageLength: message.text.length,
          sessionId: this.currentSession.id,
          responseTime:
            new Date().getTime() -
            new Date(
              this.currentSession.messages[
                this.currentSession.messages.length - 2
              ]?.timestamp || new Date()
            ).getTime(),
        });
      }

      // Sync only the new message to cloud if available (optimized approach)
      if (await this.isCloudSyncAvailable()) {
        this.syncNewMessageToCloud(message, this.currentSession).catch(
          (error: any) => {
            logger.warn('Failed to sync new message to cloud', error);
          }
        );
      }
    }
  }
  /**
   * End current session with improved error handling
   */
  async endCurrentSession(): Promise<void> {
    if (!this.currentSession) return;

    const now = new Date();
    this.currentSession.endTime = now.toISOString();
    this.currentSession.summary = this.generateSessionSummary(
      this.currentSession.messages
    ); // Save final session locally
    await this.saveSessionToLocalHistory(this.currentSession);

    // Track session end analytics
    const sessionDuration =
      now.getTime() - new Date(this.currentSession.startTime).getTime();
    await this.trackAnalytics('chat_session_ended', {
      sessionId: this.currentSession.id,
      messageCount: this.currentSession.messages.length,
      sessionDurationMs: sessionDuration,
      sessionDurationMinutes: Math.round(sessionDuration / 60000),
      hasTitle: !!this.currentSession.title,
      hasSummary: !!this.currentSession.summary,
    });

    // Final sync to cloud if available (only syncs remaining unsynced messages)
    if (await this.isCloudSyncAvailable()) {
      await this.syncSessionToCloud(this.currentSession).catch((error: any) => {
        logger.warn('Failed to sync ended session to cloud', error);
      });
    }

    // Clear current session and reset tracking
    this.currentSession = null;
    this.cloudConversationId = null;
    this.syncedMessageIds.clear();
    localStorage.removeItem(CURRENT_SESSION_KEY);

    logger.debug('Chat session ended and saved');
  }
  /**
   * Load current session from localStorage
   */
  private loadCurrentSession(): void {
    try {
      const stored = localStorage.getItem(CURRENT_SESSION_KEY);
      if (stored) {
        this.currentSession = JSON.parse(stored);
        // Reset cloud tracking for loaded session (will be re-established on next sync)
        this.cloudConversationId = null;
        this.syncedMessageIds.clear();
        logger.debug('Current session loaded from localStorage');
      }
    } catch (error) {
      logger.warn('Failed to load current session from localStorage', error);
      this.currentSession = null;
    }
  }

  /**
   * Save current session to localStorage
   */
  private saveCurrentSession(): void {
    try {
      if (this.currentSession) {
        localStorage.setItem(
          CURRENT_SESSION_KEY,
          JSON.stringify(this.currentSession)
        );
      }
    } catch (error) {
      logger.warn('Failed to save current session to localStorage', error);
    }
  }
  /**
   * Save session to local history with duplicate prevention
   */
  private async saveSessionToLocalHistory(session: ChatSession): Promise<void> {
    try {
      const allHistory = this.getLocalDayHistory();
      let dayHistory = allHistory.find((d) => d.date === session.date);

      if (!dayHistory) {
        dayHistory = {
          date: session.date,
          sessions: [],
          totalSessions: 0,
        };
        allHistory.push(dayHistory);
      }

      // Check for existing session with same ID to prevent duplicates
      const existingSessionIndex = dayHistory.sessions.findIndex(
        (s) => s.id === session.id
      );
      if (existingSessionIndex >= 0) {
        // Update existing session
        dayHistory.sessions[existingSessionIndex] = { ...session };
        logger.debug(`Updated existing session: ${session.id}`);
      } else {
        // Add new session
        dayHistory.sessions.push({ ...session });
        logger.debug(`Added new session: ${session.id}`);
      }

      // Sort sessions by start time (ascending)
      dayHistory.sessions.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      dayHistory.totalSessions = dayHistory.sessions.length;

      // Sort history by date (descending - most recent first)
      allHistory.sort((a, b) => b.date.localeCompare(a.date)); // Save to localStorage
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
      logger.debug(`Session saved to local history: ${session.id}`);
    } catch (error) {
      logger.error('Failed to save session to local history', error);
    }
  }

  /**
   * Get all local day history
   */
  private getLocalDayHistory(): DayChatHistory[] {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.warn('Failed to get local day history', error);
      return [];
    }
  }

  /**
   * Get chat sessions for a specific date
   */
  getChatSessionsForDate(date: string): ChatSession[] {
    const dayHistory = this.getLocalDayHistory().find((d) => d.date === date);
    return dayHistory?.sessions || [];
  }

  /**
   * Get all dates with chat history
   */
  getDatesWithHistory(): string[] {
    const allHistory = this.getLocalDayHistory();
    return allHistory.map((d) => d.date).sort();
  }

  /**
   * Delete a specific chat session
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const allHistory = this.getLocalDayHistory();
      let sessionFound = false;

      for (const dayHistory of allHistory) {
        const sessionIndex = dayHistory.sessions.findIndex(
          (s) => s.id === sessionId
        );
        if (sessionIndex >= 0) {
          dayHistory.sessions.splice(sessionIndex, 1);
          dayHistory.totalSessions = dayHistory.sessions.length;
          sessionFound = true;
          break;
        }
      }

      if (sessionFound) {
        // Remove empty days
        const filteredHistory = allHistory.filter((d) => d.sessions.length > 0);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filteredHistory)); // Delete from cloud if authenticated
        if (await this.isCloudSyncAvailable()) {
          await this.deleteSessionFromCloud(sessionId).catch((error: any) => {
            logger.warn('Failed to delete session from cloud', error);
          });
        }

        logger.debug(`Chat session deleted: ${sessionId}`);
      }
    } catch (error) {
      logger.error('Failed to delete chat session', error);
    }
  }

  /**
   * Delete all chat sessions for a specific date
   */
  async deleteDayHistory(date: string): Promise<void> {
    try {
      const allHistory = this.getLocalDayHistory();
      const dayHistory = allHistory.find((d) => d.date === date);

      if (dayHistory) {
        // Delete from local storage
        const updatedHistory = allHistory.filter((d) => d.date !== date);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory)); // Delete from cloud if authenticated
        if (await this.isCloudSyncAvailable()) {
          for (const session of dayHistory.sessions) {
            await this.deleteSessionFromCloud(session.id).catch(
              (error: any) => {
                logger.warn(
                  `Failed to delete session ${session.id} from cloud`,
                  error
                );
              }
            );
          }
        }

        logger.debug(`Day history deleted: ${date}`);
      }
    } catch (error) {
      logger.error('Failed to delete day history', error);
    }
  }
  /**
   * Sync only new message to cloud storage (optimized approach)
   * Prevents duplicate message creation by tracking synced messages
   */
  private async syncNewMessageToCloud(
    message: ChatMessage,
    session: ChatSession
  ): Promise<void> {
    // Pre-flight checks
    if (!(await this.isCloudSyncAvailable()) || !session.userId) {
      logger.debug('Cloud sync not available or session missing userId');
      return;
    }

    // Skip if message already synced
    if (this.syncedMessageIds.has(message.id)) {
      logger.debug(`Message ${message.id} already synced to cloud, skipping`);
      return;
    }

    try {
      // Verify Cosmos DB is initialized before proceeding
      const health = await azureCosmosDbService.healthCheck();
      if (!health.isInitialized) {
        throw new Error('Cosmos DB service not initialized');
      }

      // Ensure conversation exists in cloud
      if (!this.cloudConversationId) {
        await this.ensureCloudConversationExists(session);
      }

      if (!this.cloudConversationId) {
        throw new Error('Failed to create or get cloud conversation');
      }

      // Create only the new message in Cosmos DB
      const messageData = {
        conversationId: this.cloudConversationId,
        sender:
          message.sender === 'user'
            ? ('user' as const)
            : ('assistant' as const),
        text: message.text,
        ...(message.audioUrl && { audioUrl: message.audioUrl }),
        metadata: {
          ...(message.sender === 'virpal' && {
            model: 'gpt-4o-mini',
            tokens: message.text.length,
          }),
        },
      };

      await azureCosmosDbService.createMessage(messageData);

      // Mark message as synced
      this.syncedMessageIds.add(message.id);

      // Update conversation metadata if this is first user message (creates title)
      if (
        message.sender === 'user' &&
        session.title &&
        session.messages.length <= 2
      ) {
        await azureCosmosDbService.updateConversation(
          this.cloudConversationId,
          session.userId,
          {
            title: session.title,
            messageCount: session.messages.length,
            lastActivityTimestamp: new Date().toISOString(),
          }
        );
      }

      // Update last sync timestamp
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      logger.debug(`New message synced to cloud: ${message.id}`);
    } catch (error) {
      logger.warn('Failed to sync new message to cloud', error);
      throw error;
    }
  }
  /**
   * Ensure conversation exists in cloud storage (creates if not exists)
   */
  private async ensureCloudConversationExists(
    session: ChatSession
  ): Promise<void> {
    if (!session.userId) {
      throw new Error('Session missing userId');
    }

    try {
      // First try to find existing conversation for this session
      const existingConversation = await this.findExistingCloudConversation(
        session
      );

      if (existingConversation) {
        this.cloudConversationId = existingConversation.id;
        logger.debug(
          `Found existing cloud conversation: ${existingConversation.id} for session: ${session.id}`
        );

        // Get messages to determine what's already synced
        const existingMessages =
          await azureCosmosDbService.getMessagesByConversationId(
            existingConversation.id
          );
        existingMessages.items.forEach((msg) => {
          // Try to match with local messages to mark as synced
          const localMessage = session.messages.find(
            (localMsg) =>
              localMsg.text === msg.text &&
              localMsg.sender === (msg.sender === 'user' ? 'user' : 'virpal')
          );
          if (localMessage) {
            this.syncedMessageIds.add(localMessage.id);
          }
        });

        return;
      }

      // Create new conversation in Cosmos DB if not found
      const conversationData = {
        userId: session.userId,
        title: session.title || 'Chat Session',
        summary: session.summary || 'Chat session',
        messageCount: session.messages.length,
        date: session.date,
        timestamp: session.startTime,
        lastActivityTimestamp: session.endTime || new Date().toISOString(),
        metadata: {
          tags: [`session-${session.id}`],
          category: 'chat',
          importance: 'medium' as const,
        },
      };

      const conversation = await azureCosmosDbService.createConversation(
        conversationData
      );
      this.cloudConversationId = conversation.id;

      logger.debug(
        `Cloud conversation created: ${conversation.id} for session: ${session.id}`
      );
    } catch (error) {
      logger.warn('Failed to create cloud conversation', error);
      throw error;
    }
  }

  /**
   * Find existing cloud conversation for current session
   */
  private async findExistingCloudConversation(
    session: ChatSession
  ): Promise<any | null> {
    if (!session.userId) return null;

    try {
      // Get recent conversations for user
      const result = await azureCosmosDbService.getConversationsByUserId(
        session.userId,
        { maxItemCount: 20 }
      );

      // Look for conversation with matching session tag
      const existingConversation = result.items.find(
        (conv) =>
          conv.metadata?.tags?.includes(`session-${session.id}`) ||
          (conv.date === session.date && conv.timestamp === session.startTime)
      );

      return existingConversation || null;
    } catch (error) {
      logger.debug('Error finding existing cloud conversation', error);
      return null;
    }
  }

  /**
   * Sync session to cloud storage (full session sync - used for session end)
   * Implements Azure best practices for resilient cloud operations
   * Now optimized to avoid duplicate messages
   */
  private async syncSessionToCloud(session: ChatSession): Promise<void> {
    // Pre-flight checks
    if (!(await this.isCloudSyncAvailable()) || !session.userId) {
      logger.debug('Cloud sync not available or session missing userId');
      return;
    }

    try {
      // Verify Cosmos DB is initialized before proceeding
      const health = await azureCosmosDbService.healthCheck();
      if (!health.isInitialized) {
        throw new Error('Cosmos DB service not initialized');
      }

      // Ensure conversation exists in cloud
      if (!this.cloudConversationId) {
        await this.ensureCloudConversationExists(session);
      }

      if (!this.cloudConversationId) {
        throw new Error('Failed to create or get cloud conversation');
      }

      // Sync only messages that haven't been synced yet
      const unsyncedMessages = session.messages.filter(
        (message) => !this.syncedMessageIds.has(message.id)
      );

      if (unsyncedMessages.length > 0) {
        logger.debug(
          `Syncing ${unsyncedMessages.length} unsynced messages to cloud`
        );

        for (const message of unsyncedMessages) {
          const messageData = {
            conversationId: this.cloudConversationId,
            sender:
              message.sender === 'user'
                ? ('user' as const)
                : ('assistant' as const),
            text: message.text,
            ...(message.audioUrl && { audioUrl: message.audioUrl }),
            metadata: {
              ...(message.sender === 'virpal' && {
                model: 'gpt-4o-mini',
                tokens: message.text.length,
              }),
            },
          };

          await azureCosmosDbService.createMessage(messageData);
          this.syncedMessageIds.add(message.id);
        }
      }

      // Update conversation with final metadata
      await azureCosmosDbService.updateConversation(
        this.cloudConversationId,
        session.userId,
        {
          title: session.title || 'Chat Session',
          summary: session.summary || 'Chat session',
          messageCount: session.messages.length,
          lastActivityTimestamp: session.endTime || new Date().toISOString(),
        }
      );

      // Update last sync timestamp
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      logger.debug(
        `Session synced to cloud: ${session.id} (${unsyncedMessages.length} new messages)`
      );
    } catch (error) {
      logger.warn('Failed to sync session to cloud', error);
      throw error;
    }
  }

  /**
   * Delete session from cloud
   */
  private async deleteSessionFromCloud(sessionId: string): Promise<void> {
    // Implementation would involve querying conversations by metadata.sessionId
    // and deleting associated messages and conversation
    logger.debug(
      `Session deletion from cloud not yet implemented: ${sessionId}`
    );
  }
  /**
   * Sync with cloud (pull remote data) with enhanced error handling
   */
  private async syncWithCloud(): Promise<void> {
    if (this.syncInProgress || !(await this.isCloudSyncAvailable())) return;

    this.syncInProgress = true;
    try {
      const user = authService.getUserProfile();
      if (!user?.id) {
        logger.debug('No user profile available for cloud sync');
        return;
      }

      // Verify Cosmos DB health before querying
      const health = await azureCosmosDbService.healthCheck();
      if (!health.isInitialized) {
        logger.debug('Cosmos DB not initialized, skipping sync');
        return;
      }

      // Get conversations from last 30 days
      const result = await azureCosmosDbService.getConversationsByUserId(
        user.id
      );

      // Convert Cosmos DB data to local format
      for (const conversation of result.items) {
        const messages = await azureCosmosDbService.getMessagesByConversationId(
          conversation.id
        );

        // Extract session ID from tags (if available)
        const sessionTag = conversation.metadata?.tags?.find((tag) =>
          tag.startsWith('session-')
        );
        const sessionId = sessionTag
          ? sessionTag.replace('session-', '')
          : `cosmos-${conversation.id}`;

        const session: ChatSession = {
          id: sessionId,
          date: conversation.date,
          startTime: conversation.createdAt,
          ...(conversation.lastActivityTimestamp !== conversation.createdAt && {
            endTime: conversation.lastActivityTimestamp,
          }),
          messages: messages.items.map((msg) => ({
            id: msg.id,
            sender:
              msg.sender === 'user' ? ('user' as const) : ('virpal' as const),
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            ...(msg.audioUrl && { audioUrl: msg.audioUrl }),
          })),
          ...(conversation.summary && { summary: conversation.summary }),
          title: conversation.title,
          userId: user.id,
        };

        await this.saveSessionToLocalHistory(session);
      } // Update last sync timestamp
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      logger.debug('Cloud sync completed');
    } catch (error) {
      logger.warn('Failed to sync with cloud', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Convert legacy ChatHistory to new format (migration helper)
   */
  migrateFromLegacyFormat(): void {
    try {
      const legacyKey = 'virpal_chat_history';
      const legacyData = localStorage.getItem(legacyKey);

      if (legacyData) {
        const legacyHistory: ChatHistory[] = JSON.parse(legacyData);
        const newHistory: DayChatHistory[] = [];
        for (const legacy of legacyHistory) {
          const userProfile = authService.getUserProfile();
          const isAuthenticated = authService.isSafelyAuthenticated();

          const session: ChatSession = {
            id: `migrated_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            date: legacy.date,
            startTime: new Date(legacy.date + 'T00:00:00').toISOString(),
            messages: legacy.messages,
            ...(legacy.summary && { summary: legacy.summary }),
            title: this.generateSessionTitle(legacy.messages),
            ...(isAuthenticated &&
              userProfile?.id && { userId: userProfile.id }),
          };

          const dayHistory: DayChatHistory = {
            date: legacy.date,
            sessions: [session],
            totalSessions: 1,
          };

          newHistory.push(dayHistory);
        }

        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newHistory));
        localStorage.removeItem(legacyKey); // Remove legacy data

        logger.info('Successfully migrated from legacy chat history format');
      }
    } catch (error) {
      logger.warn('Failed to migrate from legacy format', error);
    }
  }
  /**
   * Get service health status with comprehensive checks
   */
  async getHealthStatus(): Promise<
    StorageHealthStatus & {
      cloudConversationId?: string;
      syncedMessageCount?: number;
      currentSessionMessageCount?: number;
    }
  > {
    const localStorageWorking = (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })();

    let cosmosDbWorking = false;
    try {
      if (await this.isCloudSyncAvailable()) {
        const health = await azureCosmosDbService.healthCheck();
        cosmosDbWorking = health.isInitialized;
      }
    } catch {
      cosmosDbWorking = false;
    }

    const allHistory = this.getLocalDayHistory();
    const totalLocalSessions = allHistory.reduce(
      (total, day) => total + day.totalSessions,
      0
    );
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);

    const baseStatus: StorageHealthStatus = {
      localStorageWorking,
      cosmosDbWorking,
      totalLocalSessions,
      ...(lastSyncTime && { lastSyncTime }),
    };

    return {
      ...baseStatus,
      ...(this.cloudConversationId && {
        cloudConversationId: this.cloudConversationId,
      }),
      syncedMessageCount: this.syncedMessageIds.size,
      currentSessionMessageCount: this.currentSession?.messages.length || 0,
    };
  }
  /**
   * Force synchronization with cloud (for manual testing and debugging)
   * This method can be called from the UI to test cloud sync functionality
   */
  async forceCloudSync(): Promise<{ success: boolean; message: string }> {
    try {
      if (!(await this.isCloudSyncAvailable())) {
        return {
          success: false,
          message:
            'Cloud sync not available. Check authentication and Cosmos DB connection.',
        };
      }

      await this.syncWithCloud();

      return {
        success: true,
        message: 'Cloud sync completed successfully',
      };
    } catch (error) {
      logger.error('Force cloud sync failed', error);
      return {
        success: false,
        message: `Cloud sync failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }
  /**
   * Get current sync status for debugging
   */
  getCurrentSyncStatus(): {
    hasActiveSession: boolean;
    sessionId?: string;
    cloudConversationId?: string;
    totalMessages: number;
    syncedMessages: number;
    unsyncedMessages: number;
    syncInProgress: boolean;
  } {
    const totalMessages = this.currentSession?.messages.length || 0;
    const syncedMessages = this.syncedMessageIds.size;

    return {
      hasActiveSession: !!this.currentSession,
      ...(this.currentSession?.id && { sessionId: this.currentSession.id }),
      ...(this.cloudConversationId && {
        cloudConversationId: this.cloudConversationId,
      }),
      totalMessages,
      syncedMessages,
      unsyncedMessages: totalMessages - syncedMessages,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Reset sync tracking (for debugging/recovery)
   */
  resetSyncTracking(): void {
    this.cloudConversationId = null;
    this.syncedMessageIds.clear();
    logger.info(
      'Sync tracking reset - next sync will treat all messages as new'
    );
  }
  /**
   * Comprehensive integration test for all services
   * This method validates the entire flow from authentication to cloud sync
   */
  async runIntegrationTest(): Promise<{
    success: boolean;
    results: Record<string, { status: 'success' | 'error'; message: string }>;
  }> {
    const results: Record<
      string,
      { status: 'success' | 'error'; message: string }
    > = {};
    let overallSuccess = true;

    // Test 1: Check service initialization
    try {
      await this.initialize();
      results['initialization'] = {
        status: 'success',
        message: 'Hybrid storage service initialized',
      };
    } catch (error) {
      results['initialization'] = {
        status: 'error',
        message: `Initialization failed: ${error}`,
      };
      overallSuccess = false;
    }

    // Test 2: Check localStorage functionality
    try {
      const testSession: ChatSession = {
        id: 'test_session_123',
        date: formatDateToString(new Date()),
        startTime: new Date().toISOString(),
        messages: [
          {
            id: 'msg1',
            sender: 'user',
            text: 'Test message',
            timestamp: new Date(),
          },
        ],
        title: 'Test Session',
      };

      await this.saveSessionToLocalHistory(testSession);
      const retrieved = this.getChatSessionsForDate(testSession.date);
      const found = retrieved.find((s) => s.id === 'test_session_123');

      if (found) {
        results['localStorage'] = {
          status: 'success',
          message: 'Local storage working correctly',
        };
      } else {
        results['localStorage'] = {
          status: 'error',
          message: 'Session not found in local storage',
        };
        overallSuccess = false;
      }
    } catch (error) {
      results['localStorage'] = {
        status: 'error',
        message: `Local storage test failed: ${error}`,
      };
      overallSuccess = false;
    }

    // Test 3: Check cloud sync availability
    try {
      const cloudAvailable = await this.isCloudSyncAvailable();
      if (cloudAvailable) {
        results['cloudAvailability'] = {
          status: 'success',
          message: 'Cloud sync is available',
        };

        // Test 4: If cloud is available, test health check
        try {
          const health = await this.getHealthStatus();
          if (health.cosmosDbWorking) {
            results['cosmosHealth'] = {
              status: 'success',
              message: 'Cosmos DB health check passed',
            };
          } else {
            results['cosmosHealth'] = {
              status: 'error',
              message: 'Cosmos DB health check failed',
            };
            overallSuccess = false;
          }
        } catch (error) {
          results['cosmosHealth'] = {
            status: 'error',
            message: `Cosmos DB health check error: ${error}`,
          };
          overallSuccess = false;
        }
      } else {
        results['cloudAvailability'] = {
          status: 'error',
          message: 'Cloud sync not available - check authentication',
        };
        overallSuccess = false;
      }
    } catch (error) {
      results['cloudAvailability'] = {
        status: 'error',
        message: `Cloud availability check failed: ${error}`,
      };
      overallSuccess = false;
    } // Test 5: Check authentication state
    try {
      const isAuthenticated = authService.isSafelyAuthenticated();
      const userProfile = authService.getUserProfile();

      if (isAuthenticated && userProfile) {
        results['authentication'] = {
          status: 'success',
          message: `Authenticated as ${
            userProfile.email || userProfile.displayName || 'Unknown'
          }`,
        };
      } else {
        results['authentication'] = {
          status: 'error',
          message: 'Not authenticated or missing user profile',
        };
        overallSuccess = false;
      }
    } catch (error) {
      results['authentication'] = {
        status: 'error',
        message: `Authentication check failed: ${error}`,
      };
      overallSuccess = false;
    }

    return { success: overallSuccess, results };
  }

  /**
   * Recover and clean up corrupted sessions
   * This method helps fix data inconsistencies that might occur
   */
  async recoverAndCleanSessions(): Promise<{
    recovered: number;
    removed: number;
    errors: string[];
  }> {
    const result = { recovered: 0, removed: 0, errors: [] as string[] };

    try {
      const allHistory = this.getLocalDayHistory();
      let hasChanges = false;

      for (const dayHistory of allHistory) {
        const validSessions: ChatSession[] = [];
        const sessionIds = new Set<string>();

        for (const session of dayHistory.sessions) {
          try {
            // Check for required fields
            if (!session.id || !session.date || !session.startTime) {
              result.errors.push(
                `Session missing required fields: ${JSON.stringify(session)}`
              );
              result.removed++;
              hasChanges = true;
              continue;
            }

            // Check for duplicate IDs
            if (sessionIds.has(session.id)) {
              result.errors.push(`Duplicate session ID found: ${session.id}`);
              result.removed++;
              hasChanges = true;
              continue;
            }

            sessionIds.add(session.id);

            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
              // Try to fix the date format
              const dateObj = new Date(session.date);
              if (isNaN(dateObj.getTime())) {
                result.errors.push(
                  `Invalid date format in session ${session.id}: ${session.date}`
                );
                result.removed++;
                hasChanges = true;
                continue;
              } else {
                session.date = formatDateToString(dateObj);
                result.recovered++;
                hasChanges = true;
              }
            }

            // Ensure messages array exists
            if (!Array.isArray(session.messages)) {
              session.messages = [];
              result.recovered++;
              hasChanges = true;
            }

            // Generate title if missing
            if (!session.title && session.messages.length > 0) {
              session.title = this.generateSessionTitle(session.messages);
              result.recovered++;
              hasChanges = true;
            }

            validSessions.push(session);
          } catch (error) {
            result.errors.push(`Error processing session: ${error}`);
            result.removed++;
            hasChanges = true;
          }
        }

        // Update the day history with cleaned sessions
        dayHistory.sessions = validSessions;
        dayHistory.totalSessions = validSessions.length;
      }

      // Remove empty days
      const filteredHistory = allHistory.filter(
        (day) => day.sessions.length > 0
      );
      if (filteredHistory.length !== allHistory.length) {
        hasChanges = true;
        result.removed += allHistory.length - filteredHistory.length;
      }

      // Save changes if any
      if (hasChanges) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filteredHistory));
        logger.info(
          `Session recovery completed: ${result.recovered} recovered, ${result.removed} removed`
        );
      }
    } catch (error) {
      result.errors.push(`Recovery process failed: ${error}`);
      logger.error('Session recovery failed', error);
    }

    return result;
  }

  /**
   * Ensure user exists in Cosmos DB
   * Creates user record automatically when first authenticating
   * Implements Azure best practices for user onboarding
   */
  private async ensureUserExists(): Promise<void> {
    if (!(await this.isCloudSyncAvailable())) {
      return;
    }

    try {
      const userProfile = authService.getUserProfile();
      if (!userProfile?.email) {
        logger.debug('No user profile available for user creation');
        return;
      }

      // Check if user already exists
      const existingUser = await azureCosmosDbService.getUserById(
        userProfile.email
      );
      if (existingUser) {
        // Update last login timestamp
        await azureCosmosDbService.updateUser(userProfile.email, {
          lastLoginAt: new Date().toISOString(),
        });
        logger.debug('User exists, updated last login timestamp');
        return;
      }

      // Create new user record
      const userData = {
        email: userProfile.email,
        displayName: userProfile.displayName || userProfile.username || 'User',
        subscriptionTier: 'free' as const,
        preferences: {
          language: 'en',
          theme: 'light' as const,
          notifications: true,
          voiceSettings: {
            voice: 'default',
            speed: 1.0,
            pitch: 1.0,
          },
        },
        lastLoginAt: new Date().toISOString(),
      };

      const createdUser = await azureCosmosDbService.createUser(userData);
      logger.info('New user created successfully', {
        userId: createdUser.id,
        email: '[EMAIL_MASKED]',
      });

      // Track user creation analytics
      await this.trackAnalytics('user_created', {
        userId: createdUser.id,
        userAgent: navigator.userAgent.substring(0, 100),
        referrer: document.referrer || 'direct',
      });
    } catch (error) {
      logger.warn('Failed to ensure user exists', error);
      // Don't throw error - user creation is not critical for app functionality
    }
  }
  /**
   * Track analytics events to populate analytics container
   * Implements Azure best practices for telemetry and monitoring
   */
  private async trackAnalytics(
    eventType: string,
    eventData: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    if (!(await this.isCloudSyncAvailable())) {
      return;
    }

    try {
      const userProfile = authService.getUserProfile();
      const actualUserId = userId || userProfile?.email;

      if (!actualUserId) {
        logger.debug('No user ID available for analytics tracking');
        return;
      }

      const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD format

      const analyticsData = {
        userId: actualUserId,
        date: today, // Partition key
        timestamp: new Date().toISOString(),
        metricType: 'engagement' as const,
        metrics: [
          {
            name: eventType,
            value: 1,
            unit: 'count',
            tags: {
              ...eventData,
              userAgent: navigator.userAgent.substring(0, 100),
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        ],
        rawData: {
          eventType,
          eventData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.substring(0, 100),
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await azureCosmosDbService.createAnalytics(analyticsData);
      logger.debug('Analytics event tracked', {
        eventType,
        userId: '[MASKED]',
      });
    } catch (error) {
      logger.warn('Failed to track analytics event', error);
      // Don't throw error - analytics tracking is not critical for app functionality
    }
  }
}

// Export singleton instance
export const hybridChatStorageService = new HybridChatStorageService();
export default hybridChatStorageService;
