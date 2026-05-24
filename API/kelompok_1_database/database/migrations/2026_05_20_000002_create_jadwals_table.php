<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mata_kuliah_id');
            $table->unsignedBigInteger('dosen_id');
            $table->unsignedBigInteger('id_kelas');
            $table->unsignedBigInteger('tahun_akademik_id');
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->timestamps();

            $table->foreign('mata_kuliah_id')->references('id_mk')->on('mata_kuliahs')->onDelete('cascade');
            $table->foreign('dosen_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_kelas')->references('id')->on('kelas')->onDelete('cascade');
            $table->foreign('tahun_akademik_id')->references('id')->on('tahun_akademiks')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwals');
    }
};
