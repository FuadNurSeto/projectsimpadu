<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NilaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::find($value);
                    if (!$user || $user->role_id != 6) {
                        $fail('The selected user_id must belong to a mahasiswa (role_id = 6).');
                    }
                },
            ],
            'kelas_id' => 'required|integer|exists:kelas,id',
            'mata_kuliah_id' => 'required|integer|exists:mata_kuliahs,id_mk',
            'nilai_akhir' => 'required|numeric|min:0|max:100',
            'grade' => 'nullable|string|max:5',
            'keterangan' => 'nullable|string',
        ];
    }
}
