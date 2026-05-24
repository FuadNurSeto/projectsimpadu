<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JadwalRequest;
use App\Models\Jadwal;
use App\Models\MahasiswaKelasMk;
use App\Models\Nilai;

class JadwalController extends Controller
{
    /**
     * Menampilkan seluruh data jadwal.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $jadwal = Jadwal::with(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik'])->get();

        return response()->json($jadwal);
    }

    /**
     * Menampilkan detail satu jadwal beserta daftar mahasiswa terdaftar.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $jadwal = Jadwal::with(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik'])->findOrFail($id);

        $mahasiswa = MahasiswaKelasMk::with('mahasiswa')
            ->where('mata_kuliah_id', $jadwal->mata_kuliah_id)
            ->where('id_kelas', $jadwal->id_kelas)
            ->get()
            ->map(function ($m) use ($jadwal) {
                $nilai = Nilai::where('user_id', $m->mahasiswa->id ?? 0)
                    ->where('mata_kuliah_id', $jadwal->mata_kuliah_id)
                    ->where('kelas_id', $jadwal->id_kelas)
                    ->first();

                return [
                    'id_mahasiswa_mk' => $m->id_mahasiswa_mk,
                    'nim' => $m->nim,
                    'nama' => $m->mahasiswa->name ?? null,
                    'status_id' => $m->status_id,
                    'absensi' => [
                        'p1' => $m->p1, 'p2' => $m->p2, 'p3' => $m->p3, 'p4' => $m->p4,
                        'p5' => $m->p5, 'p6' => $m->p6, 'p7' => $m->p7, 'p8' => $m->p8,
                        'p9' => $m->p9, 'p10' => $m->p10, 'p11' => $m->p11, 'p12' => $m->p12,
                        'p13' => $m->p13, 'p14' => $m->p14, 'p15' => $m->p15, 'p16' => $m->p16,
                    ],
                    'nilai_akhir' => $nilai->nilai_akhir ?? null,
                    'grade' => $nilai->grade ?? null,
                    'keterangan' => $nilai->keterangan ?? null,
                ];
            });

        return response()->json([
            'jadwal' => $jadwal,
            'mahasiswa' => $mahasiswa,
        ]);
    }

    /**
     * Menambahkan jadwal baru.
     *
     * @param JadwalRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam mata_kuliah_id int required Example: 5
     * @bodyParam dosen_id int required Example: 8
     * @bodyParam id_kelas int required Example: 1
     * @bodyParam tahun_akademik_id int required Example: 20252
     * @bodyParam hari string required Example: Senin
     * @bodyParam jam_mulai string required Example: 08:00
     * @bodyParam jam_selesai string required Example: 10:00
     */
    public function store(JadwalRequest $request)
    {
        $jadwal = Jadwal::create($request->validated());

        return response()->json([
            'message' => 'Jadwal created successfully',
            'data' => $jadwal->load(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik']),
        ], 201);
    }

    /**
     * Mengubah data jadwal.
     *
     * @param JadwalRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(JadwalRequest $request, $id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $jadwal->update($request->validated());

        return response()->json([
            'message' => 'Jadwal updated successfully',
            'data' => $jadwal->load(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik']),
        ]);
    }

    /**
     * Menghapus jadwal.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $jadwal->delete();

        return response()->json(['message' => 'Jadwal deleted successfully']);
    }
}
