<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponses
{
    /**
     * Return a success JSON response.
     */
    protected function successResponse(
        mixed $data = null,
        string $message = null,
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => true,
        ];

        if ($data !== null) {
            // Handle Laravel API Resources
            if ($data instanceof JsonResource || $data instanceof ResourceCollection) {
                $response['data'] = $data->resolve(request());

                // Add pagination meta if available
                if ($data instanceof ResourceCollection && $data->resource instanceof \Illuminate\Pagination\AbstractPaginator) {
                    $meta = array_merge($meta, [
                        'current_page' => $data->resource->currentPage(),
                        'per_page' => $data->resource->perPage(),
                        'total' => $data->resource->total(),
                        'last_page' => $data->resource->lastPage(),
                        'from' => $data->resource->firstItem(),
                        'to' => $data->resource->lastItem(),
                    ]);
                }
            } else {
                $response['data'] = $data;
            }
        }

        if ($message) {
            $response['message'] = $message;
        }

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return an error JSON response.
     */
    protected function errorResponse(
        string $message,
        string $code = 'ERROR',
        int $statusCode = 400,
        array $details = []
    ): JsonResponse {
        $response = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ];

        if (!empty($details)) {
            $response['error']['details'] = $details;
        }

        $response['meta'] = [
            'timestamp' => now()->toIso8601String(),
            'request_id' => request()->header('X-Request-ID'),
        ];

        return response()->json($response, $statusCode);
    }

    /**
     * Return a validation error response.
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return $this->errorResponse(
            message: 'The given data was invalid',
            code: 'VALIDATION_ERROR',
            statusCode: 422,
            details: $errors
        );
    }

    /**
     * Return a not found error response.
     */
    protected function notFoundResponse(string $resource = 'Resource'): JsonResponse
    {
        return $this->errorResponse(
            message: "The requested {$resource} was not found",
            code: 'RESOURCE_NOT_FOUND',
            statusCode: 404
        );
    }

    /**
     * Return an unauthorized error response.
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse(
            message: $message,
            code: 'UNAUTHORIZED',
            statusCode: 401
        );
    }

    /**
     * Return a forbidden error response.
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse(
            message: $message,
            code: 'FORBIDDEN',
            statusCode: 403
        );
    }

    /**
     * Return a rate limit exceeded response.
     */
    protected function rateLimitResponse(int $retryAfter = 60): JsonResponse
    {
        return $this->errorResponse(
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            details: ['retry_after' => $retryAfter]
        );
    }

    /**
     * Return a server error response.
     */
    protected function serverErrorResponse(string $message = 'Internal server error'): JsonResponse
    {
        return $this->errorResponse(
            message: $message,
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: 500
        );
    }

    /**
     * Return a created response.
     */
    protected function createdResponse(
        mixed $data = null,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Return a no content response.
     */
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
