<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KHS extends Model
{
    protected $table = 'k_h_s';

    protected $fillable = [
        'user_id',
        'tahun_akademik_id',
        'semester_mahasiswa',
        'total_sks',
        'ip_kumulatif',
        'keterangan',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tahunAkademik(): BelongsTo
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }
}
