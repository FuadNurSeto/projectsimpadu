<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('prodis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jurusan_id');
            $table->string('nama_prodi');
            $table->timestamps();

            $table->foreign('jurusan_id')->references('id')->on('jurusans')->onDelete('cascade');
        });

        DB::table('prodis')->insert([
            ['id' => 1, 'jurusan_id' => 1, 'nama_prodi' => 'D3 Administrasi Bisnis'],
            ['id' => 2, 'jurusan_id' => 1, 'nama_prodi' => 'D4 Manajemen Bisnis'],
            ['id' => 3, 'jurusan_id' => 2, 'nama_prodi' => 'D3 Teknik Informatika'],
            ['id' => 4, 'jurusan_id' => 2, 'nama_prodi' => 'D3 Teknik Listrik'],
            ['id' => 5, 'jurusan_id' => 2, 'nama_prodi' => 'D4 Teknik Elektronika']
        ]);
    }
    public function down() {
        Schema::dropIfExists('prodis');
    }
};
