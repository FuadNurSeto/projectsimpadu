<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MataKuliah extends Model
{
    protected $table = 'mata_kuliahs';
    protected $primaryKey = 'id_mk';

    protected $fillable = [
        'prodi_id',
        'kode_mk',
        'nama_mk',
        'sks',
        'status',
    ];

    public function prodi(): BelongsTo
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    public function nilais(): HasMany
    {
        return $this->hasMany(Nilai::class, 'mata_kuliah_id', 'id_mk');
    }

    public function mahasiswaKelasMk(): HasMany
    {
        return $this->hasMany(MahasiswaKelasMk::class, 'mata_kuliah_id', 'id_mk');
    }
}
