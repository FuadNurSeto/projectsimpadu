# Kebutuhan API Sistem Akademik

**Spesifikasi:**
* **Framework:** Laravel 12.59.0
* **PHP:** 8.4.21
* **Auth:** JWT (`PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider`)
* **Database:** Sudah selesai dibuat. Tolong pelajari skema tabel, tipe data, dan relasinya dari file SQL yang saya lampirkan. JANGAN buatkan file Migrations.

**Aturan Penting Pembuatan Model:**
1. Sesuaikan nama tabel (`$table`) dan Primary Key (`$primaryKey`) persis seperti di file SQL. Perhatikan bahwa beberapa tabel memiliki Primary Key unik (contoh: tabel `role` menggunakan `id_role`, tabel `mata_kuliahs` menggunakan `id_mk`).
2. Tuliskan properti `$fillable` secara lengkap.
3. Buatkan relasi Eloquent (`belongsTo`, `hasMany`) di setiap Model.
4. **Khusus Model `TahunAkademik`**: Set `public $incrementing = false;` dan `protected $keyType = 'int';` karena ID-nya diinput manual (contoh: 20261).

**Aturan Penting Pembuatan Controller & API (Validasi & Akses):**
1. Gunakan Middleware JWT untuk membatasi akses berdasarkan `role_id`.
2. Untuk endpoint spesifik mahasiswa (seperti KHS atau Nilai), pastikan user yang login hanya bisa mengakses datanya sendiri (`Auth::id() == $user_id`), KECUALI jika yang mengakses adalah Admin.
3. Pada request POST/PUT, buatkan dan gunakan **FormRequest** untuk memastikan ID relasi valid di database dan memiliki role yang tepat (misal: saat input nilai, `user_id` yang dikirim harus terdaftar sebagai mahasiswa, bukan admin).
4. Sediakan komentar PHPDoc di atas setiap method controller yang berisi contoh payload JSON-nya.
---

## DAFTAR API & PAYLOAD JSON

### 🔴 SUPER ADMIN

**1. GET `/api/akademik/users`**
* **Fungsi:** Menampilkan seluruh user.
* **Hak Akses:** Super Admin.

**2. POST `/api/akademik/register`**
* **Fungsi:** Membuat akun (semua role).
* **Hak Akses:** Super Admin.
* **JSON Body:**
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

**3. PUT `/api/akademik/users/{id_user}`**
* **Fungsi:** Mengubah role user.
* **Hak Akses:** Super Admin.
* **JSON Body:**
    ```json
    {
      "role_id": 2
    }
    ```

**4. POST `/api/akademik/login`**
* **Fungsi:** Login semua role. Return id, role_id, dan bearer token.
* **JSON Body:**
    ```json
    {
      "email": "budisetiawan@mahasiswa.simpadu.ac.id",
      "password": "admin123"
    }
    ```

---

### 🟠 ADMIN AKADEMIK

**5. GET `/api/akademik/tahun-akademik`**
* **Fungsi:** Menampilkan seluruh table tahun akademik.
* **Hak Akses:** Semua role admin (Kecuali Mahasiswa).

**6. POST `/api/akademik/tahun-akademik`**
* **Fungsi:** Menambahkan tahun akademik baru.
* **Hak Akses:** Hanya Admin Akademik.
* **JSON Body:**
    ```json
    {
      "id": "20261",
      "tahun_akademik": "2026 ganjil",
      "status": "nonaktif"
    }
    ```

**7. GET `/api/akademik/kelas`**
* **Fungsi:** Menampilkan seluruh data kelas.
* **Hak Akses:** Semua role admin (Kecuali Mahasiswa).

**8. GET `/api/akademik/kelas/{id_kelas}`**
* **Fungsi:** Menampilkan detail satu kelas.
* **Hak Akses:** Semua role admin (Kecuali Mahasiswa).

**9. GET `/api/akademik/kelas/{id_kelas}/mahasiswa`**
* **Fungsi:** Menampilkan daftar mahasiswa di kelas tersebut (dari tabel `mahasiswa_kelas_mk`).
* **Hak Akses:** Dosen dan Admin Akademik.

