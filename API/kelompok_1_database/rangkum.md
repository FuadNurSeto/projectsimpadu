# Rangkuman Proyek SIMPADU — Kelompok 1

> **Framework:** Laravel 12.x | **PHP:** 8.4.x | **Auth:** JWT (`PHPOpenSourceSaver\JWTAuth`) | **Database:** MySQL (`database_kelompok1_fix_data`)

---

## 📦 Model (13)

| Model | Tabel | PK | Relasi Utama |
|-------|-------|----|--------------|
| `User` | `users` | `id` | `belongsToMany(Role)` via `role_user`, JWTSubject |
| `Role` | `role` | `id_role` | `belongsToMany(User)` via `role_user` |
| `Jurusan` | `jurusans` | `id` | `hasMany(Prodi)` |
| `TahunAkademik` | `tahun_akademiks` | `id` | `$incrementing=false`, `hasMany(Kelas)`, `hasMany(KHS)` |
| `Prodi` | `prodis` | `id` | `belongsTo(Jurusan)`, `hasMany(MataKuliah)`, `hasMany(Kelas)` |
| `MataKuliah` | `mata_kuliahs` | `id_mk` | `belongsTo(Prodi)`, `hasMany(Nilai)`, `hasMany(MahasiswaKelasMk)`, `hasMany(Jadwal)` |
| `Kelas` | `kelas` | `id` | `belongsTo(TahunAkademik)`, `belongsTo(Prodi)`, `hasMany(MahasiswaKelasMk)`, `hasMany(Nilai)`, `hasMany(Jadwal)` |
| `MahasiswaKelasMk` | `mahasiswa_kelas_mk` | `id_mahasiswa_mk` | `$incrementing=true`, `$timestamps=false`, `belongsTo(MataKuliah)`, `belongsTo(User, dosen_id)`, `belongsTo(Kelas)`, `belongsTo(User, nim, nomor_identitas)` |
| `KHS` | `k_h_s` | `id` | `belongsTo(User)`, `belongsTo(TahunAkademik)` |
| `Nilai` | `nilais` | `id` | `belongsTo(User)`, `belongsTo(Kelas)`, `belongsTo(MataKuliah)` |
| `Jadwal` | `jadwals` | `id` | `belongsTo(MataKuliah)`, `belongsTo(User, dosen_id)`, `belongsTo(Kelas)`, `belongsTo(TahunAkademik)` |
| `Provinsi` | `provinsis` | `id` | `hasMany(Kabupaten)` |
| `Kabupaten` | `kabupatens` | `id` | `belongsTo(Provinsi)` |

---

## 🛡 Middleware (2)

| File | Fungsi |
|------|--------|
| `JwtMiddleware` | Parse token JWT (`JWTAuth::parseToken()->authenticate()`), return 401 jika invalid/expired |
| `RoleMiddleware` | Cek `auth()->user()->roles->pluck('id_role')` terhadap daftar role yang diizinkan, return 403 jika tidak punya akses |

---

## 📋 FormRequest (15)

| File | Rules Utama |
|------|-------------|
| `LoginRequest` | email required, password required |
| `RegisterRequest` | name, username (unique), email (unique), password (min:6), role_id (exists), status |
| `UpdateUserRequest` | Semua field opsional (`sometimes`): name, username, nomor_identitas, email, role_id, password, status — unique ignore current ID |
| `ResetPasswordRequest` | password required (min:6) |
| `TahunAkademikRequest` | id (unique), tahun_akademik (unique), status |
| `KelasRequest` | tahun_akademik_id, prodi_id, kode_kelas, nama_kelas, kapasitas, status, keterangan |
| `JurusanRequest` | nama_jurusan |
| `ProdiRequest` | jurusan_id, nama_prodi |
| `MataKuliahRequest` | prodi_id, nama_mk, semester (min:1, max:8), sks (min:1, max:6), status |
| `NilaiRequest` | user_id (harus role_id=6), kelas_id, mata_kuliah_id, nilai_akhir, grade, keterangan |
| `MahasiswaKelasMkRequest` | mata_kuliah_id, id_kelas, dosen_id (harus role_id=7), nim (harus role_id=6), status_id |
| `PertemuanRequest` | p1-p16 masing-masing nullable in:H,I,S,A |
| `MahasiswaRegisterRequest` | Sama RegisterRequest tanpa role_id (force 6) |
| `MahasiswaStatusRequest` | status (in:aktif,nonaktif), id_user (harus role_id=6) |
| `JadwalRequest` | mata_kuliah_id, dosen_id (harus role_id=7), id_kelas, tahun_akademik_id, hari (enum), jam_mulai, jam_selesai (after:jam_mulai) |

