# Panduan Kontribusi - VirPal App

Terima kasih atas minat Anda untuk berkontribusi pada VirPal App!

## Cara Berkontribusi

### 1. Fork dan Clone Repository

```bash
# Fork repository di GitHub
git clone https://github.com/YOUR_USERNAME/virpal-app.git
cd virpal-app
```

### 2. Setup Environment Pengembangan

```bash
# Instalasi dependencies
npm install

# Setup environment
cp .env.example .env
cp local.settings.json.example local.settings.json

# Konfigurasi Azure credentials (lihat docs/KEY_VAULT_SETUP_GUIDE.md)
```

### 3. Membuat Branch Baru

```bash
git checkout -b feature/nama-fitur-anda
```

### 4. Panduan Pengembangan

#### Gaya Penulisan Kode

- Gunakan TypeScript untuk keamanan tipe
- Ikuti konfigurasi ESLint yang telah ada
- Gunakan Prettier untuk formatting
- Tulis kode yang mudah dipahami dan self-documenting

#### Pesan Commit

Gunakan format conventional commits:

```
feat: menambahkan fitur riwayat chat
fix: memperbaiki bug TTS di Safari
docs: memperbarui panduan instalasi
refactor: memperbaiki struktur komponen
```

#### Pengujian

- Uji fitur baru secara menyeluruh
- Pastikan tidak ada error TypeScript
- Test kompatibilitas di berbagai browser
- Verifikasi fungsionalitas pada mode guest dan terautentikasi

### 5. Proses Pull Request

1. **Perbarui dokumentasi** jika diperlukan
2. **Uji secara menyeluruh** di environment pengembangan
3. **Buat Pull Request** dengan deskripsi yang jelas:
   - Perubahan yang dilakukan
   - Alasan perubahan diperlukan
   - Cara pengujian yang dilakukan

## Melaporkan Bug

Gunakan GitHub Issues dengan format berikut:

```
**Deskripsi Bug**
Penjelasan singkat tentang masalah yang ditemukan

**Langkah Reproduksi**
1. Buka aplikasi
2. Lakukan tindakan X
3. Amati hasil Y

**Perilaku yang Diharapkan**
Apa yang seharusnya terjadi

**Environment**
- Browser: Chrome 137
- Sistem Operasi: Windows 11
- Mode: Guest/Terautentikasi
```

## Usulan Fitur Baru

Sebelum mengembangkan fitur baru:

1. Buat GitHub Issue untuk diskusi terlebih dahulu
2. Tunggu tanggapan dari maintainer
3. Mulai pengembangan setelah mendapat persetujuan

## Area Prioritas Kontribusi

Kontribusi yang sangat dibutuhkan:

- **Internasionalisasi**: Dukungan multi-bahasa (i18n)
- **Antarmuka Pengguna**: Peningkatan UI/UX
- **Responsivitas Mobile**: Optimasi untuk perangkat mobile
- **Pengujian Unit**: Implementasi unit testing
- **Dokumentasi**: Terjemahan dokumentasi ke bahasa Inggris
- **Keamanan**: Peningkatan fitur keamanan

## Kode Etik

- Gunakan bahasa yang sopan dan profesional
- Hormati semua kontributor
- Fokus pada perbaikan, bukan kritik personal
- Bantu orang lain untuk belajar dan berkembang

## Kontak

Jika ada pertanyaan, silakan buat GitHub Issue atau gunakan GitHub Discussions.

Terima kasih telah berkontribusi!
