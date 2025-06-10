import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { logger } from '../utils/logger';

/**
 * Azure Key Vault Service for secure credential management
 * Uses Managed Identity for authentication - no hardcoded credentials needed
 * 
 * Authentication Chain:
 * 1. In local development: Azure CLI, Visual Studio Code, Environment variables
 * 2. In Azure: Managed Identity (System-assigned or User-assigned)
 * 3. Fallback: Service Principal via environment variables
 */
class AzureKeyVaultService {
    private secretClient: SecretClient | null = null;
    private keyVaultUrl: string;
    private credential: DefaultAzureCredential;

    constructor() {
        // Get Key Vault URL from environment
        this.keyVaultUrl = process.env['KEY_VAULT_URL'] || '';
          // Initialize DefaultAzureCredential for Managed Identity
        const azureClientId = process.env['AZURE_CLIENT_ID'];
        
        // Create credential with proper options based on whether client ID is provided
        if (azureClientId) {
            this.credential = new DefaultAzureCredential({
                managedIdentityClientId: azureClientId
            });
        } else {
            // Use default credential chain without specific client ID
            this.credential = new DefaultAzureCredential();
        }

        if (this.keyVaultUrl) {
            this.secretClient = new SecretClient(this.keyVaultUrl, this.credential);
        }
    }

    /**
     * Retrieves a secret from Azure Key Vault
     * @param secretName The name of the secret to retrieve
     * @returns The secret value or null if not found/error
     */    async getSecret(secretName: string): Promise<string | null> {
        try {
            if (!this.secretClient) {
                logger.warn('Key Vault client not initialized');
                return null;
            }

            logger.debug('Retrieving secret from Key Vault');
            const secret = await this.secretClient.getSecret(secretName);
            
            if (secret.value) {
                logger.debug('Successfully retrieved secret from Key Vault');
                return secret.value;
            } else {
                logger.warn('Secret exists but has no value');
                return null;
            }
        } catch (error: any) {
            logger.error('Failed to retrieve secret from Key Vault');
            
            // Log minimal error information for debugging without exposing sensitive data
            if (error.code) {
                logger.error('Key Vault error code available');
            }
            if (error.statusCode) {
                logger.error('Key Vault status code available');
            }
            
            return null;
        }
    }

    /**
     * Check if Key Vault service is properly configured
     * @returns boolean indicating if the service is ready
     */
    isConfigured(): boolean {
        return !!this.keyVaultUrl && !!this.secretClient;
    }

    /**
     * Get Key Vault URL for debugging purposes
     */
    getKeyVaultUrl(): string {
        return this.keyVaultUrl;
    }
}

// NOTE: This service should only be used in Node.js environment (Azure Functions)
// For frontend use, use frontendKeyVaultService.ts instead

// Only export if running in Node.js environment
let keyVaultService: AzureKeyVaultService | null = null;

if (typeof process !== 'undefined' && process.env) {
  // Running in Node.js (Azure Functions)
  keyVaultService = new AzureKeyVaultService();
} else {
  // Running in browser - should not be used
  logger.warn('AzureKeyVaultService should not be used in browser environment');
}

export { keyVaultService };
export default keyVaultService;