---

## 🎮 Controller (12)

| Controller | Endpoint # | Method |
|------------|-----------|--------|
| `AuthController` | 2, 4 | `register()`, `login()` |
| `UserController` | 1, 3, 30, 33–37 | `index()`, `show()`, `updateUser()`, `showByNim()`, `registerMahasiswa()`, `mahasiswa()`, `updateMahasiswaStatus()`, `resetPassword()` |
| `TahunAkademikController` | 5, 6, 32 | `index()`, `store()`, `aktif()` |
| `KelasController` | 7–11 | `index()`, `show()`, `mahasiswa()`, `store()`, `update()` |
| `JurusanController` | 17, 18 | `index()`, `store()` |
| `ProdiController` | 19, 20, 31 | `byJurusan()`, `store()`, `index()` |
| `MataKuliahController` | 21–24 | `index()`, `show()`, `store()`, `update()` |
| `NilaiController` | 12–14 | `allMahasiswa()`, `byMahasiswa()` (self-access), `store()` |
| `KHSController` | 15 | `show()` (self-access, array per semester) |
| `MahasiswaKelasMkController` | 16, 25–29 | `index()`, `show()` (self-access mahasiswa), `store()`, `update()`, `destroy()`, `updatePertemuan()` |
| `JadwalController` | 38–42 | `index()`, `show()` (jadwal + absensi + nilai mahasiswa), `store()`, `update()`, `destroy()` |
| `WilayahController` | 43, 44 | `provinsi()`, `kabupaten()` |

---

## 🌐 API Endpoint — Ringkasan per Role

### 🔴 Super Admin (role_id: 1) — 44 endpoint (semua)

### 🟠 Admin Akademik (role_id: 2, 8) — 27 endpoint

| # | Method | Endpoint | Keterangan |
|---|--------|----------|------------|
| 5 | GET | `/tahun-akademik` | List |
| 6 | POST | `/tahun-akademik` | Tambah |
| 7 | GET | `/kelas` | List |
| 8 | GET | `/kelas/{id_kelas}` | Detail |
| 9 | GET | `/kelas/{id_kelas}/mahasiswa` | Mahasiswa per kelas |
| 10 | POST | `/kelas` | Tambah kelas |
| 11 | PUT | `/kelas/{id_kelas}` | Ubah kelas |
| 12 | GET | `/nilais/mahasiswa` | Semua nilai |
| 13 | GET | `/nilais/mahasiswa/{user_id}` | Nilai 1 mahasiswa |
| 15 | GET | `/mahasiswa/{user_id}/khs` | KHS mahasiswa |
| 17 | GET | `/jurusan` | List jurusan |
| 18 | POST | `/jurusan` | Tambah |
| 19 | GET | `/jurusan/{id}/prodis` | Prodi per jurusan |
| 20 | POST | `/prodis` | Tambah prodi |
| 21 | GET | `/mata-kuliah` | List |
| 22 | GET | `/mata-kuliah/{id_mk}` | Detail |
| 23 | POST | `/mata-kuliah` | Tambah |
| 24 | PUT | `/mata-kuliah/{id_mk}` | Ubah |
| 25 | GET | `/mahasiswa-kelas` | Plotting |
| 26 | GET | `/mahasiswa-kelas/{id}` | Detail plotting |
| 27 | POST | `/mahasiswa-kelas` | Plot mahasiswa |
| 28 | PUT | `/mahasiswa-kelas/{id}` | Ubah plotting |
| 29 | DELETE | `/mahasiswa-kelas/{id}` | Batal plotting |
| 30 | GET | `/users/mahasiswa/{nim}` | Cari mahasiswa |
| 31 | GET | `/prodis` | Semua prodi |
| 32 | GET | `/tahun-akademik/aktif` | Tahun aktif |
| 34 | GET | `/mahasiswa` | List mahasiswa |
| 37 | POST | `/users/{id}/reset-password` | Reset password |

### 🟡 Admin Pegawai (role_id: 3, 8) — 11 endpoint

