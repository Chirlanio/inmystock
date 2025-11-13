<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Jobs\Cleanup\CleanOldNotifications;
use App\Jobs\Notification\CheckAuditDueReminders;
use App\Jobs\Notification\CheckLowStockAlerts;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));

            Route::middleware('web')
                ->group(base_path('routes/dev.php'));

            Route::middleware('web')
                ->group(base_path('routes/notifications.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => CheckRole::class,
            'permission' => CheckPermission::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule) {
        // Check low stock and send alerts daily at 8am
        $schedule->job(new CheckLowStockAlerts())
            ->dailyAt('08:00')
            ->timezone('America/Sao_Paulo')
            ->name('check-low-stock-alerts')
            ->withoutOverlapping();

        // Check audit due reminders daily at 7am
        $schedule->job(new CheckAuditDueReminders())
            ->dailyAt('07:00')
            ->timezone('America/Sao_Paulo')
            ->name('check-audit-due-reminders')
            ->withoutOverlapping();

        // Clean old notifications weekly (Sundays at midnight)
        $schedule->job(new CleanOldNotifications())
            ->weekly()
            ->sundays()
            ->at('00:00')
            ->timezone('America/Sao_Paulo')
            ->name('clean-old-notifications')
            ->withoutOverlapping();

        // Clean failed jobs monthly
        $schedule->command('queue:prune-failed --hours=720')
            ->monthly()
            ->name('prune-failed-jobs');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function ($response, $exception, Request $request) {
            // Skip API requests
            if ($request->is('api/*')) {
                return $response;
            }

            $statusCode = $response->getStatusCode();

            // Handle 404 - Not Found
            if ($statusCode === 404) {
                return Inertia::render('errors/404')
                    ->toResponse($request)
                    ->setStatusCode(404);
            }

            // Handle 403 - Forbidden
            if ($statusCode === 403) {
                return Inertia::render('errors/403')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }

            // Handle 500/503 - Server Errors (only in production)
            if (!app()->environment(['local', 'testing']) && in_array($statusCode, [500, 503])) {
                return Inertia::render('errors/500')
                    ->toResponse($request)
                    ->setStatusCode($statusCode);
            }

            return $response;
        });
    })->create();
