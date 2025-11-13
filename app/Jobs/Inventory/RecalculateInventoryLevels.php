<?php

namespace App\Jobs\Inventory;

use App\Models\Company;
use App\Models\InventoryLevel;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RecalculateInventoryLevels implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 2;

    /**
     * The maximum number of seconds the job can run.
     *
     * @var int
     */
    public $timeout = 1200; // 20 minutes

    /**
     * Product ID or null for all products.
     */
    public ?int $productId;

    /**
     * Company ID or null for all companies.
     */
    public ?int $companyId;

    /**
     * Create a new job instance.
     */
    public function __construct(?int $productId = null, ?int $companyId = null)
    {
        $this->productId = $productId;
        $this->companyId = $companyId;
        $this->onQueue('calculations');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting inventory recalculation', [
            'product_id' => $this->productId,
            'company_id' => $this->companyId,
        ]);

        $recalculated = 0;

        try {
            if ($this->productId) {
                // Recalculate for specific product
                $product = Product::findOrFail($this->productId);
                InventoryLevel::recalculateForProduct($product->id, null, $product->company_id);
                $recalculated = 1;

                Log::info('Recalculated inventory for product', [
                    'product_id' => $product->id,
                    'product_code' => $product->code,
                ]);
            } elseif ($this->companyId) {
                // Recalculate for all products in company
                $products = Product::where('company_id', $this->companyId)->get();

                foreach ($products as $product) {
                    InventoryLevel::recalculateForProduct($product->id, null, $product->company_id);
                    $recalculated++;

                    // Log progress every 100 products
                    if ($recalculated % 100 === 0) {
                        Log::info("Recalculated {$recalculated} products");
                    }
                }

                Log::info('Recalculated inventory for company', [
                    'company_id' => $this->companyId,
                    'products_count' => $recalculated,
                ]);
            } else {
                // Recalculate for all products in all companies
                $companies = Company::all();

                foreach ($companies as $company) {
                    $products = Product::where('company_id', $company->id)->get();

                    foreach ($products as $product) {
                        InventoryLevel::recalculateForProduct($product->id, null, $product->company_id);
                        $recalculated++;

                        if ($recalculated % 100 === 0) {
                            Log::info("Recalculated {$recalculated} products");
                        }
                    }
                }

                Log::info('Recalculated inventory for all companies', [
                    'companies_count' => $companies->count(),
                    'products_count' => $recalculated,
                ]);
            }

            Log::info('Inventory recalculation completed', [
                'total_products' => $recalculated,
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory recalculation failed', [
                'product_id' => $this->productId,
                'company_id' => $this->companyId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Inventory recalculation job failed permanently', [
            'product_id' => $this->productId,
            'company_id' => $this->companyId,
            'error' => $exception->getMessage(),
        ]);
    }
}
