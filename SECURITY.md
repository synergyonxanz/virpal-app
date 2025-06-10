# Security Policy

## Supported Versions

Kami menyediakan update keamanan untuk versi berikut:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Melaporkan Vulnerability

Keamanan adalah prioritas utama VirPal App. Jika Anda menemukan kerentanan keamanan, silakan laporkan dengan cara yang bertanggung jawab.

### 🔒 Pelaporan Pribadi

**JANGAN** membuat public issue untuk vulnerability. Sebagai gantinya:

1. **Email**: Kirim ke maintainer melalui private message di GitHub
2. **GitHub Security Advisories**: Gunakan fitur "Report a vulnerability" di tab Security
3. **Informasi yang disertakan**:
   - Deskripsi vulnerability
   - Langkah-langkah untuk reproduce
   - Potential impact
   - Saran perbaikan (jika ada)

### ⏱️ Response Timeline

- **24 jam**: Konfirmasi penerimaan laporan
- **7 hari**: Initial assessment dan priority classification
- **30 hari**: Target resolusi untuk high/critical vulnerabilities
- **90 hari**: Target resolusi untuk medium/low vulnerabilities

### 🛡️ Security Best Practices

VirPal App mengimplementasikan security practices berikut:

#### Authentication & Authorization
- ✅ Microsoft Authentication Library (MSAL) integration
- ✅ JWT token validation pada backend
- ✅ Role-based access control (RBAC)
- ✅ Guest mode dengan pembatasan yang tepat

#### Data Protection
- ✅ Azure Key Vault untuk credential management
- ✅ Managed Identity (no hardcoded secrets)
- ✅ Input validation dan sanitization
- ✅ Secure API endpoints dengan proper CORS

#### Infrastructure Security
- ✅ Azure Functions dengan least privilege access
- ✅ Circuit breaker pattern untuk resilience
- ✅ Audit logging untuk monitoring
- ✅ HTTPS enforcement

#### Code Security
- ✅ TypeScript untuk type safety
- ✅ ESLint security rules
- ✅ Dependency vulnerability scanning
- ✅ Regular security updates

### 🚫 Out of Scope

Security issues yang TIDAK akan ditangani:
- Social engineering attacks
- Physical access attacks
- DDoS attacks (handled by Azure infrastructure)
- Issues in third-party dependencies (report ke upstream)

### 🏆 Recognition

Peneliti keamanan yang melaporkan vulnerability valid akan:
- Disebutkan dalam CHANGELOG (dengan persetujuan)
- Diberikan credit dalam security advisory
- Diundang sebagai security reviewer untuk future releases

### 📞 Kontak Security

Untuk pertanyaan terkait security policy:
- Buat GitHub Discussion dengan tag [Security]
- Review dokumentasi security di [`docs/`](docs/) folder

## Responsible Disclosure

Kami menghargai responsible disclosure dan akan bekerja sama dengan security researchers untuk:
- Memahami dan reproduce vulnerability
- Mengembangkan fix yang tepat
- Koordinasi timing untuk public disclosure
- Memberikan credit yang appropriate

Terima kasih telah membantu menjaga VirPal App tetap aman! 🛡️
