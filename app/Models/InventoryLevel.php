<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLevel extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'product_id',
        'area_id',
        'quantity',
        'reserved_quantity',
        'available_quantity',
        'last_movement_at',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'reserved_quantity' => 'decimal:3',
        'available_quantity' => 'decimal:3',
        'last_movement_at' => 'datetime',
    ];

    /**
     * Product relationship
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Area relationship
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    /**
     * Recalculate inventory level for a specific product and area
     *
     * @param int $productId
     * @param int|null $areaId
     * @param int $companyId
     * @return void
     */
    public static function recalculateForProduct(int $productId, ?int $areaId, int $companyId): void
    {
        // Sum all movements for this product/area combination
        $totalQuantity = InventoryMovement::where('company_id', $companyId)
            ->where('product_id', $productId)
            ->where(function ($query) use ($areaId) {
                // For transfers, we need to check both to_area_id and area_id
                $query->where('area_id', $areaId)
                    ->orWhere('to_area_id', $areaId);
            })
            ->get()
            ->sum(function ($movement) use ($areaId) {
                // Calculate the quantity change based on movement type
                if ($movement->type === InventoryMovement::TYPE_ENTRY) {
                    return abs($movement->quantity);
                } elseif ($movement->type === InventoryMovement::TYPE_EXIT) {
                    return -abs($movement->quantity);
                } elseif ($movement->type === InventoryMovement::TYPE_ADJUSTMENT) {
                    return abs($movement->quantity);
                } elseif ($movement->type === InventoryMovement::TYPE_TRANSFER_IN && $movement->to_area_id == $areaId) {
                    return abs($movement->quantity);
                } elseif ($movement->type === InventoryMovement::TYPE_TRANSFER_OUT && $movement->from_area_id == $areaId) {
                    return -abs($movement->quantity);
                }
                return 0;
            });

        // Update or create the inventory level
        $inventoryLevel = self::updateOrCreate(
            [
                'company_id' => $companyId,
                'product_id' => $productId,
                'area_id' => $areaId,
            ],
            [
                'quantity' => $totalQuantity,
                'available_quantity' => $totalQuantity, // Simple calculation for now
                'last_movement_at' => now(),
            ]
        );
    }

    /**
     * Get total quantity for a product across all areas
     *
     * @param int $productId
     * @param int $companyId
     * @return float
     */
    public static function getTotalQuantityForProduct(int $productId, int $companyId): float
    {
        return self::where('company_id', $companyId)
            ->where('product_id', $productId)
            ->sum('quantity');
    }

    /**
     * Get available quantity for a product across all areas
     *
     * @param int $productId
     * @param int $companyId
     * @return float
     */
    public static function getAvailableQuantityForProduct(int $productId, int $companyId): float
    {
        return self::where('company_id', $companyId)
            ->where('product_id', $productId)
            ->sum('available_quantity');
    }

    /**
     * Check if product has low stock
     *
     * @return bool
     */
    public function isLowStock(): bool
    {
        if (!$this->product) {
            return false;
        }

        // Get total quantity across all areas
        $totalQuantity = self::getTotalQuantityForProduct($this->product_id, $this->company_id);

        return $totalQuantity < $this->product->min_stock;
    }

    /**
     * Reserve quantity for a product
     *
     * @param float $quantity
     * @return bool
     */
    public function reserve(float $quantity): bool
    {
        if ($this->available_quantity < $quantity) {
            return false;
        }

        $this->reserved_quantity += $quantity;
        $this->available_quantity = $this->quantity - $this->reserved_quantity;
        $this->save();

        return true;
    }

    /**
     * Release reserved quantity
     *
     * @param float $quantity
     * @return bool
     */
    public function release(float $quantity): bool
    {
        if ($this->reserved_quantity < $quantity) {
            return false;
        }

        $this->reserved_quantity -= $quantity;
        $this->available_quantity = $this->quantity - $this->reserved_quantity;
        $this->save();

        return true;
    }
}
