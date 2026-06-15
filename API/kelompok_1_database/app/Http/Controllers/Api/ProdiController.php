<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProdiRequest;
use App\Models\Prodi;

class ProdiController extends Controller
{
    /**
     * Menampilkan seluruh Prodi.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        return response()->json(Prodi::with('jurusan')->get());
    }

    /**
     * Menampilkan seluruh Prodi dalam SATU jurusan.
     *
     * @param int $jurusan_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function byJurusan($jurusan_id)
    {
        $prodis = Prodi::where('jurusan_id', $jurusan_id)->get();

        return response()->json($prodis);
    }

    /**
     * Menambahkan Prodi baru dan relasi ke Jurusan.
     *
     * @param ProdiRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam jurusan_id int required Example: 1
     * @bodyParam nama_prodi string required Example: D4 Teknik Mesin
     */
    public function store(ProdiRequest $request)
    {
        $prodi = Prodi::create($request->validated());

        return response()->json([
            'message' => 'Prodi created successfully',
            'data' => $prodi->load('jurusan'),
        ], 201);
    }

    /**
     * Mengubah prodi berdasarkan ID.
     *
     * @param ProdiRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam jurusan_id int required Example: 1
     * @bodyParam nama_prodi string required Example: D4 Teknik Elektro
     */
    public function update(ProdiRequest $request, $id)
    {
        $prodi = Prodi::findOrFail($id);
        $prodi->update($request->validated());

        return response()->json([
            'message' => 'Prodi updated successfully',
            'data' => $prodi->load('jurusan'),
        ]);
    }
}
