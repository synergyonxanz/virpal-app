// /**
//  * Azure Cosmos DB NoSQL Service for VIRPAL App
//  * 
//  * Complete CRUD operations for users, conversations, messages, and analytics
//  * with secure authentication, retry logic, and performance optimization.
//  */

// import { CosmosClient, Database, Container, ConnectionMode } from '@azure/cosmos';
// import type { FeedOptions, SqlQuerySpec, CosmosClientOptions } from '@azure/cosmos';
// import { frontendKeyVaultService } from './frontendKeyVaultService';
// import { logger } from '../utils/logger';
// import type {
//   UserEntity,
//   ConversationEntity,
//   MessageEntity,
//   AnalyticsEntity,
//   CosmosDbConfig,
//   CosmosQueryResult,
//   CosmosOperationOptions,
//   ContainerConfig
// } from '../types/cosmosTypes';

// /**
//  * Azure Cosmos DB Service Class
//  * Manages all database operations with comprehensive error handling and performance optimization
//  */
// class AzureCosmosDbService {
//   private client: CosmosClient | null = null;
//   private database: Database | null = null;
//   private containers: Map<string, Container> = new Map();
//   private config: CosmosDbConfig | null = null;
//   private isInitialized = false;
//   private initializationPromise: Promise<boolean> | null = null;

//   // Container configurations optimized for shared throughput
//   private readonly containerConfigs: ContainerConfig[] = [
//     {
//       name: 'users',
//       partitionKeyPath: '/id',
//       defaultTtl: -1 // No TTL for user data
//     },
//     {
//       name: 'conversations', 
//       partitionKeyPath: '/userId',
//       defaultTtl: -1 // No TTL for conversations
//     },
//     {
//       name: 'messages',
//       partitionKeyPath: '/conversationId',
//       defaultTtl: -1 // No TTL for messages
//     },
//     {
//       name: 'analytics',
//       partitionKeyPath: '/date',
//       defaultTtl: 7776000 // 90 days TTL for analytics data
//     }
//   ];

//   /**
//    * Initialize the Cosmos DB service
//    * Loads configuration from Key Vault and establishes connection
//    */
//   async initialize(): Promise<boolean> {
//     if (this.initializationPromise) {
//       return this.initializationPromise;
//     }

//     this.initializationPromise = this._initializeInternal();
//     return this.initializationPromise;
//   }

//   private async _initializeInternal(): Promise<boolean> {
//     if (this.isInitialized) {
//       return true;
//     }

//     try {
//       logger.debug('Initializing Azure Cosmos DB service');

//       // Load configuration from Key Vault
//       const configLoaded = await this.loadConfiguration();
//       if (!configLoaded || !this.config) {
//         logger.error('Failed to load Cosmos DB configuration');
//         return false;
//       }

//       // Initialize Cosmos DB client
//       await this.initializeClient();

//       // Initialize database and containers
//       await this.initializeDatabase();
//       await this.initializeContainers();

//       this.isInitialized = true;
//       logger.info('Azure Cosmos DB service initialized successfully');
//       return true;

//     } catch (error) {
//       logger.error('Failed to initialize Azure Cosmos DB service', error);
//       this.isInitialized = false;
//       return false;
//     }
//   }  /**
//    * Load Cosmos DB configuration from Azure Key Vault with development fallback
//    */  private async loadConfiguration(): Promise<boolean> {    try {
//       // Check authentication first - cloud storage requires authentication
//       const authService = await import('./authService').then(m => m.authService);
//       if (!authService.isSafelyAuthenticated()) {
//         logger.info('Azure Cosmos DB configuration requires authentication - user not safely authenticated');
//         return false;
//       }

//       logger.debug('Loading Cosmos DB configuration from Key Vault');      // Try to load from Key Vault first
//       try {
//         const secrets = await frontendKeyVaultService.getSecrets([
//           'azure-cosmos-db-endpoint-uri',
//           'azure-cosmos-db-key',
//           'azure-cosmos-db-connection-string',
//           'azure-cosmos-db-database-name'
//         ]);

//         const endpoint = secrets['azure-cosmos-db-endpoint-uri'];
//         const primaryKey = secrets['azure-cosmos-db-key'];
//         const connectionString = secrets['azure-cosmos-db-connection-string'];
//         const databaseName = secrets['azure-cosmos-db-database-name'];

