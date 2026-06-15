<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE `jadwals` MODIFY `hari` ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NULL");
        DB::statement("ALTER TABLE `jadwals` MODIFY `jam_mulai` TIME NULL");
        DB::statement("ALTER TABLE `jadwals` MODIFY `jam_selesai` TIME NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `jadwals` MODIFY `hari` ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL");
        DB::statement("ALTER TABLE `jadwals` MODIFY `jam_mulai` TIME NOT NULL");
        DB::statement("ALTER TABLE `jadwals` MODIFY `jam_selesai` TIME NOT NULL");
    }
};
