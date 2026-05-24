<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kabupaten extends Model
{
    protected $table = 'kabupatens';

    protected $fillable = ['provinsi_id', 'kode', 'nama'];

    public function provinsi(): BelongsTo
    {
        return $this->belongsTo(Provinsi::class, 'provinsi_id');
    }
}
