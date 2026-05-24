<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provinsi extends Model
{
    protected $table = 'provinsis';

    protected $fillable = ['kode', 'nama'];

    public function kabupatens(): HasMany
    {
        return $this->hasMany(Kabupaten::class, 'provinsi_id');
    }
}
