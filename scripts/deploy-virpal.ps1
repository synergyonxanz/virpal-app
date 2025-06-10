#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive deployment script for VirPal App following Azure Functions v4 best practices
.DESCRIPTION
    This script provides a complete deployment workflow including validation, building, testing,
    security scanning, and deployment preparation for Azure Functions and Static Web Apps.
    Follows Azure deployment best practices for enterprise-grade applications.
.PARAMETER Environment
    Target deployment environment (staging, production, local)
.PARAMETER SkipTests
    Skip running tests during deployment preparation
.PARAMETER SkipSecurity
    Skip security audit and vulnerability scanning
.PARAMETER DeploymentType
    Type of deployment: build-only, full-deploy, or validate-only
.PARAMETER ProductionDomain
    Production domain for CORS configuration (required for production)
.EXAMPLE
    .\deploy-virpal.ps1 -Environment "staging" -DeploymentType "full-deploy"
.EXAMPLE
    .\deploy-virpal.ps1 -Environment "production" -ProductionDomain "https://virpal.azurewebsites.net" -DeploymentType "full-deploy"
.EXAMPLE
    .\deploy-virpal.ps1 -Environment "local" -DeploymentType "validate-only"
.NOTES
    Requires Node.js 20+, PowerShell 7+, and Azure CLI for full deployment
    Follows Azure Functions v4 and Azure DevOps best practices
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production", "local")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("build-only", "full-deploy", "validate-only")]
    [string]$DeploymentType = "build-only",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSecurity,
    
    [Parameter(Mandatory=$false)]
    [string]$ProductionDomain
)

# Set error action preference for strict error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Configuration and constants
$REQUIRED_NODE_VERSION = "v20"
$MAX_BUILD_SIZE_MB = 100
$DEPLOYMENT_TIMEOUT_MINUTES = 30

# Initialize logging
$logFile = "deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$deploymentStartTime = Get-Date

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $logFile -Value $logEntry
}

function Test-Prerequisites {
    Write-Log "🔍 Checking prerequisites..." "INFO"
    
    # Check Node.js version
    try {
        $nodeVersion = node --version
        if (-not $nodeVersion.StartsWith($REQUIRED_NODE_VERSION)) {
            throw "Node.js version $REQUIRED_NODE_VERSION is required. Current: $nodeVersion"
        }
        Write-Log "✅ Node.js version check passed: $nodeVersion" "INFO"
    }
    catch {
        Write-Log "❌ Node.js check failed: $_" "ERROR"
        throw
    }
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        Write-Log "⚠️ PowerShell 7+ recommended. Current: $($PSVersionTable.PSVersion)" "WARN"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Log "✅ npm version: $npmVersion" "INFO"
    }
    catch {
        Write-Log "❌ npm not found" "ERROR"
        throw "npm is required but not found in PATH"
    }
    
    # Check Azure CLI for full deployment
    if ($DeploymentType -eq "full-deploy") {
        try {
            $azVersion = az --version | Select-String "azure-cli" | ForEach-Object { $_.ToString().Trim() }
            Write-Log "✅ Azure CLI detected: $azVersion" "INFO"
        }
        catch {
            Write-Log "⚠️ Azure CLI not found - required for full deployment" "WARN"
            if ($Environment -ne "local") {
                throw "Azure CLI is required for $Environment deployment"
            }
        }
    }
}

function Invoke-CleanBuild {
    Write-Log "🧹 Cleaning previous builds..." "INFO"
    
    $cleanTargets = @("dist", "dist-frontend", "node_modules/.cache", "deployment")
    foreach ($target in $cleanTargets) {
        if (Test-Path $target) {
            Remove-Item -Recurse -Force $target
            Write-Log "Cleaned: $target" "INFO"
        }
    }
    
    # Clean npm cache if needed
    if ($Environment -eq "production") {
        npm cache clean --force
        Write-Log "Cleaned npm cache" "INFO"
    }
}

function Install-Dependencies {
    Write-Log "📦 Installing dependencies..." "INFO"
    
    # Use ci for production builds, install for development
    $installCommand = if ($Environment -eq "production") { "ci" } else { "install" }
    $installArgs = @($installCommand, "--prefer-offline", "--no-audit")
    
    if ($Environment -eq "production") {
        $installArgs += "--production=false"  # We need devDependencies for building
    }
    
    try {
        & npm $installArgs
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed with exit code $LASTEXITCODE"
        }
        Write-Log "✅ Dependencies installed successfully" "INFO"
    }
    catch {
        Write-Log "❌ Failed to install dependencies: $_" "ERROR"
        throw
    }
}

