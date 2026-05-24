<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('mata_kuliahs', function (Blueprint $table) {
            $table->id('id_mk');
            $table->unsignedBigInteger('prodi_id')->nullable();
            $table->string('nama_mk');
            $table->integer('sks')->default(3);
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();

            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('set null')->onUpdate('cascade');
        });

        DB::table('mata_kuliahs')->insert([
            ['id_mk' => 1, 'prodi_id' => 3, 'nama_mk' => 'Algoritma', 'sks' => 3],
            ['id_mk' => 3, 'prodi_id' => 4, 'nama_mk' => 'ipa', 'sks' => 3],
            ['id_mk' => 4, 'prodi_id' => 1, 'nama_mk' => 'agama', 'sks' => 3],
            ['id_mk' => 5, 'prodi_id' => 3, 'nama_mk' => 'Pemrograman', 'sks' => 3],
            ['id_mk' => 6, 'prodi_id' => 1, 'nama_mk' => 'Pengantar Bisnis', 'sks' => 3],
            ['id_mk' => 11, 'prodi_id' => 2, 'nama_mk' => 'Manajemen Pemasaran', 'sks' => 3],
            ['id_mk' => 16, 'prodi_id' => 3, 'nama_mk' => 'Struktur Data', 'sks' => 3],
            ['id_mk' => 21, 'prodi_id' => 4, 'nama_mk' => 'Rangkaian Listrik', 'sks' => 3],
            ['id_mk' => 26, 'prodi_id' => 5, 'nama_mk' => 'Elektronika Analog', 'sks' => 3]
        ]);
    }
    public function down() {
        Schema::dropIfExists('mata_kuliahs');
    }
};