**10. POST `/api/akademik/kelas`**
* **Fungsi:** Menambahkan kelas.
* **Hak Akses:** Hanya Admin Akademik.
* **JSON Body:**
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

**11. PUT `/api/akademik/kelas/{id_kelas}`**
* **Fungsi:** Mengubah data kelas.
* **Hak Akses:** Hanya Admin Akademik.
* **JSON Body:** *(Sama seperti POST kelas).*

---

### 🟢 NILAI & KHS

**12. GET `/api/akademik/nilais/mahasiswa`**
* **Fungsi:** Menampilkan semua nilai matakuliah dari seluruh mahasiswa.
* **Hak Akses:** Admin Akademik (Bukan Mahasiswa).

**13. GET `/api/akademik/nilais/mahasiswa/{user_id}`**
* **Fungsi:** Menampilkan semua nilai matakuliah dari satu mahasiswa.
* **Hak Akses:** Mahasiswa yang bersangkutan dan Admin Akademik.

**14. POST `/api/akademik/nilais`**
* **Fungsi:** Menambahkan Nilai Mahasiswa.
* **Hak Akses:** Admin Pegawai dan Dosen.
* **JSON Body:**
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

**15. GET `/api/akademik/mahasiswa/{user_id}/khs`**
* **Fungsi:** Menampilkan KHS. Gabungkan tabel `k_h_s` (IP Semester/Kumulatif) dengan tabel `nilais` untuk detail nilai.
* **Hak Akses:** Mahasiswa yang bersangkutan dan Admin Akademik.

**16. PUT `/api/akademik/pertemuan/{id_mahasiswa_mk}`**
* **Fungsi:** Mengupdate isi pertemuan di tabel `mahasiswa_kelas_mk`.
* **Hak Akses:** Admin Pegawai dan Dosen.
* **JSON Body:**
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

---

### 🔵 JURUSAN & PRODI

**17. GET `/api/akademik/jurusan`**
* **Fungsi:** Menampilkan seluruh Jurusan.
* **Hak Akses:** Admin Akademik.

**18. POST `/api/akademik/jurusan`**
* **Fungsi:** Menambahkan Jurusan Baru.
* **Hak Akses:** Admin Akademik.
* **JSON Body:**
    ```json
    {
      "nama_jurusan": "Teknik Mesin"
    }
    ```

**19. GET `/api/akademik/jurusan/{jurusan_id}/prodis`**
* **Fungsi:** Menampilkan seluruh Prodi dalam SATU jurusan.
* **Hak Akses:** Admin Akademik.

**20. POST `/api/akademik/prodis`**
* **Fungsi:** Menambahkan Prodi baru dan relasi ke Jurusan.
* **Hak Akses:** Admin Akademik.
* **JSON Body:**
    ```json
    {
      "jurusan_id": 1,
      "nama_prodi": "D4 Teknik Mesin"
    }
    ```

---

### 🟣 MATA KULIAH

**21. GET `/api/akademik/mata-kuliah`**
* **Fungsi:** Menampilkan daftar mata kuliah.
* **Hak Akses:** Admin Akademik, Dosen, dan Mahasiswa.

**22. GET `/api/akademik/mata-kuliah/{id_mk}`**
* **Fungsi:** Menampilkan detail satu mata kuliah.
* **Hak Akses:** Admin Akademik, Dosen, dan Mahasiswa.

**23. POST `/api/akademik/mata-kuliah`**
* **Fungsi:** Menambahkan data mata kuliah baru.
* **Hak Akses:** Hanya Admin Akademik.
* **Validasi:** Wajib memastikan `prodi_id` ada di tabel `prodis`.
* **JSON Body:**
    ```json
    {
      "prodi_id": 3,
      "nama_mk": "Pemrograman Web Backend",
      "sks": 3,
      "status": "aktif"
    }
    ```

