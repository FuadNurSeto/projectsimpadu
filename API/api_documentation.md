# API Documentation — Sistem Akademik Simpadu

> **Base URL:** `http://admin4e06.vps-poliban.my.id`  
> **Auth:** JWT Bearer Token  
> **Total Endpoint:** 54

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
| 8 | Pegawai |

> **Multi-Role:** Admin dengan id 2–5 (Admin Akademik, Admin Pegawai, Admin Mahasiswa, Admin Keuangan) dan Dosen (7) juga otomatis memiliki role 8 (`pegawai`). Super Admin (1) dan Mahasiswa (6) hanya memiliki 1 role.

---

## 🔓 PUBLIC — Tanpa Token

### #4. POST `/api/akademik/login`

Login semua role. Return data user lengkap dan bearer token.

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
  "name": "Super Administrator",
  "username": "superadmin",
  "nomor_identitas": "SA001",
  "email": "superadmin@simpadu.ac.id",
  "role_ids": [1],
  "roles": ["super_admin"],
  "token": "eyJ0eXAiOiJKV1QiLCJh...",
  "token_type": "bearer"
}
```

---

## 🔴 SUPER ADMIN (role_id: 1)

> Super Admin dapat mengakses **seluruh 45 endpoint**. Di bawah ini hanya endpoint yang secara eksklusif atau utama dimiliki Super Admin.

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

> **Auto Role 8:** Jika `role_id` adalah 2, 3, 4, 5, atau 7, user otomatis juga mendapatkan role 8 (`pegawai`) di pivot `role_user`.

---

### #3. PUT `/api/akademik/users/{id_user}`

Mengubah data user. Semua field opsional — hanya field yang dikirim yang di-update.

**Hak Akses:** Super Admin

**JSON Body:**
```json
{
  "name": "Budi Setiawan",
  "username": "budisetiawan",
  "nomor_identitas": "C00013",
  "email": "budi@mahasiswa.simpadu.ac.id",
  "role_id": 2,
  "password": "newpassword123",
  "status": "nonaktif"
}
```

> **Sync Pivot:** Saat `role_id` diubah, pivot `role_user` otomatis di-sync ulang — role 8 ditambahkan jika role baru adalah 2,3,4,5, atau 7.

---

### #36. GET `/api/akademik/users/{id}`

Menampilkan detail satu user berdasarkan ID.

**Hak Akses:** Super Admin

---

### #37. POST `/api/akademik/users/{id_user}/reset-password`

Reset password user. Password baru otomatis di-hash oleh Laravel.

**Hak Akses:** Semua admin (Super Admin, Admin Akademik, Admin Pegawai, Admin Mahasiswa, Admin Keuangan)

**JSON Body:**
```json
{
  "password": "newpassword123"
}
```

---

## 🟠 ADMIN AKADEMIK (role_id: 2)

> Admin Akademik memiliki akses terbanyak — **34 endpoint**.

---

### 📋 Tahun Akademik

#### #5. GET `/api/akademik/tahun-akademik`

Menampilkan seluruh data tahun akademik.

**Hak Akses:** Semua admin (kecuali Mahasiswa)

---

#### #6. POST `/api/akademik/tahun-akademik`

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

#### #32. GET `/api/akademik/tahun-akademik/aktif`

Menampilkan hanya tahun akademik yang status-nya aktif.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

#### #48. PUT `/api/akademik/tahun-akademik/{id}`

Mengubah data tahun akademik (misalnya mengubah status dari nonaktif ke aktif).

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "id": "20261",
  "tahun_akademik": "2026 ganjil",
  "status": "aktif"
}
```

---

### 📋 Semester

#### #51. GET `/api/akademik/semester`

Menampilkan seluruh data semester beserta relasi tahun akademik.

**Hak Akses:** Semua admin + Mahasiswa

**Contoh Response:**
```json
[
  {
    "id": 5,
    "tahun_akademik_id": 20261,
    "nomor_semester": 5,
    "status": "aktif",
    "tahun_akademik": {
      "id": 20261,
      "tahun_akademik": "2026 ganjil",
      "status": "aktif"
    }
  }
]
```

---

