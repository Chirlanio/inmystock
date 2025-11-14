<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddRequestId
{
    /**
     * Handle an incoming request.
     *
     * Adds a unique request ID to each API request for tracking and logging.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Generate or use existing request ID
        $requestId = $request->header('X-Request-ID') ?? 'req_' . Str::random(12);

        // Store in request attributes for use in controllers and logs
        $request->attributes->set('request_id', $requestId);

        $response = $next($request);

        // Add request ID to response headers
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
