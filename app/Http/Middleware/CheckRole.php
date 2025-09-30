<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            abort(401, 'Não autenticado');
        }

        if (!$request->user()->role) {
            abort(403, 'Usuário sem função definida');
        }

        foreach ($roles as $role) {
            if ($request->user()->role->slug === $role) {
                return $next($request);
            }
        }

        abort(403, 'Acesso negado. Você não tem permissão para acessar este recurso.');
    }
}
