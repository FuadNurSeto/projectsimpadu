<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('mahasiswa_kelas_mk', function (Blueprint $table) {
            $table->integer('id_mahasiswa_mk')->autoIncrement();
            $table->unsignedBigInteger('mata_kuliah_id');
            $table->unsignedBigInteger('dosen_id')->nullable();
            $table->unsignedBigInteger('id_kelas')->nullable();
            $table->string('nim')->nullable();

            for ($i = 1; $i <= 16; $i++) {
                $table->enum("p$i", ['H','I','S','A'])->nullable();
            }
            $table->string('status_id', 50)->nullable();

            $table->foreign('mata_kuliah_id')->references('id_mk')->on('mata_kuliahs');
            $table->foreign('dosen_id')->references('id')->on('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('id_kelas')->references('id')->on('kelas')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('nim')->references('nomor_identitas')->on('users')->onDelete('set null')->onUpdate('cascade');
        });

        $mk_data = [];
        for ($i=1; $i<=10; $i++) { $mk_data[] = ['id_mahasiswa_mk' => $i, 'mata_kuliah_id' => 3]; }
        for ($i=11; $i<=15; $i++) { $mk_data[] = ['id_mahasiswa_mk' => $i, 'mata_kuliah_id' => 5]; }
        DB::table('mahasiswa_kelas_mk')->insert($mk_data);
    }
    public function down() {
        Schema::dropIfExists('mahasiswa_kelas_mk');
    }
};
