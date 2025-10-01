<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class StockAudit extends Model implements Auditable
{
    use AuditableTrait;

    protected $fillable = [
        'title',
        'code',
        'description',
        'responsible_id',
        'start_date',
        'end_date',
        'status',
        'required_counts',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'required_counts' => 'integer',
    ];

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function stockCounts(): HasMany
    {
        return $this->hasMany(StockCount::class);
    }

    public function scopePlanned($query)
    {
        return $query->where('status', 'planned');
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
        return in_array($this->status, ['planned', 'in_progress']);
    }
}
