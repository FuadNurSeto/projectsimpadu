<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MataKuliahRequest;
use App\Models\MataKuliah;

class MataKuliahController extends Controller
{
    /**
     * Menampilkan daftar mata kuliah.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $mataKuliah = MataKuliah::with('prodi')->get();

        return response()->json($mataKuliah);
    }

    /**
     * Menampilkan detail satu mata kuliah.
     *
     * @param int $id_mk
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id_mk)
    {
        $mataKuliah = MataKuliah::with('prodi')->findOrFail($id_mk);

        return response()->json($mataKuliah);
    }

    /**
     * Menambahkan data mata kuliah baru.
     *
     * @param MataKuliahRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam prodi_id int required Example: 3
     * @bodyParam nama_mk string required Example: Pemrograman Web Backend
     * @bodyParam semester int required Example: 4
     * @bodyParam sks int required Example: 3
     * @bodyParam status string required Example: aktif
     */
    public function store(MataKuliahRequest $request)
    {
        $mataKuliah = MataKuliah::create($request->validated());

        return response()->json([
            'message' => 'Mata kuliah created successfully',
            'data' => $mataKuliah->load('prodi'),
        ], 201);
    }

    /**
     * Mengubah informasi mata kuliah.
     *
     * @param MataKuliahRequest $request
     * @param int $id_mk
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam prodi_id int required Example: 3
     * @bodyParam nama_mk string required Example: Pemrograman Aplikasi Backend & API
     * @bodyParam semester int required Example: 4
     * @bodyParam sks int required Example: 4
     * @bodyParam status string required Example: aktif
     */
    public function update(MataKuliahRequest $request, $id_mk)
    {
        $mataKuliah = MataKuliah::findOrFail($id_mk);
        $mataKuliah->update($request->validated());

        return response()->json([
            'message' => 'Mata kuliah updated successfully',
            'data' => $mataKuliah->load('prodi'),
        ]);
    }
}
