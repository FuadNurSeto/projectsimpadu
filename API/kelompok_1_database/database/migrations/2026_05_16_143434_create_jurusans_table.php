<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('jurusans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jurusan');
            $table->timestamps();
        });

        DB::table('jurusans')->insert([
            ['id' => 1, 'nama_jurusan' => 'Administrasi Bisnis'],
            ['id' => 2, 'nama_jurusan' => 'Elektro']
        ]);
    }
    public function down() {
        Schema::dropIfExists('jurusans');
    }
};
