# Panduan Kontribusi - VirPal App

Terima kasih atas minat Anda untuk berkontribusi pada VirPal App! 🎉

## 🚀 Cara Berkontribusi

### 1. Fork dan Clone

```bash
# Fork repository di GitHub
git clone https://github.com/YOUR_USERNAME/virpal-app.git
cd virpal-app
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
cp local.settings.json.example local.settings.json

# Konfigurasi Azure credentials (lihat docs/KEY_VAULT_SETUP_GUIDE.md)
```

### 3. Buat Branch Baru

```bash
git checkout -b feature/nama-fitur-anda
```

### 4. Development Guidelines

#### Code Style

- Gunakan TypeScript untuk type safety
- Follow ESLint configuration yang sudah ada
- Gunakan Prettier untuk formatting
- Tulis kode yang self-documenting

#### Commit Messages

Gunakan conventional commits:

```
feat: menambahkan fitur chat history
fix: memperbaiki bug TTS di Safari
docs: update panduan instalasi
```

#### Testing

- Test fitur baru secara manual
- Pastikan tidak ada TypeScript errors
- Test di multiple browsers

### 5. Pull Request Process

1. **Update dokumentasi** jika diperlukan
2. **Test thoroughly** di development environment
3. **Create Pull Request** dengan deskripsi yang jelas:
   - Apa yang diubah
   - Mengapa perubahan diperlukan
   - Bagaimana cara testing

## 🐛 Melaporkan Bug

Gunakan GitHub Issues dengan template:

```
**Deskripsi Bug**
Penjelasan singkat tentang bug

**Langkah Reproduksi**
1. Buka aplikasi
2. Klik tombol X
3. Lihat error Y

**Expected Behavior**
Apa yang seharusnya terjadi

**Environment**
- Browser: Chrome 120
- OS: Windows 11
- Mode: Guest/Authenticated
```

## 💡 Saran Fitur

Sebelum mengembangkan fitur baru:

1. Buat GitHub Issue untuk diskusi
2. Tunggu feedback dari maintainer
3. Mulai development setelah approved

## 📋 Priority Areas

Kontribusi yang sangat dibutuhkan:

- 🌐 Internasionalisasi (i18n)
- 🎨 UI/UX improvements
- 📱 Mobile responsiveness
- 🧪 Unit testing
- 📖 Dokumentasi bahasa Inggris
- 🔒 Security enhancements

## 🤝 Code of Conduct

- Gunakan bahasa yang sopan dan profesional
- Respect terhadap semua kontributor
- Focus pada improvement, bukan kritik personal
- Help others learn dan grow

## 📞 Kontak

Jika ada pertanyaan, buat GitHub Issue atau diskusi di GitHub Discussions.

Terima kasih telah berkontribusi! 🙏
