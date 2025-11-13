<?php

namespace App\Notifications\Audit;

use App\Models\StockAudit;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuditAssigned extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('📋 Nova Auditoria Atribuída - ' . $this->audit->title)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('Você foi designado como responsável pela auditoria:')
            ->line('**' . $this->audit->title . '**')
            ->line('**Código:** ' . $this->audit->code)
            ->line('**Período:** ' . $this->audit->start_date->format('d/m/Y') . ' a ' . $this->audit->end_date->format('d/m/Y'))
            ->line('**Contagens Necessárias:** ' . $this->audit->required_counts)
            ->when($this->audit->description, function ($mail) {
                return $mail->line('**Descrição:** ' . $this->audit->description);
            })
            ->action('Ver Auditoria', url('/stock-audits/' . $this->audit->id))
            ->line('Por favor, organize as contagens necessárias.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'audit_assigned',
            'audit_id' => $this->audit->id,
            'audit_code' => $this->audit->code,
            'audit_title' => $this->audit->title,
            'start_date' => $this->audit->start_date->toDateString(),
            'end_date' => $this->audit->end_date->toDateString(),
            'required_counts' => $this->audit->required_counts,
            'message' => "Você foi designado responsável pela auditoria: {$this->audit->title}",
            'action_url' => '/stock-audits/' . $this->audit->id,
        ];
    }
}
