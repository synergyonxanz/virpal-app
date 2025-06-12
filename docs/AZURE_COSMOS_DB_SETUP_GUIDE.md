# Azure Cosmos DB Setup Guide

## 🗄️ Panduan Setup Azure Cosmos DB

Azure Cosmos DB menyediakan database NoSQL global yang scalable untuk aplikasi VIRPAL. Database ini menyimpan data users, conversations, messages, dan analytics dengan performa tinggi dan availability global.

## 🔧 Konfigurasi Dasar

### 1. Membuat Azure Cosmos DB Account

```bash
# Login ke Azure
az login

# Buat Cosmos DB account
az cosmosdb create \
  --name "virpal-cosmos" \
  --resource-group "virpal-rg" \
  --location "eastus" \
  --default-consistency-level "Session" \
  --enable-automatic-failover true \
  --enable-multiple-write-locations false
```

### 2. Membuat Database dan Containers

```bash
# Buat database
az cosmosdb sql database create \
  --account-name "virpal-cosmos" \
  --resource-group "virpal-rg" \
  --name "virpal-db"

# Buat container untuk users
az cosmosdb sql container create \
  --account-name "virpal-cosmos" \
  --resource-group "virpal-rg" \
  --database-name "virpal-db" \
  --name "users" \
  --partition-key-path "/id" \
  --throughput 400

# Buat container untuk conversations
az cosmosdb sql container create \
  --account-name "virpal-cosmos" \
  --resource-group "virpal-rg" \
  --database-name "virpal-db" \
  --name "conversations" \
  --partition-key-path "/userId" \
  --throughput 400

# Buat container untuk messages
az cosmosdb sql container create \
  --account-name "virpal-cosmos" \
  --resource-group "virpal-rg" \
  --database-name "virpal-db" \
  --name "messages" \
  --partition-key-path "/conversationId" \
  --throughput 400

# Buat container untuk analytics
az cosmosdb sql container create \
  --account-name "virpal-cosmos" \
  --resource-group "virpal-rg" \
  --database-name "virpal-db" \
  --name "analytics" \
  --partition-key-path "/date" \
  --throughput 400 \
  --ttl 7776000
```

## 🔐 Konfigurasi Keamanan

### 1. Simpan Kredensial di Key Vault

```bash
# Dapatkan connection string dan keys
COSMOS_ENDPOINT=$(az cosmosdb show --name "virpal-cosmos" --resource-group "virpal-rg" --query "documentEndpoint" -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --name "virpal-cosmos" --resource-group "virpal-rg" --query "primaryMasterKey" -o tsv)
COSMOS_CONNECTION_STRING=$(az cosmosdb keys list --name "virpal-cosmos" --resource-group "virpal-rg" --type connection-strings --query "connectionStrings[0].connectionString" -o tsv)

# Simpan ke Key Vault
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-cosmos-db-endpoint-uri" --value "$COSMOS_ENDPOINT"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-cosmos-db-key" --value "$COSMOS_KEY"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-cosmos-db-connection-string" --value "$COSMOS_CONNECTION_STRING"
az keyvault secret set --vault-name "virpal-key-vault" --name "azure-cosmos-db-database-name" --value "virpal-db"
```

### 2. Konfigurasi Managed Identity

```bash
# Berikan akses Cosmos DB ke Function App
FUNCTION_PRINCIPAL_ID=$(az functionapp identity show --name "virpal-functions" --resource-group "virpal-rg" --query "principalId" -o tsv)

# Assign Cosmos DB Data Contributor role
az role assignment create \
  --role "Cosmos DB Built-in Data Contributor" \
  --assignee "$FUNCTION_PRINCIPAL_ID" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.DocumentDB/databaseAccounts/virpal-cosmos"
```

## ⚙️ Konfigurasi Aplikasi

### 1. Container Configuration

