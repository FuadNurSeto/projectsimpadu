<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('role', function (Blueprint $table) {
            $table->integer('id_role')->autoIncrement();
            $table->char('nama_role', 40);
        });

        DB::table('role')->insert([
            ['id_role' => 1, 'nama_role' => 'super_admin'],
            ['id_role' => 2, 'nama_role' => 'admin_akademik'],
            ['id_role' => 3, 'nama_role' => 'admin_pegawai'],
            ['id_role' => 4, 'nama_role' => 'admin_mahasiswa'],
            ['id_role' => 5, 'nama_role' => 'admin_keuangan'],
            ['id_role' => 6, 'nama_role' => 'mahasiswa'],
            ['id_role' => 7, 'nama_role' => 'dosen'],
            ['id_role' => 8, 'nama_role' => 'pegawai']
        ]);
    }
    public function down() {
        Schema::dropIfExists('role');
    }
};
