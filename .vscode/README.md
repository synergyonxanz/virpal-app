# 🚀 VSCode Workspace Configuration for Virpal App

Konfigurasi VS Code workspace yang telah dioptimalkan untuk pengembangan virpal-app dengan Azure Functions dan React TypeScript.

## ✅ Status Workspace

Berdasarkan hasil validasi terakhir:

- ✅ **15 Komponen berhasil** dikonfigurasi dengan baik
- ⚠️ **1 Warning minor** - Extension TypeScript Next (dapat diabaikan)
- 🚀 **Workspace siap digunakan** untuk development

## 📁 Struktur File Konfigurasi

```
.vscode/
├── 📄 settings.json              # Pengaturan workspace dan editor
├── ⚙️ tasks.json                # Task development dan build
├── 🐛 launch.json               # Konfigurasi debugging
├── 🧩 extensions.json           # Extension yang direkomendasikan
├── 📝 typescript.code-snippets  # Custom code snippets
├── ⌨️ keybindings.jsonc         # Keyboard shortcuts custom
├── 🎨 theme.json                # Kustomisasi tema warna
├── 🔧 c_cpp_properties.json     # Konfigurasi C/C++ IntelliSense
├── 📋 path-intellisense.json    # Path intellisense configuration
├── 🔍 health-check.ps1          # Script health check workspace
├── ⚡ quick-setup.ps1           # Script setup cepat
└── 📚 README.md                 # Dokumentasi ini
```

## Files Overview

### `settings.json`

Comprehensive workspace settings including:

- **Azure Functions Configuration**: Deployment and runtime settings
- **TypeScript/JavaScript Configuration**: Auto-imports, inlay hints, and formatting
- **Editor Configuration**: Format on save, code actions, and productivity settings
- **File Management**: Exclusions, auto-save, and file associations
- **ESLint & Prettier Integration**: Code quality and formatting
- **Performance Settings**: Optimized for large TypeScript projects

### `tasks.json`

Pre-configured tasks for development workflow:

- **Azure Functions Tasks**: Build, watch, and start functions
- **Frontend Development**: Dev server, build, and preview
- **Full Stack Development**: Combined frontend and backend development
- **Deployment Tasks**: Validation and deployment to different environments
- **Code Quality**: Linting and cleaning tasks
- **Development Modes**: Switch between local and emulator modes

### `launch.json`

Debug configurations for different scenarios:

- **Azure Functions Debugging**: Attach to running functions
- **Frontend Debugging**: Chrome and Edge browser debugging
- **Full Stack Debugging**: Combined frontend and backend debugging
- **Testing Debugging**: Jest test debugging
- **TypeScript File Debugging**: Debug individual TypeScript files

### `extensions.json`

Recommended extensions for optimal development experience:

- **Azure Tools**: Functions, Storage, Cosmos DB, and more
- **TypeScript/JavaScript**: Enhanced IntelliSense and error detection
- **React Development**: Snippets, TailwindCSS, and component tools
- **Code Quality**: ESLint, Prettier, and formatting tools
- **Productivity**: GitLens, TODO management, and navigation aids

### `typescript.code-snippets`

Custom code snippets optimized for virpal-app development:

- **React Components**: Functional components with TypeScript props
- **Azure Functions**: Complete function templates with error handling
- **Custom Hooks**: React hooks with proper TypeScript typing
- **Service Classes**: Singleton pattern services for Azure integration
- **Utility Snippets**: Interfaces, types, and async functions

### `keybindings.jsonc`

Custom keyboard shortcuts for efficient development:

- **Development Workflow**: Quick start/stop services (Ctrl+Shift+D/F/A/B)
- **Code Quality**: Linting and cleaning shortcuts (Ctrl+Shift+L/C)
- **Navigation**: Quick panel access and file operations
- **Azure Functions**: Direct function creation and deployment
- **Git Operations**: Streamlined version control commands

### `theme.json`

Custom color theme configuration optimized for long coding sessions.

## Quick Start

1. **Install Recommended Extensions**: Open the Command Palette (`Ctrl+Shift+P`) and run "Extensions: Show Recommended Extensions"

2. **Start Development**: Use `Ctrl+Shift+P` and run "Tasks: Run Task" then select:

   - "Full Stack: Start Development" for complete development environment
   - "Frontend: Dev Server" for frontend-only development
   - "func: host start" for Azure Functions only

