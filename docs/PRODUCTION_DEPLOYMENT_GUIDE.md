# Production Deployment Guide

This guide will help you deploy the Virpal application to Azure.

## Architecture

The application consists of two main components:

1. **Frontend**: React application built with Vite
2. **Backend**: Azure Functions with ES modules support

## Prerequisites

- Azure subscription
- Azure CLI installed and logged in
- Node.js 20.x or higher
- PowerShell 7.0 or higher

## Step 1: Provision Azure Resources

First, create the necessary Azure resources:

```pwsh
# Login to Azure
az login

# Set variables
$resourceGroup = "virpal-app-rg"
$location = "eastus"
$storageAccName = "virpalstorageacc"
$functionAppName = "virpal-function-app"
$keyVaultName = "virpal-key-vault"
$speechServiceName = "virpal-speech-service"
$appServicePlanName = "virpal-app-plan"
$staticWebAppName = "virpal-static-web"

# Create resource group
az group create --name $resourceGroup --location $location

# Create storage account for Functions
az storage account create --name $storageAccName --resource-group $resourceGroup --location $location --sku Standard_LRS

# Create App Service Plan
az appservice plan create --name $appServicePlanName --resource-group $resourceGroup --location $location --sku B1

# Create Function App
az functionapp create --name $functionAppName --resource-group $resourceGroup --storage-account $storageAccName --runtime node --runtime-version 20 --functions-version 4 --os-type Windows --plan $appServicePlanName

# Create Key Vault
az keyvault create --name $keyVaultName --resource-group $resourceGroup --location $location

# Create Speech Service
az cognitiveservices account create --name $speechServiceName --resource-group $resourceGroup --location $location --kind SpeechServices --sku S0

# Create Static Web App
az staticwebapp create --name $staticWebAppName --resource-group $resourceGroup --location $location
```

## Step 2: Configure Key Vault

Store your speech service credentials in Key Vault:

```pwsh
# Get Speech Service key
$speechKey = az cognitiveservices account keys list --name $speechServiceName --resource-group $resourceGroup --query "key1" -o tsv

# Add secrets to Key Vault
az keyvault secret set --vault-name $keyVaultName --name "azure-speech-service-key" --value $speechKey
az keyvault secret set --vault-name $keyVaultName --name "azure-speech-service-region" --value $location

# Grant Function App access to Key Vault
$functionAppPrincipalId = az functionapp identity assign --name $functionAppName --resource-group $resourceGroup --query principalId -o tsv
az keyvault set-policy --name $keyVaultName --object-id $functionAppPrincipalId --secret-permissions get list
```

## Step 3: Prepare Application for Production

Run the production preparation script:

```pwsh
./scripts/prepare-production-deployment.ps1
```

This will:
1. Update CORS settings for production
2. Build frontend assets
3. Build Azure Functions
4. Create deployment packages

## Step 4: Deploy the Application

### Deploy Azure Functions

```pwsh
cd deployment/backend
func azure functionapp publish $functionAppName
```

### Deploy Frontend to Static Web App

```pwsh
cd deployment/frontend
$apiToken = az staticwebapp secrets list --name $staticWebAppName --resource-group $resourceGroup --query "properties.apiKey" -o tsv
npx @azure/static-web-apps-cli deploy . --api-key $apiToken --app-name $staticWebAppName --env production
```

## Step 5: Configure Application Settings

Set the Key Vault URL in the Function App settings:

```pwsh
az functionapp config appsettings set --name $functionAppName --resource-group $resourceGroup --settings KEY_VAULT_URL="https://$keyVaultName.vault.azure.net/"
```

## Step 6: Configure Frontend API URL

Update the Static Web App configuration to point to your Function App:

```pwsh
$functionAppUrl = "https://$functionAppName.azurewebsites.net"
az staticwebapp appsettings set --name $staticWebAppName --resource-group $resourceGroup --setting-names VITE_AZURE_FUNCTION_URL=$functionAppUrl
```

## Verification

1. Navigate to your Static Web App URL to verify the frontend is working
2. Test the TTS functionality to ensure it's connecting to your Azure Functions
3. Monitor the Function App logs for any errors

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Verify your Static Web App URL is included in the `allowedOrigins` section of your Function App's `host.json`
2. Check that your browser is making requests to the correct Function App URL
3. Make sure the `allowedHeaders` include any custom headers your application is using

### Authentication Issues

If Key Vault authentication fails:

1. Verify the Managed Identity for your Function App has proper access to the Key Vault
2. Check that the KEY_VAULT_URL application setting is correct
3. Make sure the secrets exist in the Key Vault with the expected names

### Performance Optimization

For better performance:

1. Enable Azure CDN for your Static Web App
2. Configure Function App scaling based on your expected load
3. Consider using Premium Functions for better cold start performance
