<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KHS;
use App\Models\Nilai;
use App\Models\User;

class KHSController extends Controller
{
    /**
     * Menampilkan KHS per semester. Gabungkan tabel k_h_s dengan tabel nilais untuk detail nilai.
     * Hanya mahasiswa yang bersangkutan atau Admin Akademik yang bisa mengakses.
     *
     * @param int $user_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($user_id)
    {
        $this->authorizeSelfOrAdmin($user_id);

        $user = User::findOrFail($user_id);
        $namaMahasiswa = $user->name;

        $khsList = KHS::with('tahunAkademik')
            ->where('user_id', $user_id)
            ->orderBy('semester_mahasiswa')
            ->get();

        $result = [];

        foreach ($khsList as $khs) {
            $nilais = Nilai::with(['mataKuliah', 'kelas'])
                ->where('user_id', $user_id)
                ->whereHas('kelas', function ($q) use ($khs) {
                    $q->where('tahun_akademik_id', $khs->tahun_akademik_id);
                })
                ->get();

            $detailNilai = $nilais->map(function ($n) {
                return [
                    'id_mk' => $n->mataKuliah->id_mk ?? null,
                    'nama_mk' => $n->mataKuliah->nama_mk ?? null,
                    'grade' => $n->grade,
                ];
            })->toArray();

            $result[] = [
                'nama_mahasiswa' => $namaMahasiswa,
                'tahun_akademik' => $khs->tahunAkademik->tahun_akademik ?? null,
                'semester_khs' => $khs->semester_mahasiswa,
                'ip_semester' => $khs->ip_kumulatif,
                'detail_nilai' => $detailNilai,
            ];
        }

        return response()->json($result);
    }

    private function authorizeSelfOrAdmin(int $resourceUserId): void
    {
        $authUser = auth()->user();

        if ($authUser->role_id != 2 && $authUser->id != $resourceUserId) {
            abort(403, 'Forbidden: Anda hanya dapat mengakses data milik Anda sendiri.');
        }
    }
}
