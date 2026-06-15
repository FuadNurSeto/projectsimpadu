<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MataKuliahRequest;
use App\Models\MataKuliah;

class MataKuliahController extends Controller
{
    /**
     * Menampilkan daftar mata kuliah.
     * Query param: ?tahun_akademik_id=20261 (wajib untuk mahasiswa / role 6)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = auth()->user();
        $tahunAkademikId = request('tahun_akademik_id');

        // Mahasiswa (role 6) wajib menyertakan tahun_akademik_id
        if ($user->role_id == 6 && ! $tahunAkademikId) {
            return response()->json([
                'message' => 'Parameter tahun_akademik_id wajib diisi',
            ], 422);
        }

        $query = MataKuliah::with('prodi');

        if ($tahunAkademikId) {
            $query->whereHas('jadwals', function ($q) use ($tahunAkademikId) {
                $q->where('tahun_akademik_id', $tahunAkademikId);
            });
        }

        // Mahasiswa hanya melihat matakuliah yang dia ambil di tahun akademik tersebut
        if ($user->role_id == 6) {
            $query->whereHas('mahasiswaKelasMk', function ($q) use ($user, $tahunAkademikId) {
                $q->where('nim', $user->nomor_identitas)
                  ->whereHas('kelas', function ($q2) use ($tahunAkademikId) {
                      $q2->where('tahun_akademik_id', $tahunAkademikId);
                  });
            });
        }

        if (request('search')) {
            $query->where('nama_mk', 'like', '%' . request('search') . '%');
        }

        return response()->json($query->get());
    }

    /**
     * Menampilkan detail satu mata kuliah.
     * Mahasiswa hanya bisa melihat matakuliah yang dia ambil.
     *
     * @param int $id_mk
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id_mk)
    {
        $user = auth()->user();
        $mataKuliah = MataKuliah::with('prodi')->findOrFail($id_mk);

        if ($user->role_id == 6) {
            $enrolled = $mataKuliah->mahasiswaKelasMk()
                ->where('nim', $user->nomor_identitas)
                ->exists();

            if (! $enrolled) {
                return response()->json([
                    'message' => 'Anda tidak terdaftar di mata kuliah ini',
                ], 403);
            }
        }

        return response()->json($mataKuliah);
    }

    /**
     * Menambahkan data mata kuliah baru.
     *
     * @param MataKuliahRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam prodi_id int required Example: 3
     * @bodyParam nama_mk string required Example: Pemrograman Web Backend
     * @bodyParam semester int required Example: 4
     * @bodyParam sks int required Example: 3
     * @bodyParam status string required Example: aktif
     */
    public function store(MataKuliahRequest $request)
    {
        $mataKuliah = MataKuliah::create($request->validated());

        return response()->json([
            'message' => 'Mata kuliah created successfully',
            'data' => $mataKuliah->load('prodi'),
        ], 201);
    }

    /**
     * Mengubah informasi mata kuliah.
     *
     * @param MataKuliahRequest $request
     * @param int $id_mk
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam prodi_id int required Example: 3
     * @bodyParam nama_mk string required Example: Pemrograman Aplikasi Backend & API
     * @bodyParam semester int required Example: 4
     * @bodyParam sks int required Example: 4
     * @bodyParam status string required Example: aktif
     */
    public function update(MataKuliahRequest $request, $id_mk)
    {
        $mataKuliah = MataKuliah::findOrFail($id_mk);
        $mataKuliah->update($request->validated());

        return response()->json([
            'message' => 'Mata kuliah updated successfully',
            'data' => $mataKuliah->load('prodi'),
        ]);
    }
}
