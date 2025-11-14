<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserNotificationPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationPreferenceController extends Controller
{
    /**
     * Display the user's notification preferences.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ensure user has all default preferences
        UserNotificationPreference::createDefaultsForUser($user);

        $preferences = $user->notificationPreferences()
            ->get()
            ->map(function ($preference) {
                return [
                    'id' => $preference->id,
                    'notification_type' => $preference->notification_type,
                    'type_label' => UserNotificationPreference::getTypes()[$preference->notification_type] ?? $preference->notification_type,
                    'email_enabled' => $preference->email_enabled,
                    'database_enabled' => $preference->database_enabled,
                    'settings' => $preference->settings,
                ];
            });

        return Inertia::render('settings/notifications', [
            'preferences' => $preferences,
            'availableTypes' => UserNotificationPreference::getTypes(),
        ]);
    }

    /**
     * Update the user's notification preferences.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.id' => 'required|exists:user_notification_preferences,id',
            'preferences.*.email_enabled' => 'required|boolean',
            'preferences.*.database_enabled' => 'required|boolean',
            'preferences.*.settings' => 'nullable|array',
        ]);

        $user = $request->user();

        foreach ($validated['preferences'] as $preferenceData) {
            $preference = UserNotificationPreference::where('id', $preferenceData['id'])
                ->where('user_id', $user->id)
                ->firstOrFail();

            $preference->update([
                'email_enabled' => $preferenceData['email_enabled'],
                'database_enabled' => $preferenceData['database_enabled'],
                'settings' => $preferenceData['settings'] ?? [],
            ]);
        }

        return redirect()->back()->with('success', 'Preferências de notificação atualizadas com sucesso.');
    }

    /**
     * Update a single preference.
     */
    public function updateSingle(Request $request, string $type)
    {
        $validated = $request->validate([
            'email_enabled' => 'required|boolean',
            'database_enabled' => 'required|boolean',
            'settings' => 'nullable|array',
        ]);

        $user = $request->user();

        $preference = UserNotificationPreference::where('user_id', $user->id)
            ->where('notification_type', $type)
            ->firstOrFail();

        $preference->update($validated);

        return response()->json([
            'message' => 'Preferência atualizada com sucesso.',
            'preference' => [
                'id' => $preference->id,
                'notification_type' => $preference->notification_type,
                'email_enabled' => $preference->email_enabled,
                'database_enabled' => $preference->database_enabled,
                'settings' => $preference->settings,
            ],
        ]);
    }
}
