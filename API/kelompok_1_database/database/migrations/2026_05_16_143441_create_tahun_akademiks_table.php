<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('tahun_akademiks', function (Blueprint $table) {
            $table->id()->primary();
            $table->string('tahun_akademik')->unique();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
        });

        DB::table('tahun_akademiks')->insert([
            ['id' => 20241, 'tahun_akademik' => '2024 ganjil', 'status' => 'nonaktif'],
            ['id' => 20242, 'tahun_akademik' => '2024 genap', 'status' => 'nonaktif'],
            ['id' => 20251, 'tahun_akademik' => '2025 ganjil', 'status' => 'nonaktif'],
            ['id' => 20252, 'tahun_akademik' => '2025 genap', 'status' => 'aktif']
        ]);
    }
    public function down() {
        Schema::dropIfExists('tahun_akademiks');
    }
};
