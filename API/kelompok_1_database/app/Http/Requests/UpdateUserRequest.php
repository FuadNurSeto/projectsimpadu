<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id_user');

        return [
            'name' => 'sometimes|string|max:255',
            'username' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'nomor_identitas' => [
                'sometimes', 'nullable', 'string', 'max:50',
                Rule::unique('users', 'nomor_identitas')->ignore($userId),
            ],
            'email' => [
                'sometimes', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'role_id' => 'sometimes|integer|exists:role,id_role',
            'password' => 'sometimes|string|min:6',
            'status' => 'sometimes|in:aktif,nonaktif',
        ];
    }
}
