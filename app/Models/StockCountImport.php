<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockCountImport extends Model
{
    protected $fillable = [
        'stock_count_id',
        'user_id',
        'file_name',
        'file_path',
        'file_format',
        'delimiter',
        'status',
        'total_lines',
        'processed_lines',
        'successful_lines',
        'failed_lines',
        'errors',
        'notes',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'errors' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_lines' => 'integer',
        'processed_lines' => 'integer',
        'successful_lines' => 'integer',
        'failed_lines' => 'integer',
    ];

    public function stockCount(): BelongsTo
    {
        return $this->belongsTo(StockCount::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if import is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if import has failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if import is in progress.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Get success rate percentage.
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_lines === 0) {
            return 0;
        }

        return round(($this->successful_lines / $this->total_lines) * 100, 2);
    }
}