//         // Check if we have valid secrets (not null/undefined)
//         if (databaseName && (connectionString || (endpoint && primaryKey))) {
//           // Successfully loaded from Key Vault
//           this.config = connectionString ? {
//             endpoint: '',
//             connectionString,
//             databaseName,
//             defaultConsistencyLevel: 'Session'
//           } : {
//             endpoint: endpoint!,
//             key: primaryKey!,
//             databaseName,
//             defaultConsistencyLevel: 'Session'
//           };
          
//           logger.debug('Cosmos DB configuration loaded from Key Vault');
//           return true;
//         } else {
//           logger.debug('Key Vault secrets not available (403/unauthorized), trying development fallback');
//         }
//       } catch (keyVaultError) {
//         logger.debug('Key Vault error occurred, trying development fallback', keyVaultError);
//       }

//       // Fallback to environment variables for development
//       const devEndpoint = import.meta.env['VITE_AZURE_COSMOS_ENDPOINT'];
//       const devKey = import.meta.env['VITE_AZURE_COSMOS_KEY'];
//       const devConnectionString = import.meta.env['VITE_AZURE_COSMOS_CONNECTION_STRING'];
//       const devDatabaseName = import.meta.env['VITE_AZURE_COSMOS_DATABASE_NAME'] || 'virpal-dev';

//       if (devConnectionString) {
//         this.config = {
//           endpoint: '',
//           connectionString: devConnectionString,
//           databaseName: devDatabaseName,
//           defaultConsistencyLevel: 'Session'
//         };
//         logger.debug('Cosmos DB configuration loaded from environment variables (connection string)');
//         return true;
//       } else if (devEndpoint && devKey) {
//         this.config = {
//           endpoint: devEndpoint,
//           key: devKey,
//           databaseName: devDatabaseName,
//           defaultConsistencyLevel: 'Session'
//         };
//         logger.debug('Cosmos DB configuration loaded from environment variables (endpoint/key)');
//         return true;
//       }

//       // If no configuration available, log and continue in local-only mode
//       logger.info('No Cosmos DB configuration available - running in local-only mode');
//       return false;

//     } catch (error) {
//       logger.warn('Failed to load Cosmos DB configuration', error);
//       return false;
//     }
//   }

//   /**
//    * Initialize the Cosmos DB client with optimized settings
//    */
//   private async initializeClient(): Promise<void> {
//     if (!this.config) {
//       throw new Error('Configuration not loaded');
//     }

//     try {      // Client options optimized for shared throughput and performance
//       const clientOptions: CosmosClientOptions = {
//         connectionPolicy: {
//           connectionMode: ConnectionMode.Gateway, // More firewall-friendly
//           requestTimeout: 30000,
//           enableEndpointDiscovery: true,
//           preferredLocations: [] // Use default region
//         }
//       };

//       // Add consistency level only if defined
//       if (this.config.defaultConsistencyLevel) {
//         clientOptions.consistencyLevel = this.config.defaultConsistencyLevel;
//       }

//       // Create client based on available configuration
//       if (this.config.connectionString) {
//         this.client = new CosmosClient(this.config.connectionString);
//       } else if (this.config.endpoint && this.config.key) {
//         this.client = new CosmosClient({
//           endpoint: this.config.endpoint,
//           key: this.config.key,
//           ...clientOptions
//         });
//       } else {
//         throw new Error('Invalid configuration: neither connection string nor endpoint/key provided');
//       }

//       logger.debug('Cosmos DB client initialized successfully');

//     } catch (error) {
//       logger.error('Failed to initialize Cosmos DB client', error);
//       throw error;
//     }
//   }

//   /**
//    * Initialize database (assumes it already exists as per user setup)
//    */
//   private async initializeDatabase(): Promise<void> {
//     if (!this.client || !this.config) {
//       throw new Error('Client not initialized');
//     }

//     try {
//       this.database = this.client.database(this.config.databaseName);
      
//       // Test database connection
//       await this.database.read();
//       logger.debug(`Connected to database: ${this.config.databaseName}`);

//     } catch (error) {
//       logger.error('Failed to initialize database', error);
//       throw error;
//     }
//   }

//   /**
//    * Initialize containers (assumes they already exist as per user setup)
//    */
//   private async initializeContainers(): Promise<void> {
//     if (!this.database) {
//       throw new Error('Database not initialized');
//     }

//     try {
//       // Initialize all containers
//       for (const config of this.containerConfigs) {
//         const container = this.database.container(config.name);
        
