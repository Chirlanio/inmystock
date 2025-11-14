<?php

namespace App\Notifications\Discrepancy;

use App\Models\StockCountItem;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalDiscrepancy extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public StockCountItem $item,
        public float $theoreticalStock,
        public float $difference,
        public float $percentageDiff
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $preference = UserNotificationPreference::where('user_id', $notifiable->id)
            ->where('notification_type', UserNotificationPreference::TYPE_DISCREPANCY)
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
        $diffType = $this->difference > 0 ? 'excesso' : 'falta';

        return (new MailMessage)
            ->error()
            ->subject('⚠️ Divergência Crítica Detectada - ' . $this->item->product_name)
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('Foi detectada uma divergência crítica em contagem:')
            ->line('**Produto:** ' . $this->item->product_name)
            ->line('**Código:** ' . $this->item->product_code)
            ->line('**Localização:** ' . ($this->item->location ?? 'N/A'))
            ->line('**Estoque Teórico:** ' . number_format($this->theoreticalStock, 2, ',', '.') . ' ' . $this->item->unit)
            ->line('**Estoque Contado:** ' . number_format($this->item->quantity_counted, 2, ',', '.') . ' ' . $this->item->unit)
            ->line('**Divergência:** ' . number_format(abs($this->difference), 2, ',', '.') . ' ' . $this->item->unit . ' (' . $diffType . ')')
            ->line('**Percentual:** ' . number_format(abs($this->percentageDiff), 2, ',', '.') . '%')
            ->action('Ver Contagem', url('/stock-audits/' . $this->item->stockCount->stock_audit_id . '/counts/' . $this->item->stock_count_id))
            ->line('Esta divergência requer atenção imediata.')
            ->salutation('Atenciosamente, Equipe InMyStock');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'critical_discrepancy',
            'item_id' => $this->item->id,
            'product_code' => $this->item->product_code,
            'product_name' => $this->item->product_name,
            'location' => $this->item->location,
            'theoretical_stock' => $this->theoreticalStock,
            'counted_stock' => $this->item->quantity_counted,
            'difference' => $this->difference,
            'percentage_diff' => $this->percentageDiff,
            'count_id' => $this->item->stock_count_id,
            'audit_id' => $this->item->stockCount->stock_audit_id,
            'message' => "Divergência crítica: {$this->item->product_name} - " . number_format(abs($this->percentageDiff), 2) . "% de diferença",
            'action_url' => '/stock-audits/' . $this->item->stockCount->stock_audit_id . '/counts/' . $this->item->stock_count_id,
        ];
    }
}