#### #52. POST `/api/akademik/semester`

Menambahkan semester baru.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "tahun_akademik_id": 20271,
  "nomor_semester": 7,
  "status": "nonaktif"
}
```

> **Validasi:** `nomor_semester` harus 1–8, kombinasi (`tahun_akademik_id`, `nomor_semester`) harus unik.

---

#### #53. PUT `/api/akademik/semester/{id}`

Mengubah data semester.

**Hak Akses:** Admin Akademik

**JSON Body:** _(Sama seperti POST semester)_

---

#### #54. GET `/api/akademik/semester/aktif`

Menampilkan hanya semester yang status-nya aktif.

**Hak Akses:** Super Admin, Admin Akademik, Admin Mahasiswa, Admin Keuangan, Mahasiswa

---

### 📋 Kelas

#### #7. GET `/api/akademik/kelas`

Menampilkan seluruh data kelas. Response menyertakan `kapasitas_mahasiswa` dan `jumlah_mahasiswa` (jumlah mahasiswa yang terdaftar di kelas tersebut).

**Hak Akses:** Semua admin (kecuali Mahasiswa)

---

#### #8. GET `/api/akademik/kelas/{id_kelas}`

Menampilkan detail satu kelas. Response menyertakan `kapasitas_mahasiswa` dan `jumlah_mahasiswa`.

**Hak Akses:** Semua admin (kecuali Mahasiswa)

---

#### #9. GET `/api/akademik/kelas/{id_kelas}/mahasiswa`

Menampilkan daftar mahasiswa di kelas tersebut (dari tabel `mahasiswa_kelas_mk`).

**Hak Akses:** Admin Akademik, Dosen

---

#### #10. POST `/api/akademik/kelas`

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

#### #11. PUT `/api/akademik/kelas/{id_kelas}`

Mengubah data kelas.

**Hak Akses:** Admin Akademik

**JSON Body:** _(Sama seperti POST kelas)_

---

#### #49. GET `/api/akademik/dosen/beban-mengajar`

Menampilkan beban mengajar seluruh dosen. Data dikelompokkan per dosen → mata kuliah → kelas, disertai prodi, SKS, periode (tahun akademik), dan jumlah mahasiswa.

**Hak Akses:** Admin Akademik

**Contoh Response:**
```json
[
  {
    "dosen": {
      "id": 8,
      "name": "Dr. Andi Wijaya",
      "username": "andi.wijaya",
      "nomor_identitas": "DSN001",
      "email": "andi@simpadu.ac.id",
      "role_id": 7,
      "status": "aktif"
    },
    "mata_kuliah": [
      {
        "id_mk": 5,
        "nama_mk": "Pemrograman Web Backend",
        "sks": 3,
        "prodi": {
          "id": 3,
          "jurusan_id": 2,
          "nama_prodi": "D3 Teknik Informatika"
        },
        "kelas": {
          "id": 1,
          "tahun_akademik_id": 20252,
          "prodi_id": 3,
          "kode_kelas": "TI-2A",
          "nama_kelas": "Teknik Informatika 2A",
          "kapasitas_mahasiswa": 40,
          "status": "aktif",
          "keterangan": null
        },
        "tahun_akademik": {
          "id": 20252,
          "tahun_akademik": "2025 genap",
          "status": "aktif"
        },
        "jumlah_mahasiswa": 35
      }
    ]
  }
]
```

---

### 📋 Nilai & KHS

#### #12. GET `/api/akademik/nilais/mahasiswa`

Menampilkan semua nilai matakuliah dari seluruh mahasiswa.

**Hak Akses:** Admin Akademik

---

#### #13. GET `/api/akademik/nilais/mahasiswa/{user_id}`

Menampilkan semua nilai matakuliah dari satu mahasiswa. Mahasiswa hanya bisa mengakses datanya sendiri.

**Hak Akses:** Admin Akademik, Mahasiswa (self-access)

---

#### #14. POST `/api/akademik/nilais`

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

#### #15. GET `/api/akademik/mahasiswa/{user_id}/khs`

Menampilkan KHS. Menggabungkan tabel `k_h_s` (IP Semester/Kumulatif) dengan tabel `nilais` untuk detail nilai. Mahasiswa hanya bisa mengakses datanya sendiri.

**Hak Akses:** Admin Akademik, Mahasiswa (self-access)

**Contoh Response:**
```json
[
  {
    "nama_mahasiswa": "Budi Setiawan",
    "tahun_akademik": "2025 Ganjil",
    "semester_khs": 3,
    "ip_semester": 3.80,
    "detail_nilai": [
      { "id_mk": 5, "nama_mk": "Pemrograman Web Backend", "grade": "A" },
      { "id_mk": 6, "nama_mk": "Pengantar Bisnis", "grade": "B" }
    ]
  },
  {
    "nama_mahasiswa": "Budi Setiawan",
    "tahun_akademik": "2025 Genap",
    "semester_khs": 4,
    "ip_semester": 3.50,
    "detail_nilai": [
      { "id_mk": 16, "nama_mk": "Struktur Data", "grade": "A" }
    ]
  }
]
```

---

#### #16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`

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

