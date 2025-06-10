# VS Code Workspace Health Check

param(
    [switch]$Quick,
    [switch]$Detailed,
    [switch]$Fix
)

Write-Host "🔍 VS Code Workspace Health Check" -ForegroundColor Cyan
Write-Host "=" * 40

$issues = @()
$successes = @()

# Check basic files
$requiredFiles = @(
    ".vscode\settings.json",
    ".vscode\tasks.json",
    ".vscode\launch.json",
    ".vscode\extensions.json",
    ".vscode\typescript.code-snippets",
    ".vscode\keybindings.jsonc"
)

Write-Host "📁 Checking VS Code Files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        $successes += "✅ $file exists"
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        $issues += "❌ Missing: $file"
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

# Check JSON syntax
Write-Host "`n🔧 Checking JSON Syntax..." -ForegroundColor Yellow
$jsonFiles = Get-ChildItem ".vscode\*.json", ".vscode\*.jsonc" -ErrorAction SilentlyContinue
foreach ($file in $jsonFiles) {
    try {
        $content = Get-Content $file.FullName -Raw
        if ($file.Extension -eq ".jsonc") {
            # Basic check for JSONC
            if ($content -match "^\s*\[" -or $content -match "^\s*\{") {
                $successes += "✅ $($file.Name) syntax OK"
                Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
            } else {
                $issues += "❌ $($file.Name) invalid syntax"
                Write-Host "  ❌ $($file.Name)" -ForegroundColor Red
            }
        } else {
            ConvertFrom-Json $content | Out-Null
            $successes += "✅ $($file.Name) syntax OK"
            Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
        }
    }
    catch {
        $issues += "❌ $($file.Name): $($_.Exception.Message)"
        Write-Host "  ❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check VS Code extensions
if ($Detailed) {
    Write-Host "`n🎯 Checking Key Extensions..." -ForegroundColor Yellow
    $keyExtensions = @(
        "ms-azuretools.vscode-azurefunctions",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "ms-vscode.vscode-typescript-next"
    )

    foreach ($ext in $keyExtensions) {
        try {
            $result = & code --list-extensions 2>$null | Where-Object { $_ -eq $ext }
            if ($result) {
                $successes += "✅ Extension: $ext"
                Write-Host "  ✅ $ext" -ForegroundColor Green
            } else {
                $issues += "⚠️ Extension missing: $ext"
                Write-Host "  ⚠️ $ext" -ForegroundColor Yellow
            }
        }
        catch {
            $issues += "❌ Cannot check extension: $ext"
        }
    }
}

# Check TypeScript configuration
Write-Host "`n📦 Checking TypeScript Setup..." -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    $successes += "✅ tsconfig.json exists"
    Write-Host "  ✅ tsconfig.json" -ForegroundColor Green
} else {
    $issues += "❌ Missing tsconfig.json"
    Write-Host "  ❌ tsconfig.json" -ForegroundColor Red
}

if (Test-Path "tsconfig.functions.json") {
    $successes += "✅ tsconfig.functions.json exists"
    Write-Host "  ✅ tsconfig.functions.json" -ForegroundColor Green
} else {
    $issues += "❌ Missing tsconfig.functions.json"
    Write-Host "  ❌ tsconfig.functions.json" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Health Check Summary" -ForegroundColor Cyan
Write-Host "=" * 30

if ($successes.Count -gt 0) {
    Write-Host "`n✅ Successes ($($successes.Count)):" -ForegroundColor Green
    $successes | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
}

if ($issues.Count -gt 0) {
    Write-Host "`n⚠️ Issues ($($issues.Count)):" -ForegroundColor Yellow
    $issues | ForEach-Object {
        if ($_ -match "❌") {
            Write-Host "  $_" -ForegroundColor Red
        } else {
            Write-Host "  $_" -ForegroundColor Yellow
        }
    }
}

# Overall status
Write-Host "`n🎯 Overall Status:" -ForegroundColor Cyan
if ($issues.Count -eq 0) {
    Write-Host "  ✨ Perfect! Workspace is fully configured." -ForegroundColor Green
} elseif ($issues.Where({ $_ -match "❌" }).Count -eq 0) {
    Write-Host "  ✨ Good! Minor warnings but workspace is functional." -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️ Issues found that may affect functionality." -ForegroundColor Red
}

# Auto-fix option
if ($Fix -and $issues.Count -gt 0) {
    Write-Host "`n🔧 Auto-fix Options:" -ForegroundColor Cyan

    # Install missing extensions
    $missingExts = $issues | Where-Object { $_ -match "Extension missing: (.+)" }
    if ($missingExts) {
        Write-Host "Installing missing extensions..." -ForegroundColor Yellow
        foreach ($ext in $missingExts) {
            if ($ext -match "Extension missing: (.+)") {
                $extName = $Matches[1]
                Write-Host "  Installing $extName..." -ForegroundColor Gray
                & code --install-extension $extName
            }
        }
    }
}

Write-Host "`n📚 Quick Commands:" -ForegroundColor Cyan
Write-Host "  🔧 Fix issues: .\\.vscode\\health-check.ps1 -Fix" -ForegroundColor Gray
Write-Host "  📖 Open workspace: code virpal-app-workspace.code-workspace" -ForegroundColor Gray
Write-Host "  🚀 Start development: Ctrl+Shift+P > 'Tasks: Run Task' > 'Full Stack: Start Development'" -ForegroundColor Gray