#5, 7, 8, 14, 16, 37, 38, 39, 40, 41, 42

### 🟤 Admin Mahasiswa (role_id: 4, 8) — 9 endpoint

#5, 7, 8, 33, 34, 35, 37, 43, 44

### 🟢 Admin Keuangan (role_id: 5, 8) — 8 endpoint

#5, 7, 8, 17, 30, 31, 32, 37

### 🔵 Mahasiswa (role_id: 6) — 5 endpoint

#13, 15, 21, 22, 26 (semua self-access)

### 🟣 Dosen (role_id: 7, 8) — 12 endpoint

#5, 7, 8, 9, 14, 16, 21, 22, 25, 26, 38, 39

---

## 🗄 Migration Baru (5 file)

| File | Perubahan |
|------|-----------|
| `2026_05_20_000001_phase1_fixes` | Tambah `semester` ke `mata_kuliahs`, `semester_mahasiswa` ke `k_h_s`, fix `id_mahasiswa_mk` auto_increment |
| `2026_05_20_000002_create_jadwals_table` | Tabel `jadwals` (jadwal kuliah: mata_kuliah, dosen, kelas, hari, jam) |
| `2026_05_22_000001_create_wilayah_tables` | Tabel `provinsis` (34 data) + `kabupatens` (489 data) dengan FK chain |
| `2026_05_22_000002_create_role_user_table` | Pivot `role_user` (user_id, role_id) — multi-role support |

---

## 🌱 Seeder

| File | Fungsi |
|------|--------|
| `UserSeeder` | Insert 5 admin user (id 1-5) + role 8 ke tabel `role` + assign multi-role via `role_user` pivot |
| `DatabaseSeeder` | Call `UserSeeder` |

---

## 🔧 Fitur Utama

| Fitur | Detail |
|-------|--------|
| **Multi-Role** | Pivot `role_user` — tiap user bisa punya 2+ role. Middleware cek semua role |
| **Auto Role 8** | Register + update role: admin 2-5 + dosen (7) otomatis dapat role 8 `pegawai` |
| **Self-Access** | Mahasiswa hanya bisa lihat KHS, nilai, plotting miliknya sendiri (kecuali Admin Akademik) |
| **Wilayah** | 34 provinsi + 489 kabupaten — mapping bridge 3 sistem ID berbeda via migration |
| **Jadwal + Absensi + Nilai** | `GET /jadwal/{id}` langsung tampilkan absensi p1-p16 + nilai_akhir + grade per mahasiswa |
| **Semester** | `mata_kuliahs.semester` (paket kurikulum 1-8), `k_h_s.semester_mahasiswa` |
| **KHS per Semester** | `GET /mahasiswa/{id}/khs` return array per semester historis: `nama_mahasiswa`, `tahun_akademik`, `semester_khs`, `ip_semester`, `detail_nilai[]` |
| **Reset Password** | Semua admin (1-5) bisa reset password user mana pun via `POST /users/{id}/reset-password` |

---

## 🐛 Bug Fixes

| Masalah | Solusi |
|---------|--------|
| `id_mahasiswa_mk` tidak auto_increment | Migration ALTER TABLE ke `INT AUTO_INCREMENT` |
| Kolom `semester` & `semester_mahasiswa` tidak ada | Migration baru tambah kolom (NOT NULL, DEFAULT 1) |
| `kode_mk` tidak ada di database | Hapus dari Model, FormRequest, PHPDoc, dokumentasi |
| Route `users/{id}` clash dengan `users/mahasiswa/{nim}` | Pindahkan `users/{id}` ke setelah `users/mahasiswa/{nim}` |
| `role_user` pivot tidak terisi saat register | `AuthController@register()` + `UserController@updateUser()` auto-insert pivot |
| `role_id` replaceAll merusak `role_id` di controller | Perbaiki manual |
| Primary key sudah ada di `mahasiswa_kelas_mk` | Skip `$table->primary()` di migration, langsung auto_increment |
| MySQL tidak berjalan saat migrate | Informasikan ke user |
| Wrong array indexing di migration kabupaten | Fix: `$k[2]` bukan `$k[1]` untuk id_provinsi |

---

## 📄 File Tambahan

| File | Isi |
|------|-----|
| `api_documentation.md` | Dokumentasi 44 endpoint lengkap dengan JSON payload, matrix akses per role |
| `rangkum.md` | File ini |