#### #17. GET `/api/akademik/jurusan`

Menampilkan seluruh Jurusan beserta Prodi-nya.

**Hak Akses:** Admin Akademik

---

#### #18. POST `/api/akademik/jurusan`

Menambahkan Jurusan Baru.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "nama_jurusan": "Teknik Mesin"
}
```

---

#### #19. GET `/api/akademik/jurusan/{jurusan_id}/prodis`

Menampilkan seluruh Prodi dalam SATU jurusan.

**Hak Akses:** Admin Akademik

---

#### #20. POST `/api/akademik/prodis`

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

#### #31. GET `/api/akademik/prodis`

Menampilkan seluruh Prodi dengan relasi Jurusan.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

### 📋 Mata Kuliah

#### #21. GET `/api/akademik/mata-kuliah`

Menampilkan daftar mata kuliah.

**Hak Akses:** Admin Akademik, Dosen, Mahasiswa

---

#### #22. GET `/api/akademik/mata-kuliah/{id_mk}`

Menampilkan detail satu mata kuliah.

**Hak Akses:** Admin Akademik, Dosen, Mahasiswa

---

#### #23. POST `/api/akademik/mata-kuliah`

Menambahkan data mata kuliah baru.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "prodi_id": 3,
  "nama_mk": "Pemrograman Web Backend",
  "semester": 4,
  "sks": 3,
  "status": "aktif"
}
```

> **Validasi:** `prodi_id` wajib ada di tabel `prodis`.

---

#### #24. PUT `/api/akademik/mata-kuliah/{id_mk}`

Mengubah informasi mata kuliah.

**Hak Akses:** Admin Akademik

**JSON Body:**
```json
{
  "prodi_id": 3,
  "nama_mk": "Pemrograman Aplikasi Backend & API",
  "semester": 4,
  "sks": 4,
  "status": "aktif"
}
```

---

### 📋 Plotting Mahasiswa-Kelas

#### #25. GET `/api/akademik/mahasiswa-kelas`

Menampilkan seluruh data plotting mahasiswa, kelas, beserta mata kuliahnya.

**Hak Akses:** Admin Akademik, Dosen

---

#### #26. GET `/api/akademik/mahasiswa-kelas/{id}`

Menampilkan detail satu baris data plotting. Mahasiswa hanya bisa melihat datanya sendiri.

**Hak Akses:** Admin Akademik, Dosen, Mahasiswa (self-access)

---

#### #27. POST `/api/akademik/mahasiswa-kelas`

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

#### #28. PUT `/api/akademik/mahasiswa-kelas/{id}`

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

#### #29. DELETE `/api/akademik/mahasiswa-kelas/{id}`

Membatalkan/menghapus mahasiswa dari plotting.

**Hak Akses:** Admin Akademik

---

#### #47. GET `/api/akademik/dosen`

Menampilkan list seluruh dosen pengajar yang berstatus aktif (role_id = 7, status = aktif).

**Hak Akses:** Super Admin, Admin Akademik, Admin Mahasiswa

