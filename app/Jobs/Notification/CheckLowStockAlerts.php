<?php

namespace App\Jobs\Notification;

use App\Models\Company;
use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\User;
use App\Notifications\Stock\LowStockAlert;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckLowStockAlerts implements ShouldQueue
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
     * Company ID or null for all companies.
     */
    public ?int $companyId;

    /**
     * Create a new job instance.
     */
    public function __construct(?int $companyId = null)
    {
        $this->companyId = $companyId;
        $this->onQueue('notifications');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting low stock alerts check', [
            'company_id' => $this->companyId,
        ]);

        $alertsSent = 0;

        try {
            $query = Product::where('active', true)
                ->where('min_stock', '>', 0);

            if ($this->companyId) {
                $query->where('company_id', $this->companyId);
            }

            $products = $query->get();

            foreach ($products as $product) {
                // Get total stock for product
                $totalStock = InventoryLevel::where('product_id', $product->id)
                    ->sum('quantity');

                // Check if below minimum
                if ($totalStock < $product->min_stock) {
                    $this->sendLowStockAlert($product, (int) $totalStock, $product->min_stock);
                    $alertsSent++;
                }
            }

            Log::info('Low stock alerts check completed', [
                'company_id' => $this->companyId,
                'products_checked' => $products->count(),
                'alerts_sent' => $alertsSent,
            ]);
        } catch (\Exception $e) {
            Log::error('Low stock alerts check failed', [
                'company_id' => $this->companyId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Send low stock alert to relevant users.
     */
    protected function sendLowStockAlert(Product $product, int $currentStock, int $minStock): void
    {
        // Get users who should be notified
        $usersToNotify = User::query()
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager'])
                    ->orWhere('level', '>=', 50); // Auditor or higher
            })
            ->when($product->company_id, function ($query) use ($product) {
                return $query->where('company_id', $product->company_id);
            })
            ->get();

        foreach ($usersToNotify as $user) {
            // Check if user has this notification enabled
            $preference = UserNotificationPreference::where('user_id', $user->id)
                ->where('notification_type', UserNotificationPreference::TYPE_LOW_STOCK)
                ->first();

            // Skip if user has disabled all channels
            if ($preference && !$preference->email_enabled && !$preference->database_enabled) {
                continue;
            }

            // Check threshold from preferences
            if ($preference && isset($preference->settings['threshold_percentage'])) {
                $threshold = $preference->settings['threshold_percentage'];
                $percentageBelow = (($minStock - $currentStock) / $minStock) * 100;

                // Only notify if below threshold
                if ($percentageBelow < $threshold) {
                    continue;
                }
            }

            // Send notification
            $user->notify(new LowStockAlert($product, $currentStock, $minStock));

            Log::info('Low stock alert sent', [
                'product_code' => $product->code,
                'current_stock' => $currentStock,
                'min_stock' => $minStock,
                'user_id' => $user->id,
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Low stock alerts job failed permanently', [
            'company_id' => $this->companyId,
            'error' => $exception->getMessage(),
        ]);
    }
}
