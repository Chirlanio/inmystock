<?php

namespace App\Jobs\Import;

use App\Models\StockCountImport;
use App\Models\StockCountItem;
use App\Notifications\Import\ImportCompleted;
use App\Notifications\Import\ImportFailed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessStockCountImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     *
     * @var int
     */
    public $timeout = 600; // 10 minutes

    /**
     * The stock count import instance.
     */
    public StockCountImport $import;

    /**
     * Create a new job instance.
     */
    public function __construct(StockCountImport $import)
    {
        $this->import = $import;
        $this->onQueue('imports');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting import processing', [
            'import_id' => $this->import->id,
            'file_name' => $this->import->file_name,
        ]);

        try {
            // Mark as processing
            $this->import->update([
                'status' => 'processing',
                'started_at' => now(),
            ]);

            // Read file from storage
            $filePath = $this->import->file_path;

            if (!Storage::exists($filePath)) {
                throw new \Exception('Import file not found: ' . $filePath);
            }

            $fileContents = Storage::get($filePath);

            // Parse CSV
            $lines = explode("\n", $fileContents);
            $delimiter = $this->import->delimiter ?? ';';

            // Remove empty lines
            $lines = array_filter($lines, fn($line) => !empty(trim($line)));

            $totalLines = count($lines);
            $headerLine = array_shift($lines); // Remove header

            // Update total lines
            $this->import->update([
                'total_lines' => $totalLines - 1, // Exclude header
            ]);

            $processedLines = 0;
            $successfulLines = 0;
            $failedLines = 0;
            $errors = [];

            // Process each line
            foreach ($lines as $index => $line) {
                $lineNumber = $index + 2; // +2 because index starts at 0 and we removed header

                try {
                    $data = str_getcsv($line, $delimiter);

                    // Validate data
                    if (count($data) < 3) {
                        throw new \Exception('Linha com dados insuficientes');
                    }

                    // Extract data (assuming format: product_code, quantity, location, notes)
                    $productCode = trim($data[0] ?? '');
                    $quantity = trim($data[1] ?? '');
                    $location = trim($data[2] ?? '');
                    $notes = trim($data[3] ?? '');

                    // Validate required fields
                    if (empty($productCode)) {
                        throw new \Exception('Código do produto é obrigatório');
                    }

                    if (empty($quantity) || !is_numeric(str_replace(',', '.', $quantity))) {
                        throw new \Exception('Quantidade inválida');
                    }

                    // Convert quantity
                    $quantity = (float) str_replace(',', '.', $quantity);

                    // Create or update stock count item
                    StockCountItem::updateOrCreate(
                        [
                            'stock_count_id' => $this->import->stock_count_id,
                            'product_code' => $productCode,
                            'location' => $location ?: null,
                        ],
                        [
                            'product_name' => $productCode, // Will be updated later if product exists
                            'quantity_counted' => $quantity,
                            'unit' => 'UN', // Default unit
                            'notes' => $notes ?: null,
                        ]
                    );

                    $successfulLines++;
                } catch (\Exception $e) {
                    $failedLines++;
                    $errors[] = [
                        'line' => $lineNumber,
                        'error' => $e->getMessage(),
                        'data' => $line,
                    ];

                    Log::warning('Import line failed', [
                        'import_id' => $this->import->id,
                        'line' => $lineNumber,
                        'error' => $e->getMessage(),
                    ]);
                }

                $processedLines++;

                // Update progress every 100 lines
                if ($processedLines % 100 === 0) {
                    $this->import->update([
                        'processed_lines' => $processedLines,
                        'successful_lines' => $successfulLines,
                        'failed_lines' => $failedLines,
                    ]);
                }
            }

            // Mark as completed
            $this->import->update([
                'status' => 'completed',
                'processed_lines' => $processedLines,
                'successful_lines' => $successfulLines,
                'failed_lines' => $failedLines,
                'errors' => $errors,
                'completed_at' => now(),
            ]);

            // Notify user
            if ($this->import->user) {
                $this->import->user->notify(new ImportCompleted($this->import));
            }

            Log::info('Import completed successfully', [
                'import_id' => $this->import->id,
                'processed' => $processedLines,
                'successful' => $successfulLines,
                'failed' => $failedLines,
            ]);
        } catch (\Exception $e) {
            // Mark as failed
            $this->import->update([
                'status' => 'failed',
                'errors' => [
                    [
                        'line' => 0,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ],
                ],
                'completed_at' => now(),
            ]);

            // Notify user
            if ($this->import->user) {
                $this->import->user->notify(new ImportFailed($this->import, $e->getMessage()));
            }

            Log::error('Import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Import job failed permanently', [
            'import_id' => $this->import->id,
            'error' => $exception->getMessage(),
        ]);

        // Mark as failed if not already
        if ($this->import->status !== 'failed') {
            $this->import->update([
                'status' => 'failed',
                'completed_at' => now(),
            ]);
        }

        // Notify user
        if ($this->import->user) {
            $this->import->user->notify(new ImportFailed($this->import, $exception->getMessage()));
        }
    }
}
