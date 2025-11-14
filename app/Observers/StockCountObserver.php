<?php

namespace App\Observers;

use App\Models\StockCount;
use App\Models\StockCountItem;
use App\Models\Product;
use App\Models\InventoryLevel;
use App\Notifications\Audit\CountCompleted;
use App\Notifications\Discrepancy\CriticalDiscrepancy;
use App\Models\UserNotificationPreference;

class StockCountObserver
{
    /**
     * Handle the StockCount "updated" event.
     */
    public function updated(StockCount $count): void
    {
        // Check if status changed to completed
        if ($count->wasChanged('status') && $count->status === 'completed') {
            // Notify the audit responsible
            if ($count->stockAudit && $count->stockAudit->responsible) {
                $count->stockAudit->responsible->notify(new CountCompleted($count));
            }

            // Check for critical discrepancies
            $this->checkCriticalDiscrepancies($count);
        }
    }

    /**
     * Check for critical discrepancies and notify.
     */
    protected function checkCriticalDiscrepancies(StockCount $count): void
    {
        $items = $count->items;

        foreach ($items as $item) {
            $product = Product::where('code', $item->product_code)->first();

            if (!$product) {
                continue;
            }

            // Calculate theoretical stock
            $theoreticalStock = 0;
            if ($count->area_id) {
                $inventoryLevel = InventoryLevel::where('product_id', $product->id)
                    ->where('area_id', $count->area_id)
                    ->first();
                $theoreticalStock = $inventoryLevel ? (float) $inventoryLevel->quantity : 0;
            } else {
                $theoreticalStock = InventoryLevel::getTotalQuantityForProduct(
                    $product->id,
                    $product->company_id
                );
            }

            $countedStock = $item->quantity_counted;
            $difference = $countedStock - $theoreticalStock;
            $percentageDiff = $theoreticalStock > 0
                ? (($difference / $theoreticalStock) * 100)
                : ($countedStock > 0 ? 100 : 0);

            // Check if discrepancy is critical
            $isCritical = $this->isCriticalDiscrepancy(abs($percentageDiff));

            if ($isCritical && $count->stockAudit && $count->stockAudit->responsible) {
                $count->stockAudit->responsible->notify(
                    new CriticalDiscrepancy($item, $theoreticalStock, $difference, $percentageDiff)
                );
            }
        }
    }

    /**
     * Determine if discrepancy percentage is critical.
     */
    protected function isCriticalDiscrepancy(float $percentageDiff): bool
    {
        // Default threshold is 10%
        $defaultThreshold = 10;

        // You can make this configurable per user later
        // For now, use a fixed threshold
        return $percentageDiff >= $defaultThreshold;
    }
}
