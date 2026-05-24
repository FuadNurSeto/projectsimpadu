<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tahun_akademik_id' => 'required|integer|exists:tahun_akademiks,id',
            'prodi_id' => 'nullable|integer|exists:prodis,id',
            'kode_kelas' => 'nullable|string|max:50',
            'nama_kelas' => 'required|string|max:255',
            'kapasitas_mahasiswa' => 'integer|min:1',
            'status' => 'required|in:aktif,nonaktif',
            'keterangan' => 'nullable|string',
        ];
    }
}
