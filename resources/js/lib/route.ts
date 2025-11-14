/**
 * Route helper using Ziggy for type-safe route generation
 */
export function route(name: string, params?: Record<string, unknown>): string {
    // @ts-expect-error - Ziggy route function is globally available
    return window.route(name, params);
}
