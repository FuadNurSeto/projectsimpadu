<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MateriRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topik_materi' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
        ];
    }
}
