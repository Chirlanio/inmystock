<?php

use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
});
