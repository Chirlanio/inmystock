<?php

use App\Http\Controllers\AreaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::resource('areas', AreaController::class);
});
