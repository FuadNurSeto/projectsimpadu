<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KHS;
use App\Models\Nilai;

class KHSController extends Controller
{
    /**
     * Menampilkan KHS. Gabungkan tabel k_h_s (IP Semester/Kumulatif) dengan tabel nilais untuk detail nilai.
     * Hanya mahasiswa yang bersangkutan atau Admin Akademik yang bisa mengakses.
     *
     * @param int $user_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($user_id)
    {
        $this->authorizeSelfOrAdmin($user_id);

        $khs = KHS::with('tahunAkademik')
            ->where('user_id', $user_id)
            ->get();

        $nilais = Nilai::with(['mataKuliah', 'kelas'])
            ->where('user_id', $user_id)
            ->get();

        return response()->json([
            'khs' => $khs,
            'nilai' => $nilais,
        ]);
    }

    private function authorizeSelfOrAdmin(int $resourceUserId): void
    {
        $authUser = auth()->user();

        if ($authUser->role_id != 2 && $authUser->id != $resourceUserId) {
            abort(403, 'Forbidden: Anda hanya dapat mengakses data milik Anda sendiri.');
        }
    }
}
