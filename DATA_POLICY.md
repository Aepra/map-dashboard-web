# Data Policy & Security Guidelines

## Informasi Sensitif - JANGAN Di-Expose di Public README

### Data Peserta Yang Sensitif
- Nama lengkap peserta
- Nomor identitas (NIK, NIM, dll)
- Alamat rumah lengkap
- Nomor telepon pribadi
- Email pribadi
- Data biometrik
- Informasi kesehatan yang detail
- Kondisi keuangan keluarga
- Informasi kebutuhan khusus yang spesifik

### Informasi Operasional Yang Sensitif
- URL produksi database
- API keys atau credentials
- Database connection strings
- Detail struktur data internal
- Akses kontrol dan permissions
- Algoritma filtering atau business logic yang proprietary
- Nama lengkap atau detail admin/staff
- Lokasi server atau infrastructure details

## Apa Yang Boleh Di-Dokumentasikan di Public README

### Yang BOLEH di-cantumkan:
- ✅ Teknologi dan library yang digunakan (public packages)
- ✅ Arsitektur umum (tanpa detail sensitif)
- ✅ Cara setup dan install (untuk internal team)
- ✅ Command-command development (npm scripts)
- ✅ Project structure overview
- ✅ Contributing guidelines
- ✅ Lisensi

### Yang JANGAN di-cantumkan:
- ❌ Actual data samples atau contoh data dengan informasi real
- ❌ API endpoints atau URLs
- ❌ Database schemas detail dengan contoh data
- ❌ Username, email, atau identitas individu
- ❌ Internal contact persons
- ❌ How data filtering works (dapat membahayakan privacy)
- ❌ Lokasi atau details tentang dimana data disimpan
- ❌ Query examples yang menunjukkan sensitive fields

## Untuk Development Team (Private Documentation)

### Gunakan file INTERNAL.md atau private wiki untuk:
- Database schema lengkap dengan sensitive fields
- API endpoints dan credentials (encrypted)
- Deployment procedures
- Security measures
- Data retention policies
- Access control rules
- Contact information staff

## Checklist Sebelum Push ke Public Repository

- [ ] No real names atau identities di example code
- [ ] No credentials atau API keys
- [ ] No actual data samples
- [ ] No internal URLs atau IPs
- [ ] No specific business logic yang dapat di-reverse
- [ ] No contact information yang personal
- [ ] No deployment atau infrastructure details
- [ ] Pastikan .env.local, .env.production, dan config files dalam .gitignore

## Recommendation

README yang baik harus:
1. **Simple & Clear** - Jelaskan apa aplikasi ini secara umum
2. **Safe** - Tidak mengungkap informasi sensitif
3. **Actionable** - Berikan langkah setup yang jelas untuk team
4. **Maintainable** - Mudah dipahami dan diupdate

Keep sensitive details untuk internal documentation saja.
