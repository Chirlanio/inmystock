<?php

use App\Http\Controllers\InventoryMovementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('inventory-movements/export', [InventoryMovementController::class, 'export'])->name('inventory-movements.export');
    Route::resource('inventory-movements', InventoryMovementController::class);
});
