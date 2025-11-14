<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'notification_type',
        'email_enabled',
        'database_enabled',
        'settings',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'database_enabled' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Notification types constants
     */
    const TYPE_LOW_STOCK = 'low_stock';
    const TYPE_AUDIT = 'audit';
    const TYPE_IMPORT = 'import';
    const TYPE_SYSTEM = 'system';
    const TYPE_DISCREPANCY = 'discrepancy';

    /**
     * Get all available notification types
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_LOW_STOCK => 'Estoque Baixo',
            self::TYPE_AUDIT => 'Auditorias',
            self::TYPE_IMPORT => 'Importações',
            self::TYPE_SYSTEM => 'Sistema',
            self::TYPE_DISCREPANCY => 'Divergências Críticas',
        ];
    }

    /**
     * User relationship
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if email notifications are enabled for this type
     */
    public function isEmailEnabled(): bool
    {
        return $this->email_enabled;
    }

    /**
     * Check if database notifications are enabled for this type
     */
    public function isDatabaseEnabled(): bool
    {
        return $this->database_enabled;
    }

    /**
     * Get default preferences for a new user
     */
    public static function getDefaults(): array
    {
        return [
            self::TYPE_LOW_STOCK => [
                'email_enabled' => true,
                'database_enabled' => true,
                'settings' => [
                    'threshold_percentage' => 20, // Notificar quando estoque estiver 20% abaixo do mínimo
                ],
            ],
            self::TYPE_AUDIT => [
                'email_enabled' => true,
                'database_enabled' => true,
                'settings' => [
                    'due_reminder_days' => 3, // Lembrar 3 dias antes do prazo
                ],
            ],
            self::TYPE_IMPORT => [
                'email_enabled' => true,
                'database_enabled' => true,
                'settings' => [],
            ],
            self::TYPE_SYSTEM => [
                'email_enabled' => false,
                'database_enabled' => true,
                'settings' => [],
            ],
            self::TYPE_DISCREPANCY => [
                'email_enabled' => true,
                'database_enabled' => true,
                'settings' => [
                    'threshold_percentage' => 10, // Notificar divergências > 10%
                ],
            ],
        ];
    }

    /**
     * Create default preferences for a user
     */
    public static function createDefaultsForUser(User $user): void
    {
        $defaults = self::getDefaults();

        foreach ($defaults as $type => $preferences) {
            self::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'notification_type' => $type,
                ],
                $preferences
            );
        }
    }
}
