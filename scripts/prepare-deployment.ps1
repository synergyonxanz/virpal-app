#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Prepares the VirPal app for production deployment
.DESCRIPTION
    This script validates configuration, optimizes build artifacts, and ensures the application
    is ready for Azure Functions deployment following best practices.
.EXAMPLE
    .\prepare-deployment.ps1 -Environment "production"
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production")]
    [string]$Environment
)

Write-Host "🚀 Preparing VirPal App for $Environment deployment..." -ForegroundColor Cyan

# Validate Node.js version
$nodeVersion = node --version
if (-not $nodeVersion.StartsWith("v20")) {
    Write-Error "❌ Node.js version 20 is required. Current version: $nodeVersion"
    exit 1
}
Write-Host "✅ Node.js version check passed: $nodeVersion" -ForegroundColor Green

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "dist-frontend") {
    Remove-Item -Recurse -Force "dist-frontend"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci --prefer-offline --no-audit
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to install dependencies"
    exit 1
}

# Run security audit
Write-Host "🔒 Running security audit..." -ForegroundColor Yellow
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️ Security audit found issues. Review before deployment."
}

# Type checking
Write-Host "🔍 Running type check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Type check failed"
    exit 1
}

# Linting
Write-Host "📝 Running linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Linting failed"
    exit 1
}

# Build frontend
Write-Host "🏗️ Building frontend..." -ForegroundColor Yellow
$env:NODE_ENV = $Environment
npm run build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Frontend build failed"
    exit 1
}

# Build functions
Write-Host "⚡ Building Azure Functions..." -ForegroundColor Yellow
npm run build:functions
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Functions build failed"
    exit 1
}

# Validate build artifacts
Write-Host "✅ Validating build artifacts..." -ForegroundColor Yellow
$requiredFiles = @("dist", "host.json", "package.json")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "❌ Required file missing: $file"
        exit 1
    }
}

# Check functions directory
$functionFiles = Get-ChildItem -Path "dist" -Filter "*.js" -Recurse
if ($functionFiles.Count -eq 0) {
    Write-Error "❌ No compiled function files found in dist/"
    exit 1
}

Write-Host "✅ Found $($functionFiles.Count) compiled function(s)" -ForegroundColor Green

# Environment-specific validations
switch ($Environment) {
    "production" {
        Write-Host "🔐 Running production-specific validations..." -ForegroundColor Yellow
        
        # Check for any development dependencies in build
        $devPatterns = @("console.log", "debugger", "TODO:", "FIXME:")
        foreach ($pattern in $devPatterns) {
            $matches = Select-String -Path "dist\*.js" -Pattern $pattern -Quiet
            if ($matches) {
                Write-Warning "⚠️ Found development code pattern '$pattern' in build"
            }
        }
        
        # Validate environment variables are not hardcoded
        $envVarPattern = "process\.env\.\w+\s*=\s*['\"]"
        $hardcodedEnv = Select-String -Path "dist\*.js" -Pattern $envVarPattern -Quiet
        if ($hardcodedEnv) {
            Write-Warning "⚠️ Potential hardcoded environment variables found"
        }
    }
    "staging" {
        Write-Host "🧪 Running staging-specific validations..." -ForegroundColor Yellow
        # Add staging-specific checks here
    }
}

# Create deployment summary
$deploymentInfo = @{
    Environment = $Environment
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    NodeVersion = $nodeVersion
    FunctionCount = $functionFiles.Count
    BuildSize = [math]::Round((Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
}

$deploymentInfo | ConvertTo-Json | Out-File -FilePath "deployment-info.json" -Encoding UTF8
Write-Host "📋 Deployment info saved to deployment-info.json" -ForegroundColor Green

Write-Host "🎉 VirPal App is ready for $Environment deployment!" -ForegroundColor Green
Write-Host "📊 Build summary:" -ForegroundColor Cyan
Write-Host "  - Functions: $($deploymentInfo.FunctionCount)" -ForegroundColor White
Write-Host "  - Build size: $($deploymentInfo.BuildSize) MB" -ForegroundColor White
Write-Host "  - Node.js: $($deploymentInfo.NodeVersion)" -ForegroundColor White
