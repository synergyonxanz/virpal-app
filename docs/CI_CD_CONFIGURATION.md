# VirPal App Deployment Configuration

This document outlines the CI/CD pipeline configuration and required secrets for the VirPal App deployment.

## Required GitHub Secrets

### For Staging Environment
- `AZURE_CREDENTIALS_STAGING`: Azure service principal credentials for staging deployment
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE_STAGING`: Azure Functions publish profile for staging

### For Production Environment  
- `AZURE_CREDENTIALS_PRODUCTION`: Azure service principal credentials for production deployment
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: Azure Functions publish profile for production

## Azure Service Principal Setup

To create the required Azure credentials, run the following Azure CLI commands:

```bash
# For staging environment
az ad sp create-for-rbac --name "virpal-app-staging-sp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{staging-resource-group} \
  --sdk-auth

# For production environment
az ad sp create-for-rbac --name "virpal-app-production-sp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{production-resource-group} \
  --sdk-auth
```

## Deployment Flow

1. **Pull Request**: Runs security scan, build, and tests
2. **Develop Branch**: Deploys to staging environment after successful tests
3. **Main Branch**: Deploys to production environment after successful tests
4. **Security**: Trivy vulnerability scanning integrated
5. **Artifacts**: Build artifacts cached and reused across jobs
6. **Health Checks**: Automated health checks after deployment

## Environment Configuration

### Staging
- Function App: `virpal-function-app-staging`
- Environment: `staging`
- Health check endpoint: `/api/health`

### Production
- Function App: `virpal-function-app`
- Environment: `production`
- Health check endpoint: `/api/health`
- Auto-tagging: Creates version tags for successful deployments

## Best Practices Implemented

- ✅ Separate environments (staging/production)
- ✅ Security scanning with Trivy
- ✅ Artifact caching and reuse
- ✅ Health checks post-deployment
- ✅ Proper Node.js version management
- ✅ Dependency caching
- ✅ Managed identity support ready
- ✅ Function-specific ignore patterns
- ✅ Environment-specific secrets
- ✅ Automated versioning for production
- ✅ Cleanup procedures
