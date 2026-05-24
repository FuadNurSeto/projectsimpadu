<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TahunAkademikRequest;
use App\Models\TahunAkademik;

class TahunAkademikController extends Controller
{
    /**
     * Menampilkan seluruh tabel tahun akademik.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        return response()->json(TahunAkademik::all());
    }

    /**
     * Menambahkan tahun akademik baru.
     *
     * @param TahunAkademikRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @bodyParam id int required Example: 20261
     * @bodyParam tahun_akademik string required Example: 2026 ganjil
     * @bodyParam status string required Example: nonaktif
     */
    public function store(TahunAkademikRequest $request)
    {
        $tahunAkademik = TahunAkademik::create($request->validated());

        return response()->json([
            'message' => 'Tahun akademik created successfully',
            'data' => $tahunAkademik,
        ], 201);
    }

    /**
     * Menampilkan hanya tahun akademik yang status-nya aktif.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function aktif()
    {
        return response()->json(TahunAkademik::where('status', 'aktif')->get());
    }
}