**Contoh Response:**
```json
[
  {
    "id": 6,
    "name": "Dosen Teknik Informatika",
    "username": "dosenti",
    "nomor_identitas": "DSN001",
    "email": "dosen.ti@simpadu.ac.id",
    "role_id": 7,
    "status": "aktif",
    "roles": [
      { "id_role": 7, "nama_role": "dosen" },
      { "id_role": 8, "nama_role": "pegawai" }
    ]
  }
]
```

---

## 🟡 ADMIN PEGAWAI (role_id: 3)

#### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

#### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

#### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

#### #14. POST `/api/akademik/nilais`
Menambahkan Nilai Mahasiswa.

#### #16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`
Mengupdate isi absensi pertemuan p1-p16.

#### #21. GET `/api/akademik/mata-kuliah`
Menampilkan daftar mata kuliah.

#### #22. GET `/api/akademik/mata-kuliah/{id_mk}`
Menampilkan detail satu mata kuliah.

#### #25. GET `/api/akademik/mahasiswa-kelas`
Menampilkan seluruh data plotting.

#### #26. GET `/api/akademik/mahasiswa-kelas/{id}`
Menampilkan detail plotting.

#### #38. GET `/api/akademik/jadwal`
Menampilkan seluruh jadwal.

#### #39. GET `/api/akademik/jadwal/{id}`
Menampilkan detail jadwal + daftar mahasiswa.

#### #46. GET `/api/akademik/dosen/kelas`

Menampilkan daftar kelas yang diajar oleh dosen/pegawai yang sedang login (berdasarkan tabel `mahasiswa_kelas_mk`).

**Hak Akses:** Admin Pegawai, Dosen

**Contoh Response:**
```json
[
  {
    "id": 1,
    "tahun_akademik_id": 20252,
    "prodi_id": 3,
    "kode_kelas": "TI-2A",
    "nama_kelas": "Teknik Informatika 2A",
    "kapasitas_mahasiswa": 40,
    "jumlah_mahasiswa": 20,
    "status": "aktif",
    "keterangan": null,
    "prodi": {
      "id": 3,
      "jurusan_id": 2,
      "nama_prodi": "D3 Teknik Informatika"
    },
    "tahun_akademik": {
      "id": 20252,
      "tahun_akademik": "2025 genap",
      "status": "aktif"
    }
  }
]
```

#### #50. POST `/api/akademik/dosen/register`

Membuat akun dosen baru. `role_id` otomatis 7, `status` otomatis `aktif`, dan otomatis mendapat role 8 (`pegawai`).

**Hak Akses:** Admin Pegawai

**JSON Body:**
```json
{
  "name": "Ahmad Fauzi",
  "username": "ahmadfauzi",
  "nomor_identitas": "DSN032",
  "email": "ahmadfauzi@simpadu.ac.id",
  "password": "password123"
}
```

**Contoh Response:**
```json
{
  "message": "Dosen created successfully",
  "user": {
    "id": 32,
    "name": "Ahmad Fauzi",
    "username": "ahmadfauzi",
    "nomor_identitas": "DSN032",
    "email": "ahmadfauzi@simpadu.ac.id",
    "role_id": 7,
    "status": "aktif",
    "roles": [
      { "id_role": 7, "nama_role": "dosen" },
      { "id_role": 8, "nama_role": "pegawai" }
    ]
  }
}
```

#### #51. GET `/api/akademik/semester`
Menampilkan seluruh data semester.

**Total: 15 endpoint**

---

## 🟤 ADMIN MAHASISWA (role_id: 4)

#### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

#### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

#### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

#### #9. GET `/api/akademik/kelas/{id_kelas}/mahasiswa`
Menampilkan daftar mahasiswa di kelas tersebut.

#### #13. GET `/api/akademik/nilais/mahasiswa/{user_id}`
Menampilkan semua nilai matakuliah dari satu mahasiswa.

#### #15. GET `/api/akademik/mahasiswa/{user_id}/khs`
Menampilkan KHS (riwayat per semester) + detail nilai.

#### #17. GET `/api/akademik/jurusan`
Menampilkan seluruh Jurusan beserta Prodi-nya.

#### #21. GET `/api/akademik/mata-kuliah`
Menampilkan daftar mata kuliah.

#### #22. GET `/api/akademik/mata-kuliah/{id_mk}`
Menampilkan detail satu mata kuliah.

