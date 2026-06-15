<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MahasiswaKelas extends Model
{
    protected $table = 'mahasiswa_kelas';

    protected $fillable = [
        'mahasiswa_id',
        'kelas_id',
        'tahun_akademik_id',
        'status',
        'tanggal_daftar',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_daftar' => 'datetime',
        ];
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function tahunAkademik(): BelongsTo
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }
}
