<?php

namespace App\Notifications\Audit;

use App\Models\StockCount;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CountCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public StockCount $count
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $preference = UserNotificationPreference::where('user_id', $notifiable->id)
            ->where('notification_type', UserNotificationPreference::TYPE_AUDIT)
            ->first();

        if (!$preference) {
            return ['database', 'mail'];
        }

        $channels = [];
        if ($preference->database_enabled) {
            $channels[] = 'database';
        }
        if ($preference->email_enabled) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $itemsCount = $this->count->items()->count();
        $areaName = $this->count->area ? $this->count->area->name : 'N/A';
        $counterName = $this->count->counter ? $this->count->counter->name : 'N/A';

        return (new MailMessage)
            ->subject('✅ Contagem Concluída - ' . $this->count->stockAudit->title)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('Uma contagem foi concluída:')
            ->line('**Auditoria:** ' . $this->count->stockAudit->title)
            ->line('**Contagem:** #' . $this->count->count_number)
            ->line('**Área:** ' . $areaName)
            ->line('**Contador:** ' . $counterName)
            ->line('**Itens Contados:** ' . $itemsCount)
            ->line('**Data de Conclusão:** ' . $this->count->completed_at->format('d/m/Y H:i'))
            ->action('Ver Contagem', url('/stock-audits/' . $this->count->stock_audit_id . '/counts/' . $this->count->id))
            ->line('Você pode visualizar os detalhes e identificar divergências.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'count_completed',
            'count_id' => $this->count->id,
            'count_number' => $this->count->count_number,
            'audit_id' => $this->count->stock_audit_id,
            'audit_title' => $this->count->stockAudit->title,
            'area_name' => $this->count->area ? $this->count->area->name : null,
            'counter_name' => $this->count->counter ? $this->count->counter->name : null,
            'items_count' => $this->count->items()->count(),
            'completed_at' => $this->count->completed_at->toDateTimeString(),
            'message' => "Contagem #{$this->count->count_number} concluída na auditoria {$this->count->stockAudit->title}",
            'action_url' => '/stock-audits/' . $this->count->stock_audit_id . '/counts/' . $this->count->id,
        ];
    }
}
