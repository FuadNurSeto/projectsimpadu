# API Documentation — Sistem Akademik Simpadu

> **Base URL:** `http://localhost:8000`  
> **Auth:** JWT Bearer Token  
> **Total Endpoint:** 35

---

## Daftar Role

| role_id | Nama Role |
|---------|-----------|
| 1 | Super Admin |
| 2 | Admin Akademik |
| 3 | Admin Pegawai |
| 4 | Admin Mahasiswa |
| 5 | Admin Keuangan |
| 6 | Mahasiswa |
| 7 | Dosen |

---

## 🔓 PUBLIC — Tanpa Token

### #4. POST `/api/akademik/login`

Login semua role. Return id, role_id, dan bearer token.

**Hak Akses:** Public

**JSON Body:**
```json
{
  "email": "superadmin@simpadu.ac.id",
  "password": "admin123"
}
```

**Contoh Response:**
```json
{
  "id": 1,
  "role_id": 1,
  "token": "eyJ0eXAiOiJKV1QiLCJh...",
  "token_type": "bearer"
}
```

---

## 🔴 SUPER ADMIN (role_id: 1)

> Super Admin dapat mengakses **seluruh 35 endpoint**. Di bawah ini hanya endpoint yang secara eksklusif atau utama dimiliki Super Admin.

### #1. GET `/api/akademik/users`

Menampilkan seluruh user.

**Hak Akses:** Super Admin

**Contoh Response:**
```json
[
  {
    "id": 1,
    "name": "Super Administrator",
    "username": "superadmin",
    "nomor_identitas": "SA001",
    "email": "superadmin@simpadu.ac.id",
    "role_id": 1,
    "status": "aktif",
    "role": { "id_role": 1, "nama_role": "super_admin" }
  }
]
```

---

### #2. POST `/api/akademik/register`

Membuat akun (semua role).

**Hak Akses:** Super Admin

**JSON Body:**
```json
{
  "name": "budi Setiawan antonio",
  "username": "budi setiawan",
  "nomor_identitas": "C00013",
  "email": "budisetiawan@mahasiswa.simpadu.ac.id",
  "password": "password123",
  "role_id": 6,
  "status": "aktif"
}
```

---

### #3. PUT `/api/akademik/users/{id_user}`

Mengubah role user.

**Hak Akses:** Super Admin

**JSON Body:**
```json
{
  "role_id": 2
}
```

---

## 🟠 ADMIN AKADEMIK (role_id: 2)

> Admin Akademik memiliki akses terbanyak — **26 endpoint**.

---

### 📋 Tahun Akademik

### #5. GET `/api/akademik/tahun-akademik`

Menampilkan seluruh data tahun akademik.

**Hak Akses:** Semua admin (kecuali Mahasiswa)

---

### #6. POST `/api/akademik/tahun-akademik`

Menambahkan tahun akademik baru.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "id": "20261",
  "tahun_akademik": "2026 ganjil",
  "status": "nonaktif"
}
```

---

### #32. GET `/api/akademik/tahun-akademik/aktif`

Menampilkan hanya tahun akademik yang status-nya aktif.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

### 📋 Kelas

### #7. GET `/api/akademik/kelas`

Menampilkan seluruh data kelas.

**Hak Akses:** Semua admin (kecuali Mahasiswa)

---

### #8. GET `/api/akademik/kelas/{id_kelas}`

Menampilkan detail satu kelas.

**Hak Akses:** Semua admin (kecuali Mahasiswa)

---

### #9. GET `/api/akademik/kelas/{id_kelas}/mahasiswa`

Menampilkan daftar mahasiswa di kelas tersebut (dari tabel `mahasiswa_kelas_mk`).

**Hak Akses:** Admin Akademik, Dosen

---

### #10. POST `/api/akademik/kelas`

Menambahkan kelas.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "tahun_akademik_id": 20252,
  "prodi_id": 3,
  "kode_kelas": "TI-2A",
  "nama_kelas": "Teknik Informatika 2A",
  "kapasitas_mahasiswa": 40,
  "status": "aktif",
  "keterangan": "Kelas semester genap"
}
```

