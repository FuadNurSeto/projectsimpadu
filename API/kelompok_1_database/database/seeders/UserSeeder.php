<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('role')->insertOrIgnore([
            ['id_role' => 8, 'nama_role' => 'pegawai'],
        ]);

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
                'extra_roles' => [],
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
                'extra_roles' => [8],
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
                'extra_roles' => [8],
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
                'extra_roles' => [8],
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
                'extra_roles' => [8],
            ],
        ];

        foreach ($users as $userData) {
            $extraRoles = $userData['extra_roles'];
            unset($userData['extra_roles']);

            $user = User::updateOrCreate(
                ['id' => $userData['id']],
                $userData
            );

            DB::table('role_user')->where('user_id', $user->id)->delete();

            $allRoleIds = array_merge([$userData['role_id']], $extraRoles);
            $allRoleIds = array_unique($allRoleIds);

            $pivotData = array_map(fn($rid) => ['user_id' => $user->id, 'role_id' => $rid], $allRoleIds);
            DB::table('role_user')->insert($pivotData);
        }
    }
}
