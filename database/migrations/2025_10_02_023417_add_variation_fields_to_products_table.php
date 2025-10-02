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
        Schema::table('products', function (Blueprint $table) {
            // Core reference - base product identifier (e.g., C306500002)
            $table->string('core_reference')->nullable()->after('code')->index();

            // Variation attributes
            $table->string('color')->nullable()->after('category');
            $table->string('size')->nullable()->after('color');

            // Parent product relationship (optional - for explicit parent-child)
            $table->foreignId('parent_product_id')->nullable()->after('company_id')->constrained('products')->nullOnDelete();

            // Flag to indicate if this is a parent/master product
            $table->boolean('is_master')->default(false)->after('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['parent_product_id']);
            $table->dropColumn(['core_reference', 'color', 'size', 'parent_product_id', 'is_master']);
        });
    }
};
