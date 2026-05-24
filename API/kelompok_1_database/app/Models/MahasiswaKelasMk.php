<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MahasiswaKelasMk extends Model
{
    protected $table = 'mahasiswa_kelas_mk';
    protected $primaryKey = 'id_mahasiswa_mk';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'mata_kuliah_id',
        'dosen_id',
        'id_kelas',
        'nim',
        'status_id',
        'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8',
        'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16',
    ];

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

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nim', 'nomor_identitas');
    }
}
