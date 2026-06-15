<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('prodi_id')->nullable()->after('role_id')->constrained('prodis')->nullOnDelete();
            $table->foreignId('semester_id')->nullable()->after('prodi_id')->constrained('semesters')->nullOnDelete();
        });
    }

    public function down() {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['prodi_id']);
            $table->dropForeign(['semester_id']);
            $table->dropColumn(['prodi_id', 'semester_id']);
        });
    }
};
