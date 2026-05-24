<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MataKuliahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prodi_id' => 'required|integer|exists:prodis,id',
            'nama_mk' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:8',
            'sks' => 'required|integer|min:1|max:6',
            'status' => 'required|in:aktif,nonaktif',
        ];
    }
}
