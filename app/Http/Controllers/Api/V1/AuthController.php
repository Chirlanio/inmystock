<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponses;

    /**
     * Login and generate API token.
     *
     * @group Authentication
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'token_name' => ['sometimes', 'string', 'max:255'],
            'abilities' => ['sometimes', 'array'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->unauthorizedResponse('Invalid credentials');
        }

        // Check if user is active
        if (!$user->is_active) {
            return $this->forbiddenResponse('Your account has been deactivated');
        }

        // Generate token name
        $tokenName = $request->token_name ?? 'API Token - ' . now()->format('Y-m-d H:i:s');

        // Get abilities from user's role permissions if not specified
        $abilities = $request->abilities ?? $this->getUserAbilities($user);

        // Create token
        $token = $user->createToken($tokenName, $abilities);

        return $this->successResponse([
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at?->toIso8601String(),
            'user' => new UserResource($user->load('role')),
            'abilities' => $abilities,
        ], 'Authentication successful');
    }

    /**
     * Logout and revoke current token.
     *
     * @group Authentication
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Token revoked successfully');
    }

    /**
     * Get authenticated user details.
     *
     * @group Authentication
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return $this->successResponse(new UserResource($user));
    }

    /**
     * List all active tokens for the authenticated user.
     *
     * @group Authentication
     */
    public function tokens(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'created_at' => $token->created_at->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
            ];
        });

        return $this->successResponse($tokens);
    }

    /**
     * Revoke a specific token.
     *
     * @group Authentication
     */
    public function revokeToken(Request $request, int $tokenId): JsonResponse
    {
        $token = $request->user()->tokens()->find($tokenId);

        if (!$token) {
            return $this->notFoundResponse('Token');
        }

        $token->delete();

        return $this->successResponse(null, 'Token revoked successfully');
    }

    /**
     * Revoke all tokens except the current one.
     *
     * @group Authentication
     */
    public function revokeAllTokens(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;

        $deletedCount = $request->user()->tokens()
            ->where('id', '!=', $currentTokenId)
            ->delete();

        return $this->successResponse([
            'revoked_count' => $deletedCount,
        ], 'All other tokens revoked successfully');
    }

    /**
     * Get abilities from user's role permissions.
     */
    private function getUserAbilities(\App\Models\User $user): array
    {
        $abilities = [];

        if (!$user->role) {
            return ['*']; // Default: all abilities
        }

        $permissions = $user->role->permissions ?? [];

        // Map permissions to abilities
        foreach ($permissions as $permission) {
            // Inventory permissions
            if (str_starts_with($permission, 'inventory.')) {
                if (in_array($permission, ['inventory.view', 'inventory.view_all'])) {
                    $abilities[] = 'inventory:read';
                }
                if (in_array($permission, ['inventory.create', 'inventory.edit', 'inventory.adjust', 'inventory.transfer'])) {
                    $abilities[] = 'inventory:write';
                }
            }

            // Products permissions
            if (str_starts_with($permission, 'products.')) {
                if ($permission === 'products.view') {
                    $abilities[] = 'products:read';
                }
                if (in_array($permission, ['products.create', 'products.edit', 'products.delete'])) {
                    $abilities[] = 'products:write';
                }
            }

            // Audits permissions
            if (str_starts_with($permission, 'audits.')) {
                if ($permission === 'audits.view') {
                    $abilities[] = 'audits:read';
                }
                if (in_array($permission, ['audits.export', 'audits.view_all'])) {
                    $abilities[] = 'audits:read';
                }
            }

            // Reports permissions
            if (str_starts_with($permission, 'reports.')) {
                $abilities[] = 'reports:read';
            }
        }

        // Admin role gets all abilities
        if ($user->role->slug === 'admin') {
            $abilities[] = 'admin:all';
        }

        // Remove duplicates
        $abilities = array_unique($abilities);

        return !empty($abilities) ? $abilities : ['*'];
    }
}
