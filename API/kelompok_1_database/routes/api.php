<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\JurusanController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\KHSController;
use App\Http\Controllers\Api\MahasiswaKelasMkController;
use App\Http\Controllers\Api\MataKuliahController;
use App\Http\Controllers\Api\MateriController;
use App\Http\Controllers\Api\NilaiController;
use App\Http\Controllers\Api\ProdiController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\TahunAkademikController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WilayahController;
use Illuminate\Support\Facades\Route;

Route::prefix('akademik')->group(function () {

    // #4 - Public login
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('jwt.auth')->group(function () {

        // #45 - Self profile (semua role yang login)
        Route::get('users/me', [UserController::class, 'me']);

        // SUPER ADMIN only (role_id = 1)
        Route::middleware('role:1')->group(function () {
            Route::get('users', [UserController::class, 'index']);                     // #1
            Route::post('register', [AuthController::class, 'register']);               // #2
        });

        // Semua Admin (1,2,3,4,5) — self-access check di controller
        Route::middleware('role:1,2,3,4,5')->group(function () {
            Route::put('users/{id_user}', [UserController::class, 'updateUser']);       // #3
        });

        // Admin + Mahasiswa (1,2,3,4,5,6,7)
        Route::middleware('role:1,2,3,4,5,6,7')->group(function () {
            Route::get('tahun-akademik', [TahunAkademikController::class, 'index']);   // #5
            Route::get('semester', [SemesterController::class, 'index']);                // #51
            Route::get('kelas', [KelasController::class, 'index']);                     // #7
            Route::get('kelas/{id_kelas}', [KelasController::class, 'show']);           // #8
        });

        // Dosen & Admin Akademik & Admin Mahasiswa & Mahasiswa (2,4,6,7)
        Route::middleware('role:2,4,6,7')->group(function () {
            Route::get('kelas/{id_kelas}/mahasiswa', [KelasController::class, 'mahasiswa']);  // #9
            Route::get('mahasiswa-kelas', [MahasiswaKelasMkController::class, 'index']);      // #25
        });

        // Admin Akademik only (role_id = 2)
        Route::middleware('role:2')->group(function () {
            Route::post('tahun-akademik', [TahunAkademikController::class, 'store']);         // #6
            Route::put('tahun-akademik/{id}', [TahunAkademikController::class, 'update']);    // #48
            Route::post('semester', [SemesterController::class, 'store']);                     // #52
            Route::put('semester/{id}', [SemesterController::class, 'update']);                // #53
            Route::post('kelas', [KelasController::class, 'store']);                           // #10
            Route::put('kelas/{id_kelas}', [KelasController::class, 'update']);                // #11

            Route::get('dosen/beban-mengajar', [KelasController::class, 'bebanMengajar']);      // #49

            Route::post('jurusan', [JurusanController::class, 'store']);                       // #18
            Route::put('jurusan/{id}', [JurusanController::class, 'update']);                  // #63
            Route::get('jurusan/{jurusan_id}/prodis', [ProdiController::class, 'byJurusan']);  // #19
            Route::post('prodis', [ProdiController::class, 'store']);                          // #20
            Route::put('prodis/{id}', [ProdiController::class, 'update']);                     // #64

            Route::post('kelas/{id_kelas}/dosen', [KelasController::class, 'assignDosen']);    // #66
            Route::put('kelas/{id_kelas}/dosen/{id}', [KelasController::class, 'updateDosen']); // #67

            Route::post('mata-kuliah', [MataKuliahController::class, 'store']);                // #23
            Route::put('mata-kuliah/{id_mk}', [MataKuliahController::class, 'update']);        // #24

            Route::post('mahasiswa-kelas', [MahasiswaKelasMkController::class, 'store']);      // #27
            Route::put('mahasiswa-kelas/{id}', [MahasiswaKelasMkController::class, 'update']); // #28
            Route::delete('mahasiswa-kelas/{id}', [MahasiswaKelasMkController::class, 'destroy']); // #29
        });

        // Super Admin + Admin Akademik + Admin Mahasiswa + Admin Keuangan + Mahasiswa (1,2,4,5,6)
        Route::middleware('role:1,2,4,5,6')->group(function () {
            Route::get('jurusan', [JurusanController::class, 'index']);                             // #17
            Route::get('users/mahasiswa/{nim}', [UserController::class, 'showByNim']);              // #30
            Route::get('prodis', [ProdiController::class, 'index']);                                // #31
            Route::get('tahun-akademik/aktif', [TahunAkademikController::class, 'aktif']);          // #32
            Route::get('semester/aktif', [SemesterController::class, 'aktif']);                      // #54
        });

        // Super Admin + Admin Mahasiswa + Mahasiswa (1,4,6)
        Route::middleware('role:1,4,6')->group(function () {
            Route::post('mahasiswa/register', [UserController::class, 'registerMahasiswa']);        // #33
            Route::put('mahasiswa/{id_user}/status', [UserController::class, 'updateMahasiswaStatus']); // #35
            Route::get('wilayah/provinsi', [WilayahController::class, 'provinsi']);              // #43
            Route::get('wilayah/provinsi/{provinsi_id}/kabupaten', [WilayahController::class, 'kabupaten']); // #44
        });

        // Reset Password - Semua admin (1,2,3,4)
        Route::middleware('role:1,2,3,4')->group(function () {
            Route::post('users/{id_user}/reset-password', [UserController::class, 'resetPassword']); // #37
        });

        // Super Admin - detail user by ID (harus setelah users/mahasiswa/{nim})
        Route::get('users/{id}', [UserController::class, 'show'])->middleware('role:1');             // #36

        // Super Admin + Admin Akademik + Admin Mahasiswa (1,2,4)
        Route::middleware('role:1,2,4')->group(function () {
            Route::get('mahasiswa', [UserController::class, 'mahasiswa']);                          // #34
            Route::get('dosen', [UserController::class, 'dosen']);                                  // #47
        });

        // Admin Akademik - all mahasiswa nilai (role = 2)
        Route::middleware('role:2')->group(function () {
            Route::get('nilais/mahasiswa', [NilaiController::class, 'allMahasiswa']);          // #12
        });

        // Admin Pegawai & Dosen (3,7)
        Route::middleware('role:3,7')->group(function () {
            Route::post('nilais', [NilaiController::class, 'store']);                          // #14
            Route::put('pertemuan/{id_mahasiswa_mk}', [MahasiswaKelasMkController::class, 'updatePertemuan']); // #16
            Route::get('jadwal', [JadwalController::class, 'index']);                          // #38
            Route::get('jadwal/{id}', [JadwalController::class, 'show']);                      // #39
            Route::get('dosen/kelas', [KelasController::class, 'dosenKelas']);                  // #46
        });

        // Dosen only (7) - jadwal + materi + presensi
        Route::middleware('role:7')->group(function () {
            Route::get('dosen/jadwal-materi', [JadwalController::class, 'jadwalMateri']);       // #62
            Route::put('dosen/jadwal/{id}/ruang', [JadwalController::class, 'updateRuang']);     // #65
        });

        // Admin Pegawai only (3) - CRUD jadwal
        Route::middleware('role:3')->group(function () {
            Route::post('dosen/register', [UserController::class, 'registerDosen']);               // #50
            Route::post('jadwal', [JadwalController::class, 'store']);                          // #40
            Route::put('jadwal/{id}', [JadwalController::class, 'update']);                     // #41
            Route::delete('jadwal/{id}', [JadwalController::class, 'destroy']);                  // #42
        });

        // Super Admin + Admin Akademik + Admin Pegawai + Dosen (1,2,3,7) — Materi & Batch Presensi
        Route::middleware('role:1,2,3,7')->group(function () {
            Route::get('jadwal/{jadwalId}/materi', [MateriController::class, 'index']);              // #55
            Route::get('jadwal/{jadwalId}/materi/{pertemuanKe}', [MateriController::class, 'show']); // #56
            Route::put('jadwal/{jadwalId}/materi/{pertemuanKe}', [MateriController::class, 'update']); // #57
            Route::post('jadwal/{jadwalId}/materi/{pertemuanKe}/upload', [MateriController::class, 'upload']); // #58
            Route::delete('jadwal/{jadwalId}/materi/{pertemuanKe}/file', [MateriController::class, 'deleteFile']); // #59
            Route::get('materi/download/{id}', [MateriController::class, 'download']);              // #60

            Route::post('jadwal/{jadwalId}/pertemuan/{pertemuanKe}/presensi', [JadwalController::class, 'batchPresensi']); // #61
        });

        // Mahasiswa sendiri + Admin Akademik + Admin Mahasiswa (2,4,6) - self-access check di controller
        Route::middleware('role:2,4,6')->group(function () {
            Route::get('nilais/mahasiswa/{user_id}', [NilaiController::class, 'byMahasiswa']); // #13
            Route::get('mahasiswa/{user_id}/khs', [KHSController::class, 'show']);             // #15
        });

        // Admin Akademik + Admin Mahasiswa + Dosen + Mahasiswa (2,4,6,7) - view mata kuliah
        Route::middleware('role:2,4,6,7')->group(function () {
            Route::get('mata-kuliah', [MataKuliahController::class, 'index']);                 // #21
            Route::get('mata-kuliah/{id_mk}', [MataKuliahController::class, 'show']);          // #22
        });

        // Admin Akademik + Admin Mahasiswa + Dosen + Mahasiswa (2,4,6,7) - self-access di controller
        Route::middleware('role:2,4,6,7')->group(function () {
            Route::get('mahasiswa-kelas/{id}', [MahasiswaKelasMkController::class, 'show']);   // #26
        });
    });
});
