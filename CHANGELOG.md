# Catatan Perubahan

Semua perubahan penting pada VirPal App akan didokumentasikan dalam berkas ini.

Format ini berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Belum Dirilis]

### Ditambahkan

- Fitur penilaian risiko kecanduan judi dengan komponen GamblingRiskAssessment
- Pelacakan suasana hati pengguna melalui komponen MoodTracker
- Indikator sinkronisasi cloud dengan CloudSyncIndicator
- Renderer konten markdown untuk tampilan yang lebih baik
- Informasi lomba hackathon terintegrasi
- Layanan kesehatan mental yang komprehensif

### Diperbaiki

- Konfigurasi autentikasi MSAL untuk keamanan yang lebih baik
- Validasi JWT dan manajemen token
- Integrasi layanan Azure (Cosmos DB, Key Vault, Speech Service)

### Dihapus

- Komponen ProtectedRoute yang tidak digunakan
- Berkas dokumentasi yang sudah usang
- Konfigurasi yang tidak relevan

## [1.0.0] - 2025-06-10

### Ditambahkan

- Chat AI interaktif dengan Azure OpenAI Service
- Text-to-Speech menggunakan Azure Speech Service dengan suara neural Brian
- Sistem autentikasi MSAL dengan Azure Active Directory
- Mode guest dengan pembatasan 5 pesan
- Integrasi Azure Key Vault untuk keamanan kredensial
- Antarmuka React dengan TypeScript yang responsif
- Backend Azure Functions serverless
- Antarmuka pengguna modern dengan Tailwind CSS
- Avatar Virpal dengan ekspresi dinamis
- Penyimpanan riwayat percakapan
- Pola circuit breaker untuk ketahanan sistem
- Dokumentasi lengkap untuk setup dan deployment
- Pipeline CI/CD dengan GitHub Actions
- Arsitektur enterprise dengan managed identity
- Utilitas pengujian dan pemantauan
- Workspace VS Code yang terkonfigurasi lengkap

### Fitur Teknis

- TypeScript untuk keamanan tipe di frontend dan backend
- Vite sebagai build tool yang cepat
- ESLint dan Prettier untuk kualitas kode
- Azure Functions dengan Node.js 20
- MSAL React untuk autentikasi Microsoft
- Penyimpanan hybrid (localStorage dengan dukungan Cosmos DB)
- Fallback Web Speech API untuk TTS
- Validasi JWT pada backend
- Izin RBAC dengan prinsip least privilege
- Validasi dan sanitasi input
- Audit logging dan pemantauan

### Dokumentasi

- Panduan setup Azure Key Vault
- Panduan troubleshooting TTS
- Best practice logging Azure Functions
- Panduan implementasi circuit breaker
- Panduan deployment produksi
- Panduan migrasi untuk upgrade
- Panduan konfigurasi CI/CD

### Pengalaman Pengembang

- Workspace VS Code dengan ekstensi yang direkomendasikan
- Skrip PowerShell untuk otomatisasi
- Tool health check dan validasi
- Panduan setup cepat
- Konfigurasi debugging
- Otomatisasi task untuk workflow pengembangan

## [0.1.0] - 2025-06-01

### Ditambahkan

- Setup proyek awal
- Struktur aplikasi React dasar
- Fondasi Azure Functions

---

## Jenis Perubahan

- `Ditambahkan` untuk fitur baru
- `Diubah` untuk perubahan pada fungsionalitas yang ada
- `Ditinggalkan` untuk fitur yang akan segera dihapus
- `Dihapus` untuk fitur yang telah dihapus
- `Diperbaiki` untuk perbaikan bug
- `Keamanan` untuk perbaikan kerentanan
