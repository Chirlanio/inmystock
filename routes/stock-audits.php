<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\StockAuditController;
use App\Http\Controllers\StockCountController;
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
        Route::get('counts/{stockCount}', [StockCountController::class, 'show'])->name('show');
        Route::get('counts/{stockCount}/edit', [StockCountController::class, 'edit'])->name('edit');
        Route::put('counts/{stockCount}', [StockCountController::class, 'update'])->name('update');
        Route::delete('counts/{stockCount}', [StockCountController::class, 'destroy'])->name('destroy');

        // Count actions
        Route::post('counts/{stockCount}/start', [StockCountController::class, 'start'])->name('start');
        Route::post('counts/{stockCount}/complete', [StockCountController::class, 'complete'])->name('complete');
    });
});
