<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Product extends Model implements Auditable
{
    use AuditableTrait, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'parent_product_id',
        'code',
        'core_reference',
        'name',
        'description',
        'category_id',
        'color',
        'size',
        'unit',
        'price',
        'cost',
        'barcode',
        'sku',
        'min_stock',
        'max_stock',
        'active',
        'is_master',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'min_stock' => 'integer',
        'max_stock' => 'integer',
        'active' => 'boolean',
        'is_master' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->code)) {
                $product->code = self::generateCode();
            }

            // Auto-extract core reference from code if not provided
            if (empty($product->core_reference) && !empty($product->code)) {
                $product->core_reference = self::extractCoreReference($product->code);
            }
        });
    }

    /**
     * Parent product relationship
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'parent_product_id');
    }

    /**
     * Child variations relationship
     */
    public function variations(): HasMany
    {
        return $this->hasMany(Product::class, 'parent_product_id');
    }

    /**
     * Category relationship
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all products with the same core reference (siblings)
     */
    public function siblings()
    {
        if (empty($this->core_reference)) {
            return collect([]);
        }

        return self::where('core_reference', $this->core_reference)
            ->where('id', '!=', $this->id)
            ->get();
    }

    /**
     * Get all products in the same variation group (including self)
     */
    public function variationGroup()
    {
        if (empty($this->core_reference)) {
            return collect([$this]);
        }

        return self::where('core_reference', $this->core_reference)->get();
    }

    /**
     * Extract core reference from product code
     * Example: C3065000020003 -> C306500002
     */
    public static function extractCoreReference(string $code): string
    {
        // Remove last 4 digits if code matches pattern
        if (preg_match('/^([A-Z]\d+)(\d{4})$/', $code, $matches)) {
            return $matches[1];
        }

        // If doesn't match expected pattern, return the code as-is
        return $code;
    }

    /**
     * Generate a unique product code
     * Format: PROD-XXXX (e.g., PROD-0001)
     */
    public static function generateCode(): string
    {
        $prefix = 'PROD-';

        // Get the last product code for the current company
        $query = self::query();

        // If user is authenticated and has a company, scope to their company
        if (auth()->check() && auth()->user()->company_id && !auth()->user()->isAdmin()) {
            $query->where('company_id', auth()->user()->company_id);
        }

        $lastProduct = $query->where('code', 'like', $prefix . '%')
            ->orderBy('code', 'desc')
            ->first();

        if ($lastProduct) {
            // Extract the numeric part and increment
            $lastNumber = (int) str_replace($prefix, '', $lastProduct->code);
            $newNumber = $lastNumber + 1;
        } else {
            // Start from 1 if no products exist
            $newNumber = 1;
        }

        // Format with leading zeros (4 digits)
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get display name with variation info
     */
    public function getFullNameAttribute(): string
    {
        $parts = [$this->name];

        if ($this->color) {
            $parts[] = $this->color;
        }

        if ($this->size) {
            $parts[] = $this->size;
        }

        return implode(' - ', $parts);
    }
}
