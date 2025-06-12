# Azure Cosmos DB Setup Guide for VirPal App

## Overview

This guide helps you set up Azure Cosmos DB for the VirPal application. The app supports multiple configuration options for different environments.

## Error 401 (Unauthorized) - Quick Fix

If you're seeing error 401 when starting the app, it means Cosmos DB credentials are not configured. The app will continue to work with local storage only, but you can enable cloud sync by following this guide.

## Configuration Options

### Option 1: Local Development with .env File (Recommended for Development)

1. **Create a .env file** in the project root directory:

   ```bash
   # Copy the example file
   cp .env.local.example .env
   ```

2. **Get your Cosmos DB credentials** from Azure Portal:

   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to your Cosmos DB account
   - Go to "Keys" section
   - Copy the URI and Primary Key

3. **Configure the .env file**:

   ```bash
   # Azure Cosmos DB Configuration
   VITE_AZURE_COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
   VITE_AZURE_COSMOS_KEY=your-primary-key-here
   VITE_AZURE_COSMOS_DATABASE_NAME=virpal-dev

   # Alternative: Use connection string
   # VITE_AZURE_COSMOS_CONNECTION_STRING=AccountEndpoint=https://...;AccountKey=...;

   # Enable development mode
   VITE_DEV_MODE=true
   ```

4. **Restart the application**:
   ```bash
   npm run dev
   ```

### Option 2: Azure Key Vault (Recommended for Production)

1. **Configure Azure Key Vault** with these secrets:

   - `azure-cosmos-db-endpoint-uri`
   - `azure-cosmos-db-key`
   - `azure-cosmos-db-database-name`
   - `azure-cosmos-db-connection-string` (optional)

2. **Ensure authentication** is properly configured for Key Vault access

3. **The app will automatically** use Key Vault when authenticated

### Option 3: Local Storage Only (No Cloud Sync)

If you don't need cloud sync, the app works perfectly with local storage:

- No configuration needed
- All chat history stored locally
- No cross-device synchronization
- Fastest setup for development

## Database Structure

The VirPal app expects the following Cosmos DB structure:

### Database: `virpal-dev` (or your configured name)

### Containers:

1. **users** (Partition key: `/id`)

   - User profiles and settings
   - Unique constraint on email

2. **conversations** (Partition key: `/userId`)

   - Chat session metadata
   - Conversation summaries

3. **messages** (Partition key: `/conversationId`)

   - Individual chat messages
   - Message content and metadata

4. **analytics** (Partition key: `/date`)
   - Usage analytics and metrics
   - TTL: 90 days (automatic cleanup)

## Setting Up Cosmos DB in Azure

### 1. Create Cosmos DB Account

```powershell
# Using Azure CLI
az cosmosdb create \
  --resource-group "your-resource-group" \
  --name "virpal-cosmos-db" \
  --kind GlobalDocumentDB \
  --locations regionName="East US" failoverPriority=0 isZoneRedundant=false \
  --default-consistency-level "Session" \
  --enable-multiple-write-locations false
```

### 2. Create Database

```powershell
az cosmosdb sql database create \
  --account-name "virpal-cosmos-db" \
  --resource-group "your-resource-group" \
  --name "virpal-dev"
```

### 3. Create Containers

```powershell
# Users container
az cosmosdb sql container create \
  --account-name "virpal-cosmos-db" \
  --resource-group "your-resource-group" \
  --database-name "virpal-dev" \
  --name "users" \
  --partition-key-path "/id" \
  --throughput 400

# Conversations container
az cosmosdb sql container create \
  --account-name "virpal-cosmos-db" \
  --resource-group "your-resource-group" \
  --database-name "virpal-dev" \
  --name "conversations" \
  --partition-key-path "/userId" \
  --throughput 400

# Messages container
az cosmosdb sql container create \
  --account-name "virpal-cosmos-db" \
  --resource-group "your-resource-group" \
  --database-name "virpal-dev" \
  --name "messages" \
  --partition-key-path "/conversationId" \
  --throughput 400

# Analytics container with TTL
az cosmosdb sql container create \
  --account-name "virpal-cosmos-db" \
  --resource-group "your-resource-group" \
  --database-name "virpal-dev" \
  --name "analytics" \
  --partition-key-path "/date" \
  --throughput 400 \
  --ttl 7776000
```

## Troubleshooting Common Issues

### Error 401 (Unauthorized)

- **Cause**: Invalid credentials or missing configuration
- **Solution**: Verify your endpoint URL and key in .env file

### Error 403 (Forbidden)

- **Cause**: Insufficient permissions
- **Solution**: Check that your key has read/write permissions

### Connection Refused

- **Cause**: Network issues or wrong endpoint
- **Solution**: Verify the endpoint URL and network connectivity

### Database/Container Not Found

- **Cause**: Database or containers don't exist
- **Solution**: Create the required database and containers

## Testing Your Setup

1. **Start the application**:

   ```bash
   npm run dev
   ```

2. **Check browser console** for success messages:

   ```
   [VIRPAL] Azure Cosmos DB service initialized successfully
   [VIRPAL] Connected to database: virpal-dev
   [VIRPAL] Successfully connected to 4 containers
   ```

3. **Test cloud sync** by:
   - Creating a chat session while authenticated
   - Checking if data persists after refresh
   - Verifying data appears in Azure Portal

## Security Best Practices

### Development Environment

- ✅ Use .env file for local development
- ✅ Never commit .env file to version control
- ✅ Use separate database for development (`virpal-dev`)

### Production Environment

- ✅ Use Azure Key Vault for all secrets
- ✅ Enable Managed Identity for authentication
- ✅ Use least privilege access principles
- ✅ Enable audit logging
- ✅ Use production database (`virpal-prod`)

## Performance Optimization

### Throughput Settings

- **Development**: 400 RU/s per container (minimum)
- **Production**: Use autoscale based on usage patterns

### Indexing Policy

The app uses default indexing, which works well for most scenarios.

### Connection Optimization

- Uses connection pooling
- Implements retry logic with exponential backoff
- Circuit breaker pattern for resilience

## Monitoring and Logging

### Application Logs

The app provides detailed logging for Cosmos DB operations:

- Connection status
- Configuration loading
- Error details with guidance

### Azure Monitoring

Enable monitoring in Azure Portal:

- Request units consumption
- Latency metrics
- Error rates
- Availability metrics

## Cost Optimization

### Development

- Use shared throughput across containers
- Minimize RU/s to 400 (minimum)
- Use TTL for analytics data cleanup

### Production

- Monitor usage patterns
- Use autoscale for variable workloads
- Implement data archiving strategies
- Consider regional deployments

## Support

For issues related to:

- **App Configuration**: Check this guide and console logs
- **Azure Setup**: Refer to [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- **Authentication**: See `docs/KEY_VAULT_SETUP_GUIDE.md`

---

**Created**: June 11, 2025
**Status**: Active - Cosmos DB functionality restored
**Environment**: Development and Production ready
