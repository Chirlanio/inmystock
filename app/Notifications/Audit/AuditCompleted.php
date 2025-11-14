<?php

namespace App\Notifications\Audit;

use App\Models\StockAudit;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuditCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public StockAudit $audit
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
        $countsCompleted = $this->audit->counts()->completed()->count();

        return (new MailMessage)
            ->subject('✅ Auditoria Concluída - ' . $this->audit->title)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('A auditoria foi concluída com sucesso:')
            ->line('**' . $this->audit->title . '**')
            ->line('**Código:** ' . $this->audit->code)
            ->line('**Contagens Realizadas:** ' . $countsCompleted)
            ->line('**Data de Conclusão:** ' . $this->audit->updated_at->format('d/m/Y H:i'))
            ->action('Ver Auditoria', url('/stock-audits/' . $this->audit->id))
            ->line('Você pode visualizar os resultados e relatórios de divergências.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'audit_completed',
            'audit_id' => $this->audit->id,
            'audit_code' => $this->audit->code,
            'audit_title' => $this->audit->title,
            'counts_completed' => $this->audit->counts()->completed()->count(),
            'completed_at' => $this->audit->updated_at->toDateTimeString(),
            'message' => "Auditoria concluída: {$this->audit->title}",
            'action_url' => '/stock-audits/' . $this->audit->id,
        ];
    }
}
