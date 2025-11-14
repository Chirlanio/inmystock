<?php

namespace App\Providers;

use App\Models\InventoryLevel;
use App\Models\StockAudit;
use App\Models\StockCount;
use App\Observers\InventoryLevelObserver;
use App\Observers\StockAuditObserver;
use App\Observers\StockCountObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for notifications
        InventoryLevel::observe(InventoryLevelObserver::class);
        StockAudit::observe(StockAuditObserver::class);
        StockCount::observe(StockCountObserver::class);
    }
}
