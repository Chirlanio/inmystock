<?php

namespace App\Notifications\Import;

use App\Models\StockCountImport;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ImportFailed extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public StockCountImport $import,
        public string $errorMessage
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
        return (new MailMessage)
            ->error()
            ->subject('❌ Importação Falhou - ' . $this->import->file_name)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('Ocorreu um erro durante a importação:')
            ->line('**Arquivo:** ' . $this->import->file_name)
            ->line('**Erro:** ' . $this->errorMessage)
            ->when($this->import->processed_lines > 0, function ($mail) {
                return $mail->line('**Linhas Processadas:** ' . $this->import->processed_lines . ' de ' . $this->import->total_lines);
            })
            ->action('Ver Detalhes', url('/stock-counts/' . $this->import->stock_count_id . '/import/history'))
            ->line('Por favor, verifique o arquivo e tente novamente.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'import_failed',
            'import_id' => $this->import->id,
            'file_name' => $this->import->file_name,
            'stock_count_id' => $this->import->stock_count_id,
            'error_message' => $this->errorMessage,
            'processed_lines' => $this->import->processed_lines,
            'total_lines' => $this->import->total_lines,
            'message' => "Importação de {$this->import->file_name} falhou: {$this->errorMessage}",
            'action_url' => '/stock-counts/' . $this->import->stock_count_id . '/import/history',
        ];
    }
}
