<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('mahasiswa_kelas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('kelas_id');
            $table->unsignedBigInteger('tahun_akademik_id');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamp('tanggal_daftar')->useCurrent();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['mahasiswa_id', 'kelas_id', 'tahun_akademik_id'], 'mk_mhs_kelas_tahun_unique');

            $table->foreign('mahasiswa_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('kelas_id')->references('id')->on('kelas')->onDelete('cascade');
            $table->foreign('tahun_akademik_id')->references('id')->on('tahun_akademiks')->onDelete('cascade');
        });
    }
    public function down() {
        Schema::dropIfExists('mahasiswa_kelas');
    }
};
