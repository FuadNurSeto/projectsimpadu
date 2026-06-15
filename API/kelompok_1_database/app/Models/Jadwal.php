<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jadwal extends Model
{
    protected $table = 'jadwals';

    protected $fillable = [
        'mata_kuliah_id',
        'dosen_id',
        'id_kelas',
        'tahun_akademik_id',
        'ruang',
        'hari',
        'jam_mulai',
        'jam_selesai',
    ];

    protected function casts(): array
    {
        return [
            'jam_mulai' => 'datetime:H:i',
            'jam_selesai' => 'datetime:H:i',
        ];
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id', 'id_mk');
    }

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'id_kelas');
    }

    public function tahunAkademik(): BelongsTo
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function mahasiswa(): HasMany
    {
        return $this->hasMany(MahasiswaKelasMk::class, 'mata_kuliah_id', 'mata_kuliah_id')
            ->whereColumn('id_kelas', 'id_kelas');
    }

    public function materiPertemuan(): HasMany
    {
        return $this->hasMany(MateriPertemuan::class, 'jadwal_id');
    }
}
