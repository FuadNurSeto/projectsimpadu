<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MateriPertemuan extends Model
{
    protected $table = 'materi_pertemuan';

    protected $fillable = [
        'jadwal_id',
        'pertemuan_ke',
        'topik_materi',
        'deskripsi',
        'file_path',
        'file_name',
        'file_type',
    ];

    public function jadwal(): BelongsTo
    {
        return $this->belongsTo(Jadwal::class, 'jadwal_id');
    }
}
