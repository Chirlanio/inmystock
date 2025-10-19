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
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // MOV-YYYYMMDD-XXXX
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', [
                'entry',        // Entrada (compra, devolução de cliente, etc)
                'exit',         // Saída (venda, devolução a fornecedor, etc)
                'adjustment',   // Ajuste (correção de estoque)
                'transfer_out', // Transferência saída
                'transfer_in'   // Transferência entrada
            ]);
            $table->decimal('quantity', 15, 3); // Quantidade (pode ser negativa para saídas)
            $table->decimal('unit_cost', 15, 2)->nullable(); // Custo unitário
            $table->decimal('total_cost', 15, 2)->nullable(); // Custo total

            // Referência ao documento origem (opcional)
            $table->string('reference_type')->nullable(); // Ex: App\Models\PurchaseOrder
            $table->unsignedBigInteger('reference_id')->nullable();

            // Transferência entre áreas (apenas para type = transfer)
            $table->foreignId('from_area_id')->nullable()->constrained('areas')->nullOnDelete();
            $table->foreignId('to_area_id')->nullable()->constrained('areas')->nullOnDelete();

            // Informações adicionais
            $table->text('notes')->nullable();
            $table->string('document_number')->nullable(); // Número do documento (NF, pedido, etc)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Quem fez a movimentação
            $table->timestamp('movement_date'); // Data da movimentação
            $table->timestamps();

            // Indexes
            $table->index(['company_id', 'product_id', 'movement_date']);
            $table->index(['company_id', 'type']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
