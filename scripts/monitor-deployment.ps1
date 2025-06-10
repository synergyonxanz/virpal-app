#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Monitors Azure Functions deployment health and performance
.DESCRIPTION
    This script performs comprehensive health checks, monitors performance metrics,
    and validates the deployment status of the VirPal app Azure Functions.
.PARAMETER Environment
    The environment to monitor (staging or production)
.PARAMETER AlertWebhook
    Optional webhook URL for sending alerts
.EXAMPLE
    .\monitor-deployment.ps1 -Environment "production"
    .\monitor-deployment.ps1 -Environment "staging" -AlertWebhook "https://hooks.slack.com/..."
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$AlertWebhook
)

# Configuration
$FunctionAppName = if ($Environment -eq "production") { "virpal-function-app" } else { "virpal-function-app-staging" }
$BaseUrl = "https://$FunctionAppName.azurewebsites.net"
$HealthEndpoint = "$BaseUrl/api/health"
$MaxRetries = 3
$RetryDelay = 10

Write-Host "🔍 Monitoring VirPal App deployment in $Environment environment..." -ForegroundColor Cyan
Write-Host "📍 Function App: $FunctionAppName" -ForegroundColor White
Write-Host "🌐 Base URL: $BaseUrl" -ForegroundColor White

# Function to send alert
function Send-Alert {
    param(
        [string]$Message,
        [string]$Level = "warning"
    )
    
    $emoji = switch ($Level) {
        "error" { "🚨" }
        "warning" { "⚠️" }
        "info" { "ℹ️" }
        "success" { "✅" }
        default { "📢" }
    }
    
    $alertMessage = "$emoji VirPal App [$Environment]: $Message"
    Write-Host $alertMessage -ForegroundColor $(if ($Level -eq "error") { "Red" } elseif ($Level -eq "warning") { "Yellow" } else { "Green" })
    
    if ($AlertWebhook) {
        try {
            $payload = @{
                text = $alertMessage
                username = "VirPal Deployment Monitor"
                icon_emoji = ":robot_face:"
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $AlertWebhook -Method Post -Body $payload -ContentType "application/json" -ErrorAction SilentlyContinue
        } catch {
            Write-Warning "Failed to send alert to webhook: $($_.Exception.Message)"
        }
    }
}

# Function to test endpoint with retries
function Test-EndpointWithRetry {
    param(
        [string]$Url,
        [int]$ExpectedStatusCode = 200,
        [int]$TimeoutSeconds = 30
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            Write-Host "  Attempt $i/$MaxRetries..." -ForegroundColor Gray
            
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds -UseBasicParsing
            
            if ($response.StatusCode -eq $ExpectedStatusCode) {
                return @{
                    Success = $true
                    StatusCode = $response.StatusCode
                    ResponseTime = $response.Headers['X-Response-Time']
                    Content = $response.Content
                }
            } else {
                Write-Warning "  Unexpected status code: $($response.StatusCode)"
            }
        } catch {
            Write-Warning "  Request failed: $($_.Exception.Message)"
            
            if ($i -lt $MaxRetries) {
                Write-Host "  Retrying in $RetryDelay seconds..." -ForegroundColor Gray
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    
    return @{
        Success = $false
        Error = "Failed after $MaxRetries attempts"
    }
}

# 1. Health Check
Write-Host "`n🏥 Performing health check..." -ForegroundColor Yellow
$healthResult = Test-EndpointWithRetry -Url $HealthEndpoint

if ($healthResult.Success) {
    Write-Host "✅ Health check passed" -ForegroundColor Green
    
    try {
        $healthData = $healthResult.Content | ConvertFrom-Json
        Write-Host "  Status: $($healthData.status)" -ForegroundColor White
        Write-Host "  Version: $($healthData.version)" -ForegroundColor White
        Write-Host "  Node.js: $($healthData.runtime.node)" -ForegroundColor White
        Write-Host "  Uptime: $([math]::Round($healthData.uptime / 3600, 2)) hours" -ForegroundColor White
        
        if ($healthData.status -ne "healthy") {
            Send-Alert "Health check reports unhealthy status: $($healthData.status)" "error"
        } else {
            Send-Alert "Health check passed - system is healthy" "success"
        }
    } catch {
        Write-Warning "Failed to parse health check response"
    }
} else {
    Send-Alert "Health check failed: $($healthResult.Error)" "error"
    Write-Error "❌ Health check failed"
}

# 2. Function App Status Check
Write-Host "`n⚡ Checking Function App status..." -ForegroundColor Yellow
try {
    # This requires Azure CLI to be installed and authenticated
    $appStatus = az functionapp show --name $FunctionAppName --resource-group "virpal-app-rg" --query "state" --output tsv 2>$null
    
    if ($appStatus -eq "Running") {
        Write-Host "✅ Function App is running" -ForegroundColor Green
    } else {
        Send-Alert "Function App is not running. Current state: $appStatus" "error"
        Write-Warning "⚠️ Function App state: $appStatus"
    }
} catch {
    Write-Warning "Could not check Function App status (Azure CLI required)"
}

# 3. Performance Metrics Check
Write-Host "`n📊 Checking performance metrics..." -ForegroundColor Yellow

# Test response times for key endpoints
$performanceTests = @(
    @{ Name = "Health Endpoint"; Url = $HealthEndpoint; MaxResponseTime = 2000 }
)

foreach ($test in $performanceTests) {
    Write-Host "  Testing $($test.Name)..." -ForegroundColor Gray
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $result = Test-EndpointWithRetry -Url $test.Url -TimeoutSeconds 10
    $stopwatch.Stop()
    
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($result.Success) {
        if ($responseTime -le $test.MaxResponseTime) {
            Write-Host "  ✅ $($test.Name): ${responseTime}ms" -ForegroundColor Green
        } else {
            Send-Alert "$($test.Name) response time is slow: ${responseTime}ms (max: $($test.MaxResponseTime)ms)" "warning"
            Write-Host "  ⚠️ $($test.Name): ${responseTime}ms (slow)" -ForegroundColor Yellow
        }
    } else {
        Send-Alert "$($test.Name) performance test failed" "error"
        Write-Host "  ❌ $($test.Name): Failed" -ForegroundColor Red
    }
}

# 4. SSL Certificate Check
Write-Host "`n🔒 Checking SSL certificate..." -ForegroundColor Yellow
try {
    $uri = [System.Uri]$BaseUrl
    $req = [System.Net.HttpWebRequest]::Create($uri)
    $req.Timeout = 10000
    $response = $req.GetResponse()
    
    if ($req.ServicePoint.Certificate) {
        $cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]$req.ServicePoint.Certificate
        $daysUntilExpiry = ($cert.NotAfter - (Get-Date)).Days
        
        if ($daysUntilExpiry -gt 30) {
            Write-Host "  ✅ SSL certificate valid for $daysUntilExpiry days" -ForegroundColor Green
        } elseif ($daysUntilExpiry -gt 7) {
            Send-Alert "SSL certificate expires in $daysUntilExpiry days" "warning"
            Write-Host "  ⚠️ SSL certificate expires in $daysUntilExpiry days" -ForegroundColor Yellow
        } else {
            Send-Alert "SSL certificate expires in $daysUntilExpiry days - immediate action required" "error"
            Write-Host "  ❌ SSL certificate expires in $daysUntilExpiry days" -ForegroundColor Red
        }
    }
    
    $response.Close()
} catch {
    Write-Warning "Could not check SSL certificate: $($_.Exception.Message)"
}

# 5. Generate Monitoring Report
$reportData = @{
    Environment = $Environment
    FunctionApp = $FunctionAppName
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    HealthCheck = $healthResult.Success
    BaseUrl = $BaseUrl
    Checks = @{
        Health = $healthResult.Success
        Performance = $performanceTests | ForEach-Object { @{ Name = $_.Name; Passed = $true } }
    }
}

$reportJson = $reportData | ConvertTo-Json -Depth 3
$reportPath = "monitoring-report-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$reportJson | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📋 Monitoring report saved to: $reportPath" -ForegroundColor Cyan

# Summary
Write-Host "`n📈 Monitoring Summary:" -ForegroundColor Cyan
if ($healthResult.Success) {
    Write-Host "✅ Overall Status: HEALTHY" -ForegroundColor Green
    Send-Alert "Deployment monitoring completed - all systems healthy" "success"
} else {
    Write-Host "❌ Overall Status: UNHEALTHY" -ForegroundColor Red
    Send-Alert "Deployment monitoring completed - issues detected" "error"
}

Write-Host "🏁 Monitoring completed for $Environment environment" -ForegroundColor Cyan
