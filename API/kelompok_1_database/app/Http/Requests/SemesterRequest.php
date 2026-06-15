<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SemesterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tahun_akademik_id' => 'required|integer|exists:tahun_akademiks,id',
            'nomor_semester' => 'required|integer|min:1|max:8',
            'status' => 'required|in:aktif,nonaktif',
        ];
    }
}
