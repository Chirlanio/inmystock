<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * Ensures that all API responses are in JSON format.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Set Accept header to application/json if not already set
        if (!$request->hasHeader('Accept') || $request->header('Accept') !== 'application/json') {
            $request->headers->set('Accept', 'application/json');
        }

        $response = $next($request);

        // Ensure response is JSON
        if (!$response->headers->has('Content-Type')) {
            $response->headers->set('Content-Type', 'application/json');
        }

        return $response;
    }
}
