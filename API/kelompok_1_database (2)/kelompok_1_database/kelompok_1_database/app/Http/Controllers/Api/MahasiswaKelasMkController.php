<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MahasiswaKelasMkRequest;
use App\Http\Requests\PertemuanRequest;
use App\Models\MahasiswaKelasMk;

class MahasiswaKelasMkController extends Controller
{
    /**
     * Menampilkan seluruh data plotting mahasiswa, kelas, beserta mata kuliahnya.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $data = MahasiswaKelasMk::with(['mataKuliah', 'dosen', 'kelas', 'mahasiswa'])->get();

        return response()->json($data);
    }

    /**
     * Menampilkan detail satu baris data plotting berdasarkan id primary key.
     * Mahasiswa hanya bisa melihat datanya sendiri.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $record = MahasiswaKelasMk::with(['mataKuliah', 'dosen', 'kelas', 'mahasiswa'])
            ->findOrFail($id);

        $authUser = auth()->user();

        if ($authUser->role_id == 6 && $record->nim !== $authUser->nomor_identitas) {
            abort(403, 'Forbidden: Anda hanya dapat mengakses data milik Anda sendiri.');
        }

        return response()->json($record);
    }

    /**
     * Mendaftarkan mahasiswa ke sebuah kelas dan mata kuliah (Plotting manual).
     *
     * @param MahasiswaKelasMkRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam mata_kuliah_id int required Example: 5
     * @bodyParam dosen_id int required Example: 8
     * @bodyParam id_kelas int required Example: 1
     * @bodyParam nim string required Example: C00002
     * @bodyParam status_id string required Example: aktif
     */
    public function store(MahasiswaKelasMkRequest $request)
    {
        $record = MahasiswaKelasMk::create($request->validated());

        return response()->json([
            'message' => 'Mahasiswa plotted successfully',
            'data' => $record->load(['mataKuliah', 'dosen', 'kelas', 'mahasiswa']),
        ], 201);
    }

    /**
     * Mengubah data plotting jika terjadi kesalahan input.
     *
     * @param MahasiswaKelasMkRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam mata_kuliah_id int required Example: 5
     * @bodyParam dosen_id int required Example: 10
     * @bodyParam id_kelas int required Example: 2
     * @bodyParam nim string required Example: C00002
     * @bodyParam status_id string required Example: aktif
     */
    public function update(MahasiswaKelasMkRequest $request, $id)
    {
        $record = MahasiswaKelasMk::findOrFail($id);
        $record->update($request->validated());

        return response()->json([
            'message' => 'Plotting updated successfully',
            'data' => $record->load(['mataKuliah', 'dosen', 'kelas', 'mahasiswa']),
        ]);
    }

    /**
     * Membatalkan/menghapus mahasiswa dari kelas atau mata kuliah tersebut (Batal Plotting).
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $record = MahasiswaKelasMk::findOrFail($id);
        $record->delete();

        return response()->json(['message' => 'Plotting deleted successfully']);
    }

    /**
     * Mengupdate isi pertemuan di tabel mahasiswa_kelas_mk.
     *
     * @param PertemuanRequest $request
     * @param int $id_mahasiswa_mk
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam p1 string nullable Example: H
     * @bodyParam p2 string nullable Example: A
     * @bodyParam p3 string nullable
     * @bodyParam p4 string nullable
     * @bodyParam p5 string nullable
     * @bodyParam p6 string nullable
     * @bodyParam p7 string nullable
     * @bodyParam p8 string nullable
     * @bodyParam p9 string nullable
     * @bodyParam p10 string nullable
     * @bodyParam p11 string nullable
     * @bodyParam p12 string nullable
     * @bodyParam p13 string nullable
     * @bodyParam p14 string nullable
     * @bodyParam p15 string nullable
     * @bodyParam p16 string nullable
     * @bodyParam status_id string required Example: aktif
     */
    public function updatePertemuan(PertemuanRequest $request, $id_mahasiswa_mk)
    {
        $record = MahasiswaKelasMk::findOrFail($id_mahasiswa_mk);
        $record->update($request->validated());

        return response()->json([
            'message' => 'Pertemuan updated successfully',
            'data' => $record,
        ]);
    }
}
