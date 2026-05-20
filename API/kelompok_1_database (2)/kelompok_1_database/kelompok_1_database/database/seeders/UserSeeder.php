<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'id' => 1,
                'name' => 'Super Administrator',
                'username' => 'superadmin',
                'nomor_identitas' => 'SA001',
                'email' => 'superadmin@simpadu.ac.id',
                'password' => 'admin123',
                'role_id' => 1,
                'status' => 'aktif',
            ],
            [
                'id' => 2,
                'name' => 'Admin Akademik',
                'username' => 'adminakademik',
                'nomor_identitas' => 'AA001',
                'email' => 'admin.akademik@simpadu.ac.id',
                'password' => 'admin123',
                'role_id' => 2,
                'status' => 'aktif',
            ],
            [
                'id' => 3,
                'name' => 'Admin Pegawai',
                'username' => 'adminpegawai',
                'nomor_identitas' => 'AP001',
                'email' => 'admin.pegawai@simpadu.ac.id',
                'password' => 'admin123',
                'role_id' => 3,
                'status' => 'aktif',
            ],
            [
                'id' => 4,
                'name' => 'Admin Mahasiswa',
                'username' => 'adminmahasiswa',
                'nomor_identitas' => 'AM001',
                'email' => 'admin.mahasiswa@simpadu.ac.id',
                'password' => 'admin123',
                'role_id' => 4,
                'status' => 'aktif',
            ],
            [
                'id' => 5,
                'name' => 'Admin Keuangan',
                'username' => 'adminkeuangan',
                'nomor_identitas' => 'AK001',
                'email' => 'admin.keuangan@simpadu.ac.id',
                'password' => 'admin123',
                'role_id' => 5,
                'status' => 'aktif',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['id' => $user['id']],
                $user
            );
        }
    }
}
