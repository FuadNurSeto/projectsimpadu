<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'tahun_akademik_id',
        'prodi_id',
        'kode_kelas',
        'nama_kelas',
        'kapasitas_mahasiswa',
        'status',
        'keterangan',
    ];

    public function tahunAkademik(): BelongsTo
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function prodi(): BelongsTo
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    public function mahasiswaKelasMk(): HasMany
    {
        return $this->hasMany(MahasiswaKelasMk::class, 'id_kelas');
    }

    public function nilais(): HasMany
    {
        return $this->hasMany(Nilai::class, 'kelas_id');
    }

    public function jadwals(): HasMany
    {
        return $this->hasMany(Jadwal::class, 'id_kelas');
    }
}
