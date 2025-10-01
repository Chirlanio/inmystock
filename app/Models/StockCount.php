<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class StockCount extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'stock_audit_id',
        'area_id',
        'counter_id',
        'count_number',
        'status',
        'started_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'count_number' => 'integer',
    ];

    public function stockAudit(): BelongsTo
    {
        return $this->belongsTo(StockAudit::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function counter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counter_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockCountItem::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['pending', 'in_progress']);
    }

    public function start(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
