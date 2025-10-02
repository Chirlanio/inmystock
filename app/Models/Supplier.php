<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Supplier extends Model implements Auditable
{
    use AuditableTrait, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'contact_name',
        'notes',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (empty($supplier->code)) {
                $supplier->code = self::generateCode();
            }
        });
    }

    /**
     * Generate a unique supplier code
     * Format: SUP-XXXX (e.g., SUP-0001)
     */
    public static function generateCode(): string
    {
        $prefix = 'SUP-';

        // Get the last supplier code for the current company
        $query = self::query();

        // If user is authenticated and has a company, scope to their company
        if (auth()->check() && auth()->user()->company_id && !auth()->user()->isAdmin()) {
            $query->where('company_id', auth()->user()->company_id);
        }

        $lastSupplier = $query->where('code', 'like', $prefix . '%')
            ->orderBy('code', 'desc')
            ->first();

        if ($lastSupplier) {
            // Extract the numeric part and increment
            $lastNumber = (int) str_replace($prefix, '', $lastSupplier->code);
            $newNumber = $lastNumber + 1;
        } else {
            // Start from 1 if no suppliers exist
            $newNumber = 1;
        }

        // Format with leading zeros (4 digits)
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
