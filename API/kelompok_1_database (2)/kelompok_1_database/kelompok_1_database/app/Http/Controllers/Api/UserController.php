<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MahasiswaRegisterRequest;
use App\Http\Requests\MahasiswaStatusRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Menampilkan seluruh user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $users = User::with('role')->get();

        return response()->json($users);
    }

    /**
     * Mengubah role user.
     *
     * @param UpdateUserRoleRequest $request
     * @param int $id_user
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam role_id int required Example: 2
     */
    public function updateRole(UpdateUserRoleRequest $request, $id_user)
    {
        $user = User::findOrFail($id_user);
        $user->update(['role_id' => $request->role_id]);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user->load('role'),
        ]);
    }

    /**
     * Menampilkan data user mahasiswa berdasarkan NIM (nomor_identitas).
     *
     * @param string $nim
     * @return \Illuminate\Http\JsonResponse
     */
    public function showByNim($nim)
    {
        $user = User::with('role')
            ->where('nomor_identitas', $nim)
            ->where('role_id', 6)
            ->firstOrFail();

        return response()->json($user);
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

        return response()->json([
            'message' => 'Mahasiswa created successfully',
            'user' => $user->load('role'),
        ], 201);
    }

    /**
     * Menampilkan list seluruh mahasiswa (role_id = 6).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function mahasiswa()
    {
        $users = User::where('role_id', 6)->with('role')->get();

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
            'user' => $user->load('role'),
        ]);
    }
}
