<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NilaiRequest;
use App\Models\Nilai;

class NilaiController extends Controller
{
    /**
     * Menampilkan semua nilai matakuliah dari seluruh mahasiswa.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function allMahasiswa()
    {
        $nilais = Nilai::with(['user', 'mataKuliah', 'kelas'])->get();

        return response()->json($nilais);
    }

    /**
     * Menampilkan semua nilai matakuliah dari satu mahasiswa.
     * Hanya mahasiswa yang bersangkutan atau Admin Akademik yang bisa mengakses.
     *
     * @param int $user_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function byMahasiswa($user_id)
    {
        $this->authorizeSelfOrAdmin($user_id);

        $nilais = Nilai::with(['mataKuliah', 'kelas'])
            ->where('user_id', $user_id)
            ->get();

        return response()->json($nilais);
    }

    /**
     * Menambahkan Nilai Mahasiswa.
     *
     * @param NilaiRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam user_id int required Example: 15
     * @bodyParam mata_kuliah_id int required Example: 5
     * @bodyParam kelas_id int required Example: 1
     * @bodyParam nilai_akhir float required Example: 88.00
     * @bodyParam grade string nullable Example: A
     * @bodyParam keterangan string nullable Example: Lulus
     */
    public function store(NilaiRequest $request)
    {
        $nilai = Nilai::create($request->validated());

        return response()->json([
            'message' => 'Nilai created successfully',
            'data' => $nilai->load(['user', 'mataKuliah', 'kelas']),
        ], 201);
    }

    private function authorizeSelfOrAdmin(int $resourceUserId): void
    {
        $authUser = auth()->user();

        if ($authUser->role_id != 2 && $authUser->id != $resourceUserId) {
            abort(403, 'Forbidden: Anda hanya dapat mengakses data milik Anda sendiri.');
        }
    }
}