```typescript
// src/services/azureCosmosDbService.ts
const containerConfigs: ContainerConfig[] = [
  {
    id: 'users',
    partitionKeyPath: '/id',
    defaultTtl: -1, // No TTL for user data
  },
  {
    id: 'conversations',
    partitionKeyPath: '/userId',
    defaultTtl: -1, // No TTL for conversation data
  },
  {
    id: 'messages',
    partitionKeyPath: '/conversationId',
    defaultTtl: -1, // No TTL for message data
  },
  {
    id: 'analytics',
    partitionKeyPath: '/date',
    defaultTtl: 7776000, // 90 days TTL for analytics data
  },
];
```

### 2. Client Configuration

```typescript
// Optimal client configuration
const clientOptions: CosmosClientOptions = {
  endpoint: config.endpoint,
  key: config.key,
  connectionPolicy: {
    connectionMode: ConnectionMode.Direct,
    requestTimeout: 10000,
    retryOptions: {
      maxRetryAttemptCount: 3,
      fixedRetryIntervalInMilliseconds: 1000,
      maxWaitTimeInSeconds: 60,
    },
  },
  consistencyLevel: 'Session',
  userAgentSuffix: 'VIRPAL-App/1.0',
};
```

### 3. Environment Variables (Development)

```bash
# .env file - Hanya untuk development
VITE_AZURE_COSMOS_ENDPOINT=https://virpal-cosmos.documents.azure.com:443/
VITE_AZURE_COSMOS_KEY=your-development-key
VITE_AZURE_COSMOS_DATABASE_NAME=virpal-dev
```

## 🚀 Best Practices

### 1. Query Optimization

```typescript
// Optimized queries dengan partition key
async function getUserConversations(
  userId: string
): Promise<ConversationEntity[]> {
  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC`,
    parameters: [{ name: '@userId', value: userId }],
  };

  const options: FeedOptions = {
    partitionKey: userId,
    maxItemCount: 50,
    enableCrossPartitionQuery: false,
  };

  return await this.queryContainer('conversations', querySpec, options);
}
```

### 2. Batch Operations

```typescript
// Efficient batch operations
async function createMultipleMessages(
  messages: MessageEntity[]
): Promise<void> {
  const operations = messages.map((message) => ({
    operationType: 'Create' as const,
    resourceBody: message,
    partitionKey: message.conversationId,
  }));

  // Group by partition key untuk optimal performance
  const groupedOps = groupBy(operations, (op) => op.partitionKey);

  for (const [partitionKey, ops] of Object.entries(groupedOps)) {
    await container.items.bulk(ops);
  }
}
```

### 3. Error Handling

```typescript
// Comprehensive error handling
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Tidak retry untuk 400-level errors
      if (error.code >= 400 && error.code < 500) {
        throw error;
      }

      // Exponential backoff untuk retry
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

## 📊 Monitoring

### 1. Key Metrics

- **Request Units (RU/s)**: Throughput consumption
- **Latency**: Query response times
- **Availability**: Service uptime percentage
- **Storage**: Data size dan growth trends

### 2. Query Performance

```typescript
// Monitor query performance
async function logQueryMetrics(
  querySpec: SqlQuerySpec,
  duration: number,
  ruCharge: number
) {
  logger.info('Cosmos DB query metrics', {
    query: querySpec.query,
    duration,
    ruCharge,
    timestamp: new Date().toISOString(),
  });

  // Alert jika RU charge tinggi
  if (ruCharge > 100) {
    logger.warn('High RU consumption detected', {
      ruCharge,
      query: querySpec.query,
    });
  }
}
```

### 3. Azure Monitor Setup

```bash
# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name "virpal-cosmos-diagnostics" \
  --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.DocumentDB/databaseAccounts/virpal-cosmos" \
  --logs '[{"category":"DataPlaneRequests","enabled":true},{"category":"QueryRuntimeStatistics","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]' \
  --workspace "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/virpal-rg/providers/Microsoft.OperationalInsights/workspaces/virpal-logs"
```

## 🔍 Troubleshooting

### Common Issues

#### 1. High Request Unit Consumption

