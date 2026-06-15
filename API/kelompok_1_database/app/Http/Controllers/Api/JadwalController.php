<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BatchPresensiRequest;
use App\Http\Requests\JadwalRequest;
use App\Models\Jadwal;
use App\Models\MahasiswaKelasMk;
use App\Models\Nilai;

class JadwalController extends Controller
{
    /**
     * Menampilkan seluruh data jadwal.
     * Dosen hanya melihat jadwal miliknya sendiri.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = auth()->user();

        $query = Jadwal::with(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik']);

        if ($user->role_id == 7) {
            $query->where('dosen_id', $user->id);
        }

        return response()->json($query->get());
    }

    /**
     * Menampilkan detail satu jadwal beserta daftar mahasiswa terdaftar.
     * Dosen hanya bisa melihat detail jadwal miliknya sendiri.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = auth()->user();
        $jadwal = Jadwal::with(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik'])->findOrFail($id);

        if ($user->role_id == 7 && $jadwal->dosen_id !== $user->id) {
            return response()->json([
                'message' => 'Anda hanya bisa melihat jadwal milik sendiri',
            ], 403);
        }

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

    /**
     * Batch update presensi untuk satu pertemuan pada satu jadwal.
     *
     * @bodyParam pertemuan_ke int required Example: 1
     * @bodyParam presensi array required Array of { id_mahasiswa_mk, status }
     */
    public function batchPresensi(BatchPresensiRequest $request, $jadwalId, $pertemuanKe)
    {
        $jadwal = Jadwal::findOrFail($jadwalId);

        $col = 'p' . $pertemuanKe;

        $updated = 0;
        foreach ($request->presensi as $item) {
            $affected = MahasiswaKelasMk::where('id_mahasiswa_mk', $item['id_mahasiswa_mk'])
                ->where('mata_kuliah_id', $jadwal->mata_kuliah_id)
                ->where('id_kelas', $jadwal->id_kelas)
                ->update([$col => $item['status']]);
            $updated += $affected;
        }

        return response()->json([
            'message' => 'Presensi updated successfully',
            'updated' => $updated,
        ]);
    }

    /**
     * Menampilkan jadwal + materi 16 pertemuan + presensi mahasiswa
     * untuk dosen yang sedang login.
     *
     * Query param opsional: ?tahun_akademik_id=20261
     */
    public function jadwalMateri()
    {
        $user = auth()->user();
        $tahunAkademikId = request('tahun_akademik_id');

        $query = Jadwal::with([
            'mataKuliah:id_mk,nama_mk,sks,prodi_id',
            'mataKuliah.prodi:id,nama_prodi',
            'kelas:id,nama_kelas',
            'tahunAkademik:id,tahun_akademik',
            'materiPertemuan' => fn($q) => $q->orderBy('pertemuan_ke'),
        ])->where('dosen_id', $user->id);

        if ($tahunAkademikId) {
            $query->where('tahun_akademik_id', $tahunAkademikId);
        }

        $jadwals = $query->get();

        $result = $jadwals->map(function ($jadwal) {
            $mahasiswaList = MahasiswaKelasMk::with('mahasiswa:id,name,nomor_identitas')
                ->where('mata_kuliah_id', $jadwal->mata_kuliah_id)
                ->where('id_kelas', $jadwal->id_kelas)
                ->whereNotNull('nim')
                ->get();

            $pertemuan = collect(range(1, 16))->map(function ($ke) use ($jadwal, $mahasiswaList) {
                $materi = $jadwal->materiPertemuan->firstWhere('pertemuan_ke', $ke);
                $col = 'p' . $ke;

                return [
                    'pertemuan_ke' => $ke,
                    'topik_materi' => $materi->topik_materi ?? null,
                    'deskripsi'    => $materi->deskripsi ?? null,
                    'file_path'    => $materi->file_path ?? null,
                    'file_name'    => $materi->file_name ?? null,
                    'file_type'    => $materi->file_type ?? null,
                    'presensi'     => $mahasiswaList->map(fn($m) => [
                        'id_mahasiswa_mk' => $m->id_mahasiswa_mk,
                        'nim'             => $m->nim,
                        'nama'            => $m->mahasiswa->name ?? null,
                        'status'          => $m->$col,
                    ])->values(),
                ];
            });

            return [
                'id'             => $jadwal->id,
                'hari'           => $jadwal->hari,
                'jam_mulai'      => $jadwal->jam_mulai ? $jadwal->jam_mulai->format('H:i') : null,
                'jam_selesai'    => $jadwal->jam_selesai ? $jadwal->jam_selesai->format('H:i') : null,
                'ruang'          => $jadwal->ruang,
                'mata_kuliah'    => $jadwal->mataKuliah,
                'kelas'          => $jadwal->kelas,
                'tahun_akademik' => $jadwal->tahunAkademik,
                'pertemuan'      => $pertemuan,
            ];
        });

        return response()->json($result);
    }

    /**
     * Dosen mengubah ruang kelas pada jadwal miliknya.
     */
    public function updateRuang($id)
    {
        $user = auth()->user();
        $jadwal = Jadwal::findOrFail($id);

        if ($jadwal->dosen_id !== $user->id) {
            return response()->json([
                'message' => 'Anda hanya bisa mengubah ruang pada jadwal milik sendiri',
            ], 403);
        }

        request()->validate([
            'ruang' => 'nullable|string|max:50',
        ]);

        $jadwal->update(['ruang' => request('ruang')]);

        return response()->json([
            'message' => 'Ruang berhasil diubah',
            'data'    => $jadwal->load(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik']),
        ]);
    }
}