function Invoke-SecurityAudit {
    if ($SkipSecurity) {
        Write-Log "⏭️ Skipping security audit" "WARN"
        return
    }
    
    Write-Log "🔒 Running security audit..." "INFO"
    
    try {
        # Run npm audit with appropriate level
        $auditLevel = if ($Environment -eq "production") { "moderate" } else { "high" }
        npm audit --audit-level=$auditLevel
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "⚠️ Security audit found issues (level: $auditLevel)" "WARN"
            if ($Environment -eq "production") {
                Write-Log "❌ Production deployment blocked due to security issues" "ERROR"
                throw "Security audit failed for production deployment"
            }
        } else {
            Write-Log "✅ Security audit passed" "INFO"
        }
    }
    catch {
        Write-Log "❌ Security audit failed: $_" "ERROR"
        if ($Environment -eq "production") {
            throw
        }
    }
}

function Invoke-QualityChecks {
    Write-Log "🔍 Running quality checks..." "INFO"
    
    # TypeScript compilation check
    Write-Log "Checking TypeScript compilation..." "INFO"
    try {
        npx tsc --noEmit
        if ($LASTEXITCODE -ne 0) {
            throw "TypeScript compilation failed"
        }
        Write-Log "✅ TypeScript compilation passed" "INFO"
    }
    catch {
        Write-Log "❌ TypeScript check failed: $_" "ERROR"
        throw
    }
    
    # ESLint check
    Write-Log "Running ESLint..." "INFO"
    try {
        npm run lint
        if ($LASTEXITCODE -ne 0) {
            throw "ESLint failed"
        }
        Write-Log "✅ ESLint passed" "INFO"
    }
    catch {
        Write-Log "❌ ESLint failed: $_" "ERROR"
        throw
    }
}

function Invoke-Tests {
    if ($SkipTests) {
        Write-Log "⏭️ Skipping tests" "WARN"
        return
    }
    
    Write-Log "🧪 Running tests..." "INFO"
    
    # Check if test script exists
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        try {
            npm test
            if ($LASTEXITCODE -ne 0) {
                throw "Tests failed"
            }
            Write-Log "✅ Tests passed" "INFO"
        }
        catch {
            Write-Log "❌ Tests failed: $_" "ERROR"
            if ($Environment -eq "production") {
                throw
            }
        }
    } else {
        Write-Log "⚠️ No test script found in package.json" "WARN"
    }
}

function Update-CorsConfiguration {
    if ($Environment -ne "production" -or -not $ProductionDomain) {
        return
    }
    
    Write-Log "📝 Updating CORS configuration for production..." "INFO"
    
    try {
        $hostJsonPath = "host.json"
        if (-not (Test-Path $hostJsonPath)) {
            Write-Log "⚠️ host.json not found, skipping CORS update" "WARN"
            return
        }
        
        $hostJson = Get-Content $hostJsonPath -Raw | ConvertFrom-Json
        
        # Ensure CORS section exists
        if (-not $hostJson.cors) {
            $hostJson | Add-Member -NotePropertyName "cors" -NotePropertyValue @{ allowedOrigins = @() }
        }
        
        # Add production domain if not already present
        if ($hostJson.cors.allowedOrigins -notcontains $ProductionDomain) {
            $hostJson.cors.allowedOrigins += $ProductionDomain
            Write-Log "Added production domain to CORS: $ProductionDomain" "INFO"
        }
        
        # Remove localhost entries for production
        $hostJson.cors.allowedOrigins = $hostJson.cors.allowedOrigins | Where-Object { 
            $_ -notmatch "localhost|127\.0\.0\.1" -and $_ -like "https://*" 
        }
        
        # Save updated configuration
        $hostJson | ConvertTo-Json -Depth 10 | Set-Content $hostJsonPath
        Write-Log "✅ CORS configuration updated" "INFO"
    }
    catch {
        Write-Log "❌ Failed to update CORS configuration: $_" "ERROR"
        throw
    }
}

