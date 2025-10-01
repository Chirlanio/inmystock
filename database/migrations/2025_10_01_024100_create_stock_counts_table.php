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
        Schema::create('stock_counts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_audit_id')->constrained()->onDelete('cascade');
            $table->foreignId('area_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('counter_id')->constrained('users')->onDelete('cascade');
            $table->integer('count_number')->comment('1st count, 2nd count, etc.');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['stock_audit_id', 'area_id', 'count_number'], 'unique_count_per_area');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_counts');
    }
};
