<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JurusanRequest;
use App\Models\Jurusan;

class JurusanController extends Controller
{
    /**
     * Menampilkan seluruh Jurusan.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $jurusan = Jurusan::with('prodis')->get();

        return response()->json($jurusan);
    }

    /**
     * Menambahkan Jurusan Baru.
     *
     * @param JurusanRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam nama_jurusan string required Example: Teknik Mesin
     */
    public function store(JurusanRequest $request)
    {
        $jurusan = Jurusan::create($request->validated());

        return response()->json([
            'message' => 'Jurusan created successfully',
            'data' => $jurusan,
        ], 201);
    }
}
