<?php

namespace App\Notifications\System;

use App\Models\User;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public User $user
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $preference = UserNotificationPreference::where('user_id', $notifiable->id)
            ->where('notification_type', UserNotificationPreference::TYPE_SYSTEM)
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
            ->subject('🎉 Bem-vindo ao InMyStock!')
            ->greeting('Olá, ' . $this->user->name . '!')
            ->line('Seja bem-vindo ao **InMyStock**, seu sistema de gestão e auditoria de estoque!')
            ->line('Sua conta foi criada com sucesso com as seguintes informações:')
            ->line('**E-mail:** ' . $this->user->email)
            ->line('**Função:** ' . ($this->user->role ? $this->user->role->name : 'N/A'))
            ->line('Aqui estão algumas ações que você pode fazer:')
            ->line('• Gerenciar produtos e estoque')
            ->line('• Criar e participar de auditorias')
            ->line('• Gerar relatórios de divergências')
            ->line('• Configurar suas preferências de notificações')
            ->action('Acessar o Sistema', url('/dashboard'))
            ->line('Se você tiver alguma dúvida, não hesite em entrar em contato com o administrador.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'welcome',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'user_email' => $this->user->email,
            'user_role' => $this->user->role ? $this->user->role->name : null,
            'message' => 'Bem-vindo ao InMyStock! Sua conta foi criada com sucesso.',
            'action_url' => '/dashboard',
        ];
    }
}
