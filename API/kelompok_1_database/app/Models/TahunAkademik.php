<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TahunAkademik extends Model
{
    protected $table = 'tahun_akademiks';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'tahun_akademik',
        'status',
    ];

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class, 'tahun_akademik_id');
    }

    public function khs(): HasMany
    {
        return $this->hasMany(KHS::class, 'tahun_akademik_id');
    }

    public function jadwals(): HasMany
    {
        return $this->hasMany(Jadwal::class, 'tahun_akademik_id');
    }
}
