<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TahunAkademikRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('tahun_akademik');

        return [
            'id' => 'required|integer|unique:tahun_akademiks,id' . ($id ? ',' . $id : ''),
            'tahun_akademik' => 'required|string|max:255|unique:tahun_akademiks,tahun_akademik' . ($id ? ',' . $id : ''),
            'status' => 'required|in:aktif,nonaktif',
        ];
    }
}