**24. PUT `/api/akademik/mata-kuliah/{id_mk}`**
* **Fungsi:** Mengubah informasi mata kuliah.
* **Hak Akses:** Hanya Admin Akademik.
* **Validasi:** Wajib memvalidasi `prodi_id` jika diubah.
* **JSON Body:**
    ```json
    {
      "prodi_id": 3,
      "nama_mk": "Pemrograman Aplikasi Backend & API",
      "sks": 4,
      "status": "aktif"
    }
    ```

---

### 🟤 PLOTTING PESERTA KELAS / MAHASISWA KELAS

**25. GET `/api/akademik/mahasiswa-kelas`**
* **Fungsi:** Menampilkan seluruh data plotting mahasiswa, kelas, beserta mata kuliahnya.
* **Hak Akses:** Admin Akademik dan Dosen.

**26. GET `/api/akademik/mahasiswa-kelas/{id}`**
* **Fungsi:** Menampilkan detail satu baris data plotting berdasarkan `id` primary key.
* **Hak Akses:** Admin Akademik, Dosen, dan Mahasiswa yang bersangkutan.

**27. POST `/api/akademik/mahasiswa-kelas`**
* **Fungsi:** Mendaftarkan mahasiswa ke sebuah kelas dan mata kuliah (Plotting manual oleh Admin karena KRS ditiadakan).
* **Hak Akses:** Hanya Admin Akademik.
* **Validasi Backend (PENTING):**
  * Wajib memastikan `mata_kuliah_id` ada di tabel `mata_kuliahs`.
  * Wajib memastikan `id_kelas` ada di tabel `kelas`.
  * Wajib memvalidasi `dosen_id` ada di tabel `users` dan memiliki `role_id` sebagai DOSEN.
  * Wajib memvalidasi `nim` ada di kolom `nomor_identitas` tabel `users` dan memiliki `role_id` sebagai MAHASISWA.
* **JSON Body:**
    ```json
    {
      "mata_kuliah_id": 5,
      "dosen_id": 8,
      "id_kelas": 1,
      "nim": "C00002",
      "status_id": "aktif"
    }
    ```

**28. PUT `/api/akademik/mahasiswa-kelas/{id}`**
* **Fungsi:** Mengubah data plotting jika terjadi kesalahan input (misal ingin pindah kelas atau ganti dosen pengajar).
* **Hak Akses:** Hanya Admin Akademik.
* **Validasi Backend:** Sama dengan validasi pada proses POST.
* **JSON Body:**
    ```json
    {
      "mata_kuliah_id": 5,
      "dosen_id": 10,
      "id_kelas": 2,
      "nim": "C00002",
      "status_id": "aktif"
    }
    ```

**29. DELETE `/api/akademik/mahasiswa-kelas/{id}`**
* **Fungsi:** Membatalkan/menghapus mahasiswa dari kelas atau mata kuliah tersebut (Batal Plotting).
* **Hak Akses:** Hanya Admin Akademik.

**30. GET `/api/akademik/users/mahasiswa/{nim}`**
* **Fungsi:** Melihat Daftar mahasiswa dengan nim.
* **Hak Akses:** Hanya Admin Keuangan.

**31. GET `/api/akademik/prodis`**
* **Fungsi:** Melihat Daftar Prodi.
* **Hak Akses:** Hanya Admin Keuangan.

**32. GET `/api/akademik/tahun-akademik/aktif`**
* **Fungsi:** Melihat Daftar Jurusan.
* **Hak Akses:** Hanya Admin Keuangan.

**33. POST `/api/akademik/mahasiswa/register`**
* **Fungsi:** Mendaftarkan mahasiswa.
* **Hak Akses:** Hanya Admin Mahasiswa.
**json**

**34. GET `/api/akademik/mahasiswa`**
* **Fungsi:** Melihat Daftar mahasiswa.
* **Hak Akses:** Hanya Admin Mahasiswa.

**35. PUT `/api/akademik/mahasiswa/{id_user}/status`**
* **Fungsi:** Melihat Daftar Jurusan.
* **Hak Akses:** Hanya Admin Mahasiswa.
```json
{
  "status": "cuti"
}
```
