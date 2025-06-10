# Quick Setup Script for VS Code Workspace

Write-Host "🚀 Quick Setup for Virpal App Development" -ForegroundColor Cyan
Write-Host "=" * 50

# Install missing extensions
Write-Host "📦 Installing VS Code Extensions..." -ForegroundColor Yellow
$extensions = @(
    "ms-azuretools.vscode-azurefunctions",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "dsznajder.es7-react-js-snippets",
    "bradlc.vscode-tailwindcss",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "pkief.material-icon-theme"
)

foreach ($ext in $extensions) {
    Write-Host "  Installing $ext..." -ForegroundColor Gray
    & code --install-extension $ext --force 2>$null
}

# Install npm dependencies
Write-Host "`n📦 Installing NPM Dependencies..." -ForegroundColor Yellow
npm install

# Build functions
Write-Host "`n🔧 Building Azure Functions..." -ForegroundColor Yellow
npm run functions:build

# Setup development mode
Write-Host "`n⚙️ Setting up Development Mode..." -ForegroundColor Yellow
npm run mode:local

Write-Host "`n✨ Setup Complete!" -ForegroundColor Green
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open workspace: code virpal-app-workspace.code-workspace" -ForegroundColor Gray
Write-Host "  2. Start development: Ctrl+Shift+D" -ForegroundColor Gray
Write-Host "  3. Open frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "  4. Azure Functions: http://localhost:7071" -ForegroundColor Gray
