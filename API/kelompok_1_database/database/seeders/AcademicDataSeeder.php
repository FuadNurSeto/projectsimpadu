<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AcademicDataSeeder extends Seeder
{
    private array $namaDepan = [
        'Ahmad', 'Siti', 'Budi', 'Dewi', 'Rudi', 'Indah', 'Agus', 'Rina',
        'Hendra', 'Maya', 'Dedi', 'Rizky', 'Putri', 'Bayu', 'Nia', 'Ferdy',
        'Saras', 'Anton', 'Citra', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hadi',
        'Irma', 'Joko', 'Kartika', 'Lukman', 'Mega', 'Novi', 'Oka', 'Pipit',
    ];

    private array $namaBelakang = [
        'Fauzi', 'Nurhaliza', 'Santoso', 'Lestari', 'Hermawan', 'Permata',
        'Setiawan', 'Pratama', 'Marlina', 'Gunawan', 'Sari', 'Kurniawan',
        'Ramadhan', 'Anggraini', 'Saputra', 'Nugroho', 'Wati', 'Hidayat',
        'Purnama', 'Wijaya', 'Kusuma', 'Halim', 'Putra', 'Syahputra',
    ];

    private array $kelasConfig = [
        1  => ['count' => 20, 'nomor_semester' => 2],
        2  => ['count' => 20, 'nomor_semester' => 2],
        3  => ['count' => 15, 'nomor_semester' => 4],
        4  => ['count' => 20, 'nomor_semester' => 2],
        5  => ['count' => 15, 'nomor_semester' => 2],
        6  => ['count' => 15, 'nomor_semester' => 2],
        7  => ['count' => 20, 'nomor_semester' => 2],
        8  => ['count' => 10, 'nomor_semester' => 4],
        9  => ['count' => 15, 'nomor_semester' => 2],
        10 => ['count' => 15, 'nomor_semester' => 2],
        11 => ['count' => 10, 'nomor_semester' => 4],
        12 => ['count' => 10, 'nomor_semester' => 4],
        13 => ['count' => 10, 'nomor_semester' => 4],
        14 => ['count' => 10, 'nomor_semester' => 6],
    ];

    private array $kelasProdiMap = [
        1  => ['prodi_id' => 7, 'jurusan' => 'C'],
        2  => ['prodi_id' => 7, 'jurusan' => 'C'],
        3  => ['prodi_id' => 7, 'jurusan' => 'C'],
        4  => ['prodi_id' => 1, 'jurusan' => 'A'],
        5  => ['prodi_id' => 1, 'jurusan' => 'A'],
        6  => ['prodi_id' => 2, 'jurusan' => 'A'],
        7  => ['prodi_id' => 6, 'jurusan' => 'C'],
        8  => ['prodi_id' => 6, 'jurusan' => 'C'],
        9  => ['prodi_id' => 8, 'jurusan' => 'C'],
        10 => ['prodi_id' => 9, 'jurusan' => 'A'],
        11 => ['prodi_id' => 3, 'jurusan' => 'C'],
        12 => ['prodi_id' => 4, 'jurusan' => 'C'],
        13 => ['prodi_id' => 5, 'jurusan' => 'C'],
        14 => ['prodi_id' => 7, 'jurusan' => 'C'],
    ];

    private array $kelasMkMap = [
        1  => [
            ['mk' => 1,  'dosen_id' => 6],
            ['mk' => 2,  'dosen_id' => 7],
        ],
        2  => [
            ['mk' => 1,  'dosen_id' => 8],
            ['mk' => 19, 'dosen_id' => 9],
        ],
        3  => [
            ['mk' => 3,  'dosen_id' => 10],
            ['mk' => 19, 'dosen_id' => 11],
        ],
        4  => [
            ['mk' => 4,  'dosen_id' => 12],
            ['mk' => 6,  'dosen_id' => 13],
        ],
        5  => [
            ['mk' => 5,  'dosen_id' => 14],
            ['mk' => 18, 'dosen_id' => 15],
        ],
        6  => [
            ['mk' => 7,  'dosen_id' => 16],
            ['mk' => 8,  'dosen_id' => 17],
        ],
        7  => [
            ['mk' => 9,  'dosen_id' => 18],
            ['mk' => 20, 'dosen_id' => 19],
        ],
        8  => [
            ['mk' => 9,  'dosen_id' => 20],
            ['mk' => 20, 'dosen_id' => 21],
        ],
        9  => [
            ['mk' => 10, 'dosen_id' => 22],
            ['mk' => 11, 'dosen_id' => 23],
        ],
        10 => [
            ['mk' => 16, 'dosen_id' => 24],
            ['mk' => 17, 'dosen_id' => 25],
        ],
        11 => [
            ['mk' => 12, 'dosen_id' => 26],
        ],
        12 => [
            ['mk' => 13, 'dosen_id' => 27],
        ],
        13 => [
            ['mk' => 14, 'dosen_id' => 28],
            ['mk' => 15, 'dosen_id' => 29],
        ],
        14 => [
            ['mk' => 3,  'dosen_id' => 30],
            ['mk' => 19, 'dosen_id' => 31],
        ],
    ];

    public function run(): void
    {
        $tables = [
            'nilais', 'k_h_s', 'mahasiswa_kelas', 'mahasiswa_kelas_mk',
            'jadwals', 'semesters', 'kelas', 'mata_kuliahs', 'prodis', 'jurusans', 'tahun_akademiks',
        ];

        Schema::disableForeignKeyConstraints();

        DB::table('role_user')->where('user_id', '>=', 32)->delete();
        DB::table('users')->where('id', '>=', 32)->delete();

        foreach ($tables as $table) {
            DB::statement("DELETE FROM `{$table}`");
        }

        Schema::enableForeignKeyConstraints();

        if (DB::connection()->getDriverName() === 'sqlite') {
            foreach ($tables as $table) {
                DB::statement("DELETE FROM sqlite_sequence WHERE name = '{$table}'");
            }
        }

        $this->seedJurusans();
        $this->seedProdis();
        $this->seedTahunAkademik();
        $this->seedSemesters();
        $this->seedMataKuliah();
        $this->seedKelas();
        $this->seedMahasiswaDenganKelas();
        $this->seedJadwals();
    }

    private function seedJurusans(): void
    {
        $rows = [
            ['id' => 1, 'nama_jurusan' => 'Administrasi Bisnis', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nama_jurusan' => 'Teknik Elektro',        'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('jurusans')->updateOrInsert(['id' => $row['id']], $row);
        }
    }

    private function seedProdis(): void
    {
        $rows = [
            ['id' => 1, 'jurusan_id' => 1, 'nama_prodi' => 'D3 Administrasi Bisnis',                      'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'jurusan_id' => 1, 'nama_prodi' => 'D4 Bisnis Digital',                            'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'jurusan_id' => 2, 'nama_prodi' => 'D4 Teknologi Rekayasa Pembangkit Energi',      'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'jurusan_id' => 2, 'nama_prodi' => 'D4 Sistem Informasi Kota Cerdas',              'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'jurusan_id' => 2, 'nama_prodi' => 'D4 Teknologi Rekayasa Otomasi',                'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'jurusan_id' => 2, 'nama_prodi' => 'D3 Elektronika',                               'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'jurusan_id' => 2, 'nama_prodi' => 'D3 Teknik Informatika',                        'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'jurusan_id' => 2, 'nama_prodi' => 'D3 Teknik Listrik',                            'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'jurusan_id' => 1, 'nama_prodi' => 'D3 Sistem Informasi',                          'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('prodis')->updateOrInsert(['id' => $row['id']], $row);
        }
    }

    private function seedTahunAkademik(): void
    {
        $rows = [
            ['id' => 20241, 'tahun_akademik' => '2024 ganjil', 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20242, 'tahun_akademik' => '2024 genap',  'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20251, 'tahun_akademik' => '2025 ganjil', 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20252, 'tahun_akademik' => '2025 genap',  'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20261, 'tahun_akademik' => '2026 ganjil', 'status' => 'aktif',    'created_at' => now(), 'updated_at' => now()],
            ['id' => 20262, 'tahun_akademik' => '2026 genap',  'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('tahun_akademiks')->updateOrInsert(['id' => $row['id']], $row);
        }
    }

    private function seedSemesters(): void
    {
        $rows = [
            ['id' => 1,  'tahun_akademik_id' => 20241, 'nomor_semester' => 1, 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2,  'tahun_akademik_id' => 20242, 'nomor_semester' => 2, 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3,  'tahun_akademik_id' => 20251, 'nomor_semester' => 3, 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4,  'tahun_akademik_id' => 20252, 'nomor_semester' => 4, 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5,  'tahun_akademik_id' => 20261, 'nomor_semester' => 5, 'status' => 'aktif',   'created_at' => now(), 'updated_at' => now()],
            ['id' => 6,  'tahun_akademik_id' => 20262, 'nomor_semester' => 6, 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('semesters')->updateOrInsert(['id' => $row['id']], $row);
        }
    }

    private function seedMataKuliah(): void
    {
        $rows = [
            ['id_mk' => 1,  'prodi_id' => 7, 'nama_mk' => 'Algoritma dan Pemrograman',    'sks' => 4, 'semester' => 1, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 2,  'prodi_id' => 7, 'nama_mk' => 'Struktur Data',                 'sks' => 3, 'semester' => 3, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 3,  'prodi_id' => 7, 'nama_mk' => 'Basis Data',                    'sks' => 3, 'semester' => 4, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 4,  'prodi_id' => 1, 'nama_mk' => 'Pengantar Bisnis',              'sks' => 2, 'semester' => 1, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 5,  'prodi_id' => 1, 'nama_mk' => 'Manajemen',                     'sks' => 3, 'semester' => 2, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 6,  'prodi_id' => 1, 'nama_mk' => 'Akuntansi Dasar',               'sks' => 3, 'semester' => 1, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 7,  'prodi_id' => 2, 'nama_mk' => 'Bisnis Digital',                'sks' => 3, 'semester' => 3, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 8,  'prodi_id' => 2, 'nama_mk' => 'E-Commerce',                    'sks' => 3, 'semester' => 4, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 9,  'prodi_id' => 6, 'nama_mk' => 'Elektronika Dasar',             'sks' => 4, 'semester' => 1, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 10, 'prodi_id' => 8, 'nama_mk' => 'Rangkaian Listrik',             'sks' => 3, 'semester' => 2, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 11, 'prodi_id' => 8, 'nama_mk' => 'Instalasi Listrik',             'sks' => 3, 'semester' => 3, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 12, 'prodi_id' => 3, 'nama_mk' => 'Energi Terbarukan',             'sks' => 3, 'semester' => 4, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 13, 'prodi_id' => 4, 'nama_mk' => 'Sistem Informasi Kota',         'sks' => 3, 'semester' => 4, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 14, 'prodi_id' => 5, 'nama_mk' => 'Sistem Kontrol',                'sks' => 3, 'semester' => 5, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 15, 'prodi_id' => 5, 'nama_mk' => 'Otomasi Industri',              'sks' => 4, 'semester' => 6, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 16, 'prodi_id' => 9, 'nama_mk' => 'Sistem Informasi Manajemen',    'sks' => 3, 'semester' => 2, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 17, 'prodi_id' => 9, 'nama_mk' => 'Analisis Sistem',               'sks' => 3, 'semester' => 3, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 18, 'prodi_id' => 1, 'nama_mk' => 'Kewirausahaan',                 'sks' => 2, 'semester' => 5, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 19, 'prodi_id' => 7, 'nama_mk' => 'Pemrograman Web',               'sks' => 3, 'semester' => 5, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id_mk' => 20, 'prodi_id' => 6, 'nama_mk' => 'Mikrokontroler',                'sks' => 3, 'semester' => 3, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('mata_kuliahs')->updateOrInsert(['id_mk' => $row['id_mk']], $row);
        }
    }

    private function seedKelas(): void
    {
        $rows = [
            ['id' => 1,  'tahun_akademik_id' => 20261, 'prodi_id' => 7, 'kode_kelas' => 'TI-2A',  'nama_kelas' => 'Teknik Informatika 2A',   'kapasitas_mahasiswa' => 40, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2,  'tahun_akademik_id' => 20261, 'prodi_id' => 7, 'kode_kelas' => 'TI-2B',  'nama_kelas' => 'Teknik Informatika 2B',   'kapasitas_mahasiswa' => 40, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3,  'tahun_akademik_id' => 20261, 'prodi_id' => 7, 'kode_kelas' => 'TI-4A',  'nama_kelas' => 'Teknik Informatika 4A',   'kapasitas_mahasiswa' => 35, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4,  'tahun_akademik_id' => 20261, 'prodi_id' => 1, 'kode_kelas' => 'AB-2A',  'nama_kelas' => 'Administrasi Bisnis 2A',   'kapasitas_mahasiswa' => 45, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5,  'tahun_akademik_id' => 20261, 'prodi_id' => 1, 'kode_kelas' => 'AB-2B',  'nama_kelas' => 'Administrasi Bisnis 2B',   'kapasitas_mahasiswa' => 45, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6,  'tahun_akademik_id' => 20261, 'prodi_id' => 2, 'kode_kelas' => 'BD-2A',  'nama_kelas' => 'Bisnis Digital 2A',       'kapasitas_mahasiswa' => 40, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7,  'tahun_akademik_id' => 20261, 'prodi_id' => 6, 'kode_kelas' => 'EL-2A',  'nama_kelas' => 'Elektronika 2A',          'kapasitas_mahasiswa' => 35, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8,  'tahun_akademik_id' => 20261, 'prodi_id' => 6, 'kode_kelas' => 'EL-4A',  'nama_kelas' => 'Elektronika 4A',          'kapasitas_mahasiswa' => 30, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9,  'tahun_akademik_id' => 20261, 'prodi_id' => 8, 'kode_kelas' => 'TL-2A',  'nama_kelas' => 'Teknik Listrik 2A',       'kapasitas_mahasiswa' => 35, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'tahun_akademik_id' => 20261, 'prodi_id' => 9, 'kode_kelas' => 'SI-2A',  'nama_kelas' => 'Sistem Informasi 2A',     'kapasitas_mahasiswa' => 40, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'tahun_akademik_id' => 20261, 'prodi_id' => 3, 'kode_kelas' => 'TRPE-4A','nama_kelas' => 'TR Pembangkit Energi 4A',  'kapasitas_mahasiswa' => 30, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'tahun_akademik_id' => 20261, 'prodi_id' => 4, 'kode_kelas' => 'SIKC-4A','nama_kelas' => 'SI Kota Cerdas 4A',        'kapasitas_mahasiswa' => 30, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'tahun_akademik_id' => 20261, 'prodi_id' => 5, 'kode_kelas' => 'TRO-4A', 'nama_kelas' => 'TR Otomasi 4A',            'kapasitas_mahasiswa' => 30, 'status' => 'aktif', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'tahun_akademik_id' => 20262, 'prodi_id' => 7, 'kode_kelas' => 'TI-6A',  'nama_kelas' => 'Teknik Informatika 6A',   'kapasitas_mahasiswa' => 30, 'status' => 'nonaktif', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('kelas')->updateOrInsert(['id' => $row['id']], $row);
        }
    }

    private function seedMahasiswaDenganKelas(): void
    {
        $depan = $this->namaDepan;
        $belakang = $this->namaBelakang;
        shuffle($depan);
        shuffle($belakang);

        $usedUsernames = [];
        $userId = 32;
        $totalCreated = 0;
        $prodiCounters = [];

        foreach ($this->kelasConfig as $kelasId => $config) {
            $tahunAkademikId = in_array($kelasId, [14]) ? 20262 : 20261;
            $semesterId = DB::table('semesters')
                ->where('nomor_semester', $config['nomor_semester'])
                ->value('id');
            $prodiInfo = $this->kelasProdiMap[$kelasId];
            $jurusanPrefix = $prodiInfo['jurusan'];
            $kodeProdi = str_pad((string)$prodiInfo['prodi_id'], 3, '0', STR_PAD_LEFT);
            $tahun = substr((string)$tahunAkademikId, -2);

            $prodiKey = $prodiInfo['prodi_id'];
            if (!isset($prodiCounters[$prodiKey])) {
                $prodiCounters[$prodiKey] = 0;
            }

            for ($i = 0; $i < $config['count']; $i++, $userId++) {
                $firstIndex = ($totalCreated + $i * 7) % count($depan);
                $lastIndex = ($totalCreated * 3 + $i * 11) % count($belakang);
                $name = $depan[$firstIndex] . ' ' . $belakang[$lastIndex];

                $baseUsername = strtolower(str_replace(' ', '', $name));
                $username = $this->makeUniqueUsername($baseUsername, $usedUsernames);
                $usedUsernames[] = $username;

                $prodiCounters[$prodiKey]++;
                $urutan = str_pad((string)$prodiCounters[$prodiKey], 4, '0', STR_PAD_LEFT);
                $nim = $jurusanPrefix . $kodeProdi . $tahun . $urutan;
                $email = strtolower($nim) . '@mahasiswa.ac.id';

                $userData = [
                    'id' => $userId,
                    'name' => $name,
                    'username' => $username,
                    'nomor_identitas' => $nim,
                    'email' => $email,
                    'password' => bcrypt('mahasiswa123'),
                    'role_id' => 6,
                    'prodi_id' => $prodiInfo['prodi_id'],
                    'semester_id' => $semesterId,
                    'status' => 'aktif',
                ];

                DB::table('users')->updateOrInsert(['id' => $userId], array_merge($userData, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));

                DB::table('role_user')->where('user_id', $userId)->delete();
                DB::table('role_user')->insert(['user_id' => $userId, 'role_id' => 6]);

                DB::table('mahasiswa_kelas')->updateOrInsert(
                    ['mahasiswa_id' => $userId, 'kelas_id' => $kelasId],
                    [
                        'mahasiswa_id' => $userId,
                        'kelas_id' => $kelasId,
                        'tahun_akademik_id' => $tahunAkademikId,
                        'status' => 'aktif',
                        'tanggal_daftar' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                if (isset($this->kelasMkMap[$kelasId])) {
                    foreach ($this->kelasMkMap[$kelasId] as $entry) {
                        DB::table('mahasiswa_kelas_mk')->insert([
                            'mata_kuliah_id' => $entry['mk'],
                            'dosen_id' => $entry['dosen_id'],
                            'id_kelas' => $kelasId,
                            'nim' => $nim,
                            'status_id' => 'aktif',
                        ]);
                    }
                }

                $totalCreated++;
            }
        }

        if ($this->command) {
            $this->command->info("Seeded {$totalCreated} mahasiswa across " . count($this->kelasConfig) . ' kelas.');
        }
    }

    private function makeUniqueUsername(string $base, array $used): string
    {
        if (!in_array($base, $used, true) && !DB::table('users')->where('username', $base)->exists()) {
            return $base;
        }

        $suffix = 2;
        while (in_array($base . $suffix, $used, true) || DB::table('users')->where('username', $base . $suffix)->exists()) {
            $suffix++;
        }

        return $base . $suffix;
    }

    private function seedJadwals(): void
    {
        $rows = [
            ['id' => 1,  'mata_kuliah_id' => 1,  'dosen_id' => 6,  'id_kelas' => 1,  'tahun_akademik_id' => 20261, 'hari' => 'Senin',  'jam_mulai' => '08:00', 'jam_selesai' => '10:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2,  'mata_kuliah_id' => 2,  'dosen_id' => 7,  'id_kelas' => 1,  'tahun_akademik_id' => 20261, 'hari' => 'Selasa', 'jam_mulai' => '10:00', 'jam_selesai' => '12:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3,  'mata_kuliah_id' => 1,  'dosen_id' => 8,  'id_kelas' => 2,  'tahun_akademik_id' => 20261, 'hari' => 'Rabu',   'jam_mulai' => '08:00', 'jam_selesai' => '10:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4,  'mata_kuliah_id' => 3,  'dosen_id' => 10, 'id_kelas' => 3,  'tahun_akademik_id' => 20261, 'hari' => 'Kamis',  'jam_mulai' => '13:00', 'jam_selesai' => '15:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5,  'mata_kuliah_id' => 19, 'dosen_id' => 11, 'id_kelas' => 3,  'tahun_akademik_id' => 20261, 'hari' => 'Jumat',  'jam_mulai' => '08:00', 'jam_selesai' => '10:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6,  'mata_kuliah_id' => 4,  'dosen_id' => 12, 'id_kelas' => 4,  'tahun_akademik_id' => 20261, 'hari' => 'Senin',  'jam_mulai' => '10:00', 'jam_selesai' => '12:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7,  'mata_kuliah_id' => 5,  'dosen_id' => 14, 'id_kelas' => 5,  'tahun_akademik_id' => 20261, 'hari' => 'Selasa', 'jam_mulai' => '08:00', 'jam_selesai' => '10:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8,  'mata_kuliah_id' => 7,  'dosen_id' => 16, 'id_kelas' => 6,  'tahun_akademik_id' => 20261, 'hari' => 'Rabu',   'jam_mulai' => '10:00', 'jam_selesai' => '12:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9,  'mata_kuliah_id' => 16, 'dosen_id' => 24, 'id_kelas' => 10, 'tahun_akademik_id' => 20261, 'hari' => 'Kamis',  'jam_mulai' => '08:00', 'jam_selesai' => '10:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'mata_kuliah_id' => 9,  'dosen_id' => 18, 'id_kelas' => 7,  'tahun_akademik_id' => 20261, 'hari' => 'Senin',  'jam_mulai' => '13:00', 'jam_selesai' => '15:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'mata_kuliah_id' => 10, 'dosen_id' => 22, 'id_kelas' => 9,  'tahun_akademik_id' => 20261, 'hari' => 'Selasa', 'jam_mulai' => '13:00', 'jam_selesai' => '15:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'mata_kuliah_id' => 12, 'dosen_id' => 26, 'id_kelas' => 11, 'tahun_akademik_id' => 20261, 'hari' => 'Rabu',   'jam_mulai' => '13:00', 'jam_selesai' => '15:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'mata_kuliah_id' => 13, 'dosen_id' => 27, 'id_kelas' => 12, 'tahun_akademik_id' => 20261, 'hari' => 'Kamis',  'jam_mulai' => '10:00', 'jam_selesai' => '12:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'mata_kuliah_id' => 14, 'dosen_id' => 28, 'id_kelas' => 13, 'tahun_akademik_id' => 20261, 'hari' => 'Jumat',  'jam_mulai' => '13:00', 'jam_selesai' => '15:00', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'mata_kuliah_id' => 6,  'dosen_id' => 13, 'id_kelas' => 4,  'tahun_akademik_id' => 20261, 'hari' => 'Rabu',   'jam_mulai' => '08:00', 'jam_selesai' => '10:00', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($rows as $row) {
            DB::table('jadwals')->updateOrInsert(['id' => $row['id']], $row);
        }
    }
}
