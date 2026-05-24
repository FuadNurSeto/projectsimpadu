<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kabupaten;
use App\Models\Provinsi;

class WilayahController extends Controller
{
    /**
     * Menampilkan seluruh provinsi.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function provinsi()
    {
        return response()->json(Provinsi::orderBy('kode')->get());
    }

    /**
     * Menampilkan seluruh kabupaten dalam satu provinsi.
     *
     * @param int $provinsi_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function kabupaten($provinsi_id)
    {
        $kabupatens = Kabupaten::where('provinsi_id', $provinsi_id)
            ->orderBy('kode')
            ->get();

        return response()->json($kabupatens);
    }
}
