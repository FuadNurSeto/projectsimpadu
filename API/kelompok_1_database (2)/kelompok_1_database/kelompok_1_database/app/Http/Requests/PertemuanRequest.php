<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PertemuanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [];
        for ($i = 1; $i <= 16; $i++) {
            $rules["p$i"] = 'nullable|in:H,I,S,A';
        }
        $rules['status_id'] = 'required|in:aktif,nonaktif';
        return $rules;
    }
}
