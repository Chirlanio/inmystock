<?php

namespace App\Observers;

use App\Models\StockAudit;
use App\Notifications\Audit\AuditAssigned;
use App\Notifications\Audit\AuditCompleted;

class StockAuditObserver
{
    /**
     * Handle the StockAudit "created" event.
     */
    public function created(StockAudit $audit): void
    {
        // Notify the responsible user when audit is created
        if ($audit->responsible) {
            $audit->responsible->notify(new AuditAssigned($audit));
        }
    }

    /**
     * Handle the StockAudit "updated" event.
     */
    public function updated(StockAudit $audit): void
    {
        // Check if status changed to completed
        if ($audit->wasChanged('status') && $audit->status === 'completed') {
            // Notify the responsible user
            if ($audit->responsible) {
                $audit->responsible->notify(new AuditCompleted($audit));
            }

            // TODO: Also notify managers/admins if needed
        }

        // Check if responsible_id changed
        if ($audit->wasChanged('responsible_id') && $audit->responsible) {
            $audit->responsible->notify(new AuditAssigned($audit));
        }
    }
}
