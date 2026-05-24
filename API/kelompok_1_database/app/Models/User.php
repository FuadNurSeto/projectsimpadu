<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'nomor_identitas',
        'email',
        'password',
        'role_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role_ids' => $this->roles->pluck('id_role')->toArray(),
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id', 'id', 'id_role');
    }

    public function hasRole($roleIds): bool
    {
        $roleIds = is_array($roleIds) ? $roleIds : [$roleIds];

        return $this->roles->pluck('id_role')->intersect($roleIds)->isNotEmpty();
    }

    public function nilais(): HasMany
    {
        return $this->hasMany(Nilai::class, 'user_id');
    }

    public function khs(): HasMany
    {
        return $this->hasMany(KHS::class, 'user_id');
    }

    public function dosenMahasiswaKelasMk(): HasMany
    {
        return $this->hasMany(MahasiswaKelasMk::class, 'dosen_id');
    }

    public function mahasiswaKelasMk(): HasMany
    {
        return $this->hasMany(MahasiswaKelasMk::class, 'nim', 'nomor_identitas');
    }

    public function jadwals(): HasMany
    {
        return $this->hasMany(Jadwal::class, 'dosen_id');
    }
}
