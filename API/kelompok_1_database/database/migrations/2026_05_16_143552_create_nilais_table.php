<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('nilais', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('kelas_id');
            $table->unsignedBigInteger('mata_kuliah_id');
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->string('grade')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('kelas_id')->references('id')->on('kelas')->onDelete('cascade');
            $table->foreign('mata_kuliah_id')->references('id_mk')->on('mata_kuliahs')->onDelete('cascade');
        });
    }
    public function down() {
        Schema::dropIfExists('nilais');
    }
};
