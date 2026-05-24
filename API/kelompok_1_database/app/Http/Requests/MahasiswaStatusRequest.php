<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class MahasiswaStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'in:aktif,nonaktif',
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = User::find($this->route('id_user'));
            if (!$user) {
                $validator->errors()->add('id_user', 'User not found.');
                return;
            }
            if ($user->role_id != 6) {
                $validator->errors()->add('id_user', 'The selected user must be a mahasiswa (role_id = 6).');
            }
        });
    }
}
