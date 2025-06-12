# VirPal App - AI Mental Health Assistant

**🏆 elevAIte with Dicoding Hackathon 2025 | 🎯 SDG 3: Kesehatan Mental dan Dampak Judi Online**

VirPal (Virtual Pal) adalah asisten AI inovatif yang dirancang khusus untuk mendukung kesehatan mental masyarakat Indonesia dalam menghadapi tantangan era digital, termasuk dampak negatif dari judi online. Aplikasi ini merupakan kontribusi dalam mempercepat pencapaian **Sustainable Development Goals (SDG) 3: Good Health and Well-being** melalui teknologi Microsoft Azure AI.

> **🎯 Hackathon Context**: Dikembangkan untuk elevAIte with Dicoding Online Hackathon dengan tema "Mendukung SDG Indonesia dengan AI" - Subtema Kesehatan Mental dan Dampak Judi Online.

## 🌟 Mission & Vision

### **Mission**

Memberikan dukungan kesehatan mental yang mudah diakses, empati, dan berbasis AI untuk membantu masyarakat Indonesia mengatasi stres, kecemasan, dan dampak negatif dari kecanduan judi online.

### **Vision**

Menjadi platform AI terdepan yang berkontribusi dalam menciptakan masyarakat Indonesia yang lebih sehat mental dan terlindungi dari dampak destruktif judi online.

## 🎯 Kontribusi terhadap SDG 3

### **Good Health and Well-being**

- **🧠 Mental Health Support**: AI companion yang memberikan dukungan emosional 24/7
- **🚨 Early Detection**: Deteksi dini tanda-tanda stress dan gangguan mental
- **💡 Personalized Guidance**: Rekomendasi aktivitas positif dan coping strategies
- **🛡️ Prevention**: Edukasi dan pencegahan kecanduan judi online
- **🌐 Digital Wellness**: Promosi kesehatan mental di era digital

## ✨ Fitur Utama untuk Kesehatan Mental

- **🤖 Advanced AI Integration**: Sophisticated Azure OpenAI Service implementation
- **🎙️ Neural Text-to-Speech**: High-quality voice synthesis using Azure Cognitive Services
- **🔒 Enterprise Security**: Zero-trust architecture with Azure Key Vault and Managed Identity
- **🌐 Scalable Architecture**: Cloud-native design with microservices patterns
- **📊 Real-time Analytics**: User behavior tracking and performance monitoring

## ✨ Key Features & Technical Capabilities

### 🚀 **Modern Frontend Architecture**

- **React 19** with concurrent features and hooks optimization
- **TypeScript** for type safety and enhanced developer experience
- **Vite** for lightning-fast development and optimized builds
- **TailwindCSS** with custom design system implementation
- **Responsive Design** with mobile-first approach

### 🧠 **AI & Conversational Intelligence**

- **Azure OpenAI Integration**: gpt-4o-mini powered conversations with context awareness
- **Message History Management**: Intelligent conversation threading and context preservation
- **Dual Access Modes**: Guest access (5 messages) and authenticated unlimited access
- **Real-time Responses**: WebSocket-ready architecture for instant messaging

### 🎵 **Advanced Audio Features**

- **Azure Speech Service**: Premium neural voices (en-US-Brian:DragonHDLatestNeural)
- **Fallback Support**: Web Speech API with graceful degradation
- **Audio Controls**: Play/pause functionality with visual feedback
- **Cross-browser Compatibility**: AudioContext handling with auto-unlock

### 🔐 **Enterprise-Grade Security**

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

- **React 19** - Library UI dengan hooks modern
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

## 📈 Portfolio Showcase

### **🏗️ Technical Architecture Highlights**

This application demonstrates mastery of enterprise software development practices:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Azure Cloud    │    │   AI Services   │
│                 │    │                  │    │                 │
│ • React 19      │◄──►│ • Functions      │◄──►│ • OpenAI gpt-4o-mini  │
│ • TypeScript    │    │ • Key Vault      │    │ • Speech Service│
│ • TailwindCSS   │    │ • Cosmos DB      │    │ • MSAL Auth     │
│ • MSAL Auth     │    │ • Managed ID     │    │ • Analytics     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🏗️ Technical Architecture

