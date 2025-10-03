<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\SystemLogController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('companies', CompanyController::class);

    // System Logs
    Route::get('logs', [SystemLogController::class, 'index'])->name('logs.index');
    Route::get('logs/download', [SystemLogController::class, 'download'])->name('logs.download');
    Route::post('logs/clear', [SystemLogController::class, 'clear'])->name('logs.clear');
    Route::delete('logs', [SystemLogController::class, 'delete'])->name('logs.delete');
});