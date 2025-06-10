# 📄 Ignore Files Documentation - Virpal App

## 📋 Overview

Dokumentasi ini menjelaskan konfigurasi `.gitignore` dan `.funcignore` yang telah dioptimalkan untuk virpal-app dengan best practices.

## 🔧 .gitignore - Git Version Control

### ✨ Key Features

- **Terstruktur dan terkategorisasi** dengan header yang jelas
- **Security-focused** - mengabaikan semua file credentials dan secrets
- **Build-optimized** - mengabaikan semua build artifacts dan cache
- **IDE-agnostic** - mendukung VS Code, IntelliJ, Sublime, dll
- **Cross-platform** - kompatibel Windows, macOS, Linux

### 📂 Categories

#### 🔒 Security & Secrets

```
.env*
local.settings.json
*.pem, *.key, *.crt
Azure credentials
```

#### 🏗️ Build & Cache

```
dist/, build/, out/
node_modules/
.vite/, .cache/
*.tsbuildinfo
```

#### ☁️ Azure Specific

```
.azure/
__azurite_db*__.json
*.azure.log
func-extensions/
```

#### 🛠️ Development Tools

```
.vscode/* (with exceptions)
.idea/
*.log files
Coverage reports
```

### ⚠️ Important Notes

- **VS Code config disimpan**: Hanya file konfigurasi workspace yang berguna
- **Environment files**: Semua `.env*` diabaikan, gunakan `.env.example`
- **Azure secrets**: `local.settings.json` diabaikan, gunakan `.example`

## 🚀 .funcignore - Azure Functions Deployment

### ✨ Key Features

- **Deployment-optimized** - hanya kirim file yang diperlukan ke Azure
- **Size-minimized** - mengabaikan semua source code dan dev tools
- **Runtime-focused** - hanya compiled JavaScript dan config yang dibutuhkan

### 📂 What's Excluded

#### 💻 Source Code

```
*.ts, *.tsx, *.jsx (source files)
src/ directory
TypeScript configs
```

#### 🛠️ Development

```
.vscode/, .git/
node_modules/
package.json (dependencies handled by runtime)
Testing files
```

#### 🎨 Frontend Assets

```
CSS, images, fonts
React components
Public assets
Build tools config
```

#### 📚 Documentation

```
README.md
docs/
All *.md files
```

### ✅ What's Included (not ignored)

- `host.json` - Azure Functions configuration
- `proxies.json` - API proxies (if exists)
- `dist/**/*.js` - Compiled JavaScript functions
- Runtime configuration files

## 🎯 Best Practices Applied

### 1. **Security First**

```bash
# ❌ Never commit secrets
.env
local.settings.json
*.key

# ✅ Use example files
.env.example
local.settings.json.example
```

### 2. **Performance Optimization**

```bash
# ❌ Don't include build artifacts
dist/
node_modules/
*.tsbuildinfo

# ✅ Let CI/CD rebuild
npm run build
```

### 3. **Deployment Efficiency**

```bash
# .funcignore optimizes deployment size
# Only sends compiled code to Azure
# Reduces cold start times
```

### 4. **Development Experience**

```bash
# Keep useful VS Code settings
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json

# Ignore user-specific IDE files
.idea/
*.sublime-*
```

## 🔧 Configuration Commands

### Setup Environment Files

```powershell
# Copy example files
Copy-Item .env.example .env
Copy-Item local.settings.json.example local.settings.json

# Edit with your values
code .env
code local.settings.json
```

### Test Ignore Patterns

```powershell
# Check what Git will track
git status

# Check what Functions will deploy
func azure functionapp publish your-app --dry-run
```

### Validate Configuration

```powershell
# Run workspace health check
.\.vscode\health-check.ps1 -Detailed
```

## 📊 Ignore Files Comparison

| File          | Purpose         | Size Impact | Security |
| ------------- | --------------- | ----------- | -------- |
| `.gitignore`  | Version control | Medium      | High     |
| `.funcignore` | Deployment      | High        | Medium   |

### Git vs Functions Ignore

- **Git**: Protects repository from sensitive files
- **Functions**: Optimizes deployment package size
- **Both**: Improve security and performance

## ⚠️ Troubleshooting

### Common Issues

#### 1. **File Not Ignored**

```powershell
# Clear Git cache and re-add
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

#### 2. **Deployment Too Large**

```powershell
# Check .funcignore patterns
func azure functionapp publish --dry-run

# Common culprits:
# - node_modules/ not ignored
# - Large frontend assets included
# - Source files (*.ts) included
```

#### 3. **Missing Files in Deployment**

```powershell
# Check if essential files are ignored
# Should NOT ignore:
# - host.json
# - dist/**/*.js
# - proxies.json
```

## 📚 References

- [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
- [Azure Functions - funcignore](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#using-funcignore)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

_Konfigurasi ini dioptimalkan untuk virpal-app development workflow dengan security dan performance sebagai prioritas utama._
