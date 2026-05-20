<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasRequest;
use App\Models\Kelas;
use App\Models\MahasiswaKelasMk;

class KelasController extends Controller
{
    /**
     * Menampilkan seluruh data kelas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $kelas = Kelas::with(['prodi', 'tahunAkademik'])->get();

        return response()->json($kelas);
    }

    /**
     * Menampilkan detail satu kelas.
     *
     * @param int $id_kelas
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id_kelas)
    {
        $kelas = Kelas::with(['prodi', 'tahunAkademik'])->findOrFail($id_kelas);

        return response()->json($kelas);
    }

    /**
     * Menampilkan daftar mahasiswa di kelas tersebut (dari tabel mahasiswa_kelas_mk).
     *
     * @param int $id_kelas
     * @return \Illuminate\Http\JsonResponse
     */
    public function mahasiswa($id_kelas)
    {
        $data = MahasiswaKelasMk::with(['mahasiswa', 'mataKuliah'])
            ->where('id_kelas', $id_kelas)
            ->get();

        return response()->json($data);
    }

    /**
     * Menambahkan kelas.
     *
     * @param KelasRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam tahun_akademik_id int required Example: 20252
     * @bodyParam prodi_id int nullable Example: 3
     * @bodyParam kode_kelas string nullable Example: TI-2A
     * @bodyParam nama_kelas string required Example: Teknik Informatika 2A
     * @bodyParam kapasitas_mahasiswa int optional Example: 40
     * @bodyParam status string required Example: aktif
     * @bodyParam keterangan string nullable Example: Kelas semester genap
     */
    public function store(KelasRequest $request)
    {
        $kelas = Kelas::create($request->validated());

        return response()->json([
            'message' => 'Kelas created successfully',
            'data' => $kelas,
        ], 201);
    }

    /**
     * Mengubah data kelas.
     *
     * @param KelasRequest $request
     * @param int $id_kelas
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam tahun_akademik_id int required Example: 20252
     * @bodyParam prodi_id int nullable Example: 3
     * @bodyParam kode_kelas string nullable Example: TI-2A
     * @bodyParam nama_kelas string required Example: Teknik Informatika 2A
     * @bodyParam kapasitas_mahasiswa int optional Example: 40
     * @bodyParam status string required Example: aktif
     * @bodyParam keterangan string nullable Example: Kelas semester genap
     */
    public function update(KelasRequest $request, $id_kelas)
    {
        $kelas = Kelas::findOrFail($id_kelas);
        $kelas->update($request->validated());

        return response()->json([
            'message' => 'Kelas updated successfully',
            'data' => $kelas->load(['prodi', 'tahunAkademik']),
        ]);
    }
}
