# VirPal App - Asisten AI dengan Azure Functions

VirPal (Virtual Pal) adalah aplikasi modern berbasis React + TypeScript dengan backend Azure Functions yang menyediakan asisten AI empatik dan interaktif. Aplikasi ini dirancang untuk memberikan pengalaman chat yang personal dengan dukungan teknologi Text-to-Speech dan integrasi Azure cloud services yang aman.

## Deskripsi Proyek

VirPal hadir sebagai solusi untuk mengatasi kebutuhan akan pendamping virtual yang tidak hanya cerdas secara logika, tetapi juga peka emosi. Aplikasi ini menyediakan:

- **Asisten AI yang Personal**: Kemampuan menyesuaikan kepribadian dan gaya interaksi
- **Teknologi Text-to-Speech**: Menggunakan Azure Cognitive Services untuk pengalaman audio yang natural
- **Keamanan Enterprise**: Integrasi Azure Key Vault dan Managed Identity
- **Akses Terbuka**: Mendukung pengguna guest dengan batasan yang wajar

## Fitur Utama

### 1. Chat AI Interaktif

- **AI Conversation**: Percakapan natural dengan Azure OpenAI Service
- **Message History**: Penyimpanan riwayat percakapan dengan konteks
- **Guest Mode**: Akses terbatas untuk pengguna tanpa login (5 pesan)
- **Authenticated Mode**: Akses penuh untuk pengguna terautentikasi

### 2. Text-to-Speech (TTS)

- **Azure Speech Service**: Menggunakan voice neural berkualitas tinggi (en-US-Brian:DragonHDLatestNeural)
- **Fallback Support**: Web Speech API sebagai alternatif
- **Audio Controls**: Kontrol putar/berhenti dengan indikator visual
- **Browser Compatibility**: Dukungan AudioContext dengan unlock otomatis

### 3. Autentikasi dan Keamanan

- **Microsoft Authentication Library (MSAL)**: Integrasi Azure Active Directory
- **JWT Validation**: Validasi token pada backend Azure Functions
- **Guest Access**: Mode guest dengan pembatasan penggunaan
- **Secure Credential Management**: Azure Key Vault untuk menyimpan API keys

### 4. Keamanan Enterprise

- **Azure Key Vault Integration**: Manajemen kredensial yang aman
- **Managed Identity**: Tanpa hardcoded credentials
- **Circuit Breaker Pattern**: Penanganan error yang resilient
- **RBAC Permissions**: Akses dengan prinsip least privilege
- **Input Validation**: Sanitasi nama secret dan validasi input
- **Audit Logging**: Pelacakan request dan monitoring

## Arsitektur Teknologi

### Frontend

- **React 18** - Library UI dengan hooks modern
- **TypeScript** - Type safety dan developer experience
- **Vite** - Build tool dan development server yang cepat
- **Tailwind CSS** - Utility-first CSS framework
- **MSAL React** - Autentikasi Microsoft

### Backend

- **Azure Functions** - Serverless compute platform
- **Node.js 20** - JavaScript runtime
- **TypeScript** - Type safety pada backend
- **JWT Validation** - Keamanan token-based

### Cloud Services

- **Azure OpenAI Service** - Large Language Model untuk chat
- **Azure Cognitive Services Speech** - Text-to-Speech neural voice
- **Azure Key Vault** - Secure credential storage
- **Azure Active Directory** - Identity dan access management

## Instalasi dan Pengembangan

### Prasyarat

- Node.js 20 atau lebih tinggi
- Azure CLI untuk development dan deployment
- Azure Functions Core Tools
- Azure Key Vault yang sudah dikonfigurasi

### Langkah Instalasi

1. **Clone dan Install Dependencies**

   ```bash
   git clone <repository-url>
   cd virpal-app
   npm install
   ```

2. **Konfigurasi Environment**

   ```bash
   cp .env.example .env
   cp local.settings.json.example local.settings.json
   ```

3. **Autentikasi Azure**

   ```bash
   # Login ke Azure untuk akses Key Vault
   az login --tenant virpalapp.onmicrosoft.com
   ```

4. **Menjalankan Services Development**

   ```bash
   # Terminal 1: Build dan start Azure Functions
   npm run build && npx func host start

   # Terminal 2: Start frontend development server
   npm run dev
   ```

