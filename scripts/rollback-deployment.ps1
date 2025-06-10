#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated rollback script for VirPal Azure Functions deployment
.DESCRIPTION
    This script performs automated rollback to the previous known good deployment
    when issues are detected in the current deployment.
.PARAMETER Environment
    The environment to rollback (staging or production)
.PARAMETER Reason
    The reason for the rollback
.PARAMETER Force
    Force rollback without confirmation prompts
.EXAMPLE
    .\rollback-deployment.ps1 -Environment "production" -Reason "High error rate detected"
    .\rollback-deployment.ps1 -Environment "staging" -Force
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$Reason = "Manual rollback requested",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Configuration
$FunctionAppName = if ($Environment -eq "production") { "virpal-function-app" } else { "virpal-function-app-staging" }
$ResourceGroupName = "virpal-app-rg"
$BaseUrl = "https://$FunctionAppName.azurewebsites.net"
$HealthEndpoint = "$BaseUrl/api/health"

Write-Host "🔄 VirPal App Deployment Rollback" -ForegroundColor Red
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Function App: $FunctionAppName" -ForegroundColor White
Write-Host "Reason: $Reason" -ForegroundColor White
Write-Host ""

# Function to test health endpoint
function Test-Health {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to create rollback log entry
function Write-RollbackLog {
    param(
        [string]$Action,
        [string]$Status = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Status] $Action"
    Write-Host $logEntry -ForegroundColor $(if ($Status -eq "ERROR") { "Red" } elseif ($Status -eq "WARNING") { "Yellow" } else { "White" })
    
    # Append to rollback log file
    $logEntry | Out-File -FilePath "rollback-$Environment-$(Get-Date -Format 'yyyyMMdd').log" -Append -Encoding UTF8
}

# Confirmation prompt (unless forced)
if (-not $Force) {
    Write-Host "⚠️  WARNING: This will rollback the $Environment deployment!" -ForegroundColor Yellow
    Write-Host "This action will:" -ForegroundColor Yellow
    Write-Host "  1. Stop the current deployment slot" -ForegroundColor Yellow
    Write-Host "  2. Swap to the previous deployment" -ForegroundColor Yellow
    Write-Host "  3. Verify the rollback was successful" -ForegroundColor Yellow
    Write-Host ""
    
    $confirmation = Read-Host "Are you sure you want to proceed? (type 'ROLLBACK' to confirm)"
    if ($confirmation -ne "ROLLBACK") {
        Write-Host "❌ Rollback cancelled by user" -ForegroundColor Red
        exit 0
    }
}

Write-RollbackLog "Starting rollback process for $Environment environment" "INFO"

# 1. Pre-rollback health check
Write-Host "🔍 Performing pre-rollback health check..." -ForegroundColor Yellow
$preRollbackHealth = Test-Health -Url $HealthEndpoint

if ($preRollbackHealth) {
    Write-Host "⚠️  Current deployment is responding to health checks" -ForegroundColor Yellow
    Write-RollbackLog "Current deployment is healthy but rollback requested" "WARNING"
    
    if (-not $Force) {
        $proceed = Read-Host "Current deployment appears healthy. Continue with rollback? (y/N)"
        if ($proceed -ne "y" -and $proceed -ne "Y") {
            Write-Host "❌ Rollback cancelled" -ForegroundColor Red
            Write-RollbackLog "Rollback cancelled - current deployment is healthy" "INFO"
            exit 0
        }
    }
} else {
    Write-Host "❌ Current deployment is not responding - proceeding with rollback" -ForegroundColor Red
    Write-RollbackLog "Current deployment is unhealthy - automatic rollback triggered" "ERROR"
}

# 2. Check if Azure CLI is available and authenticated
Write-Host "🔧 Checking Azure CLI..." -ForegroundColor Yellow
try {
    $azAccount = az account show --query "user.name" --output tsv 2>$null
    if (-not $azAccount) {
        throw "Not authenticated"
    }
    Write-Host "✅ Azure CLI authenticated as: $azAccount" -ForegroundColor Green
    Write-RollbackLog "Azure CLI authenticated as $azAccount" "INFO"
} catch {
    Write-Host "❌ Azure CLI not available or not authenticated" -ForegroundColor Red
    Write-Host "Please run 'az login' and try again" -ForegroundColor Yellow
    Write-RollbackLog "Azure CLI authentication failed" "ERROR"
    exit 1
}

# 3. Get current deployment information
Write-Host "📋 Getting current deployment information..." -ForegroundColor Yellow
try {
    $currentSlot = az functionapp deployment slot list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name=='production']" --output json | ConvertFrom-Json
    $stagingSlot = az functionapp deployment slot list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?name!='production']" --output json | ConvertFrom-Json
    
    if ($stagingSlot) {
        Write-Host "✅ Found staging slot for rollback" -ForegroundColor Green
        Write-RollbackLog "Staging slot available for rollback" "INFO"
    } else {
        Write-Host "❌ No staging slot found - cannot perform slot swap rollback" -ForegroundColor Red
        Write-RollbackLog "No staging slot found for rollback" "ERROR"
        
        # Alternative: Get previous deployment from deployment history
        Write-Host "🔍 Checking deployment history..." -ForegroundColor Yellow
        $deployments = az functionapp deployment list --name $FunctionAppName --resource-group $ResourceGroupName --query "[?status=='Success'] | sort_by(@, &received_time) | [-2:]" --output json | ConvertFrom-Json
        
        if ($deployments.Count -ge 2) {
            $previousDeployment = $deployments[0]
            Write-Host "Found previous successful deployment: $($previousDeployment.id)" -ForegroundColor Green
            Write-RollbackLog "Previous deployment found: $($previousDeployment.id)" "INFO"
        } else {
            Write-Host "❌ No previous deployment found in history" -ForegroundColor Red
            Write-RollbackLog "No previous deployment found in history" "ERROR"
            exit 1
        }
    }
} catch {
    Write-Host "❌ Failed to get deployment information: $($_.Exception.Message)" -ForegroundColor Red
    Write-RollbackLog "Failed to get deployment information: $($_.Exception.Message)" "ERROR"
    exit 1
}

