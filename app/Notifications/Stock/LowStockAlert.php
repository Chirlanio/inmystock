<?php

namespace App\Notifications\Stock;

use App\Models\Product;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Product $product,
        public int $currentStock,
        public int $minStock
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $preference = UserNotificationPreference::where('user_id', $notifiable->id)
            ->where('notification_type', UserNotificationPreference::TYPE_LOW_STOCK)
            ->first();

        if (!$preference) {
            return ['database', 'mail']; // Default channels
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
        $percentageBelow = round((($this->minStock - $this->currentStock) / $this->minStock) * 100, 2);

        return (new MailMessage)
            ->subject('⚠️ Alerta: Estoque Baixo - ' . $this->product->name)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('O produto **' . $this->product->name . '** está com estoque baixo.')
            ->line('**Código:** ' . $this->product->code)
            ->line('**Estoque Atual:** ' . $this->currentStock . ' ' . $this->product->unit)
            ->line('**Estoque Mínimo:** ' . $this->minStock . ' ' . $this->product->unit)
            ->line('**Divergência:** ' . $percentageBelow . '% abaixo do mínimo')
            ->action('Ver Produto', url('/products?search=' . $this->product->code))
            ->line('Por favor, considere reabastecer este item.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'low_stock',
            'product_id' => $this->product->id,
            'product_code' => $this->product->code,
            'product_name' => $this->product->name,
            'current_stock' => $this->currentStock,
            'min_stock' => $this->minStock,
            'unit' => $this->product->unit,
            'message' => "Produto {$this->product->name} está com estoque baixo ({$this->currentStock} {$this->product->unit})",
            'action_url' => '/products?search=' . $this->product->code,
        ];
    }
}