function Invoke-Build {
    Write-Log "🏗️ Building application..." "INFO"
    
    # Set environment variables
    $env:NODE_ENV = $Environment
    $env:AZURE_FUNCTIONS_ENVIRONMENT = $Environment
    
    try {
        # Build frontend
        Write-Log "Building frontend..." "INFO"
        npm run build:frontend
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend build failed"
        }
        
        # Build functions
        Write-Log "Building Azure Functions..." "INFO"
        npm run build:functions
        if ($LASTEXITCODE -ne 0) {
            throw "Functions build failed"
        }
        
        Write-Log "✅ Build completed successfully" "INFO"
    }
    catch {
        Write-Log "❌ Build failed: $_" "ERROR"
        throw
    }
}

function Test-BuildArtifacts {
    Write-Log "✅ Validating build artifacts..." "INFO"
    
    # Required files check
    $requiredFiles = @("dist", "dist-frontend", "host.json", "package.json")
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            throw "Required file missing: $file"
        }
    }
    
    # Check function files
    $functionFiles = Get-ChildItem -Path "dist" -Filter "*.js" -Recurse
    if ($functionFiles.Count -eq 0) {
        throw "No compiled function files found in dist/"
    }
    
    # Check frontend files
    $frontendIndex = Test-Path "dist-frontend/index.html"
    if (-not $frontendIndex) {
        throw "Frontend index.html not found"
    }
    
    # Calculate build sizes
    $distSize = [math]::Round((Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    $frontendSize = [math]::Round((Get-ChildItem -Path "dist-frontend" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    
    Write-Log "Build validation passed:" "INFO"
    Write-Log "  - Functions: $($functionFiles.Count) files, $distSize MB" "INFO"
    Write-Log "  - Frontend: $frontendSize MB" "INFO"
    
    # Size validation
    if ($distSize -gt $MAX_BUILD_SIZE_MB) {
        Write-Log "⚠️ Build size ($distSize MB) exceeds recommended maximum ($MAX_BUILD_SIZE_MB MB)" "WARN"
    }
    
    return @{
        FunctionCount = $functionFiles.Count
        BackendSize = $distSize
        FrontendSize = $frontendSize
    }
}

function Invoke-ProductionValidation {
    if ($Environment -ne "production") {
        return
    }
    
    Write-Log "🔐 Running production-specific validations..." "INFO"
    
    # Check for development code patterns
    $devPatterns = @("console.log", "debugger", "TODO:", "FIXME:", "alert(")
    foreach ($pattern in $devPatterns) {
        $matches = Select-String -Path "dist\*.js" -Pattern $pattern -Quiet
        if ($matches) {
            Write-Log "⚠️ Found development code pattern '$pattern' in build" "WARN"
        }
    }
    
    # Check for hardcoded environment variables
    $envVarPattern = "process\.env\.\w+\s*=\s*['\"][^'\"]+['\"]"
    $hardcodedEnv = Select-String -Path "dist\*.js" -Pattern $envVarPattern -Quiet
    if ($hardcodedEnv) {
        Write-Log "⚠️ Potential hardcoded environment variables found" "WARN"
    }
    
    # Validate production domain requirement
    if (-not $ProductionDomain) {
        Write-Log "❌ ProductionDomain parameter required for production deployment" "ERROR"
        throw "ProductionDomain parameter is required for production deployment"
    }
}

function New-DeploymentPackage {
    Write-Log "📦 Creating deployment package..." "INFO"
    
    try {
        # Create deployment directory
        $deploymentDir = "deployment"
        if (Test-Path $deploymentDir) {
            Remove-Item -Path $deploymentDir -Recurse -Force
        }
        New-Item -Path $deploymentDir -ItemType Directory | Out-Null
        
        # Frontend package
        $frontendDeployDir = Join-Path $deploymentDir "frontend"
        New-Item -Path $frontendDeployDir -ItemType Directory | Out-Null
        Copy-Item -Path "dist-frontend\*" -Destination $frontendDeployDir -Recurse
        
        # Backend package
        $backendDeployDir = Join-Path $deploymentDir "backend"
        New-Item -Path $backendDeployDir -ItemType Directory | Out-Null
        Copy-Item -Path "dist\*" -Destination $backendDeployDir -Recurse
        Copy-Item -Path "host.json" -Destination $backendDeployDir
        Copy-Item -Path "package.json" -Destination $backendDeployDir
        
        # Create deployment manifest
        $manifest = @{
            Environment = $Environment
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            DeploymentType = $DeploymentType
            GitCommit = try { git rev-parse HEAD } catch { "unknown" }
            GitBranch = try { git branch --show-current } catch { "unknown" }
        }
        
        $manifest | ConvertTo-Json | Set-Content -Path (Join-Path $deploymentDir "manifest.json")
        
        Write-Log "✅ Deployment package created at $deploymentDir" "INFO"
        return $deploymentDir
    }
    catch {
        Write-Log "❌ Failed to create deployment package: $_" "ERROR"
        throw
    }
}

function Save-DeploymentSummary {
    param($BuildStats, $DeploymentDir)
    
    $deploymentEndTime = Get-Date
    $duration = $deploymentEndTime - $deploymentStartTime
    
    $summary = @{
        Environment = $Environment
        DeploymentType = $DeploymentType
        StartTime = $deploymentStartTime.ToString("yyyy-MM-dd HH:mm:ss")
        EndTime = $deploymentEndTime.ToString("yyyy-MM-dd HH:mm:ss")
        Duration = $duration.ToString("hh\:mm\:ss")
        NodeVersion = (node --version)
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        BuildStats = $BuildStats
        DeploymentPath = $DeploymentDir
        LogFile = $logFile
        Success = $true
    }
    
    $summaryFile = "deployment-summary-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryFile
    
    Write-Log "📋 Deployment summary saved to $summaryFile" "INFO"
    return $summary
}

# Main execution flow
try {
    Write-Log "🚀 Starting VirPal App deployment for $Environment environment" "INFO"
    Write-Log "Deployment Type: $DeploymentType" "INFO"
    
    # Phase 1: Prerequisites and validation
    Test-Prerequisites
    
    if ($DeploymentType -ne "validate-only") {
        # Phase 2: Clean and prepare
        Invoke-CleanBuild
        Install-Dependencies
        
        # Phase 3: Quality assurance
        if (-not $SkipSecurity) {
            Invoke-SecurityAudit
        }
        Invoke-QualityChecks
        if (-not $SkipTests) {
            Invoke-Tests
        }
        
        # Phase 4: Configuration and build
        Update-CorsConfiguration
        Invoke-Build
        
        # Phase 5: Validation and packaging
        $buildStats = Test-BuildArtifacts
        Invoke-ProductionValidation
        
        if ($DeploymentType -eq "full-deploy") {
            $deploymentDir = New-DeploymentPackage
            $summary = Save-DeploymentSummary -BuildStats $buildStats -DeploymentDir $deploymentDir
        } else {
            $summary = Save-DeploymentSummary -BuildStats $buildStats -DeploymentDir $null
        }
    } else {
        Write-Log "✅ Validation-only mode completed" "INFO"
        $summary = @{ Environment = $Environment; DeploymentType = $DeploymentType; Success = $true }
    }
    
    # Success summary
    Write-Log "🎉 VirPal App deployment preparation completed successfully!" "INFO"
    Write-Log "📊 Summary:" "INFO"
    if ($buildStats) {
        Write-Log "  - Functions: $($buildStats.FunctionCount)" "INFO"
        Write-Log "  - Backend size: $($buildStats.BackendSize) MB" "INFO"
        Write-Log "  - Frontend size: $($buildStats.FrontendSize) MB" "INFO"
    }
    Write-Log "  - Environment: $Environment" "INFO"
    Write-Log "  - Type: $DeploymentType" "INFO"
    Write-Log "  - Duration: $((Get-Date) - $deploymentStartTime)" "INFO"
    
    if ($DeploymentType -eq "full-deploy") {
        Write-Log "" "INFO"
        Write-Log "📋 Next steps:" "INFO"
        Write-Log "  1. Deploy 'deployment/backend' to Azure Functions" "INFO"
        Write-Log "  2. Deploy 'deployment/frontend' to Static Web App or CDN" "INFO"
        Write-Log "  3. Configure environment variables in Azure" "INFO"
        Write-Log "  4. Test the deployed application" "INFO"
    }
    
    exit 0
}
catch {
    Write-Log "❌ Deployment failed: $_" "ERROR"
    Write-Log "💡 Check the log file for details: $logFile" "ERROR"
    exit 1
}
