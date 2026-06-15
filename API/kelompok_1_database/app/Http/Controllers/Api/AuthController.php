<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Login semua role. Return data user lengkap dan bearer token.
     *
     * @param LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam email string required Example: superadmin@simpadu.ac.id
     * @bodyParam password string required Example: admin123
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        $user = auth()->user()->load('roles');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'nomor_identitas' => $user->nomor_identitas,
            'email' => $user->email,
            'role_ids' => $user->roles->pluck('id_role')->toArray(),
            'roles' => $user->roles->pluck('nama_role')->toArray(),
            'token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    /**
     * Membuat akun (semua role).
     *
     * @param RegisterRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam name string required Example: budi Setiawan antonio
     * @bodyParam username string required Example: budi setiawan
     * @bodyParam nomor_identitas string nullable Example: C00013
     * @bodyParam email string required Example: budisetiawan@mahasiswa.simpadu.ac.id
     * @bodyParam password string required Example: password123
     * @bodyParam role_id int required Example: 6
     * @bodyParam status string required Example: aktif
     */
    public function register(RegisterRequest $request)
    {
        $user = User::create($request->validated());

        $roleIds = [$request->role_id];
        if (in_array($request->role_id, [2, 3, 4, 5, 7])) {
            $roleIds[] = 8;
        }

        DB::table('role_user')->insert(
            array_map(fn($rid) => ['user_id' => $user->id, 'role_id' => $rid], $roleIds)
        );

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('roles'),
        ], 201);
    }
}