3. **Debug**: Press `F5` and select the appropriate debug configuration

## Available Tasks

### Development

- `Full Stack: Start Development` - Start both frontend and backend
- `Frontend: Dev Server` - Start Vite development server
- `func: host start` - Start Azure Functions runtime

### Build & Deploy

- `Build: Full Application` - Build entire application
- `Deploy: Validate` - Validate deployment configuration
- `Deploy: Staging` - Deploy to staging environment

### Code Quality

- `Lint: Check All` - Run ESLint on all files
- `Clean: All Dist Folders` - Clean build outputs

### Mode Management

- `Mode: Switch to Local` - Switch to local development mode
- `Mode: Switch to Emulator` - Switch to emulator mode
- `Mode: Check Status` - Check current development mode

## Debug Configurations

### Frontend Debugging

- **🌐 Debug Frontend (Chrome)**: Debug React app in Chrome
- **🌐 Debug Frontend (Edge)**: Debug React app in Edge

### Backend Debugging

- **🔧 Debug Azure Functions**: Debug Azure Functions with hot reload
- **🔄 Debug Full Stack**: Debug both frontend and backend

### Testing & Development

- **🧪 Debug Tests (Node)**: Debug Jest tests
- **🔍 Debug Current TypeScript File**: Debug any TypeScript file

## Best Practices Applied

1. **TypeScript Configuration**: Strict type checking and auto-imports
2. **Code Formatting**: Automatic formatting with Prettier on save
3. **Error Detection**: Real-time ESLint feedback with Error Lens
4. **Performance**: Optimized file exclusions and IntelliSense settings
5. **Security**: Workspace trust settings and secure defaults
6. **Productivity**: Comprehensive task automation and debugging setup

## Code Snippets Usage

### TypeScript Snippets

- `rfc` - React Functional Component with TypeScript
- `azfunc` - Azure Function with error handling
- `hook` - Custom React hook with TypeScript
- `service` - Service class with singleton pattern
- `interface` - TypeScript interface definition
- `type` - TypeScript type definition
- `afunc` - Async function with error handling

### React Snippets

- `rcwp` - React Component with Props and children
- `twcomp` - TailwindCSS component with variants

## Keyboard Shortcuts

### Development Workflow

- `Ctrl+Shift+D` - Start Full Stack Development
- `Ctrl+Shift+F` - Start Frontend Dev Server
- `Ctrl+Shift+A` - Start Azure Functions
- `Ctrl+Shift+B` - Build Full Application

### Code Quality

- `Ctrl+Shift+L` - Run Lint Check
- `Ctrl+Shift+C` - Clean Dist Folders
- `Ctrl+Shift+I` - Format Document
- `Ctrl+.` - Quick Fix Actions

### Azure Functions

- `Ctrl+Alt+F` - Create New Function
- `Ctrl+Alt+D` - Deploy Function

### Navigation & Git

- `Ctrl+Shift+E` - Explorer View
- `Ctrl+Shift+G` - Source Control
- `F12` - Go to Definition
- `Shift+F12` - Find References

## Troubleshooting

### Common Issues

1. **Tasks not working**: Ensure all npm dependencies are installed
2. **Debug not starting**: Check if ports 9229 and 5173 are available
3. **Functions not building**: Run `npm run clean:dist` first
4. **Extensions missing**: Install recommended extensions from Extensions view

### Performance Tips

1. **Exclude large folders**: Already configured in `files.exclude`
2. **Disable unused extensions**: Only use recommended extensions
3. **Optimize TypeScript**: IntelliSense settings are pre-configured
4. **Use workspace settings**: Settings are optimized for this project

## File Structure Overview

```
.vscode/
├── settings.json           # Workspace and editor settings
├── tasks.json             # Development and build tasks
├── launch.json            # Debug configurations
├── extensions.json        # Recommended extensions
├── typescript.code-snippets # Custom code snippets
├── keybindings.jsonc      # Custom keyboard shortcuts
├── theme.json             # Color theme customization
├── c_cpp_properties.json  # C/C++ configuration
└── README.md              # This documentation
```

## Customization

You can customize these settings by:

1. Modifying the respective JSON files
2. Adding user-specific settings in your global VS Code settings
3. Creating additional tasks for your specific workflow needs

The configuration is designed to be comprehensive yet flexible for the virpal-app development workflow.
