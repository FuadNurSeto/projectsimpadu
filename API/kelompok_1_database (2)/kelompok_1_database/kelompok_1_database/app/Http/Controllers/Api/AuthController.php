<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Login semua role. Return id, role_id, dan bearer token.
     *
     * @param LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam email string required Example: budisetiawan@mahasiswa.simpadu.ac.id
     * @bodyParam password string required Example: admin123
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Email atau kata sandi salah. Silakan coba'], 401);
        }

        $user = auth()->user();

        return response()->json([
            'id' => $user->id,
            'role_id' => $user->role_id,
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

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }
}