### **🔄 System Overview**

VirPal menggunakan arsitektur cloud-native yang terdiri dari beberapa layer:

```
┌───────────────────────────┐
│      USER INTERFACES      │
│ React Frontend (SPA) + TTS│
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│     APPLICATION LAYER     │
│   Azure Functions (API)   │
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│       SERVICE LAYER       │
│ AI, Auth, Storage Services│
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│   DATA & SECURITY LAYER   │
│Cosmos DB, Key Vault, MSAL │
└───────────────────────────┘
```

### **🔌 Integration Points**

- **Azure OpenAI Service**: Large Language Model untuk chat dan pemahaman konteks
- **Azure Speech Service**: Neural Text-to-Speech untuk pengalaman natural
- **Azure Cosmos DB**: NoSQL database untuk penyimpanan percakapan dan data pengguna
- **Azure Key Vault**: Pengelolaan kredensial dan secrets dengan aman
- **Microsoft Entra ID**: Autentikasi pengguna dan otorisasi

### **🔒 Security Architecture**

VirPal menerapkan prinsip zero-trust dengan lapisan keamanan:

1. **Authentication Layer**: Microsoft Entra ID + JWT Validation
2. **Resource Access Control**: Azure Managed Identity untuk akses antar-layanan
3. **Data Protection**: Encryption at rest dan in-transit
4. **Secret Management**: Key Vault rotation dan access policies
5. **Input Validation**: Sanitasi dan validasi di semua endpoint

### **📱 Frontend Architecture**

Frontend aplikasi menggunakan pola arsitektur modern:

- **Component-Based Design**: Komponen terenkapsulasi dengan reusability tinggi
- **State Management**: React hooks dengan context API
- **Service Layer**: Abstraksi untuk API dan resource eksternal
- **Responsive Design**: Mobile-first approach dengan Tailwind CSS
- **Accessibility**: WCAG compliance untuk pengalaman inklusif

### **☁️ Cloud Resource Overview**

| **Azure Resource**       | **Purpose**                                     |
| ------------------------ | ----------------------------------------------- |
| **Azure Functions**      | Serverless API endpoints                        |
| **Azure OpenAI Service** | LLM integration dengan gpt-4o-mini model        |
| **Azure Speech Service** | Neural Text-to-Speech dan voice synthesis       |
| **Azure Cosmos DB**      | NoSQL database untuk chat history dan user data |
| **Azure Key Vault**      | Secure credential storage dan key management    |
| **Azure App Service**    | Static web app hosting dengan custom domain     |
| **Microsoft Entra ID**   | SSO dan user authentication services            |
| **Azure Monitor**        | Application monitoring dan performance insights |

## 🛣️ Roadmap

### **🔮 Future Development**

- **Multilingual Support**: Dukungan penuh untuk Bahasa Indonesia dan regional dialects
- **Offline Capabilities**: PWA enhancement dengan kemampuan offline
- **Advanced Analytics**: User behavior insights untuk personalization
- **Community Features**: Forum dukungan dan jaringan support peer
- **Mobile App**: Native mobile apps untuk Android dan iOS
- **Enhanced Accessibility**: Screen reader optimization dan voice navigation

### **🌱 Sustainability & Growth**

VirPal dirancang dengan pertimbangan keberlanjutan teknologi dan dampak sosial:

- **Scalable Infrastructure**: Arsitektur yang dapat mensupport jutaan pengguna
- **Low-Resource Mode**: Optimasi untuk device dengan resource terbatas
- **Impact Tracking**: Metrik untuk mengukur dampak pada kesehatan mental
- **Responsible AI**: Penggunaan AI securely dan ethically

## 💭 Ucapan Terima Kasih

Terima kasih kepada semua yang telah mendukung pengembangan VirPal:

- **Microsoft Azure**: Platform dan layanan AI
- **Dicoding**: Dukungan hackathon dan mentorship
- **Mental Health Professionals**: Konsultasi dan validasi konten
- **Beta Testers**: Feedback yang berharga selama development

### **📧 Contact & Support**

Untuk pertanyaan teknis atau dukungan:

- Email: reihan3000@gmail.com
- GitHub: github.com/ach-reihan
