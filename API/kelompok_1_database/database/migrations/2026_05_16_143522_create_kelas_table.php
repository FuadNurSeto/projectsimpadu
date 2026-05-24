<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tahun_akademik_id');
            $table->unsignedBigInteger('prodi_id')->nullable();
            $table->string('kode_kelas')->nullable();
            $table->string('nama_kelas');
            $table->integer('kapasitas_mahasiswa')->default(40);
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('tahun_akademik_id')->references('id')->on('tahun_akademiks')->onDelete('cascade');
            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('cascade');
        });

        DB::table('kelas')->insert([
            ['id' => 1, 'tahun_akademik_id' => 20252, 'prodi_id' => null, 'kode_kelas' => '', 'nama_kelas' => 'ti-2a', 'kapasitas_mahasiswa' => 40],
            ['id' => 2, 'tahun_akademik_id' => 20252, 'prodi_id' => null, 'kode_kelas' => '', 'nama_kelas' => 'ti-2b', 'kapasitas_mahasiswa' => 40],
            ['id' => 3, 'tahun_akademik_id' => 20252, 'prodi_id' => null, 'kode_kelas' => '', 'nama_kelas' => 'ti-4a', 'kapasitas_mahasiswa' => 40],
            ['id' => 5, 'tahun_akademik_id' => 20252, 'prodi_id' => null, 'kode_kelas' => '', 'nama_kelas' => 'ti-4b', 'kapasitas_mahasiswa' => 40],
            ['id' => 6, 'tahun_akademik_id' => 20252, 'prodi_id' => null, 'kode_kelas' => '', 'nama_kelas' => 'ti-6a', 'kapasitas_mahasiswa' => 40],
            ['id' => 7, 'tahun_akademik_id' => 20252, 'prodi_id' => null, 'kode_kelas' => '', 'nama_kelas' => 'ti-6b', 'kapasitas_mahasiswa' => 40]
        ]);
    }
    public function down() {
        Schema::dropIfExists('kelas');
    }
};