#### #25. GET `/api/akademik/mahasiswa-kelas`
Menampilkan seluruh data plotting mahasiswa.

#### #26. GET `/api/akademik/mahasiswa-kelas/{id}`
Menampilkan detail plotting.

#### #30. GET `/api/akademik/users/mahasiswa/{nim}`
Menampilkan data mahasiswa + prodi + semester_sekarang.

#### #31. GET `/api/akademik/prodis`
Menampilkan seluruh Prodi dengan relasi Jurusan.

#### #32. GET `/api/akademik/tahun-akademik/aktif`
Menampilkan tahun akademik yang status-nya aktif.

---

#### #33. POST `/api/akademik/mahasiswa/register`

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

#### #34. GET `/api/akademik/mahasiswa`

Menampilkan list seluruh mahasiswa (role_id = 6).

**Hak Akses:** Super Admin, Admin Akademik, Admin Mahasiswa

---

### #47. GET `/api/akademik/dosen`

Menampilkan list seluruh dosen pengajar yang berstatus aktif.

**Hak Akses:** Super Admin, Admin Akademik, Admin Mahasiswa

---

#### #35. PUT `/api/akademik/mahasiswa/{id_user}/status`

Mengubah status mahasiswa (aktif/nonaktif).

**Hak Akses:** Super Admin, Admin Mahasiswa

**JSON Body:**
```json
{
  "status": "nonaktif"
}
```

> **Validasi:** `id_user` wajib memiliki `role_id = 6`.

#### #43. GET `/api/akademik/wilayah/provinsi`

Menampilkan seluruh provinsi.

**Hak Akses:** Super Admin, Admin Mahasiswa

---

#### #44. GET `/api/akademik/wilayah/provinsi/{provinsi_id}/kabupaten`

Menampilkan kabupaten dalam satu provinsi.

**Hak Akses:** Super Admin, Admin Mahasiswa

#### #51. GET `/api/akademik/semester`
Menampilkan seluruh data semester.

#### #54. GET `/api/akademik/semester/aktif`
Menampilkan hanya semester yang status-nya aktif.

**Total: 23 endpoint**

---

## 🟢 ADMIN KEUANGAN (role_id: 5)

#### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

#### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

#### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

---

#### #17. GET `/api/akademik/jurusan`

Menampilkan seluruh Jurusan beserta Prodi-nya.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

#### #30. GET `/api/akademik/users/mahasiswa/{nim}`

Menampilkan data user mahasiswa berdasarkan NIM (`nomor_identitas`).

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

#### #31. GET `/api/akademik/prodis`

Menampilkan seluruh Prodi dengan relasi Jurusan.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

---

#### #32. GET `/api/akademik/tahun-akademik/aktif`

Menampilkan hanya tahun akademik yang status-nya aktif.

**Hak Akses:** Super Admin, Admin Akademik, Admin Keuangan

#### #51. GET `/api/akademik/semester`
Menampilkan seluruh data semester.

#### #54. GET `/api/akademik/semester/aktif`
Menampilkan hanya semester yang status-nya aktif.

**Total: 9 endpoint**

---

## 🔵 MAHASISWA (role_id: 6)

#### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

#### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

#### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

#### #13. GET `/api/akademik/nilais/mahasiswa/{user_id}`
Menampilkan semua nilai matakuliah. **Hanya data sendiri.**

#### #15. GET `/api/akademik/mahasiswa/{user_id}/khs`
Menampilkan KHS riwayat per semester. **Hanya data sendiri.**

#### #17. GET `/api/akademik/jurusan`
Menampilkan seluruh Jurusan.

#### #21. GET `/api/akademik/mata-kuliah`
Menampilkan daftar mata kuliah.

#### #22. GET `/api/akademik/mata-kuliah/{id_mk}`
Menampilkan detail satu mata kuliah.

#### #25. GET `/api/akademik/mahasiswa-kelas`
Menampilkan seluruh data plotting.

#### #26. GET `/api/akademik/mahasiswa-kelas/{id}`
Menampilkan detail plotting. **Hanya data sendiri.**

#### #31. GET `/api/akademik/prodis`
Menampilkan seluruh Prodi.

