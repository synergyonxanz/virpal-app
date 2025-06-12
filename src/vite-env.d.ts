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

// This file is used by Vite to define environment variables and types
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Azure Functions Configuration
  readonly VITE_AZURE_FUNCTION_ENDPOINT?: string;
  readonly VITE_AZURE_FUNCTION_URL?: string;
  readonly VITE_AZURE_FUNCTION_ENDPOINT2?: string;

  // Azure OpenAI Configuration (Development Fallback)
  readonly VITE_AZURE_OPENAI_ENDPOINT?: string;
  readonly VITE_AZURE_OPENAI_API_KEY?: string;
  readonly VITE_AZURE_OPENAI_DEPLOYMENT_NAME?: string;
  readonly VITE_AZURE_OPENAI_API_VERSION?: string;
  readonly VITE_OPENAI_API_KEY?: string;

  // Microsoft Entra External ID (CIAM) Configuration
  readonly VITE_MSAL_CLIENT_ID?: string;
  readonly VITE_TENANT_NAME?: string;
  readonly VITE_USER_FLOW_NAME?: string;
  readonly VITE_BACKEND_SCOPE?: string;
  readonly VITE_TENANT_DOMAIN?: string;
  readonly VITE_BACKEND_CLIENT_ID?: string;
  readonly VITE_FRONTEND_CLIENT_ID?: string;

  // Azure Cosmos DB Configuration (Development Fallback)
  readonly VITE_AZURE_COSMOS_ENDPOINT?: string;
  readonly VITE_AZURE_COSMOS_KEY?: string;
  readonly VITE_AZURE_COSMOS_DATABASE_NAME?: string;
  readonly VITE_AZURE_COSMOS_CONNECTION_STRING?: string;

  // Application Configuration
  readonly VITE_DEV_MODE?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;

  // Build and Development Environment
  readonly NODE_ENV?: string;
  readonly MODE?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;

  // Note: Azure Speech Service credentials are intentionally NOT included here
  // These sensitive credentials must be accessed through Azure Key Vault only
  // via Azure Functions secure proxy for security compliance
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
