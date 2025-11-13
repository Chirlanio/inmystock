<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Middleware\AddRequestId;
use App\Http\Middleware\EnsureJsonResponse;
use App\Http\Middleware\ForceHttps;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
| API Versioning: /api/v1/...
|
*/

// API v1 Routes
Route::prefix('v1')
    ->middleware([EnsureJsonResponse::class, AddRequestId::class, ForceHttps::class])
    ->group(function () {
        // Authentication routes (public)
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AuthController::class, 'login'])
                ->name('api.v1.auth.login')
                ->middleware('throttle:10,1'); // 10 requests per minute

            // Protected auth routes
            Route::middleware(['auth:sanctum'])->group(function () {
                Route::post('/logout', [AuthController::class, 'logout'])
                    ->name('api.v1.auth.logout');

                Route::get('/me', [AuthController::class, 'me'])
                    ->name('api.v1.auth.me');

                Route::get('/tokens', [AuthController::class, 'tokens'])
                    ->name('api.v1.auth.tokens');

                Route::delete('/tokens/{tokenId}', [AuthController::class, 'revokeToken'])
                    ->name('api.v1.auth.revoke-token');

                Route::delete('/tokens', [AuthController::class, 'revokeAllTokens'])
                    ->name('api.v1.auth.revoke-all-tokens');
            });
        });

        // Protected API routes
        Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
            // Products API (to be implemented in Phase 2)
            Route::prefix('products')->name('api.v1.products.')->group(function () {
                // Route::get('/', [ProductController::class, 'index'])->name('index');
                // Route::get('/{id}', [ProductController::class, 'show'])->name('show');
                // Route::post('/', [ProductController::class, 'store'])->name('store');
                // Route::put('/{id}', [ProductController::class, 'update'])->name('update');
                // Route::delete('/{id}', [ProductController::class, 'destroy'])->name('destroy');
            });

            // Inventory Levels API (to be implemented in Phase 2)
            Route::prefix('inventory')->name('api.v1.inventory.')->group(function () {
                // Route::get('/', [InventoryLevelController::class, 'index'])->name('index');
                // Route::get('/{id}', [InventoryLevelController::class, 'show'])->name('show');
                // Route::post('/adjust', [InventoryLevelController::class, 'adjust'])->name('adjust');
                // Route::post('/transfer', [InventoryLevelController::class, 'transfer'])->name('transfer');
                // Route::get('/low-stock', [InventoryLevelController::class, 'lowStock'])->name('low-stock');
            });

            // Inventory Movements API (to be implemented in Phase 2)
            Route::prefix('movements')->name('api.v1.movements.')->group(function () {
                // Route::get('/', [InventoryMovementController::class, 'index'])->name('index');
                // Route::get('/{id}', [InventoryMovementController::class, 'show'])->name('show');
                // Route::post('/', [InventoryMovementController::class, 'store'])->name('store');
                // Route::get('/product/{id}', [InventoryMovementController::class, 'byProduct'])->name('by-product');
            });

            // Stock Audits API (to be implemented in Phase 3)
            Route::prefix('audits')->name('api.v1.audits.')->group(function () {
                // Route::get('/', [StockAuditController::class, 'index'])->name('index');
                // Route::get('/{id}', [StockAuditController::class, 'show'])->name('show');
                // Route::post('/', [StockAuditController::class, 'store'])->name('store');
                // Route::put('/{id}', [StockAuditController::class, 'update'])->name('update');
                // Route::post('/{id}/complete', [StockAuditController::class, 'complete'])->name('complete');
                // Route::get('/{id}/discrepancies', [StockAuditController::class, 'discrepancies'])->name('discrepancies');
            });

            // Stock Counts API (to be implemented in Phase 3)
            Route::prefix('counts')->name('api.v1.counts.')->group(function () {
                // Route::get('/', [StockCountController::class, 'index'])->name('index');
                // Route::get('/{id}', [StockCountController::class, 'show'])->name('show');
                // Route::post('/', [StockCountController::class, 'store'])->name('store');
                // Route::put('/{id}', [StockCountController::class, 'update'])->name('update');
                // Route::post('/{id}/items', [StockCountController::class, 'addItems'])->name('add-items');
            });

            // Reports API (to be implemented in Phase 4)
            Route::prefix('reports')->name('api.v1.reports.')->group(function () {
                // Route::get('/inventory-valuation', [ReportController::class, 'inventoryValuation'])->name('inventory-valuation');
                // Route::get('/stock-movement', [ReportController::class, 'stockMovement'])->name('stock-movement');
                // Route::get('/audit-summary', [ReportController::class, 'auditSummary'])->name('audit-summary');
                // Route::get('/abc-analysis', [ReportController::class, 'abcAnalysis'])->name('abc-analysis');
            });
        });
    });

/*
|--------------------------------------------------------------------------
| API v2 Routes (Future)
|--------------------------------------------------------------------------
|
| Reserve this space for future API version 2
|
*/

// Route::prefix('v2')->group(function () {
//     // Future v2 endpoints
// });
