<?php

namespace App\Jobs\Cleanup;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanOldNotifications implements ShouldQueue
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
     * Days to keep read notifications.
     *
     * @var int
     */
    public int $readRetentionDays;

    /**
     * Days to keep unread notifications.
     *
     * @var int
     */
    public int $unreadRetentionDays;

    /**
     * Create a new job instance.
     */
    public function __construct(int $readRetentionDays = 30, int $unreadRetentionDays = 90)
    {
        $this->readRetentionDays = $readRetentionDays;
        $this->unreadRetentionDays = $unreadRetentionDays;
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting notifications cleanup', [
            'read_retention_days' => $this->readRetentionDays,
            'unread_retention_days' => $this->unreadRetentionDays,
        ]);

        try {
            // Delete old read notifications
            $readDeleted = DB::table('notifications')
                ->whereNotNull('read_at')
                ->where('read_at', '<', now()->subDays($this->readRetentionDays))
                ->delete();

            // Delete old unread notifications
            $unreadDeleted = DB::table('notifications')
                ->whereNull('read_at')
                ->where('created_at', '<', now()->subDays($this->unreadRetentionDays))
                ->delete();

            $totalDeleted = $readDeleted + $unreadDeleted;

            Log::info('Notifications cleanup completed', [
                'read_deleted' => $readDeleted,
                'unread_deleted' => $unreadDeleted,
                'total_deleted' => $totalDeleted,
            ]);
        } catch (\Exception $e) {
            Log::error('Notifications cleanup failed', [
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
        Log::error('Notifications cleanup job failed permanently', [
            'error' => $exception->getMessage(),
        ]);
    }
}
