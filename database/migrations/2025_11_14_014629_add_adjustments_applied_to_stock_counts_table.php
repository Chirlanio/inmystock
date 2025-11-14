<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_counts', function (Blueprint $table) {
            $table->timestamp('adjustments_applied_at')->nullable()->after('completed_at');
            $table->foreignId('adjustments_applied_by')->nullable()->after('adjustments_applied_at')->constrained('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_counts', function (Blueprint $table) {
            $table->dropForeign(['adjustments_applied_by']);
            $table->dropColumn(['adjustments_applied_at', 'adjustments_applied_by']);
        });
    }
};