#### #32. GET `/api/akademik/tahun-akademik/aktif`
Menampilkan tahun akademik aktif.

#### #43. GET `/api/akademik/wilayah/provinsi`
Menampilkan seluruh provinsi.

#### #44. GET `/api/akademik/wilayah/provinsi/{id}/kabupaten`
Menampilkan kabupaten dalam satu provinsi.

#### #45. GET `/api/akademik/users/me`
Menampilkan profil user yang sedang login (termasuk status).

#### #51. GET `/api/akademik/semester`
Menampilkan seluruh data semester.

#### #54. GET `/api/akademik/semester/aktif`
Menampilkan hanya semester yang status-nya aktif.

**Total: 17 endpoint**

---

## 🟣 DOSEN (role_id: 7)

#### #5. GET `/api/akademik/tahun-akademik`
Menampilkan seluruh data tahun akademik.

#### #7. GET `/api/akademik/kelas`
Menampilkan seluruh data kelas.

#### #8. GET `/api/akademik/kelas/{id_kelas}`
Menampilkan detail satu kelas.

#### #9. GET `/api/akademik/kelas/{id_kelas}/mahasiswa`
Menampilkan daftar mahasiswa di kelas tersebut.

#### #14. POST `/api/akademik/nilais`
Menambahkan Nilai Mahasiswa.

#### #16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`
Mengupdate isi absensi pertemuan p1-p16.

#### #21. GET `/api/akademik/mata-kuliah`
Menampilkan daftar mata kuliah.

#### #22. GET `/api/akademik/mata-kuliah/{id_mk}`
Menampilkan detail satu mata kuliah.

#### #25. GET `/api/akademik/mahasiswa-kelas`
Menampilkan seluruh data plotting.

#### #26. GET `/api/akademik/mahasiswa-kelas/{id}`
Menampilkan detail plotting.

#### #38. GET `/api/akademik/jadwal`
Menampilkan seluruh jadwal.

#### #39. GET `/api/akademik/jadwal/{id}`
Menampilkan detail jadwal + daftar mahasiswa.

#### #45. GET `/api/akademik/users/me`
Menampilkan profil user yang sedang login.

#### #46. GET `/api/akademik/dosen/kelas`

Menampilkan daftar kelas yang diajar oleh dosen yang sedang login (difilter dari `mahasiswa_kelas_mk` berdasarkan `dosen_id`).

**Hak Akses:** Admin Pegawai, Dosen

**Contoh Response:**
```json
[
  {
    "id": 1,
    "tahun_akademik_id": 20252,
    "prodi_id": 3,
    "kode_kelas": "TI-2A",
    "nama_kelas": "Teknik Informatika 2A",
    "kapasitas_mahasiswa": 40,
    "jumlah_mahasiswa": 20,
    "status": "aktif",
    "keterangan": null,
    "prodi": {
      "id": 3,
      "jurusan_id": 2,
      "nama_prodi": "D3 Teknik Informatika"
    },
    "tahun_akademik": {
      "id": 20252,
      "tahun_akademik": "2025 genap",
      "status": "aktif"
    }
  }
]
```

#### #51. GET `/api/akademik/semester`
Menampilkan seluruh data semester.

**Total: 15 endpoint**

---

## 📊 Ringkasan Akses

