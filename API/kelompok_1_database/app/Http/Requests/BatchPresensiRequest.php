<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BatchPresensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'presensi' => 'required|array',
            'presensi.*.id_mahasiswa_mk' => 'required|integer|exists:mahasiswa_kelas_mk,id_mahasiswa_mk',
            'presensi.*.status' => 'required|in:H,I,S,A',
        ];
    }
}