---

### #11. PUT `/api/akademik/kelas/{id_kelas}`

Mengubah data kelas.

**Hak Akses:** Admin Akademik

**JSON Body:** _(Sama seperti POST kelas)_

---

### 📋 Nilai & KHS

### #12. GET `/api/akademik/nilais/mahasiswa`

Menampilkan semua nilai matakuliah dari seluruh mahasiswa.

**Hak Akses:** Admin Akademik

---

### #13. GET `/api/akademik/nilais/mahasiswa/{user_id}`

Menampilkan semua nilai matakuliah dari satu mahasiswa. Mahasiswa hanya bisa mengakses datanya sendiri.

**Hak Akses:** Admin Akademik, Mahasiswa (self-access)

---

### #14. POST `/api/akademik/nilais`

Menambahkan Nilai Mahasiswa.

**Hak Akses:** Admin Pegawai, Dosen

**JSON Body:**
```json
{
  "user_id": 15,
  "mata_kuliah_id": 5,
  "kelas_id": 1,
  "nilai_akhir": 88.00,
  "grade": "A",
  "keterangan": "Lulus"
}
```

> **Validasi:** `user_id` wajib terdaftar dengan role_id = 6 (mahasiswa).

---

### #15. GET `/api/akademik/mahasiswa/{user_id}/khs`

Menampilkan KHS. Menggabungkan tabel `k_h_s` (IP Semester/Kumulatif) dengan tabel `nilais` untuk detail nilai. Mahasiswa hanya bisa mengakses datanya sendiri.

**Hak Akses:** Admin Akademik, Mahasiswa (self-access)

**Contoh Response:**
```json
{
  "khs": [
    {
      "id": 1,
      "user_id": 15,
      "tahun_akademik_id": 20252,
      "total_sks": 12,
      "ip_kumulatif": 3.50,
      "tahun_akademik": { "id": 20252, "tahun_akademik": "2025 genap" }
    }
  ],
  "nilai": [
    {
      "id": 1,
      "user_id": 15,
      "mata_kuliah_id": 5,
      "kelas_id": 1,
      "nilai_akhir": 88.00,
      "grade": "A",
      "mata_kuliah": { "id_mk": 5, "nama_mk": "Pemrograman" },
      "kelas": { "id": 1, "nama_kelas": "ti-2a" }
    }
  ]
}
```

---

### #16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`

Mengupdate isi pertemuan (p1-p16) di tabel `mahasiswa_kelas_mk`.

**Hak Akses:** Admin Pegawai, Dosen

**JSON Body:**
```json
{
  "p1": "H",
  "p2": "A",
  "p3": null,
  "p4": null,
  "p5": null,
  "p6": null,
  "p7": null,
  "p8": null,
  "p9": null,
  "p10": null,
  "p11": null,
  "p12": null,
  "p13": null,
  "p14": null,
  "p15": null,
  "p16": null,
  "status_id": "aktif"
}
```

> Keterangan kode absensi: `H` = Hadir, `I` = Izin, `S` = Sakit, `A` = Alpa

---

### 📋 Jurusan & Prodi

### #17. GET `/api/akademik/jurusan`

Menampilkan seluruh Jurusan beserta Prodi-nya.

**Hak Akses:** Admin Akademik

---

### #18. POST `/api/akademik/jurusan`

Menambahkan Jurusan Baru.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "nama_jurusan": "Teknik Mesin"
}
```

---

### #19. GET `/api/akademik/jurusan/{jurusan_id}/prodis`

Menampilkan seluruh Prodi dalam SATU jurusan.

**Hak Akses:** Admin Akademik

---

### #20. POST `/api/akademik/prodis`

Menambahkan Prodi baru dan relasi ke Jurusan.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "jurusan_id": 1,
  "nama_prodi": "D4 Teknik Mesin"
}
```

