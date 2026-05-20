<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    protected $table = 'jurusans';

    protected $fillable = [
        'nama_jurusan',
    ];

    public function prodis(): HasMany
    {
        return $this->hasMany(Prodi::class, 'jurusan_id');
    }
}
