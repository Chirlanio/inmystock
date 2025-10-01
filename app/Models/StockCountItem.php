<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class StockCountItem extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'stock_count_id',
        'product_code',
        'product_name',
        'quantity_counted',
        'unit',
        'location',
        'notes',
    ];

    protected $casts = [
        'quantity_counted' => 'decimal:2',
    ];

    public function stockCount(): BelongsTo
    {
        return $this->belongsTo(StockCount::class);
    }
}
