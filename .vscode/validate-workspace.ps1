#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Validates the VS Code workspace configuration for virpal-app
.DESCRIPTION
    This script checks if all required components are properly configured
    and working in the VS Code workspace.
#>

param(
    [switch]$Detailed,
    [switch]$Fix
)

Write-Host "🔍 Validating VS Code Workspace Configuration for Virpal App" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

$errors = @()
$warnings = @()
$success = @()

# Function to check file existence
function Test-ConfigFile {
    param($Path, $Description)

    if (Test-Path $Path) {
        $success += "✅ $Description exists"
        return $true
    } else {
        $errors += "❌ $Description missing: $Path"
        return $false
    }
}

# Function to check JSON validity
function Test-JsonFile {
    param($Path, $Description)

    if (Test-Path $Path) {
        try {
            $content = Get-Content $Path -Raw | ConvertFrom-Json
            $success += "✅ $Description is valid JSON"
            return $true
        } catch {
            $errors += "❌ $Description has invalid JSON: $($_.Exception.Message)"
            return $false
        }
    } else {
        $errors += "❌ $Description missing: $Path"
        return $false
    }
}

Write-Host "`n📁 Checking VS Code Configuration Files..." -ForegroundColor Yellow

# Check .vscode folder structure
Test-ConfigFile ".vscode" "VS Code configuration folder"
Test-JsonFile ".vscode/settings.json" "Workspace settings"
Test-JsonFile ".vscode/tasks.json" "Task definitions"
Test-JsonFile ".vscode/launch.json" "Debug configurations"
Test-JsonFile ".vscode/extensions.json" "Extension recommendations"
Test-ConfigFile ".vscode/typescript.code-snippets" "TypeScript snippets"
Test-ConfigFile ".vscode/keybindings.jsonc" "Custom keybindings"
Test-ConfigFile ".vscode/README.md" "Configuration documentation"
Test-ConfigFile ".vscode/QUICK_START_GUIDE.md" "Quick start guide"

Write-Host "`n📦 Checking Project Dependencies..." -ForegroundColor Yellow

# Check package.json
if (Test-Path "package.json") {
    try {
        $package = Get-Content "package.json" -Raw | ConvertFrom-Json
        $success += "✅ Package.json is valid"

        # Check important scripts
        $requiredScripts = @("dev", "build", "functions:build", "deploy:validate")
        foreach ($script in $requiredScripts) {
            if ($package.scripts.$script) {
                $success += "✅ Script '$script' is defined"
            } else {
                $warnings += "⚠️  Script '$script' is missing"
            }
        }
    } catch {
        $errors += "❌ Package.json is invalid: $($_.Exception.Message)"
    }
}

# Check Node.js and npm
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    $success += "✅ Node.js version: $nodeVersion"
    $success += "✅ npm version: $npmVersion"
} catch {
    $errors += "❌ Node.js or npm not found in PATH"
}

# Check Azure Functions Core Tools
try {
    $funcVersion = func --version
    $success += "✅ Azure Functions Core Tools: $funcVersion"
} catch {
    $warnings += "⚠️  Azure Functions Core Tools not found"
}

Write-Host "`n🔧 Checking Development Environment..." -ForegroundColor Yellow

# Check if node_modules exists
if (Test-Path "node_modules") {
    $success += "✅ Dependencies installed (node_modules exists)"
} else {
    $warnings += "⚠️  Dependencies not installed (run 'npm install')"
}

# Check TypeScript configuration
Test-JsonFile "tsconfig.json" "TypeScript configuration"
Test-JsonFile "tsconfig.app.json" "TypeScript app configuration"
Test-JsonFile "tsconfig.functions.json" "TypeScript functions configuration"

# Check if dist folders exist
if (Test-Path "dist") {
    $success += "✅ Functions build output exists"
} else {
    $warnings += "⚠️  Functions not built (run 'npm run functions:build')"
}

if (Test-Path "dist-frontend") {
    $success += "✅ Frontend build output exists"
} else {
    $warnings += "⚠️  Frontend not built (run 'npm run build:frontend')"
}

Write-Host "`n🎯 Checking VS Code Extensions..." -ForegroundColor Yellow

# Check if VS Code is available
try {
    $codeVersion = code --version
    $success += "✅ VS Code available in PATH"

    # Try to get installed extensions (this may not work in all environments)
    try {
        $extensions = code --list-extensions
        $recommendedExtensions = @(
            "ms-azuretools.vscode-azurefunctions",
            "ms-vscode.vscode-typescript-next",
            "esbenp.prettier-vscode",
            "dbaeumer.vscode-eslint"
        )

        foreach ($ext in $recommendedExtensions) {
            if ($extensions -contains $ext) {
                $success += "✅ Extension installed: $ext"
            } else {
                $warnings += "⚠️  Extension not installed: $ext"
            }
        }
    } catch {
        $warnings += "⚠️  Could not check VS Code extensions"
    }
} catch {
    $warnings += "⚠️  VS Code not found in PATH"
}

Write-Host "`n📊 Validation Results" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan

Write-Host "`n✅ Successes ($($success.Count)):" -ForegroundColor Green
foreach ($item in $success) {
    if ($Detailed) { Write-Host "  $item" -ForegroundColor Green }
}
if (-not $Detailed -and $success.Count -gt 0) {
    Write-Host "  Use -Detailed flag to see all successful checks" -ForegroundColor Gray
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  Warnings ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ Errors ($($errors.Count)):" -ForegroundColor Red
    foreach ($item in $errors) {
        Write-Host "  $item" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n🎯 Summary:" -ForegroundColor Cyan
if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "  🎉 Perfect! Your VS Code workspace is fully configured." -ForegroundColor Green
    Write-Host "  🚀 Ready to start development with 'Ctrl+Shift+D'" -ForegroundColor Green
} elseif ($errors.Count -eq 0) {
    Write-Host "  ✨ Good! Minor warnings found but workspace is functional." -ForegroundColor Yellow
    Write-Host "  🚀 You can start development, consider fixing warnings for optimal experience." -ForegroundColor Yellow
} else {
    Write-Host "  🔧 Issues found that need attention before development." -ForegroundColor Red
    Write-Host "  📝 Please fix the errors above and run validation again." -ForegroundColor Red
}

# Auto-fix suggestions
if ($Fix -and ($errors.Count -gt 0 -or $warnings.Count -gt 0)) {
    Write-Host "`n🔧 Auto-fix Suggestions:" -ForegroundColor Cyan

    if (-not (Test-Path "node_modules")) {
        Write-Host "  Running npm install..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed to install dependencies" -ForegroundColor Red
        }
    }

    if (-not (Test-Path "dist")) {
        Write-Host "  Building Azure Functions..." -ForegroundColor Yellow
        try {
            npm run functions:build
            Write-Host "  ✅ Functions built successfully" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed to build functions" -ForegroundColor Red
        }
    }
}

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open VS Code workspace: code virpal-app-workspace.code-workspace" -ForegroundColor Gray
Write-Host "  2. Install recommended extensions when prompted" -ForegroundColor Gray
Write-Host "  3. Press Ctrl+Shift+P and run 'Tasks: Run Task' > '🎯 Quick Setup'" -ForegroundColor Gray
Write-Host "  4. Start development with Ctrl+Shift+D" -ForegroundColor Gray

exit $errors.Count