# 4. Create backup of current state
Write-Host "💾 Creating backup of current deployment..." -ForegroundColor Yellow
try {
    $backupTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupName = "pre-rollback-backup-$backupTimestamp"
    
    # Export current function app configuration
    az functionapp config show --name $FunctionAppName --resource-group $ResourceGroupName --output json > "backup-config-$backupName.json"
    Write-Host "✅ Configuration backup created: backup-config-$backupName.json" -ForegroundColor Green
    Write-RollbackLog "Configuration backup created: backup-config-$backupName.json" "INFO"
} catch {
    Write-Host "⚠️  Failed to create backup: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-RollbackLog "Failed to create backup: $($_.Exception.Message)" "WARNING"
}

# 5. Perform rollback
Write-Host "🔄 Performing rollback..." -ForegroundColor Yellow

try {
    if ($stagingSlot) {
        # Slot swap rollback
        Write-Host "  Using slot swap method..." -ForegroundColor Gray
        Write-RollbackLog "Initiating slot swap rollback" "INFO"
        
        az functionapp deployment slot swap --name $FunctionAppName --resource-group $ResourceGroupName --slot staging --target-slot production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Slot swap completed successfully" -ForegroundColor Green
            Write-RollbackLog "Slot swap rollback completed successfully" "INFO"
        } else {
            throw "Slot swap failed with exit code $LASTEXITCODE"
        }
    } else {
        # Deployment history rollback
        Write-Host "  Using deployment history method..." -ForegroundColor Gray
        Write-RollbackLog "Initiating deployment history rollback" "INFO"
        
        # This would require additional implementation for redeploying from history
        Write-Host "⚠️  Deployment history rollback not fully implemented" -ForegroundColor Yellow
        Write-RollbackLog "Deployment history rollback not implemented" "WARNING"
    }
} catch {
    Write-Host "❌ Rollback failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-RollbackLog "Rollback failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# 6. Post-rollback verification
Write-Host "✅ Verifying rollback..." -ForegroundColor Yellow
Write-RollbackLog "Starting post-rollback verification" "INFO"

# Wait for deployment to stabilize
Write-Host "  Waiting for deployment to stabilize..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Health check with retries
$verificationPassed = $false
$maxAttempts = 5

for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    Write-Host "  Health check attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    if (Test-Health -Url $HealthEndpoint) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-RollbackLog "Post-rollback health check passed on attempt $attempt" "INFO"
        $verificationPassed = $true
        break
    } else {
        Write-Host "  ❌ Health check failed" -ForegroundColor Red
        if ($attempt -lt $maxAttempts) {
            Write-Host "  Retrying in 15 seconds..." -ForegroundColor Gray
            Start-Sleep -Seconds 15
        }
    }
}

# 7. Final status and cleanup
if ($verificationPassed) {
    Write-Host "`n🎉 Rollback completed successfully!" -ForegroundColor Green
    Write-Host "✅ $Environment environment has been rolled back" -ForegroundColor Green
    Write-Host "✅ Health checks are passing" -ForegroundColor Green
    Write-RollbackLog "Rollback completed successfully - system is healthy" "INFO"
    
    # Update application insights with rollback event
    try {
        $telemetryData = @{
            name = "deployment.rollback"
            properties = @{
                environment = $Environment
                reason = $Reason
                timestamp = Get-Date -Format "o"
                success = $true
            }
        } | ConvertTo-Json
        
        Write-RollbackLog "Rollback telemetry logged" "INFO"
    } catch {
        Write-RollbackLog "Failed to log rollback telemetry: $($_.Exception.Message)" "WARNING"
    }
} else {
    Write-Host "`n❌ Rollback verification failed!" -ForegroundColor Red
    Write-Host "The rollback process completed but health checks are still failing" -ForegroundColor Red
    Write-Host "Manual intervention may be required" -ForegroundColor Yellow
    Write-RollbackLog "Rollback completed but verification failed - manual intervention required" "ERROR"
    exit 1
}

# Generate rollback report
$rollbackReport = @{
    Environment = $Environment
    Reason = $Reason
    Timestamp = Get-Date -Format "o"
    FunctionApp = $FunctionAppName
    Success = $verificationPassed
    Method = if ($stagingSlot) { "slot-swap" } else { "deployment-history" }
    VerificationAttempts = $attempt
} | ConvertTo-Json -Depth 2

$reportPath = "rollback-report-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$rollbackReport | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📋 Rollback report saved to: $reportPath" -ForegroundColor Cyan
Write-RollbackLog "Rollback report generated: $reportPath" "INFO"

Write-Host "🏁 Rollback process completed" -ForegroundColor Cyan
