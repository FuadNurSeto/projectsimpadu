<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProdiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jurusan_id' => 'required|integer|exists:jurusans,id',
            'nama_prodi' => 'required|string|max:255',
        ];
    }
}
