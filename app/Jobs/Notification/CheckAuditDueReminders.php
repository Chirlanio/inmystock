<?php

namespace App\Jobs\Notification;

use App\Models\StockAudit;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class CheckAuditDueReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 1;

    /**
     * The maximum number of seconds the job can run.
     *
     * @var int
     */
    public $timeout = 300; // 5 minutes

    /**
     * Days before end date to send reminder.
     *
     * @var int
     */
    public int $reminderDays;

    /**
     * Create a new job instance.
     */
    public function __construct(int $reminderDays = 3)
    {
        $this->reminderDays = $reminderDays;
        $this->onQueue('notifications');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting audit due reminders check', [
            'reminder_days' => $this->reminderDays,
        ]);

        $remindersSent = 0;

        try {
            // Get audits that are due soon (in_progress or planned)
            $dueDate = now()->addDays($this->reminderDays)->startOfDay();

            $audits = StockAudit::whereIn('status', ['planned', 'in_progress'])
                ->whereDate('end_date', '=', $dueDate)
                ->with('responsible')
                ->get();

            foreach ($audits as $audit) {
                if (!$audit->responsible) {
                    continue;
                }

                // Check if user has audit notifications enabled
                $preference = UserNotificationPreference::where('user_id', $audit->responsible->id)
                    ->where('notification_type', UserNotificationPreference::TYPE_AUDIT)
                    ->first();

                // Skip if user has disabled all channels
                if ($preference && !$preference->email_enabled && !$preference->database_enabled) {
                    continue;
                }

                // Create a simple notification (could create a dedicated AuditDueReminder notification class later)
                $audit->responsible->notify(
                    new \Illuminate\Notifications\Messages\SimpleNotification(
                        'Lembrete: Auditoria próxima do prazo',
                        "A auditoria '{$audit->title}' (#{$audit->code}) vence em {$this->reminderDays} dias ({$audit->end_date->format('d/m/Y')}).",
                        url('/stock-audits/' . $audit->id)
                    )
                );

                $remindersSent++;

                Log::info('Audit due reminder sent', [
                    'audit_id' => $audit->id,
                    'audit_code' => $audit->code,
                    'end_date' => $audit->end_date->format('Y-m-d'),
                    'user_id' => $audit->responsible->id,
                ]);
            }

            Log::info('Audit due reminders check completed', [
                'audits_found' => $audits->count(),
                'reminders_sent' => $remindersSent,
            ]);
        } catch (\Exception $e) {
            Log::error('Audit due reminders check failed', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Audit due reminders job failed permanently', [
            'error' => $exception->getMessage(),
        ]);
    }
}
