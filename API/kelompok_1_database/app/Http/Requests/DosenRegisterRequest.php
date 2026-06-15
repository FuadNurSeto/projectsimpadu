<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DosenRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'nomor_identitas' => 'nullable|string|max:50|unique:users,nomor_identitas',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ];
    }
}
