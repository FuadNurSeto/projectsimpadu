<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('k_h_s', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tahun_akademik_id');
            $table->integer('total_sks')->default(0);
            $table->decimal('ip_kumulatif', 3, 2)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'tahun_akademik_id']);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tahun_akademik_id')->references('id')->on('tahun_akademiks')->onDelete('cascade');
        });
    }
    public function down() {
        Schema::dropIfExists('k_h_s');
    }
};