```typescript
// Solusi: Optimize queries dan indexing
// Check query execution stats
const response = await container.items
  .query(querySpec, {
    populateQueryMetrics: true,
  })
  .fetchAll();

console.log('Query metrics:', response.queryMetrics);
```

#### 2. Partition Key Design Issues

```typescript
// Solusi: Review partition key strategy
// Ensure even distribution
const partitionKeyValue = `/userId/${userId}`;
// Atau untuk time-based data
const partitionKeyValue = `/date/${new Date().toISOString().split('T')[0]}`;
```

#### 3. Connection Timeout

```typescript
// Solusi: Adjust timeout settings
const clientOptions: CosmosClientOptions = {
  connectionPolicy: {
    requestTimeout: 30000, // Increase timeout
    retryOptions: {
      maxRetryAttemptCount: 5,
      fixedRetryIntervalInMilliseconds: 2000,
    },
  },
};
```

#### 4. Authentication Issues

```typescript
// Solusi: Verify credentials dari Key Vault
async function validateCosmosCredentials(): Promise<boolean> {
  try {
    const endpoint = await frontendKeyVaultService.getSecret(
      'azure-cosmos-db-endpoint-uri'
    );
    const key = await frontendKeyVaultService.getSecret('azure-cosmos-db-key');

    return !!(endpoint && key && endpoint.includes('.documents.azure.com'));
  } catch (error) {
    logger.error('Cosmos credentials validation failed:', error);
    return false;
  }
}
```

## 🎯 Validasi Setup

### Test Connection

```typescript
// Test Cosmos DB connectivity
async function testCosmosConnection(): Promise<boolean> {
  try {
    await azureCosmosDbService.initialize();

    // Test basic operations
    const testUser: UserEntity = {
      id: 'test-user',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create dan read test
    await azureCosmosDbService.createUser(testUser);
    const retrievedUser = await azureCosmosDbService.getUser(testUser.id);

    // Cleanup test data
    await azureCosmosDbService.deleteUser(testUser.id);

    logger.info('✅ Cosmos DB connection test successful');
    return true;
  } catch (error) {
    logger.error('❌ Cosmos DB connection test failed:', error);
    return false;
  }
}
```

### Performance Baseline

```typescript
// Establish performance baselines
async function measurePerformance() {
  const startTime = Date.now();

  // Test query performance
  await azureCosmosDbService.getUserConversations('test-user-id');

  const duration = Date.now() - startTime;
  logger.info('Query performance baseline', { duration });

  return duration;
}
```

## 📋 Security Checklist

- [ ] ✅ **Connection string stored in Key Vault** - Tidak ada credentials di code
- [ ] ✅ **Managed Identity configured** untuk secure access
- [ ] ✅ **TLS 1.2+ encryption** untuk semua connections
- [ ] ✅ **Firewall rules configured** untuk network security
- [ ] ✅ **Audit logging enabled** untuk compliance
- [ ] ✅ **Regular backup enabled** untuk disaster recovery

## 💰 Cost Optimization

### 1. Throughput Management

```typescript
// Auto-scale throughput berdasarkan usage
async function optimizeThroughput(containerName: string) {
  const container = database.container(containerName);
  const metrics = await container.readThroughput();

  // Adjust berdasarkan usage patterns
  if (metrics && metrics.resource) {
    const currentRU = metrics.resource.throughput;
    const targetRU = calculateOptimalThroughput(containerName);

    if (Math.abs(currentRU - targetRU) > 100) {
      await container.replaceThroughput(targetRU);
    }
  }
}
```

### 2. Storage Optimization

```typescript
// TTL untuk data analytics
const analyticsData: AnalyticsEntity = {
  id: generateId(),
  date: new Date().toISOString().split('T')[0],
  data: eventData,
  ttl: 7776000, // 90 days automatic cleanup
};
```

---

**✅ Azure Cosmos DB siap menyediakan database NoSQL yang scalable dan performant untuk aplikasi VIRPAL!**