5. **Verifikasi Setup**
   - Buka browser di `http://localhost:5173`
   - Buka browser console dan jalankan: `KeyVaultTester.runTests()`

### Perintah Development

```bash
# Frontend Development
npm run dev                    # Start frontend development server
npm run build:frontend         # Build frontend untuk production

# Azure Functions
npm run build:functions        # Build Azure Functions
npm run functions:start        # Start Azure Functions server
npm run functions:watch        # Watch mode untuk Functions

# Quality Assurance
npm run lint                   # ESLint code linting
npm run type-check            # TypeScript type checking

# Development Utilities
npm run clean:dist            # Bersihkan direktori build
```

## Konfigurasi Azure Key Vault

Aplikasi memerlukan secrets berikut di Azure Key Vault:

### Secrets yang Diperlukan

- `azure-speech-service-key` - API key Azure Speech Service
- `azure-speech-service-region` - Region Azure Speech Service
- `azure-openai-api-key` - API key Azure OpenAI Service
- `azure-openai-endpoint` - Endpoint Azure OpenAI Service

### Panduan Setup

Lihat dokumentasi lengkap: [docs/KEY_VAULT_SETUP_GUIDE.md](./docs/KEY_VAULT_SETUP_GUIDE.md)

## Struktur Proyek

```
virpal-app/
├── src/
│   ├── components/          # Komponen React UI
│   │   ├── AboutUs.tsx      # Halaman tentang aplikasi
│   │   ├── AuthButton.tsx   # Tombol autentikasi
│   │   ├── Avatar.tsx       # Avatar Virpal dengan ekspresi
│   │   ├── ChatBubble.tsx   # Bubble chat message
│   │   ├── TTSControls.tsx  # Kontrol Text-to-Speech
│   │   └── UserInput.tsx    # Input area pengguna
│   ├── functions/           # Azure Functions backend
│   │   ├── chat-completion.ts    # Endpoint chat dengan AI
│   │   ├── get-secret.ts         # Proxy Key Vault access
│   │   └── jwtValidationService.ts # Validasi JWT token
│   ├── services/            # Layer service dan API
│   │   ├── azureOpenAIService.ts     # Integrasi Azure OpenAI
│   │   ├── azureSpeechService.ts     # Text-to-Speech service
│   │   ├── azureKeyVaultService.ts   # Key Vault client
│   │   ├── authService.ts            # Autentikasi MSAL
│   │   └── frontendKeyVaultService.ts # Frontend Key Vault proxy
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Hook untuk autentikasi
│   │   └── useTTSChat.ts    # Hook untuk TTS integration
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions dan helpers
├── docs/                    # Dokumentasi proyek
├── scripts/                 # Script automation
└── public/                  # Static assets
```

## Pengujian dan Troubleshooting

### Testing TTS Integration

Lihat panduan: [docs/TTS_TESTING_GUIDE.md](./docs/TTS_TESTING_GUIDE.md)

### Common Issues

**CORS Errors**: Pastikan konfigurasi CORS di `host.json` sudah benar
**Authentication Issues**: Verifikasi login Azure CLI dan akses Key Vault
**Audio Issues**: Pastikan browser mendukung Web Audio API dan audio tidak di-mute

### Monitoring dan Logging

- **Application Insights**: Monitoring performa dan error tracking
- **Azure Functions Logs**: Diagnostic logging untuk backend
- **Browser Console**: Development debugging dan metrics

## Deployment

### Development Deployment

```bash
# Build semua komponen
npm run build

# Verify Azure Functions
func host start --verbose
```

### Production Deployment

Lihat panduan lengkap: [docs/PRODUCTION_DEPLOYMENT_GUIDE.md](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md)

## Kontribusi

Proyek ini mengikuti best practices untuk:

- **TypeScript**: Strict type checking dan konsistensi kode
- **Security**: Tidak ada hardcoded credentials atau sensitive data
- **Performance**: Lazy loading dan caching untuk optimasi
- **Accessibility**: UI yang dapat diakses untuk semua pengguna

## Lisensi

Proyek ini dikembangkan untuk keperluan pembelajaran dan demonstrasi integrasi Azure cloud services dengan modern web application stack.