//         // Test container connection
//         await container.read();
//         this.containers.set(config.name, container);
        
//         logger.debug(`Connected to container: ${config.name}`);
//       }

//       logger.info(`Successfully connected to ${this.containers.size} containers`);

//     } catch (error) {
//       logger.error('Failed to initialize containers', error);
//       throw error;
//     }
//   }

//   /**
//    * Ensure service is initialized before operations
//    */
//   private async ensureInitialized(): Promise<void> {
//     if (!this.isInitialized) {
//       const initialized = await this.initialize();
//       if (!initialized) {
//         throw new Error('Failed to initialize Cosmos DB service');
//       }
//     }
//   }

//   /**
//    * Get container by name with error handling
//    */
//   private getContainer(containerName: string): Container {
//     const container = this.containers.get(containerName);
//     if (!container) {
//       throw new Error(`Container '${containerName}' not found or not initialized`);
//     }
//     return container;
//   }

//   /**
//    * Execute operation with retry logic and comprehensive error handling
//    */
//   private async executeWithRetry<T>(
//     operation: () => Promise<T>,
//     operationName: string,
//     maxRetries: number = 3
//   ): Promise<T> {
//     let lastError: Error;

//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//       try {
//         const result = await operation();
//         if (attempt > 1) {
//           logger.debug(`${operationName} succeeded on attempt ${attempt}`);
//         }
//         return result;

//       } catch (error: any) {
//         lastError = error;
        
//         // Log the attempt
//         if (attempt < maxRetries) {
//           logger.warn(`${operationName} failed on attempt ${attempt}, retrying...`, error);
          
//           // Exponential backoff
//           const delay = Math.pow(2, attempt - 1) * 1000;
//           await new Promise(resolve => setTimeout(resolve, delay));
//         } else {
//           logger.error(`${operationName} failed after ${maxRetries} attempts`, error);
//         }
//       }
//     }

//     throw lastError!;
//   }

//   // ==================== USER OPERATIONS ====================

//   /**
//    * Create a new user
//    */
//   async createUser(userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('users');
      
//       const user: UserEntity = {
//         ...userData,
//         id: userData.email, // Use email as ID since it's unique
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       };

//       const { resource } = await container.items.create(user);
//       logger.debug(`User created successfully: ${user.email}`);
      
//       return resource as UserEntity;
//     }, 'createUser');
//   }

//   /**
//    * Get user by ID (email)
//    */
//   async getUserById(userId: string): Promise<UserEntity | null> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('users');
      
//       try {
//         const { resource } = await container.item(userId, userId).read<UserEntity>();
//         return resource || null;
//       } catch (error: any) {
//         if (error.code === 404) {
//           return null;
//         }
//         throw error;
//       }
//     }, 'getUserById');
//   }

//   /**
//    * Update user
//    */
//   async updateUser(userId: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('users');
      
//       try {
//         const { resource: existingUser } = await container.item(userId, userId).read<UserEntity>();
//         if (!existingUser) {
//           return null;
//         }

//         const updatedUser: UserEntity = {
//           ...existingUser,
//           ...updates,
//           id: userId, // Ensure ID doesn't change
//           updatedAt: new Date().toISOString()
//         };

//         const { resource } = await container.item(userId, userId).replace(updatedUser);
//         logger.debug(`User updated successfully: ${userId}`);
        
//         return resource as UserEntity;
//       } catch (error: any) {
//         if (error.code === 404) {
//           return null;
//         }
//         throw error;
//       }
//     }, 'updateUser');
//   }

//   /**
//    * Delete user
//    */
//   async deleteUser(userId: string): Promise<boolean> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('users');
      
//       try {
//         await container.item(userId, userId).delete();
//         logger.debug(`User deleted successfully: ${userId}`);
//         return true;
//       } catch (error: any) {
//         if (error.code === 404) {
//           return false;
//         }
//         throw error;
//       }
//     }, 'deleteUser');
//   }

//   // ==================== CONVERSATION OPERATIONS ====================

//   /**
//    * Create a new conversation
//    */
//   async createConversation(conversationData: Omit<ConversationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConversationEntity> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('conversations');
      
//       const conversation: ConversationEntity = {
//         ...conversationData,
//         id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         lastActivityTimestamp: new Date().toISOString()
//       };

//       const { resource } = await container.items.create(conversation);
//       logger.debug(`Conversation created successfully: ${conversation.id}`);
      
