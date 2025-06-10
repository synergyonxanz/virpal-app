/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_FUNCTION_ENDPOINT?: string;
  readonly VITE_AZURE_FUNCTION_URL?: string;
  readonly VITE_AZURE_OPENAI_ENDPOINT?: string;
  readonly VITE_AZURE_OPENAI_API_KEY?: string;
  readonly VITE_AZURE_OPENAI_DEPLOYMENT_NAME?: string;
  readonly VITE_AZURE_OPENAI_API_VERSION?: string;
  readonly VITE_MSAL_CLIENT_ID?: string;
  readonly VITE_TENANT_NAME?: string;
  readonly VITE_USER_FLOW_NAME?: string;
  readonly VITE_BACKEND_SCOPE?: string;
  readonly VITE_TENANT_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
