<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('materi_pertemuan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_id')->constrained('jadwals')->cascadeOnDelete();
            $table->integer('pertemuan_ke');
            $table->string('topik_materi')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->timestamps();

            $table->unique(['jadwal_id', 'pertemuan_ke']);
        });
    }

    public function down() {
        Schema::dropIfExists('materi_pertemuan');
    }
};
