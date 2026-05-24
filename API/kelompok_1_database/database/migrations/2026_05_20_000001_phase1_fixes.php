<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('mata_kuliahs', 'semester')) {
            Schema::table('mata_kuliahs', function (Blueprint $table) {
                $table->integer('semester')->after('nama_mk')->default(1);
            });
        }

        if (!Schema::hasColumn('k_h_s', 'semester_mahasiswa')) {
            Schema::table('k_h_s', function (Blueprint $table) {
                $table->integer('semester_mahasiswa')->after('tahun_akademik_id')->default(1);
            });
        }

        DB::statement('ALTER TABLE mahasiswa_kelas_mk MODIFY id_mahasiswa_mk INT AUTO_INCREMENT');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE mahasiswa_kelas_mk MODIFY id_mahasiswa_mk INT NOT NULL');

        if (Schema::hasColumn('k_h_s', 'semester_mahasiswa')) {
            Schema::table('k_h_s', function (Blueprint $table) {
                $table->dropColumn('semester_mahasiswa');
            });
        }

        if (Schema::hasColumn('mata_kuliahs', 'semester')) {
            Schema::table('mata_kuliahs', function (Blueprint $table) {
                $table->dropColumn('semester');
            });
        }
    }
};
