<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JadwalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mata_kuliah_id' => [
                'required', 'integer', 'exists:mata_kuliahs,id_mk',
            ],
            'dosen_id' => [
                'required', 'integer', 'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::find($value);
                    if (!$user || $user->role_id != 7) {
                        $fail('The selected dosen_id must belong to a dosen (role_id = 7).');
                    }
                },
            ],
            'id_kelas' => 'required|integer|exists:kelas,id',
            'tahun_akademik_id' => 'required|integer|exists:tahun_akademiks,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ];
    }
}
