<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class InventoryMovement extends Model implements Auditable
{
    use AuditableTrait, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'code',
        'product_id',
        'area_id',
        'type',
        'quantity',
        'unit_cost',
        'total_cost',
        'reference_type',
        'reference_id',
        'from_area_id',
        'to_area_id',
        'notes',
        'document_number',
        'user_id',
        'movement_date',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'movement_date' => 'datetime',
    ];

    /**
     * Movement types
     */
    const TYPE_ENTRY = 'entry';
    const TYPE_EXIT = 'exit';
    const TYPE_ADJUSTMENT = 'adjustment';
    const TYPE_TRANSFER_OUT = 'transfer_out';
    const TYPE_TRANSFER_IN = 'transfer_in';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($movement) {
            if (empty($movement->code)) {
                $movement->code = self::generateCode();
            }

            // Auto-calculate total_cost if unit_cost is provided
            if (!empty($movement->unit_cost) && empty($movement->total_cost)) {
                $movement->total_cost = abs($movement->quantity) * $movement->unit_cost;
            }

            // Set movement_date to now if not provided
            if (empty($movement->movement_date)) {
                $movement->movement_date = now();
            }
        });

        // After creating, update inventory levels
        static::created(function ($movement) {
            $movement->updateInventoryLevels();
        });

        // After deleting, recalculate inventory levels
        static::deleted(function ($movement) {
            $movement->recalculateInventoryLevels();
        });
    }

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
     * From area relationship (for transfers)
     */
    public function fromArea(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'from_area_id');
    }

    /**
     * To area relationship (for transfers)
     */
    public function toArea(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'to_area_id');
    }

    /**
     * User who made the movement
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic reference to source document
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Generate a unique movement code
     * Format: MOV-YYYYMMDD-XXXX (e.g., MOV-20251019-0001)
     */
    public static function generateCode(): string
    {
        $date = now()->format('Ymd');
        $prefix = 'MOV-' . $date . '-';

        // Get the last movement code for today
        $query = self::query();

        // If user is authenticated and has a company, scope to their company
        if (auth()->check() && auth()->user()->company_id && !auth()->user()->isAdmin()) {
            $query->where('company_id', auth()->user()->company_id);
        }

        $lastMovement = $query->where('code', 'like', $prefix . '%')
            ->orderBy('code', 'desc')
            ->first();

        if ($lastMovement) {
            // Extract the numeric part and increment
            $lastNumber = (int) str_replace($prefix, '', $lastMovement->code);
            $newNumber = $lastNumber + 1;
        } else {
            // Start from 1 if no movements exist today
            $newNumber = 1;
        }

        // Format with leading zeros (4 digits)
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Update inventory levels based on this movement
     */
    public function updateInventoryLevels(): void
    {
        $targetAreaId = $this->determineTargetAreaId();

        // Get or create inventory level
        $inventoryLevel = InventoryLevel::firstOrCreate(
            [
                'company_id' => $this->company_id,
                'product_id' => $this->product_id,
                'area_id' => $targetAreaId,
            ],
            [
                'quantity' => 0,
                'reserved_quantity' => 0,
                'available_quantity' => 0,
            ]
        );

        // Calculate quantity change based on movement type
        $quantityChange = $this->calculateQuantityChange();

        // Update inventory level
        $inventoryLevel->quantity += $quantityChange;
        $inventoryLevel->available_quantity = $inventoryLevel->quantity - $inventoryLevel->reserved_quantity;
        $inventoryLevel->last_movement_at = $this->movement_date;
        $inventoryLevel->save();

        // For transfers, also update the from_area
        if ($this->type === self::TYPE_TRANSFER_OUT && $this->from_area_id) {
            $fromInventoryLevel = InventoryLevel::firstOrCreate(
                [
                    'company_id' => $this->company_id,
                    'product_id' => $this->product_id,
                    'area_id' => $this->from_area_id,
                ],
                [
                    'quantity' => 0,
                    'reserved_quantity' => 0,
                    'available_quantity' => 0,
                ]
            );

            $fromInventoryLevel->quantity -= abs($this->quantity);
            $fromInventoryLevel->available_quantity = $fromInventoryLevel->quantity - $fromInventoryLevel->reserved_quantity;
            $fromInventoryLevel->last_movement_at = $this->movement_date;
            $fromInventoryLevel->save();
        }
    }

    /**
     * Recalculate inventory levels after deletion
     */
    public function recalculateInventoryLevels(): void
    {
        $targetAreaId = $this->determineTargetAreaId();

        // Recalculate inventory level by summing all movements
        InventoryLevel::recalculateForProduct($this->product_id, $targetAreaId, $this->company_id);

        // For transfers, also recalculate the from_area
        if ($this->type === self::TYPE_TRANSFER_OUT && $this->from_area_id) {
            InventoryLevel::recalculateForProduct($this->product_id, $this->from_area_id, $this->company_id);
        }
    }

    /**
     * Determine the target area for this movement
     */
    private function determineTargetAreaId(): ?int
    {
        // For transfers, use to_area_id
        if ($this->type === self::TYPE_TRANSFER_IN || $this->type === self::TYPE_TRANSFER_OUT) {
            return $this->to_area_id;
        }

        // For other movements, use area_id
        return $this->area_id;
    }

    /**
     * Calculate quantity change based on movement type
     */
    private function calculateQuantityChange(): float
    {
        switch ($this->type) {
            case self::TYPE_ENTRY:
            case self::TYPE_TRANSFER_IN:
            case self::TYPE_ADJUSTMENT:
                return abs($this->quantity);

            case self::TYPE_EXIT:
            case self::TYPE_TRANSFER_OUT:
                return -abs($this->quantity);

            default:
                return 0;
        }
    }

    /**
     * Get movement type label
     */
    public function getTypeLabel(): string
    {
        return match($this->type) {
            self::TYPE_ENTRY => 'Entrada',
            self::TYPE_EXIT => 'Saída',
            self::TYPE_ADJUSTMENT => 'Ajuste',
            self::TYPE_TRANSFER_OUT => 'Transferência (Saída)',
            self::TYPE_TRANSFER_IN => 'Transferência (Entrada)',
            default => $this->type,
        };
    }

    /**
     * Get movement type color for badges
     */
    public function getTypeColor(): string
    {
        return match($this->type) {
            self::TYPE_ENTRY => 'success',
            self::TYPE_EXIT => 'danger',
            self::TYPE_ADJUSTMENT => 'warning',
            self::TYPE_TRANSFER_OUT => 'info',
            self::TYPE_TRANSFER_IN => 'info',
            default => 'default',
        };
    }

    /**
     * Check if movement is a transfer
     */
    public function isTransfer(): bool
    {
        return in_array($this->type, [self::TYPE_TRANSFER_IN, self::TYPE_TRANSFER_OUT]);
    }
}
