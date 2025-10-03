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
        Schema::create('stock_count_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_count_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->enum('file_format', ['barcode_only', 'barcode_quantity'])->default('barcode_only');
            $table->string('delimiter')->default(',')->comment('Column delimiter for barcode_quantity format');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->integer('total_lines')->default(0);
            $table->integer('processed_lines')->default(0);
            $table->integer('successful_lines')->default(0);
            $table->integer('failed_lines')->default(0);
            $table->json('errors')->nullable()->comment('Array of errors encountered during import');
            $table->text('notes')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_count_imports');
    }
};
