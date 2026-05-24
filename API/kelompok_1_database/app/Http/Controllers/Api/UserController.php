<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MahasiswaRegisterRequest;
use App\Http\Requests\MahasiswaStatusRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\KHS;
use App\Models\MahasiswaKelasMk;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Menampilkan seluruh user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $users = User::with('roles')->get();

        return response()->json($users);
    }

    /**
     * Menampilkan detail satu user berdasarkan ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Mengubah data user (name, username, nomor_identitas, email, role_id, password, status).
     * Semua field bersifat opsional — hanya field yang dikirim yang akan di-update.
     *
     * @param UpdateUserRequest $request
     * @param int $id_user
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam name string optional Example: Budi Setiawan
     * @bodyParam username string optional Example: budisetiawan
     * @bodyParam nomor_identitas string optional Example: C00013
     * @bodyParam email string optional Example: budi@mahasiswa.simpadu.ac.id
     * @bodyParam role_id int optional Example: 2
     * @bodyParam password string optional Example: newpassword123
     * @bodyParam status string optional Example: nonaktif
     */
    public function updateUser(UpdateUserRequest $request, $id_user)
    {
        $user = User::findOrFail($id_user);
        $user->update($request->validated());

        if ($request->has('role_id')) {
            $roleIds = [$request->role_id];
            if (in_array((int) $request->role_id, [2, 3, 4, 5, 7], true)) {
                $roleIds[] = 8;
            }

            DB::table('role_user')->where('user_id', $user->id)->delete();
            DB::table('role_user')->insert(
                array_map(fn($rid) => ['user_id' => $user->id, 'role_id' => $rid], $roleIds)
            );
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Menampilkan data user mahasiswa berdasarkan NIM (nomor_identitas).
     * Menyertakan prodi_id, nama_prodi, dan semester_sekarang.
     *
     * @param string $nim
     * @return \Illuminate\Http\JsonResponse
     */
    public function showByNim($nim)
    {
        $user = User::where('nomor_identitas', $nim)
            ->where('role_id', 6)
            ->firstOrFail();

        $prodiId = null;
        $namaProdi = null;

        $plotting = MahasiswaKelasMk::with('kelas.prodi')
            ->where('nim', $nim)
            ->latest('id_mahasiswa_mk')
            ->first();

        if ($plotting && $plotting->kelas && $plotting->kelas->prodi) {
            $prodiId = $plotting->kelas->prodi->id;
            $namaProdi = $plotting->kelas->prodi->nama_prodi;
        }

        $semesterSekarang = KHS::where('user_id', $user->id)
            ->max('semester_mahasiswa');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'nomor_identitas' => $user->nomor_identitas,
            'email' => $user->email,
            'prodi_id' => $prodiId,
            'nama_prodi' => $namaProdi,
            'semester_sekarang' => $semesterSekarang,
        ]);
    }

    /**
     * Membuat akun mahasiswa baru (role_id otomatis 6, status default aktif).
     *
     * @param MahasiswaRegisterRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam name string required Example: budi Setiawan antonio
     * @bodyParam username string required Example: budi setiawan
     * @bodyParam nomor_identitas string nullable Example: C00013
     * @bodyParam email string required Example: budisetiawan@mahasiswa.simpadu.ac.id
     * @bodyParam password string required Example: password123
     */
    public function registerMahasiswa(MahasiswaRegisterRequest $request)
    {
        $data = $request->validated();
        $data['role_id'] = 6;
        $data['status'] = 'aktif';

        $user = User::create($data);

        DB::table('role_user')->insert(['user_id' => $user->id, 'role_id' => 6]);

        return response()->json([
            'message' => 'Mahasiswa created successfully',
            'user' => $user->load('roles'),
        ], 201);
    }

    /**
     * Menampilkan list seluruh mahasiswa (role_id = 6).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function mahasiswa()
    {
        $users = User::where('role_id', 6)->with('roles')->get();

        return response()->json($users);
    }

    /**
     * Mengubah status mahasiswa (aktif/nonaktif).
     *
     * @param MahasiswaStatusRequest $request
     * @param int $id_user
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam status string required Example: nonaktif
     */
    public function updateMahasiswaStatus(MahasiswaStatusRequest $request, $id_user)
    {
        $user = User::findOrFail($id_user);
        $user->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Mahasiswa status updated successfully',
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Mereset password user.
     * Password baru akan otomatis di-hash oleh Laravel.
     *
     * @param ResetPasswordRequest $request
     * @param int $id_user
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam password string required min:6 Example: newpassword123
     */
    public function resetPassword(ResetPasswordRequest $request, $id_user)
    {
        $user = User::findOrFail($id_user);
        $user->update(['password' => $request->password]);

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }
}
