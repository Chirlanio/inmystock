<?php

namespace App\Services;

use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\StockCount;
use App\Models\StockCountItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StockCountComparisonService
{
    /**
     * Compare stock count with system inventory.
     *
     * @return array{
     *     total_counted: int,
     *     total_system: int,
     *     matched_items: int,
     *     discrepancy_items: int,
     *     missing_in_count: int,
     *     missing_in_system: int,
     *     total_discrepancy_value: float,
     *     items: Collection
     * }
     */
    public function compare(StockCount $stockCount): array
    {
        // Get all counted items
        $countedItems = $stockCount->items()
            ->with('stockCount.area')
            ->get();

        // Get system inventory for the area
        $area = $stockCount->area;
        $warehouse = $area ? $area->warehouse : null;

        $comparisonItems = collect();
        $totalCountedQty = 0;
        $totalSystemQty = 0;
        $matchedItems = 0;
        $discrepancyItems = 0;
        $totalDiscrepancyValue = 0;

        // Process each counted item
        foreach ($countedItems as $item) {
            $product = Product::where('code', $item->product_code)
                ->orWhere('barcode', $item->product_code)
                ->first();

            if (!$product) {
                // Product not found in system
                $comparisonItems->push([
                    'id' => $item->id,
                    'product_code' => $item->product_code,
                    'product_name' => $item->product_name ?? 'Produto não encontrado',
                    'product_id' => null,
                    'quantity_counted' => (float) $item->quantity_counted,
                    'quantity_system' => 0,
                    'discrepancy' => (float) $item->quantity_counted,
                    'discrepancy_percentage' => 100,
                    'status' => 'missing_in_system',
                    'unit' => $item->unit ?? 'UN',
                    'location' => $item->location,
                    'notes' => $item->notes,
                    'product_cost' => 0,
                    'discrepancy_value' => 0,
                ]);

                $totalCountedQty += (float) $item->quantity_counted;
                $discrepancyItems++;
                continue;
            }

            // Get system inventory for this product
            $systemInventory = InventoryLevel::where('product_id', $product->id)
                ->when($warehouse, fn($q) => $q->where('warehouse_id', $warehouse->id))
                ->first();

            $systemQty = $systemInventory ? (float) $systemInventory->quantity : 0;
            $countedQty = (float) $item->quantity_counted;
            $discrepancy = $countedQty - $systemQty;
            $discrepancyPercentage = $systemQty > 0
                ? (($discrepancy / $systemQty) * 100)
                : ($countedQty > 0 ? 100 : 0);

            $productCost = (float) ($product->cost ?? 0);
            $discrepancyValue = $discrepancy * $productCost;

            // Determine status
            $status = 'matched';
            if (abs($discrepancy) > 0.01) { // Allow small floating point differences
                $status = 'discrepancy';
                $discrepancyItems++;
            } else {
                $matchedItems++;
            }

            $comparisonItems->push([
                'id' => $item->id,
                'product_code' => $product->code,
                'product_name' => $product->name,
                'product_id' => $product->id,
                'quantity_counted' => $countedQty,
                'quantity_system' => $systemQty,
                'discrepancy' => $discrepancy,
                'discrepancy_percentage' => round($discrepancyPercentage, 2),
                'status' => $status,
                'unit' => $product->unit,
                'location' => $item->location,
                'notes' => $item->notes,
                'product_cost' => $productCost,
                'discrepancy_value' => $discrepancyValue,
            ]);

            $totalCountedQty += $countedQty;
            $totalSystemQty += $systemQty;
            $totalDiscrepancyValue += $discrepancyValue;
        }

        // Find products in system but not counted
        $countedProductCodes = $countedItems->pluck('product_code')->toArray();

        $missingInCount = Product::whereHas('inventoryLevels', function ($query) use ($warehouse) {
            $query->when($warehouse, fn($q) => $q->where('warehouse_id', $warehouse->id))
                  ->where('quantity', '>', 0);
        })
        ->whereNotIn('code', $countedProductCodes)
        ->whereNotIn('barcode', $countedProductCodes)
        ->with(['inventoryLevels' => function ($query) use ($warehouse) {
            $query->when($warehouse, fn($q) => $q->where('warehouse_id', $warehouse->id));
        }])
        ->get();

        foreach ($missingInCount as $product) {
            $inventory = $product->inventoryLevels->first();
            $systemQty = $inventory ? (float) $inventory->quantity : 0;

            if ($systemQty > 0) {
                $productCost = (float) ($product->cost ?? 0);
                $discrepancyValue = -$systemQty * $productCost;

                $comparisonItems->push([
                    'id' => null,
                    'product_code' => $product->code,
                    'product_name' => $product->name,
                    'product_id' => $product->id,
                    'quantity_counted' => 0,
                    'quantity_system' => $systemQty,
                    'discrepancy' => -$systemQty,
                    'discrepancy_percentage' => -100,
                    'status' => 'missing_in_count',
                    'unit' => $product->unit,
                    'location' => null,
                    'notes' => 'Produto não contado',
                    'product_cost' => $productCost,
                    'discrepancy_value' => $discrepancyValue,
                ]);

                $totalSystemQty += $systemQty;
                $discrepancyItems++;
                $totalDiscrepancyValue += $discrepancyValue;
            }
        }

        // Sort by absolute discrepancy value (highest first)
        $comparisonItems = $comparisonItems->sortByDesc(function ($item) {
            return abs($item['discrepancy_value']);
        })->values();

        return [
            'total_counted' => $totalCountedQty,
            'total_system' => $totalSystemQty,
            'matched_items' => $matchedItems,
            'discrepancy_items' => $discrepancyItems,
            'missing_in_count' => $missingInCount->count(),
            'missing_in_system' => $countedItems->whereNull('product_id')->count(),
            'total_discrepancy_value' => round($totalDiscrepancyValue, 2),
            'items' => $comparisonItems,
        ];
    }

    /**
     * Get summary statistics for a stock count.
     */
    public function getSummary(StockCount $stockCount): array
    {
        $comparison = $this->compare($stockCount);

        $totalItems = $comparison['items']->count();
        $accuracy = $totalItems > 0
            ? round(($comparison['matched_items'] / $totalItems) * 100, 2)
            : 0;

        return [
            'total_items' => $totalItems,
            'matched_items' => $comparison['matched_items'],
            'discrepancy_items' => $comparison['discrepancy_items'],
            'accuracy_percentage' => $accuracy,
            'total_counted' => $comparison['total_counted'],
            'total_system' => $comparison['total_system'],
            'total_discrepancy_value' => $comparison['total_discrepancy_value'],
        ];
    }

    /**
     * Get critical discrepancies (above threshold).
     */
    public function getCriticalDiscrepancies(StockCount $stockCount, float $thresholdPercentage = 10.0): Collection
    {
        $comparison = $this->compare($stockCount);

        return $comparison['items']->filter(function ($item) use ($thresholdPercentage) {
            return abs($item['discrepancy_percentage']) >= $thresholdPercentage;
        });
    }
}
