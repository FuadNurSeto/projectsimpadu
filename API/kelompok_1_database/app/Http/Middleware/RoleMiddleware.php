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

        $userRoleIds = $user->roles->pluck('id_role')->toArray();

        foreach ($roles as $role) {
            if (in_array((int) $role, $userRoleIds, true)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Forbidden: You do not have access to this resource'], 403);
    }
}
