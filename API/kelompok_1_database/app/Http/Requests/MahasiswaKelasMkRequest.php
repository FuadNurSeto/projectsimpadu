<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MahasiswaKelasMkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mata_kuliah_id' => 'required|integer|exists:mata_kuliahs,id_mk',
            'id_kelas' => 'required|integer|exists:kelas,id',
            'dosen_id' => [
                'required',
                'integer',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::find($value);
                    if (!$user || $user->role_id != 7) {
                        $fail('The selected dosen_id must belong to a dosen (role_id = 7).');
                    }
                },
            ],
            'nim' => [
                'required',
                'string',
                'exists:users,nomor_identitas',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::where('nomor_identitas', $value)->first();
                    if (!$user || $user->role_id != 6) {
                        $fail('The selected nim must belong to a mahasiswa (role_id = 6).');
                    }
                },
            ],
            'status_id' => 'required|in:aktif,nonaktif',
        ];
    }
}
