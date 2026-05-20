<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array((string) $user->role_id, $roles, true)) {
            return response()->json(['message' => 'Forbidden: You do not have access to this resource'], 403);
        }

        return $next($request);
    }
}