---

### #31. GET `/api/akademik/prodis`

Menampilkan seluruh Prodi dengan relasi Jurusan.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

### 📋 Mata Kuliah

### #21. GET `/api/akademik/mata-kuliah`

Menampilkan daftar mata kuliah.

**Hak Akses:** Admin Akademik, Dosen, Mahasiswa

---

### #22. GET `/api/akademik/mata-kuliah/{id_mk}`

Menampilkan detail satu mata kuliah.

**Hak Akses:** Admin Akademik, Dosen, Mahasiswa

---

### #23. POST `/api/akademik/mata-kuliah`

Menambahkan data mata kuliah baru.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "prodi_id": 3,
  "kode_mk": "TI201",
  "nama_mk": "Pemrograman Web Backend",
  "sks": 3,
  "status": "aktif"
}
```

> **Validasi:** `prodi_id` wajib ada di tabel `prodis`.

---

### #24. PUT `/api/akademik/mata-kuliah/{id_mk}`

Mengubah informasi mata kuliah.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "prodi_id": 3,
  "kode_mk": "TI201",
  "nama_mk": "Pemrograman Aplikasi Backend & API",
  "sks": 4,
  "status": "aktif"
}
```

---

### 📋 Plotting Mahasiswa-Kelas

### #25. GET `/api/akademik/mahasiswa-kelas`

Menampilkan seluruh data plotting mahasiswa, kelas, beserta mata kuliahnya.

**Hak Akses:** Admin Akademik, Dosen

---

### #26. GET `/api/akademik/mahasiswa-kelas/{id}`

Menampilkan detail satu baris data plotting. Mahasiswa hanya bisa melihat datanya sendiri.

**Hak Akses:** Admin Akademik, Dosen, Mahasiswa (self-access)

---

### #27. POST `/api/akademik/mahasiswa-kelas`

Mendaftarkan mahasiswa ke sebuah kelas dan mata kuliah (Plotting manual).

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "mata_kuliah_id": 5,
  "dosen_id": 8,
  "id_kelas": 1,
  "nim": "C00002",
  "status_id": "aktif"
}
```

> **Validasi Backend:**
> - `mata_kuliah_id` wajib ada di tabel `mata_kuliahs`
> - `id_kelas` wajib ada di tabel `kelas`
> - `dosen_id` wajib ada di `users` dengan `role_id = 7` (dosen)
> - `nim` wajib ada di `users.nomor_identitas` dengan `role_id = 6` (mahasiswa)

---

### #28. PUT `/api/akademik/mahasiswa-kelas/{id}`

Mengubah data plotting (pindah kelas / ganti dosen).

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "mata_kuliah_id": 5,
  "dosen_id": 10,
  "id_kelas": 2,
  "nim": "C00002",
  "status_id": "aktif"
}
```

---

### #29. DELETE `/api/akademik/mahasiswa-kelas/{id}`

Membatalkan/menghapus mahasiswa dari plotting.

**Hak Akses:** Admin Akademik

---

## 🟡 ADMIN PEGAWAI (role_id: 3)

### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

