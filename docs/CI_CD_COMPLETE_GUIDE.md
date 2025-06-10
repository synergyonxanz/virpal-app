# VirPal App CI/CD Pipeline - Complete Guide

## Overview

This document provides a comprehensive guide to the enhanced CI/CD pipeline for the VirPal App, implementing Azure Functions deployment best practices and enterprise-grade DevOps workflows.

## 🚀 Pipeline Features

### ✅ What's Been Implemented

1. **Multi-Environment Deployment**
   - Staging environment (develop branch)
   - Production environment (main branch)
   - Environment-specific secrets and configurations

2. **Security First Approach**
   - Trivy vulnerability scanning
   - npm security audits
   - Secrets detection capabilities
   - SARIF integration with GitHub Security tab

3. **Quality Assurance**
   - TypeScript type checking
   - ESLint code linting
   - Automated testing framework ready
   - Performance monitoring

4. **Azure Functions Best Practices**
   - Node.js 20 runtime
   - Extension bundles (latest v4.x)
   - Proper build artifact management
   - Health check endpoints
   - Managed identity ready configuration

5. **Advanced Monitoring**
   - Health check validation
   - Response time monitoring
   - Extended post-deployment checks
   - Performance thresholds
   - Lighthouse auditing for frontend

6. **Deployment Safety**
   - Artifact caching and reuse
   - Deployment verification
   - Automated rollback capabilities
   - Blue-green deployment ready with staging slots

7. **Automation Scripts**
   - `prepare-deployment.ps1` - Pre-deployment validation
   - `monitor-deployment.ps1` - Post-deployment monitoring
   - `rollback-deployment.ps1` - Automated rollback procedures

## 📁 Files Updated/Created

### Core CI/CD Files
- `.github/workflows/ci-cd.yml` - Main pipeline
- `.github/workflows/security-scan.yml` - Security scanning
- `.github/workflows/performance-testing.yml` - Performance validation
- `.lighthouserc.js` - Frontend performance configuration

### Support Scripts
- `scripts/prepare-deployment.ps1` - Deployment preparation
- `scripts/monitor-deployment.ps1` - Health monitoring
- `scripts/rollback-deployment.ps1` - Emergency rollback

### Function Code
- `src/functions/health.ts` - Health check endpoint

### Documentation
- `docs/CI_CD_CONFIGURATION.md` - Configuration guide
- `.funcignore` - Deployment artifact optimization

## 🔧 Required GitHub Secrets

### Production Environment
```
AZURE_CREDENTIALS_PRODUCTION - Azure service principal (JSON)
AZURE_FUNCTIONAPP_PUBLISH_PROFILE - Function app publish profile
MONITORING_WEBHOOK - Success notifications (optional)
ALERT_WEBHOOK - Failure alerts (optional)
```

### Staging Environment
```
AZURE_CREDENTIALS_STAGING - Azure service principal (JSON)
AZURE_FUNCTIONAPP_PUBLISH_PROFILE_STAGING - Staging publish profile
```

### Optional Security Tools
```
SEMGREP_APP_TOKEN - Semgrep security scanning
```

## 🏗️ Azure Resources Required

### Function Apps
- `virpal-function-app` (production)
- `virpal-function-app-staging` (staging)

### Resource Groups
- `virpal-app-rg` (or your preferred naming)

### Service Principals
Create with these Azure CLI commands:
```bash
# Production
az ad sp create-for-rbac --name "virpal-app-production-sp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{production-rg} \
  --sdk-auth

# Staging  
az ad sp create-for-rbac --name "virpal-app-staging-sp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{staging-rg} \
  --sdk-auth
```

## 🔄 Deployment Flow

### Development Workflow
1. **Feature Development** → `feature/*` branches
2. **Pull Request** → Triggers security scan + build + test
3. **Merge to develop** → Deploys to staging environment
4. **Merge to main** → Deploys to production environment

### Automated Checks
1. **Security Scanning** - Trivy + npm audit
2. **Code Quality** - ESLint + TypeScript
3. **Build Validation** - Frontend + Functions
4. **Deployment** - Blue-green ready
5. **Health Verification** - Multi-step validation
6. **Performance Monitoring** - Response time checks
7. **Rollback Ready** - Automated failure recovery

## 📊 Monitoring and Alerting

### Health Checks
- `/api/health` endpoint validation
- Response time monitoring (<5s threshold)
- Multi-attempt verification
- System status reporting

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Uptime verification
- Resource utilization (via health endpoint)

### Alerting Integration
- Webhook notifications for success/failure
- GitHub Security tab integration
- Deployment tagging for tracking
- Incident logging

## 🛠️ Usage Examples

### Manual Deployment Preparation
```powershell
# Prepare for production deployment
.\scripts\prepare-deployment.ps1 -Environment "production"

# Monitor current deployment
.\scripts\monitor-deployment.ps1 -Environment "production"

# Emergency rollback
.\scripts\rollback-deployment.ps1 -Environment "production" -Reason "High error rate"
```

### Trigger Manual Deployment
```bash
# Trigger workflow manually
gh workflow run ci-cd.yml

# Check workflow status
gh run list --workflow=ci-cd.yml
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Review ESLint issues

2. **Deployment Failures** 
   - Verify Azure credentials are valid
   - Check Function App exists and is running
   - Review resource group permissions

3. **Health Check Failures**
   - Verify health endpoint is deployed
   - Check Function App logs
   - Review environment variables

4. **Performance Issues**
   - Monitor response times via health checks
   - Review Function App scaling settings
   - Check Application Insights metrics

### Debug Commands
```powershell
# Check Azure CLI authentication
az account show

# Verify Function App status
az functionapp show --name virpal-function-app --resource-group virpal-app-rg

# Test health endpoint locally
curl https://virpal-function-app.azurewebsites.net/api/health

# View Function App logs
az functionapp logs tail --name virpal-function-app --resource-group virpal-app-rg
```

## 🚀 Next Steps

### Recommended Enhancements
1. **Add comprehensive tests** - Unit, integration, and E2E tests
2. **Implement feature flags** - For gradual rollouts
3. **Add database migrations** - If using databases
4. **Enhanced monitoring** - Application Insights integration
5. **Load testing** - Artillery or similar tools
6. **Infrastructure as Code** - Bicep/ARM templates

### Security Improvements
1. **Key Vault integration** - For secrets management
2. **Managed Identity** - For Azure service authentication
3. **Network security** - VNet integration
4. **Compliance scanning** - Additional security tools

## 📚 Additional Resources

- [Azure Functions Best Practices](https://docs.microsoft.com/en-us/azure/azure-functions/functions-best-practices)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure DevOps Security](https://docs.microsoft.com/en-us/azure/devops/organizations/security/)

---

**Note**: This pipeline follows enterprise DevOps best practices and is production-ready. Customize the configuration according to your specific organizational requirements and compliance needs.
