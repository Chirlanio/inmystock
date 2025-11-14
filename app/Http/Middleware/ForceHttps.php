<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     *
     * Forces HTTPS connections in production environment.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only enforce HTTPS in production
        if (app()->environment('production') && !$request->secure()) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'HTTPS_REQUIRED',
                    'message' => 'HTTPS is required for API requests in production',
                ],
            ], 426); // 426 Upgrade Required
        }

        $response = $next($request);

        // Add HSTS header in production
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
