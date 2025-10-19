<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/areas.php';
require __DIR__.'/products.php';
require __DIR__.'/suppliers.php';
require __DIR__.'/inventory.php';
require __DIR__.'/inventory-movements.php';
require __DIR__.'/reports.php';
require __DIR__.'/stock-audits.php';
require __DIR__.'/admin.php';
