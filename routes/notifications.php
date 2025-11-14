<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Settings\NotificationPreferenceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Notification Routes
|--------------------------------------------------------------------------
|
| Routes for managing user notifications and preferences.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Notification Management
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/latest', [NotificationController::class, 'latest'])->name('latest');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/read/all', [NotificationController::class, 'destroyAllRead'])->name('destroy-all-read');
    });

    // Notification Preferences
    Route::prefix('notification-preferences')->name('notification-preferences.')->group(function () {
        Route::get('/', [NotificationPreferenceController::class, 'index'])->name('index');
        Route::put('/', [NotificationPreferenceController::class, 'update'])->name('update');
        Route::put('/{type}', [NotificationPreferenceController::class, 'updateSingle'])->name('update-single');
    });
});
