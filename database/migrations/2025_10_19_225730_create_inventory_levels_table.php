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
        Schema::create('inventory_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('quantity', 15, 3)->default(0); // Quantidade atual
            $table->decimal('reserved_quantity', 15, 3)->default(0); // Quantidade reservada
            $table->decimal('available_quantity', 15, 3)->default(0); // Disponível = quantity - reserved
            $table->timestamp('last_movement_at')->nullable(); // Última movimentação
            $table->timestamps();

            // Unique constraint: um registro por produto/área/empresa
            $table->unique(['company_id', 'product_id', 'area_id']);

            // Indexes
            $table->index(['company_id', 'product_id']);
            $table->index(['company_id', 'area_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_levels');
    }
};