//       return resource as ConversationEntity;
//     }, 'createConversation');
//   }

//   /**
//    * Get conversations by user ID with pagination
//    */
//   async getConversationsByUserId(
//     userId: string, 
//     options: CosmosOperationOptions = {}
//   ): Promise<CosmosQueryResult<ConversationEntity>> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('conversations');
      
//       const querySpec: SqlQuerySpec = {
//         query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.lastActivityTimestamp DESC',
//         parameters: [{ name: '@userId', value: userId }]
//       };

//       const feedOptions: FeedOptions = {
//         partitionKey: userId,
//         maxItemCount: options.maxItemCount || 50
//       };

//       if (options.continuationToken) {
//         feedOptions.continuationToken = options.continuationToken;
//       }

//       const { resources, requestCharge, continuationToken, activityId } = 
//         await container.items.query<ConversationEntity>(querySpec, feedOptions).fetchNext();

//       return {
//         items: resources,
//         continuationToken,
//         requestCharge,
//         activityId
//       };
//     }, 'getConversationsByUserId');
//   }

//   /**
//    * Update conversation
//    */
//   async updateConversation(conversationId: string, userId: string, updates: Partial<ConversationEntity>): Promise<ConversationEntity | null> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('conversations');
      
//       try {
//         const { resource: existingConversation } = await container.item(conversationId, userId).read<ConversationEntity>();
//         if (!existingConversation) {
//           return null;
//         }

//         const updatedConversation: ConversationEntity = {
//           ...existingConversation,
//           ...updates,
//           id: conversationId,
//           userId: userId,
//           updatedAt: new Date().toISOString(),
//           lastActivityTimestamp: new Date().toISOString()
//         };

//         const { resource } = await container.item(conversationId, userId).replace(updatedConversation);
//         logger.debug(`Conversation updated successfully: ${conversationId}`);
        
//         return resource as ConversationEntity;
//       } catch (error: any) {
//         if (error.code === 404) {
//           return null;
//         }
//         throw error;
//       }
//     }, 'updateConversation');
//   }

//   // ==================== MESSAGE OPERATIONS ====================

//   /**
//    * Create a new message
//    */
//   async createMessage(messageData: Omit<MessageEntity, 'id' | 'timestamp'>): Promise<MessageEntity> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('messages');
      
//       const message: MessageEntity = {
//         ...messageData,
//         id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         timestamp: new Date().toISOString()
//       };

//       const { resource } = await container.items.create(message);
//       logger.debug(`Message created successfully: ${message.id}`);
      
//       return resource as MessageEntity;
//     }, 'createMessage');
//   }

//   /**
//    * Get messages by conversation ID with pagination
//    */
//   async getMessagesByConversationId(
//     conversationId: string, 
//     options: CosmosOperationOptions = {}
//   ): Promise<CosmosQueryResult<MessageEntity>> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('messages');
      
//       const querySpec: SqlQuerySpec = {
//         query: 'SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.timestamp ASC',
//         parameters: [{ name: '@conversationId', value: conversationId }]
//       };

//       const feedOptions: FeedOptions = {
//         partitionKey: conversationId,
//         maxItemCount: options.maxItemCount || 100
//       };

//       if (options.continuationToken) {
//         feedOptions.continuationToken = options.continuationToken;
//       }

//       const { resources, requestCharge, continuationToken, activityId } = 
//         await container.items.query<MessageEntity>(querySpec, feedOptions).fetchNext();

//       return {
//         items: resources,
//         continuationToken,
//         requestCharge,
//         activityId
//       };
//     }, 'getMessagesByConversationId');
//   }

//   // ==================== ANALYTICS OPERATIONS ====================

//   /**
//    * Create analytics entry
//    */
//   async createAnalytics(analyticsData: Omit<AnalyticsEntity, 'id' | 'createdAt'>): Promise<AnalyticsEntity> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('analytics');
      
//       const analytics: AnalyticsEntity = {
//         ...analyticsData,
//         id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         createdAt: new Date().toISOString()
//       };

//       const { resource } = await container.items.create(analytics);
//       logger.debug(`Analytics entry created successfully: ${analytics.id}`);
      
//       return resource as AnalyticsEntity;
//     }, 'createAnalytics');
//   }

