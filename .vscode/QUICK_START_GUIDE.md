# Virpal App - VS Code Configuration Guide

## 🚀 Quick Start

1. **Open this workspace**: Use `File > Open Workspace from File` and select `virpal-app-workspace.code-workspace`
2. **Install recommended extensions**: VS Code will prompt you to install recommended extensions
3. **Start development**: Press `Ctrl+Shift+P` and run "Tasks: Run Task" then select "🎯 Quick Setup"

## 📋 Development Checklist

### Initial Setup

- [ ] All recommended extensions installed
- [ ] Node.js 20+ installed
- [ ] Azure Functions Core Tools installed
- [ ] PowerShell 7+ installed

### Environment Configuration

- [ ] `local.settings.json` configured
- [ ] Azure resources configured
- [ ] Environment variables set

### Development Workflow

- [ ] Frontend dev server running (`Ctrl+Shift+F`)
- [ ] Azure Functions running (`Ctrl+Shift+A`)
- [ ] Full stack debugging working (`F5`)

## 🛠️ Available Commands

### Quick Actions (Keyboard Shortcuts)

```
Ctrl+Shift+D    Start Full Stack Development
Ctrl+Shift+F    Start Frontend Only
Ctrl+Shift+A    Start Azure Functions Only
Ctrl+Shift+B    Build Full Application
Ctrl+Shift+L    Run Lint Check
Ctrl+Shift+C    Clean All Builds
```

### Development Tasks

- **🎯 Quick Setup** - Complete environment setup
- **Full Stack: Start Development** - Start both frontend and backend
- **Frontend: Dev Server** - Vite development server (localhost:5173)
- **func: host start** - Azure Functions runtime (localhost:7071)

### Build & Deploy Tasks

- **Build: Full Application** - Complete production build
- **Deploy: Validate** - Validate deployment configuration
- **Deploy: Staging** - Deploy to staging environment

### Code Quality Tasks

- **Lint: Check All** - ESLint check across all files
- **Clean: All Dist Folders** - Remove all build artifacts

### Mode Management Tasks

- **Mode: Switch to Local** - Use local development mode
- **Mode: Switch to Emulator** - Use Azure emulator mode
- **Mode: Check Status** - Check current development mode

## 🐛 Debug Configurations

### Recommended (Start Here)

- **🎯 Start Here - Quick Debug** - One-click setup and debug

### Frontend Debugging

- **🌐 Debug Frontend (Chrome)** - Debug React in Chrome
- **🌐 Debug Frontend (Edge)** - Debug React in Edge

### Backend Debugging

- **🔧 Debug Azure Functions** - Debug functions with hot reload
- **🔄 Debug Full Stack** - Debug both frontend and backend

### Testing & Development

- **🧪 Debug Tests (Node)** - Debug Jest tests
- **🔍 Debug Current TypeScript File** - Debug any TS file

### Compound Debugging

- **🚀 Full Stack Debug** - Debug functions + frontend simultaneously

## 📝 Code Snippets

### TypeScript Snippets

| Trigger     | Description                                |
| ----------- | ------------------------------------------ |
| `rfc`       | React Functional Component with TypeScript |
| `azfunc`    | Azure Function with error handling         |
| `hook`      | Custom React hook with TypeScript          |
| `service`   | Service class with singleton pattern       |
| `interface` | TypeScript interface definition            |
| `type`      | TypeScript type definition                 |
| `afunc`     | Async function with error handling         |

### React Snippets

| Trigger  | Description                             |
| -------- | --------------------------------------- |
| `rcwp`   | React Component with Props and children |
| `twcomp` | TailwindCSS component with variants     |

## ⚙️ Settings Overview

### Auto-Configuration

- **Format on Save**: Prettier formatting applied automatically
- **Auto Imports**: TypeScript imports added automatically
- **Error Detection**: Real-time ESLint feedback
- **IntelliSense**: Enhanced TypeScript support

### File Management

- **Auto Exclusions**: node_modules, dist folders excluded from search
- **Auto Save**: Files saved on focus change
- **Trim Whitespace**: Automatic whitespace cleanup

### Azure Integration

- **Functions Support**: Full Azure Functions development support
- **Key Vault Integration**: Secure secrets management
- **Deployment Tools**: Built-in deployment workflows

## 🔧 Troubleshooting

### Common Issues

#### Tasks Not Working

```powershell
# Check if dependencies are installed
npm install

# Check current development mode
npm run mode:status

# Clean and rebuild
npm run clean:dist
npm run build
```

#### Debug Not Starting

```powershell
# Check if ports are available
netstat -an | Select-String ":9229|:5173|:7071"

# Kill processes if needed
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "func" | Stop-Process -Force
```

#### Azure Functions Issues

```powershell
# Rebuild functions
npm run functions:build

# Check Azure Functions Core Tools
func --version

# Start with verbose logging
func host start --verbose
```

#### Frontend Issues

```powershell
# Clear Vite cache
npm run dev -- --force

# Check if development server is running
Invoke-WebRequest -Uri "http://localhost:5173" -Method HEAD
```

### Performance Issues

1. **Slow IntelliSense**: Restart TypeScript service (`Ctrl+Shift+P` > "TypeScript: Restart TS Server")
2. **High CPU**: Close unused extensions and restart VS Code
3. **Memory Issues**: Increase Node.js memory limit in tasks

### Extension Issues

1. **Missing Extensions**: Open Extensions view (`Ctrl+Shift+X`) and install recommended
2. **Extension Conflicts**: Disable conflicting extensions listed in `unwantedRecommendations`
3. **Updates Needed**: Update all extensions to latest versions

## 📈 Performance Tips

### Optimization

- Use workspace settings instead of global settings
- Exclude large folders from file watcher
- Use TypeScript project references
- Enable Prettier caching

### Memory Management

- Close unused files and tabs
- Use "restart window" periodically
- Monitor extension resource usage

### Network Optimization

- Use local Azure emulator when possible
- Cache dependencies properly
- Use build watch mode for development

## 🔐 Security Notes

### Workspace Trust

- This workspace is configured with secure defaults
- Sensitive files are excluded from version control
- Environment variables are managed securely

### Azure Security

- Secrets stored in Azure Key Vault
- Authentication via Azure Active Directory
- Function-level security configured

## 📚 Additional Resources

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [VS Code Azure Tools](https://code.visualstudio.com/docs/azure/extensions)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Need help?** Check the project documentation in the `docs/` folder or raise an issue in the project repository.
