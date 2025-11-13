<?php

namespace App\Notifications\Import;

use App\Models\StockCountImport;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ImportCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public StockCountImport $import
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $preference = UserNotificationPreference::where('user_id', $notifiable->id)
            ->where('notification_type', UserNotificationPreference::TYPE_IMPORT)
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
        $successRate = $this->import->successful_lines > 0
            ? round(($this->import->successful_lines / $this->import->total_lines) * 100, 2)
            : 0;

        $mail = (new MailMessage)
            ->subject('✅ Importação Concluída - ' . $this->import->file_name)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('A importação foi concluída:')
            ->line('**Arquivo:** ' . $this->import->file_name)
            ->line('**Total de Linhas:** ' . $this->import->total_lines)
            ->line('**Linhas Processadas:** ' . $this->import->processed_lines)
            ->line('**Linhas com Sucesso:** ' . $this->import->successful_lines)
            ->line('**Linhas com Falha:** ' . $this->import->failed_lines)
            ->line('**Taxa de Sucesso:** ' . $successRate . '%');

        if ($this->import->failed_lines > 0) {
            $mail->line('⚠️ Algumas linhas falharam. Verifique os detalhes da importação.');
        }

        $mail->action('Ver Importação', url('/stock-counts/' . $this->import->stock_count_id . '/import/history'))
            ->salutation('Atenciosamente, Equipe InMyStock');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'import_completed',
            'import_id' => $this->import->id,
            'file_name' => $this->import->file_name,
            'stock_count_id' => $this->import->stock_count_id,
            'total_lines' => $this->import->total_lines,
            'successful_lines' => $this->import->successful_lines,
            'failed_lines' => $this->import->failed_lines,
            'success_rate' => $this->import->successful_lines > 0
                ? round(($this->import->successful_lines / $this->import->total_lines) * 100, 2)
                : 0,
            'message' => "Importação de {$this->import->file_name} concluída ({$this->import->successful_lines}/{$this->import->total_lines} linhas)",
            'action_url' => '/stock-counts/' . $this->import->stock_count_id . '/import/history',
        ];
    }
}
