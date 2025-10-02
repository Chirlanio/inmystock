<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Area extends Model implements Auditable
{
    use AuditableTrait, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'location',
        'location_count',
        'code',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($area) {
            if (empty($area->code)) {
                $area->code = self::generateCode();
            }
        });
    }

    /**
     * Generate a unique area code
     * Format: AREA-XXXX (e.g., AREA-0001)
     */
    public static function generateCode(): string
    {
        $prefix = 'AREA-';

        // Get the last area code for the current company
        $query = self::query();

        // If user is authenticated and has a company, scope to their company
        if (auth()->check() && auth()->user()->company_id && !auth()->user()->isAdmin()) {
            $query->where('company_id', auth()->user()->company_id);
        }

        $lastArea = $query->where('code', 'like', $prefix . '%')
            ->orderBy('code', 'desc')
            ->first();

        if ($lastArea) {
            // Extract the numeric part and increment
            $lastNumber = (int) str_replace($prefix, '', $lastArea->code);
            $newNumber = $lastNumber + 1;
        } else {
            // Start from 1 if no areas exist
            $newNumber = 1;
        }

        // Format with leading zeros (4 digits)
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function stockCounts(): HasMany
    {
        return $this->hasMany(StockCount::class);
    }
}