//   /**
//    * Get analytics by date range
//    */
//   async getAnalyticsByDateRange(
//     startDate: string, 
//     endDate: string, 
//     userId?: string,
//     options: CosmosOperationOptions = {}
//   ): Promise<CosmosQueryResult<AnalyticsEntity>> {
//     await this.ensureInitialized();
    
//     return this.executeWithRetry(async () => {
//       const container = this.getContainer('analytics');
      
//       let query = 'SELECT * FROM c WHERE c.date >= @startDate AND c.date <= @endDate';
//       const parameters = [
//         { name: '@startDate', value: startDate },
//         { name: '@endDate', value: endDate }
//       ];

//       if (userId) {
//         query += ' AND c.userId = @userId';
//         parameters.push({ name: '@userId', value: userId });
//       }

//       query += ' ORDER BY c.date DESC, c.timestamp DESC';

//       const querySpec: SqlQuerySpec = { query, parameters };

//       const feedOptions: FeedOptions = {
//         maxItemCount: options.maxItemCount || 100
//       };

//       if (options.continuationToken) {
//         feedOptions.continuationToken = options.continuationToken;
//       }

//       const { resources, requestCharge, continuationToken, activityId } = 
//         await container.items.query<AnalyticsEntity>(querySpec, feedOptions).fetchNext();

//       return {
//         items: resources,
//         continuationToken,
//         requestCharge,
//         activityId
//       };
//     }, 'getAnalyticsByDateRange');
//   }

//   // ==================== UTILITY METHODS ====================
//   /**
//    * Health check for the service with detailed connection status
//    */
//   async healthCheck(): Promise<{
//     isInitialized: boolean;
//     databaseName?: string;
//     containerCount: number;
//     lastConnectionTest?: Date;
//     connectionError?: string;
//     endpoint?: string;
//     isDevMode?: boolean;
//   }> {
//     const isDevMode = import.meta.env['VITE_DEV_MODE'] === 'true';
    
//     try {
//       // First check if we even have configuration
//       if (!this.config) {
//         const configLoaded = await this.loadConfiguration();
//         if (!configLoaded) {        return {
//             isInitialized: false,
//             containerCount: 0,
//             connectionError: 'No Cosmos DB configuration available',
//             isDevMode
//           };
//         }
//       }

//       await this.ensureInitialized();
      
//       // Test connection with detailed error reporting
//       if (this.database) {
//         await this.database.read();
//       }

//       const healthResult: any = {
//         isInitialized: this.isInitialized,
//         containerCount: this.containers.size,
//         lastConnectionTest: new Date(),
//         isDevMode
//       };

//       // Add configuration details for debugging
//       if (this.config?.databaseName) {
//         healthResult.databaseName = this.config.databaseName;
//       }
//       if (this.config?.endpoint) {
//         healthResult.endpoint = this.config.endpoint;
//       }

//       return healthResult;
//     } catch (error: any) {
//       let connectionError = 'Unknown error';
      
//       // Provide specific error messages for common issues
//       if (error.code === 'ECONNREFUSED') {
//         connectionError = 'Connection refused - Cosmos DB emulator may not be running';
//       } else if (error.code === 'ENOTFOUND') {
//         connectionError = 'Hostname not found - check endpoint configuration';
//       } else if (error.message?.includes('401')) {
//         connectionError = 'Authentication failed - check key/connection string';
//       } else if (error.message?.includes('403')) {
//         connectionError = 'Access forbidden - check permissions';
//       } else {
//         connectionError = error.message || error.toString();
//       }      logger.error('Health check failed', { error: connectionError, isDevMode });
      
//       const result: any = {
//         isInitialized: false,
//         containerCount: 0,
//         connectionError,
//         isDevMode
//       };
      
//       if (this.config?.endpoint) {
//         result.endpoint = this.config.endpoint;
//       }
      
//       return result;
//     }
//   }

//   /**
//    * Close all connections and clean up resources
//    */
//   async dispose(): Promise<void> {
//     try {
//       if (this.client) {
//         this.client.dispose();
//         this.client = null;
//       }
      
//       this.database = null;
//       this.containers.clear();
//       this.config = null;
//       this.isInitialized = false;
//       this.initializationPromise = null;
      
//       logger.debug('Cosmos DB service disposed successfully');
//     } catch (error) {
//       logger.error('Error disposing Cosmos DB service', error);
//     }
//   }
// }

// // Export singleton instance
// export const azureCosmosDbService = new AzureCosmosDbService();
// export default azureCosmosDbService;
