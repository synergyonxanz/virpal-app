# Changelog

All notable changes to VirPal App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-06-10

### Added

- 🤖 Chat AI interaktif dengan Azure OpenAI Service
- 🔊 Text-to-Speech menggunakan Azure Speech Service (voice neural Brian)
- 🔐 Sistem autentikasi MSAL dengan Azure Active Directory
- 👤 Mode guest dengan pembatasan 5 pesan
- 🔑 Integrasi Azure Key Vault untuk keamanan kredensial
- 📱 Frontend React + TypeScript yang responsive
- ⚡ Backend Azure Functions serverless
- 🎨 UI modern dengan Tailwind CSS
- 📊 Avatar Virpal dengan ekspresi dinamis
- 💾 Penyimpanan riwayat percakapan
- 🔄 Circuit breaker pattern untuk resilience
- 📖 Dokumentasi lengkap setup dan deployment
- 🚀 CI/CD pipeline dengan GitHub Actions
- 🏗️ Arsitektur enterprise dengan managed identity
- 🧪 Testing utilities dan monitoring
- 📋 Workspace VS Code yang terkonfigurasi lengkap

### Technical Features

- TypeScript untuk type safety di frontend dan backend
- Vite untuk build tool yang cepat
- ESLint dan Prettier untuk code quality
- Azure Functions dengan Node.js 20
- MSAL React untuk autentikasi Microsoft
- Hybrid storage (localStorage + future Cosmos DB support)
- Fallback Web Speech API untuk TTS
- JWT validation pada backend
- RBAC permissions dengan least privilege
- Input validation dan sanitization
- Audit logging dan monitoring

### Documentation

- Panduan setup Azure Key Vault
- Guide troubleshooting TTS
- Best practices Azure Functions logging
- Circuit breaker implementation guide
- Production deployment guide
- Migration guide untuk upgrade
- CI/CD configuration guide

### Developer Experience

- VS Code workspace dengan extensions yang direkomendasikan
- PowerShell scripts untuk automation
- Health check dan validation tools
- Quick setup guide
- Debugging configuration
- Task automation untuk development workflow

## [0.1.0] - 2025-06-01

### Added

- Initial project setup
- Basic React application structure
- Azure Functions foundation

---

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