### #14. POST `/api/akademik/nilais`
Menambahkan Nilai Mahasiswa.  
[Lihat payload di atas →](#14-post-apiakademiknilais)

### #16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`
Mengupdate isi pertemuan p1-p16.  
[Lihat payload di atas →](#16-put-apiakademikpertemuanid_mahasiswa_mk)

**Total: 5 endpoint**

---

## 🟤 ADMIN MAHASISWA (role_id: 4)

### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

### #33. POST `/api/akademik/mahasiswa/register`

Membuat akun mahasiswa baru. `role_id` otomatis 6, `status` default `aktif`.

**Hak Akses:** Super Admin, Admin Mahasiswa

**JSON Body:**
```json
{
  "name": "budi Setiawan antonio",
  "username": "budi setiawan",
  "nomor_identitas": "C00013",
  "email": "budisetiawan@mahasiswa.simpadu.ac.id",
  "password": "password123"
}
```

---

### #34. GET `/api/akademik/mahasiswa`

Menampilkan list seluruh mahasiswa (role_id = 6).

**Hak Akses:** Super Admin, Admin Akademik, Admin Mahasiswa

---

### #35. PUT `/api/akademik/mahasiswa/{id_user}/status`

Mengubah status mahasiswa (aktif/nonaktif).

**Hak Akses:** Super Admin, Admin Mahasiswa

**JSON Body:**
```json
{
  "status": "nonaktif"
}
```

> **Validasi:** `id_user` wajib memiliki `role_id = 6`.

**Total: 6 endpoint**

---

## 🟢 ADMIN KEUANGAN (role_id: 5)

### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

### #30. GET `/api/akademik/users/mahasiswa/{nim}`

Menampilkan data user mahasiswa berdasarkan NIM (`nomor_identitas`).

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

### #31. GET `/api/akademik/prodis`

Menampilkan seluruh Prodi dengan relasi Jurusan.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

### #32. GET `/api/akademik/tahun-akademik/aktif`

Menampilkan hanya tahun akademik yang status-nya aktif.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

**Total: 6 endpoint**

---

## 🔵 MAHASISWA (role_id: 6)

### #13. GET `/api/akademik/nilais/mahasiswa/{user_id}`
Menampilkan semua nilai matakuliah dari satu mahasiswa. **Hanya data sendiri** (kecuali diakses Admin Akademik).

### #15. GET `/api/akademik/mahasiswa/{user_id}/khs`
Menampilkan KHS gabungan `k_h_s` + `nilais`. **Hanya data sendiri** (kecuali Admin Akademik).

### #21. GET `/api/akademik/mata-kuliah`
Menampilkan daftar mata kuliah.

### #22. GET `/api/akademik/mata-kuliah/{id_mk}`
Menampilkan detail satu mata kuliah.

### #26. GET `/api/akademik/mahasiswa-kelas/{id}`
Menampilkan detail plotting. **Hanya data sendiri** (nim = nomor_identitas).

**Total: 5 endpoint**

---

## 🟣 DOSEN (role_id: 7)

### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

### #9. GET `/api/akademik/kelas/{id_kelas}/mahasiswa`
Menampilkan daftar mahasiswa dalam satu kelas.

### #14. POST `/api/akademik/nilais`
Menambahkan Nilai Mahasiswa.

### #16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`
Mengupdate isi absensi pertemuan p1-p16.

### #21. GET `/api/akademik/mata-kuliah`
Menampilkan daftar mata kuliah.

### #22. GET `/api/akademik/mata-kuliah/{id_mk}`
Menampilkan detail satu mata kuliah.

### #25. GET `/api/akademik/mahasiswa-kelas`
Menampilkan seluruh data plotting.

### #26. GET `/api/akademik/mahasiswa-kelas/{id}`
Menampilkan detail plotting.

**Total: 10 endpoint**

---

## 📊 Ringkasan Akses

| # | Endpoint | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|----------|---|---|---|---|---|---|---|
| 1 | GET `/api/akademik/users` | ✅ | - | - | - | - | - | - |
| 2 | POST `/api/akademik/register` | ✅ | - | - | - | - | - | - |
| 3 | PUT `/api/akademik/users/{id_user}` | ✅ | - | - | - | - | - | - |
| 4 | POST `/api/akademik/login` | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| 5 | GET `/api/akademik/tahun-akademik` | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| 6 | POST `/api/akademik/tahun-akademik` | ✅ | ✅ | - | - | - | - | - |
| 7 | GET `/api/akademik/kelas` | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| 8 | GET `/api/akademik/kelas/{id_kelas}` | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| 9 | GET `/api/akademik/kelas/{id_kelas}/mahasiswa` | ✅ | ✅ | - | - | - | - | ✅ |
| 10 | POST `/api/akademik/kelas` | ✅ | ✅ | - | - | - | - | - |
| 11 | PUT `/api/akademik/kelas/{id_kelas}` | ✅ | ✅ | - | - | - | - | - |
| 12 | GET `/api/akademik/nilais/mahasiswa` | ✅ | ✅ | - | - | - | - | - |
| 13 | GET `/api/akademik/nilais/mahasiswa/{user_id}` | ✅ | ✅ | - | - | - | 🔒 | - |
| 14 | POST `/api/akademik/nilais` | ✅ | - | ✅ | - | - | - | ✅ |
| 15 | GET `/api/akademik/mahasiswa/{user_id}/khs` | ✅ | ✅ | - | - | - | 🔒 | - |
| 16 | PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}` | ✅ | - | ✅ | - | - | - | ✅ |
| 17 | GET `/api/akademik/jurusan` | ✅ | ✅ | - | - | - | - | - |
| 18 | POST `/api/akademik/jurusan` | ✅ | ✅ | - | - | - | - | - |
| 19 | GET `/api/akademik/jurusan/{jurusan_id}/prodis` | ✅ | ✅ | - | - | - | - | - |
| 20 | POST `/api/akademik/prodis` | ✅ | ✅ | - | - | - | - | - |
| 21 | GET `/api/akademik/mata-kuliah` | ✅ | ✅ | - | - | - | ✅ | ✅ |
| 22 | GET `/api/akademik/mata-kuliah/{id_mk}` | ✅ | ✅ | - | - | - | ✅ | ✅ |
| 23 | POST `/api/akademik/mata-kuliah` | ✅ | ✅ | - | - | - | - | - |
| 24 | PUT `/api/akademik/mata-kuliah/{id_mk}` | ✅ | ✅ | - | - | - | - | - |
| 25 | GET `/api/akademik/mahasiswa-kelas` | ✅ | ✅ | - | - | - | - | ✅ |
| 26 | GET `/api/akademik/mahasiswa-kelas/{id}` | ✅ | ✅ | - | - | - | 🔒 | ✅ |
| 27 | POST `/api/akademik/mahasiswa-kelas` | ✅ | ✅ | - | - | - | - | - |
| 28 | PUT `/api/akademik/mahasiswa-kelas/{id}` | ✅ | ✅ | - | - | - | - | - |
| 29 | DELETE `/api/akademik/mahasiswa-kelas/{id}` | ✅ | ✅ | - | - | - | - | - |
| 30 | GET `/api/akademik/users/mahasiswa/{nim}` | ✅ | ✅ | - | - | ✅ | - | - |
| 31 | GET `/api/akademik/prodis` | ✅ | ✅ | - | - | ✅ | - | - |
| 32 | GET `/api/akademik/tahun-akademik/aktif` | ✅ | ✅ | - | - | ✅ | - | - |
| 33 | POST `/api/akademik/mahasiswa/register` | ✅ | - | - | ✅ | - | - | - |
| 34 | GET `/api/akademik/mahasiswa` | ✅ | ✅ | - | ✅ | - | - | - |
| 35 | PUT `/api/akademik/mahasiswa/{id_user}/status` | ✅ | - | - | ✅ | - | - | - |

> 🌐 = Public (tanpa token)  
> ✅ = Full access  
> 🔒 = Self-access only (hanya data milik sendiri)

---

## Kredensial Test (Seeder)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@simpadu.ac.id | admin123 |
| Admin Akademik | admin.akademik@simpadu.ac.id | admin123 |
| Admin Pegawai | admin.pegawai@simpadu.ac.id | admin123 |
| Admin Mahasiswa | admin.mahasiswa@simpadu.ac.id | admin123 |
| Admin Keuangan | admin.keuangan@simpadu.ac.id | admin123 |
