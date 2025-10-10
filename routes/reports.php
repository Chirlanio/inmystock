<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

    // Relatórios de divergências
    Route::get('reports/stock-vs-count', [ReportController::class, 'stockVsCount'])->name('reports.stock-vs-count');
    Route::get('reports/count-vs-count', [ReportController::class, 'countVsCount'])->name('reports.count-vs-count');
    Route::get('reports/missing-products', [ReportController::class, 'missingProducts'])->name('reports.missing-products');

    // Exportação de relatórios
    Route::get('reports/export/{type}', [ReportController::class, 'export'])->name('reports.export');
});
