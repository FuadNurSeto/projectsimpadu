<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasRequest;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\MahasiswaKelas;
use App\Models\MahasiswaKelasMk;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class KelasController extends Controller
{
    /**
     * Menampilkan seluruh data kelas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $query = Kelas::with(['prodi', 'tahunAkademik'])
            ->withCount(['mahasiswaKelasMk as jumlah_mahasiswa' => function ($q) {
                $q->select(DB::raw('count(distinct nim)'));
            }]);

        if (request('tahun_akademik_id')) {
            $query->where('tahun_akademik_id', request('tahun_akademik_id'));
        }

        if (request('search')) {
            $query->where('nama_kelas', 'like', '%' . request('search') . '%');
        }

        return response()->json($query->get());
    }

    /**
     * Menampilkan detail satu kelas beserta daftar mahasiswa terdaftar.
     *
     * @param int $id_kelas
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id_kelas)
    {
        $kelas = Kelas::with(['prodi', 'tahunAkademik'])->findOrFail($id_kelas);
        $kelas->loadCount(['mahasiswaKelasMk as jumlah_mahasiswa' => function ($query) {
            $query->select(DB::raw('count(distinct nim)'));
        }]);

        $daftarMahasiswa = MahasiswaKelas::with('mahasiswa')
            ->where('kelas_id', $id_kelas)
            ->where('tahun_akademik_id', $kelas->tahun_akademik_id)
            ->where('status', 'aktif')
            ->get()
            ->map(function ($mk) {
                return [
                    'id' => $mk->mahasiswa->id ?? null,
                    'name' => $mk->mahasiswa->name ?? null,
                    'nim' => $mk->mahasiswa->nomor_identitas ?? null,
                    'email' => $mk->mahasiswa->email ?? null,
                    'prodi_id' => $mk->mahasiswa->prodi_id ?? null,
                    'semester_id' => $mk->mahasiswa->semester_id ?? null,
                    'tanggal_daftar' => $mk->tanggal_daftar,
                ];
            });

        $dosenPengajar = Jadwal::with(['dosen:id,name,nomor_identitas', 'mataKuliah:id_mk,nama_mk,sks'])
            ->where('id_kelas', $id_kelas)
            ->where('tahun_akademik_id', $kelas->tahun_akademik_id)
            ->get()
            ->map(function ($j) {
                return [
                    'id_jadwal'   => $j->id,
                    'dosen'       => $j->dosen,
                    'mata_kuliah' => $j->mataKuliah,
                    'hari'        => $j->hari,
                    'jam_mulai'   => $j->jam_mulai ? $j->jam_mulai->format('H:i') : null,
                    'jam_selesai' => $j->jam_selesai ? $j->jam_selesai->format('H:i') : null,
                    'ruang'       => $j->ruang,
                ];
            });

        return response()->json([
            'kelas'          => $kelas,
            'mahasiswa'      => $daftarMahasiswa,
            'dosen_pengajar' => $dosenPengajar,
        ]);
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
            'data' => $kelas->load(['prodi', 'tahunAkademik'])
                ->loadCount(['mahasiswaKelasMk as jumlah_mahasiswa' => function ($query) {
                    $query->select(DB::raw('count(distinct nim)'));
                }]),
        ]);
    }

    /**
     * Menampilkan kelas yang diajar oleh dosen yang sedang login.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function dosenKelas()
    {
        $dosenId = auth()->id();

        $kelasIds = MahasiswaKelasMk::where('dosen_id', $dosenId)
            ->distinct()
            ->pluck('id_kelas');

        $kelas = Kelas::with(['prodi', 'tahunAkademik'])
            ->whereIn('id', $kelasIds)
            ->withCount(['mahasiswaKelasMk as jumlah_mahasiswa' => function ($query) {
                $query->select(DB::raw('count(distinct nim)'));
            }])
            ->get();

        return response()->json($kelas);
    }

    public function bebanMengajar()
    {
        $data = MahasiswaKelasMk::select(
                'dosen_id',
                'mata_kuliah_id',
                'id_kelas',
                DB::raw('count(distinct nim) as jumlah_mahasiswa')
            )
            ->with([
                'dosen',
                'mataKuliah.prodi',
                'kelas.prodi',
                'kelas.tahunAkademik',
            ])
            ->groupBy('dosen_id', 'mata_kuliah_id', 'id_kelas')
            ->get()
            ->groupBy('dosen_id')
            ->map(function ($items) {
                $dosen = $items->first()->dosen;

                $mataKuliah = $items->map(function ($item) {
                    return [
                        'id_mk' => $item->mata_kuliah_id,
                        'nama_mk' => $item->mataKuliah->nama_mk,
                        'sks' => $item->mataKuliah->sks,
                        'prodi' => $item->mataKuliah->prodi,
                        'kelas' => $item->kelas,
                        'tahun_akademik' => $item->kelas->tahunAkademik,
                        'jumlah_mahasiswa' => $item->jumlah_mahasiswa,
                    ];
                })->values();

                return [
                    'dosen' => $dosen,
                    'mata_kuliah' => $mataKuliah,
                ];
            })->values();

        return response()->json($data);
    }

    /**
     * Admin Akademik mengassign dosen ke kelas + mata kuliah.
     */
    public function assignDosen($id_kelas)
    {
        $kelas = Kelas::findOrFail($id_kelas);

        request()->validate([
            'mata_kuliah_id'    => 'required|integer|exists:mata_kuliahs,id_mk',
            'dosen_id'          => 'required|integer|exists:users,id',
            'tahun_akademik_id' => 'required|integer|exists:tahun_akademiks,id',
        ]);

        $dosen = User::findOrFail(request('dosen_id'));
        if ($dosen->role_id != 7) {
            return response()->json(['message' => 'dosen_id harus merujuk ke dosen (role_id = 7)'], 422);
        }

        $jadwal = Jadwal::updateOrCreate(
            [
                'mata_kuliah_id'    => request('mata_kuliah_id'),
                'id_kelas'          => $id_kelas,
                'tahun_akademik_id' => request('tahun_akademik_id'),
            ],
            [
                'dosen_id'    => request('dosen_id'),
                'hari'        => null,
                'jam_mulai'   => null,
                'jam_selesai' => null,
                'ruang'       => null,
            ]
        );

        $wasUpdated = ! $jadwal->wasRecentlyCreated;

        return response()->json([
            'message' => $wasUpdated ? 'Dosen berhasil diubah' : 'Dosen berhasil diassign ke kelas',
            'data'    => $jadwal->load(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik']),
        ], $wasUpdated ? 200 : 201);
    }

    /**
     * Admin Akademik mengubah dosen pada jadwal yang sudah ada.
     */
    public function updateDosen($id_kelas, $id)
    {
        Kelas::findOrFail($id_kelas);

        request()->validate([
            'dosen_id' => 'required|integer|exists:users,id',
        ]);

        $dosen = User::findOrFail(request('dosen_id'));
        if ($dosen->role_id != 7) {
            return response()->json(['message' => 'dosen_id harus merujuk ke dosen (role_id = 7)'], 422);
        }

        $jadwal = Jadwal::where('id', $id)
            ->where('id_kelas', $id_kelas)
            ->firstOrFail();

        $jadwal->update(['dosen_id' => request('dosen_id')]);

        return response()->json([
            'message' => 'Dosen berhasil diubah',
            'data'    => $jadwal->load(['mataKuliah', 'dosen', 'kelas', 'tahunAkademik']),
        ]);
    }
}
