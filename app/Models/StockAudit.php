<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class StockAudit extends Model implements Auditable
{
    use AuditableTrait, BelongsToCompany;

    protected $fillable = [
        'company_id',
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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($audit) {
            if (empty($audit->code)) {
                $audit->code = self::generateCode();
            }

            // Set default status if not provided
            if (empty($audit->status)) {
                $audit->status = 'planned';
            }
        });
    }

    /**
     * Generate a unique audit code
     * Format: AUD-YYYYMM-XXXX (e.g., AUD-202501-0001)
     */
    public static function generateCode(): string
    {
        $prefix = 'AUD-' . date('Ym') . '-';

        // Get the last audit code for the current company and month
        $query = self::query();

        // If user is authenticated and has a company, scope to their company
        if (auth()->check() && auth()->user()->company_id && !auth()->user()->isAdmin()) {
            $query->where('company_id', auth()->user()->company_id);
        }

        $lastAudit = $query->where('code', 'like', $prefix . '%')
            ->orderBy('code', 'desc')
            ->first();

        if ($lastAudit) {
            // Extract the numeric part and increment
            $lastNumber = (int) str_replace($prefix, '', $lastAudit->code);
            $newNumber = $lastNumber + 1;
        } else {
            // Start from 1 if no audits exist for this month
            $newNumber = 1;
        }

        // Format with leading zeros (4 digits)
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

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
