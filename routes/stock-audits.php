<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\StockAuditController;
use App\Http\Controllers\StockCountController;
use App\Http\Controllers\StockCountImportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {

    // Areas routes
    Route::resource('areas', AreaController::class);

    // Stock Audits routes
    Route::resource('stock-audits', StockAuditController::class);

    // Stock Counts routes (nested under stock-audits)
    Route::prefix('stock-audits/{stockAudit}')->name('stock-counts.')->group(function () {
        Route::get('counts', [StockCountController::class, 'index'])->name('index');
        Route::get('counts/create', [StockCountController::class, 'create'])->name('create');
        Route::post('counts', [StockCountController::class, 'store'])->name('store');
        Route::get('counts/{stockCount}', [StockCountController::class, 'show'])->where('stockCount', '[0-9]+')->name('show');
        Route::get('counts/{stockCount}/edit', [StockCountController::class, 'edit'])->where('stockCount', '[0-9]+')->name('edit');
        Route::put('counts/{stockCount}', [StockCountController::class, 'update'])->where('stockCount', '[0-9]+')->name('update');
        Route::delete('counts/{stockCount}', [StockCountController::class, 'destroy'])->where('stockCount', '[0-9]+')->name('destroy');

        // Count actions
        Route::post('counts/{stockCount}/start', [StockCountController::class, 'start'])->where('stockCount', '[0-9]+')->name('start');
        Route::post('counts/{stockCount}/complete', [StockCountController::class, 'complete'])->where('stockCount', '[0-9]+')->name('complete');
    });

    // Stock Count Imports and direct access routes
    Route::prefix('stock-counts/{stockCount}')->group(function () {
        // Direct access to stock count (redirects to proper nested route)
        Route::get('/', function (\App\Models\StockCount $stockCount) {
            return redirect()->route('stock-counts.show', [
                'stockAudit' => $stockCount->stock_audit_id,
                'stockCount' => $stockCount->id
            ]);
        })->name('stock-counts.direct');

        Route::get('import', [StockCountImportController::class, 'create'])->name('stock-counts.import');
        Route::post('import', [StockCountImportController::class, 'store'])->name('stock-counts.import.store');
        Route::get('import/history', [StockCountImportController::class, 'index'])->name('stock-counts.import.history');
    });

    Route::get('stock-count-imports/{import}/download', [StockCountImportController::class, 'download'])->name('stock-count-imports.download');
});