| # | Endpoint | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|----------|---|---|---|---|---|---|---|   
| 1 | GET `/api/akademik/users` | ✅ | - | - | - | - | - | - |
| 2 | POST `/api/akademik/register` | ✅ | - | - | - | - | - | - |
| 3 | PUT `/api/akademik/users/{id_user}` | ✅ | - | - | - | - | - | - |
| 4 | POST `/api/akademik/login` | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| 5 | GET `/api/akademik/tahun-akademik` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | POST `/api/akademik/tahun-akademik` | ✅ | ✅ | - | - | - | - | - |
| 7 | GET `/api/akademik/kelas` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | GET `/api/akademik/kelas/{id_kelas}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | GET `/api/akademik/kelas/{id_kelas}/mahasiswa` | ✅ | ✅ | - | ✅ | - | - | ✅ |
| 10 | POST `/api/akademik/kelas` | ✅ | ✅ | - | - | - | - | - |
| 11 | PUT `/api/akademik/kelas/{id_kelas}` | ✅ | ✅ | - | - | - | - | - |
| 12 | GET `/api/akademik/nilais/mahasiswa` | ✅ | ✅ | - | - | - | - | - |
| 13 | GET `/api/akademik/nilais/mahasiswa/{user_id}` | ✅ | ✅ | - | ✅ | - | 🔒 | - |
| 14 | POST `/api/akademik/nilais` | ✅ | - | ✅ | - | - | - | ✅ |
| 15 | GET `/api/akademik/mahasiswa/{user_id}/khs` | ✅ | ✅ | - | ✅ | - | 🔒 | - |
| 16 | PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}` | ✅ | - | ✅ | - | - | - | ✅ |
| 17 | GET `/api/akademik/jurusan` | ✅ | ✅ | - | ✅ | ✅ | ✅ | - |
| 18 | POST `/api/akademik/jurusan` | ✅ | ✅ | - | - | - | - | - |
| 19 | GET `/api/akademik/jurusan/{jurusan_id}/prodis` | ✅ | ✅ | - | - | - | - | - |
| 20 | POST `/api/akademik/prodis` | ✅ | ✅ | - | - | - | - | - |
| 21 | GET `/api/akademik/mata-kuliah` | ✅ | ✅ | - | ✅ | - | ✅ | ✅ |
| 22 | GET `/api/akademik/mata-kuliah/{id_mk}` | ✅ | ✅ | - | ✅ | - | ✅ | ✅ |
| 23 | POST `/api/akademik/mata-kuliah` | ✅ | ✅ | - | - | - | - | - |
| 24 | PUT `/api/akademik/mata-kuliah/{id_mk}` | ✅ | ✅ | - | - | - | - | - |
| 25 | GET `/api/akademik/mahasiswa-kelas` | ✅ | ✅ | - | ✅ | - | ✅ | ✅ |
| 26 | GET `/api/akademik/mahasiswa-kelas/{id}` | ✅ | ✅ | - | ✅ | - | 🔒 | ✅ |
| 27 | POST `/api/akademik/mahasiswa-kelas` | ✅ | ✅ | - | - | - | - | - |
| 28 | PUT `/api/akademik/mahasiswa-kelas/{id}` | ✅ | ✅ | - | - | - | - | - |
| 29 | DELETE `/api/akademik/mahasiswa-kelas/{id}` | ✅ | ✅ | - | - | - | - | - |
| 30 | GET `/api/akademik/users/mahasiswa/{nim}` | ✅ | ✅ | - | ✅ | ✅ | - | - |
| 31 | GET `/api/akademik/prodis` | ✅ | ✅ | - | ✅ | ✅ | ✅ | - |
| 32 | GET `/api/akademik/tahun-akademik/aktif` | ✅ | ✅ | - | ✅ | ✅ | ✅ | - |
| 33 | POST `/api/akademik/mahasiswa/register` | ✅ | - | - | ✅ | - | - | - |
| 34 | GET `/api/akademik/mahasiswa` | ✅ | ✅ | - | ✅ | - | - | - |
| 35 | PUT `/api/akademik/mahasiswa/{id_user}/status` | ✅ | - | - | ✅ | - | - | - |
| 36 | GET `/api/akademik/users/{id}` | ✅ | - | - | - | - | - | - |
| 37 | POST `/api/akademik/users/{id_user}/reset-password` | ✅ | ✅ | ✅ | ✅ | - | - | - |
| 38 | GET `/api/akademik/jadwal` | ✅ | - | ✅ | - | - | - | ✅ |
| 39 | GET `/api/akademik/jadwal/{id}` | ✅ | - | ✅ | - | - | - | ✅ |
| 40 | POST `/api/akademik/jadwal` | ✅ | - | ✅ | - | - | - | - |
| 41 | PUT `/api/akademik/jadwal/{id}` | ✅ | - | ✅ | - | - | - | - |
| 42 | DELETE `/api/akademik/jadwal/{id}` | ✅ | - | ✅ | - | - | - | - |
| 43 | GET `/api/akademik/wilayah/provinsi` | ✅ | - | - | ✅ | - | ✅ | - |
| 44 | GET `/api/akademik/wilayah/provinsi/{id}/kabupaten` | ✅ | - | - | ✅ | - | ✅ | - |
| 45 | GET `/api/akademik/users/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 46 | GET `/api/akademik/dosen/kelas` | - | - | ✅ | - | - | - | ✅ |
| 47 | GET `/api/akademik/dosen` | ✅ | ✅ | - | ✅ | - | - | - |
| 48 | PUT `/api/akademik/tahun-akademik/{id}` | ✅ | ✅ | - | - | - | - | - |
| 49 | GET `/api/akademik/dosen/beban-mengajar` | ✅ | ✅ | - | - | - | - | - |
| 50 | POST `/api/akademik/dosen/register` | - | - | ✅ | - | - | - | - |
| 51 | GET `/api/akademik/semester` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 52 | POST `/api/akademik/semester` | ✅ | ✅ | - | - | - | - | - |
| 53 | PUT `/api/akademik/semester/{id}` | ✅ | ✅ | - | - | - | - | - |
| 54 | GET `/api/akademik/semester/aktif` | ✅ | ✅ | - | ✅ | ✅ | ✅ | - |

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
| Dosen Algoritma (TI-2A) | ahmadfauzi@simpadu.ac.id | admin123 |
| Dosen Struktur Data (TI-2A) | budisantoso@simpadu.ac.id | admin123 |
| Dosen Algoritma (TI-2B) | citralestari@simpadu.ac.id | admin123 |
| Dosen Pemrograman Web (TI-2B) | dimashermawan@simpadu.ac.id | admin123 |
| Dosen Basis Data (TI-4A) | ekapermata@simpadu.ac.id | admin123 |
| Dosen Pemrograman Web (TI-4A) | fajarsetiawan@simpadu.ac.id | admin123 |
| Dosen Pengantar Bisnis (AB-2A) | gitapratama@simpadu.ac.id | admin123 |
| Dosen Akuntansi Dasar (AB-2A) | hadigunawan@simpadu.ac.id | admin123 |
| Dosen Manajemen (AB-2B) | indahmarlina@simpadu.ac.id | admin123 |
| Dosen Kewirausahaan (AB-2B) | jokonugroho@simpadu.ac.id | admin123 |
| Dosen Bisnis Digital (BD-2A) | kartikasari@simpadu.ac.id | admin123 |
| Dosen E-Commerce (BD-2A) | lukmankurniawan@simpadu.ac.id | admin123 |
| Dosen Elektronika Dasar (EL-2A) | megaramadhan@simpadu.ac.id | admin123 |
| Dosen Mikrokontroler (EL-2A) | novianggraini@simpadu.ac.id | admin123 |
| Dosen Elektronika Dasar (EL-4A) | rizkysaputra@simpadu.ac.id | admin123 |
| Dosen Mikrokontroler (EL-4A) | putriwati@simpadu.ac.id | admin123 |
| Dosen Rangkaian Listrik (TL-2A) | sitihidayat@simpadu.ac.id | admin123 |
| Dosen Instalasi Listrik (TL-2A) | dewipurnama@simpadu.ac.id | admin123 |
| Dosen SIM (SI-2A) | rinawijaya@simpadu.ac.id | admin123 |
| Dosen Analisis Sistem (SI-2A) | hendrakusuma@simpadu.ac.id | admin123 |
| Dosen Energi Terbarukan (TRPE-4A) | mayahalim@simpadu.ac.id | admin123 |
| Dosen SI Kota (SIKC-4A) | dediputra@simpadu.ac.id | admin123 |
| Dosen Sistem Kontrol (TRO-4A) | niasyahputra@simpadu.ac.id | admin123 |
| Dosen Otomasi Industri (TRO-4A) | ferdynurhaliza@simpadu.ac.id | admin123 |
| Dosen Basis Data (TI-6A) | sarasfauzi@simpadu.ac.id | admin123 |
| Dosen Pemrograman Web (TI-6A) | antonsantoso@simpadu.ac.id | admin123 |
