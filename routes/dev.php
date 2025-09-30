<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Development routes for testing error pages (only in local environment)
if (app()->environment('local')) {
    Route::prefix('dev')->name('dev.')->group(function () {
        Route::get('/error-404', function () {
            return Inertia::render('errors/404');
        })->name('error.404');

        Route::get('/error-403', function () {
            return Inertia::render('errors/403');
        })->name('error.403');

        Route::get('/error-500', function () {
            return Inertia::render('errors/500');
        })->name('error.500');
    });
}