<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JurusanController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\KHSController;
use App\Http\Controllers\Api\MahasiswaKelasMkController;
use App\Http\Controllers\Api\MataKuliahController;
use App\Http\Controllers\Api\NilaiController;
use App\Http\Controllers\Api\ProdiController;
use App\Http\Controllers\Api\TahunAkademikController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('akademik')->group(function () {

    // #4 - Public login
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('jwt.auth')->group(function () {

        // SUPER ADMIN only (role_id = 1)
        Route::middleware('role:1')->group(function () {
            Route::get('users', [UserController::class, 'index']);                     // #1
            Route::post('register', [AuthController::class, 'register']);               // #2
            Route::put('users/{id_user}', [UserController::class, 'updateRole']);       // #3
        });

        // Admin (kecuali mahasiswa: 1,2,3,4,5,7)
        Route::middleware('role:1,2,3,4,5,7')->group(function () {
            Route::get('tahun-akademik', [TahunAkademikController::class, 'index']);   // #5
            Route::get('kelas', [KelasController::class, 'index']);                     // #7
            Route::get('kelas/{id_kelas}', [KelasController::class, 'show']);           // #8
        });

        // Dosen & Admin Akademik (2,7)
        Route::middleware('role:2,7')->group(function () {
            Route::get('kelas/{id_kelas}/mahasiswa', [KelasController::class, 'mahasiswa']);  // #9
            Route::get('mahasiswa-kelas', [MahasiswaKelasMkController::class, 'index']);      // #25
        });

        // Admin Akademik only (role_id = 2)
        Route::middleware('role:2')->group(function () {
            Route::post('tahun-akademik', [TahunAkademikController::class, 'store']);         // #6
            Route::post('kelas', [KelasController::class, 'store']);                           // #10
            Route::put('kelas/{id_kelas}', [KelasController::class, 'update']);                // #11

            Route::get('jurusan', [JurusanController::class, 'index']);                        // #17
            Route::post('jurusan', [JurusanController::class, 'store']);                       // #18
            Route::get('jurusan/{jurusan_id}/prodis', [ProdiController::class, 'byJurusan']);  // #19
            Route::post('prodis', [ProdiController::class, 'store']);                          // #20

            Route::post('mata-kuliah', [MataKuliahController::class, 'store']);                // #23
            Route::put('mata-kuliah/{id_mk}', [MataKuliahController::class, 'update']);        // #24

            Route::post('mahasiswa-kelas', [MahasiswaKelasMkController::class, 'store']);      // #27
            Route::put('mahasiswa-kelas/{id}', [MahasiswaKelasMkController::class, 'update']); // #28
            Route::delete('mahasiswa-kelas/{id}', [MahasiswaKelasMkController::class, 'destroy']); // #29
        });

        // Super Admin + Admin Akademik + Admin Keuangan (1,2,5)
        Route::middleware('role:1,2,5')->group(function () {
            Route::get('users/mahasiswa/{nim}', [UserController::class, 'showByNim']);              // #30
            Route::get('prodis', [ProdiController::class, 'index']);                                // #31
            Route::get('tahun-akademik/aktif', [TahunAkademikController::class, 'aktif']);          // #32
        });

        // Super Admin + Admin Mahasiswa (1,4)
        Route::middleware('role:1,4')->group(function () {
            Route::post('mahasiswa/register', [UserController::class, 'registerMahasiswa']);        // #33
            Route::put('mahasiswa/{id_user}/status', [UserController::class, 'updateMahasiswaStatus']); // #35
        });

        // Super Admin + Admin Akademik + Admin Mahasiswa (1,2,4)
        Route::middleware('role:1,2,4')->group(function () {
            Route::get('mahasiswa', [UserController::class, 'mahasiswa']);                          // #34
        });

        // Admin Akademik - all mahasiswa nilai (role = 2)
        Route::middleware('role:2')->group(function () {
            Route::get('nilais/mahasiswa', [NilaiController::class, 'allMahasiswa']);          // #12
        });

        // Admin Pegawai & Dosen (3,7)
        Route::middleware('role:3,7')->group(function () {
            Route::post('nilais', [NilaiController::class, 'store']);                          // #14
            Route::put('pertemuan/{id_mahasiswa_mk}', [MahasiswaKelasMkController::class, 'updatePertemuan']); // #16
        });

        // Mahasiswa sendiri + Admin Akademik (2,6) - self-access check di controller
        Route::middleware('role:2,6')->group(function () {
            Route::get('nilais/mahasiswa/{user_id}', [NilaiController::class, 'byMahasiswa']); // #13
            Route::get('mahasiswa/{user_id}/khs', [KHSController::class, 'show']);             // #15
        });

        // Admin Akademik + Dosen + Mahasiswa (2,6,7) - view mata kuliah
        Route::middleware('role:2,6,7')->group(function () {
            Route::get('mata-kuliah', [MataKuliahController::class, 'index']);                 // #21
            Route::get('mata-kuliah/{id_mk}', [MataKuliahController::class, 'show']);          // #22
        });

        // Admin Akademik + Dosen + Mahasiswa (2,6,7) - self-access di controller
        Route::middleware('role:2,6,7')->group(function () {
            Route::get('mahasiswa-kelas/{id}', [MahasiswaKelasMkController::class, 'show']);   // #26
        });
    });
});
