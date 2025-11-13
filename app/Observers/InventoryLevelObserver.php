<?php

namespace App\Observers;

use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\User;
use App\Notifications\Stock\LowStockAlert;
use App\Models\UserNotificationPreference;

class InventoryLevelObserver
{
    /**
     * Handle the InventoryLevel "updated" event.
     */
    public function updated(InventoryLevel $inventoryLevel): void
    {
        // Check if stock is low
        $product = $inventoryLevel->product;

        if (!$product || !$product->min_stock || $product->min_stock <= 0) {
            return;
        }

        // Get total quantity for the product across all areas
        $totalQuantity = InventoryLevel::where('product_id', $product->id)
            ->sum('quantity');

        // Check if total stock is below minimum
        if ($totalQuantity < $product->min_stock) {
            $this->notifyLowStock($product, (int) $totalQuantity, $product->min_stock);
        }
    }

    /**
     * Notify relevant users about low stock.
     */
    protected function notifyLowStock(Product $product, int $currentStock, int $minStock): void
    {
        // Get users who should be notified
        // Notify managers, admins, and users with inventory permissions
        $usersToNotify = User::query()
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager'])
                    ->orWhere('level', '>=', 50); // Auditor level or higher
            })
            ->when($product->company_id, function ($query) use ($product) {
                return $query->where('company_id', $product->company_id);
            })
            ->get();

        foreach ($usersToNotify as $user) {
            // Check if user has this notification enabled
            $preference = UserNotificationPreference::where('user_id', $user->id)
                ->where('notification_type', UserNotificationPreference::TYPE_LOW_STOCK)
                ->first();

            // Skip if user has disabled all channels
            if ($preference && !$preference->email_enabled && !$preference->database_enabled) {
                continue;
            }

            // Check threshold from preferences
            if ($preference && isset($preference->settings['threshold_percentage'])) {
                $threshold = $preference->settings['threshold_percentage'];
                $percentageBelow = (($minStock - $currentStock) / $minStock) * 100;

                // Only notify if below threshold
                if ($percentageBelow < $threshold) {
                    continue;
                }
            }

            // Send notification
            $user->notify(new LowStockAlert($product, $currentStock, $minStock));
        }
    }
}
