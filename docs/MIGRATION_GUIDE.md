# Migration Guide: Old Scripts → New Deployment System

## 🔄 **Script Migration Summary**

This guide helps you transition from the old deployment scripts to the new enterprise deployment system.

## 📋 **What Changed**

### **Removed Scripts**
- ❌ `scripts/prepare-production-deployment.ps1`
- ❌ `scripts/prepare-deployment.ps1`

### **New Consolidated Script**
- ✅ `scripts/deploy-virpal.ps1` (replaces both old scripts)

## 🚀 **Migration Mapping**

### **Old → New Command Mapping**

| **Old Command** | **New Command** |
|----------------|----------------|
| `.\scripts\prepare-deployment.ps1 -Environment production` | `.\scripts\deploy-virpal.ps1 -Environment production -DeploymentType full-deploy -ProductionDomain "https://virpal.azurewebsites.net"` |
| `.\scripts\prepare-deployment.ps1 -Environment staging` | `.\scripts\deploy-virpal.ps1 -Environment staging -DeploymentType full-deploy` |
| `.\scripts\prepare-production-deployment.ps1` | `.\scripts\deploy-virpal.ps1 -Environment production -DeploymentType full-deploy -ProductionDomain "https://virpal.azurewebsites.net"` |

### **New npm Scripts Available**

| **npm Script** | **Equivalent PowerShell Command** |
|----------------|-----------------------------------|
| `npm run deploy:validate` | `.\scripts\deploy-virpal.ps1 -Environment local -DeploymentType validate-only` |
| `npm run deploy:staging` | `.\scripts\deploy-virpal.ps1 -Environment staging -DeploymentType full-deploy` |
| `npm run deploy:production` | `.\scripts\deploy-virpal.ps1 -Environment production -DeploymentType full-deploy -ProductionDomain "https://virpal.azurewebsites.net"` |
| `npm run deploy:build-only` | `.\scripts\deploy-virpal.ps1 -Environment staging -DeploymentType build-only` |

## ✨ **New Features**

### **Enhanced Capabilities**

1. **Multi-Deployment Types**:
   - `validate-only`: Check prerequisites and code quality
   - `build-only`: Build without deploying
   - `full-deploy`: Complete deployment pipeline

2. **Advanced Security**:
   - npm audit with environment-specific levels
   - Development code detection
   - Hardcoded variable validation
   - CORS configuration management

3. **Comprehensive Logging**:
   - Detailed deployment logs (`deployment-*.log`)
   - JSON deployment summaries
   - Build metrics and validation

4. **Error Handling**:
   - Proper exit codes for CI/CD
   - Rollback triggers
   - Detailed error reporting

## 🔧 **Migration Steps**

### **1. Update Your Local Scripts**

If you have any custom scripts that reference the old deployment scripts, update them:

**Before:**
```powershell
# Old way
.\scripts\prepare-deployment.ps1 -Environment production
.\scripts\prepare-production-deployment.ps1
```

**After:**
```powershell
# New way
npm run deploy:production
# OR
.\scripts\deploy-virpal.ps1 -Environment production -DeploymentType full-deploy -ProductionDomain "https://virpal.azurewebsites.net"
```

### **2. Update CI/CD References**

The GitHub Actions workflow has been automatically updated to use the new script. No action needed for CI/CD.

### **3. Update Documentation References**

Update any documentation that references the old scripts:

- Replace `prepare-deployment.ps1` → `deploy-virpal.ps1`
- Replace `prepare-production-deployment.ps1` → `deploy-virpal.ps1`
- Add new npm script references

## 📊 **Feature Comparison**

| **Feature** | **Old Scripts** | **New Script** |
|-------------|----------------|----------------|
| Environment Support | ✅ staging, production | ✅ staging, production, local |
| Security Audit | ✅ Basic | ✅ Advanced (environment-specific) |
| Type Checking | ✅ Basic | ✅ Comprehensive |
| Error Handling | ⚠️ Limited | ✅ Enterprise-grade |
| Logging | ⚠️ Console only | ✅ File + console + JSON |
| Validation | ⚠️ Build-time only | ✅ Pre-deployment + runtime |
| CORS Management | ✅ Production only | ✅ Environment-aware |
| Rollback Support | ❌ None | ✅ Automated triggers |
| Deployment Types | ❌ Build only | ✅ validate/build/deploy |
| CI/CD Integration | ⚠️ Limited | ✅ Full integration |

## 🚨 **Breaking Changes**

### **Parameter Changes**

The new script uses different parameter names and structure:

**Old Parameters (prepare-deployment.ps1):**
```powershell
-Environment "production"  # Required
```

**New Parameters (deploy-virpal.ps1):**
```powershell
-Environment "production"           # Required
-DeploymentType "full-deploy"      # Required
-ProductionDomain "https://..."    # Required for production
-SkipTests                         # Optional switch
-SkipSecurity                      # Optional switch
```

### **Output Changes**

The new script provides more detailed output:

**Old Output:**
- Basic success/failure messages
- Limited logging

**New Output:**
- Comprehensive deployment logs
- JSON deployment summaries
- Build metrics and timing
- Artifact locations
- Next steps guidance

## 🔄 **Backward Compatibility**

### **What Still Works**

- All existing Azure resources and configurations
- Environment variables and secrets
- CI/CD pipeline triggers and environments
- GitHub repository settings

### **What Changed**

- Script file names and locations
- Parameter syntax
- Output format and logging
- Error codes and handling

## 📝 **Quick Reference**

### **Common Tasks - Old vs New**

| **Task** | **Old Way** | **New Way** |
|----------|-------------|-------------|
| Validate environment | N/A | `npm run deploy:validate` |
| Build for staging | `.\scripts\prepare-deployment.ps1 -Environment staging` | `npm run deploy:build-only` |
| Deploy to production | `.\scripts\prepare-production-deployment.ps1` | `npm run deploy:production` |
| Skip tests in deployment | Add manual flag | `.\scripts\deploy-virpal.ps1 -Environment staging -DeploymentType full-deploy -SkipTests` |

### **Troubleshooting Migration Issues**

1. **"Script not found" error**:
   ```powershell
   # Check if new script exists
   ls scripts/deploy-virpal.ps1
   
   # If missing, the file may not have been created properly
   ```

2. **"Invalid parameter" error**:
   ```powershell
   # Use the new parameter syntax
   .\scripts\deploy-virpal.ps1 -Environment production -DeploymentType full-deploy -ProductionDomain "https://virpal.azurewebsites.net"
   ```

3. **PowerShell execution policy**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 💡 **Best Practices**

### **Recommended Migration Approach**

1. **Start with validation**:
   ```powershell
   npm run deploy:validate
   ```

2. **Test with build-only**:
   ```powershell
   npm run deploy:build-only
   ```

3. **Deploy to staging first**:
   ```powershell
   npm run deploy:staging
   ```

4. **Finally deploy to production**:
   ```powershell
   npm run deploy:production
   ```

### **Monitoring Your Migration**

- Check deployment logs: `deployment-*.log`
- Review deployment summaries: `deployment-summary-*.json`
- Monitor GitHub Actions for CI/CD
- Verify health endpoints after deployment

---

**Migration Support**: If you encounter issues during migration, check the [troubleshooting section](DEPLOYMENT_GUIDE_ENTERPRISE.md#troubleshooting) in the main deployment guide.
