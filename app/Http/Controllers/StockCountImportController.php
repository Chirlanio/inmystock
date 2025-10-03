<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockCount;
use App\Models\StockCountImport;
use App\Models\StockCountItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StockCountImportController extends Controller
{
    /**
     * Show the import form.
     */
    public function create(StockCount $stockCount): Response
    {
        $stockCount->load(['stockAudit', 'area', 'counter']);

        return Inertia::render('stock-counts/import', [
            'stockCount' => $stockCount,
        ]);
    }

    /**
     * Process the uploaded file.
     */
    public function store(Request $request, StockCount $stockCount): RedirectResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:txt,csv|max:10240', // 10MB max
            'file_format' => 'required|in:barcode_only,barcode_quantity',
            'delimiter' => 'required_if:file_format,barcode_quantity|string|max:1',
        ]);

        try {
            DB::beginTransaction();

            // Store the file
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('stock-count-imports', $fileName, 'local');

            // Create import record
            $import = StockCountImport::create([
                'stock_count_id' => $stockCount->id,
                'user_id' => auth()->id(),
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_format' => $validated['file_format'],
                'delimiter' => $validated['delimiter'] ?? ',',
                'status' => 'pending',
            ]);

            // Process the file
            $this->processImport($import);

            DB::commit();

            return redirect()
                ->route('stock-counts.show', [
                    'stockAudit' => $stockCount->stock_audit_id,
                    'stockCount' => $stockCount->id
                ])
                ->with('success', "Arquivo importado com sucesso! {$import->successful_lines} itens processados.");
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->with('error', 'Erro ao processar arquivo: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Process the import file.
     */
    protected function processImport(StockCountImport $import): void
    {
        $import->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        $filePath = Storage::disk('local')->path($import->file_path);
        $fileContent = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $totalLines = count($fileContent);
        $import->update(['total_lines' => $totalLines]);

        $errors = [];
        $processedLines = 0;
        $successfulLines = 0;
        $failedLines = 0;

        // Track products and their quantities (for barcode_only format)
        $productCounts = [];

        foreach ($fileContent as $lineNumber => $line) {
            $processedLines++;

            try {
                $line = trim($line);

                if (empty($line)) {
                    continue;
                }

                if ($import->file_format === 'barcode_only') {
                    // Format: just barcode (one per line, can repeat)
                    $barcode = $line;
                    $quantity = 1;

                    // Accumulate counts
                    if (!isset($productCounts[$barcode])) {
                        $productCounts[$barcode] = 0;
                    }
                    $productCounts[$barcode] += $quantity;

                    $successfulLines++;
                } else {
                    // Format: barcode[delimiter]quantity
                    $parts = explode($import->delimiter, $line);

                    if (count($parts) < 2) {
                        throw new \Exception("Formato inválido: esperado 'código{$import->delimiter}quantidade'");
                    }

                    $barcode = trim($parts[0]);
                    $quantity = (float) trim($parts[1]);

                    if ($quantity <= 0) {
                        throw new \Exception("Quantidade inválida: {$quantity}");
                    }

                    // Accumulate counts (in case of duplicates)
                    if (!isset($productCounts[$barcode])) {
                        $productCounts[$barcode] = 0;
                    }
                    $productCounts[$barcode] += $quantity;

                    $successfulLines++;
                }
            } catch (\Exception $e) {
                $failedLines++;
                $errors[] = [
                    'line' => $lineNumber + 1,
                    'content' => $line,
                    'error' => $e->getMessage(),
                ];
            }
        }

        // Now save all products to stock_count_items
        foreach ($productCounts as $barcode => $totalQuantity) {
            try {
                // Try to find product by barcode
                $product = Product::where('barcode', $barcode)->first();

                if (!$product) {
                    // If not found, create a placeholder or skip
                    $errors[] = [
                        'barcode' => $barcode,
                        'error' => 'Produto não encontrado no sistema',
                        'quantity' => $totalQuantity,
                    ];
                    continue;
                }

                // Check if item already exists for this stock count
                $existingItem = StockCountItem::where('stock_count_id', $import->stock_count_id)
                    ->where('product_code', $product->barcode)
                    ->first();

                if ($existingItem) {
                    // Update existing item (add to quantity)
                    $existingItem->update([
                        'quantity_counted' => $existingItem->quantity_counted + $totalQuantity,
                    ]);
                } else {
                    // Create new item
                    StockCountItem::create([
                        'stock_count_id' => $import->stock_count_id,
                        'product_code' => $product->barcode,
                        'product_name' => $product->name,
                        'quantity_counted' => $totalQuantity,
                        'unit' => $product->unit,
                    ]);
                }
            } catch (\Exception $e) {
                $errors[] = [
                    'barcode' => $barcode,
                    'error' => $e->getMessage(),
                    'quantity' => $totalQuantity,
                ];
            }
        }

        // Update import status
        $import->update([
            'status' => $failedLines > 0 && $successfulLines === 0 ? 'failed' : 'completed',
            'processed_lines' => $processedLines,
            'successful_lines' => $successfulLines,
            'failed_lines' => $failedLines,
            'errors' => empty($errors) ? null : $errors,
            'completed_at' => now(),
        ]);
    }

    /**
     * Show import history.
     */
    public function index(StockCount $stockCount): Response
    {
        $imports = StockCountImport::where('stock_count_id', $stockCount->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('stock-counts/import-history', [
            'stockCount' => $stockCount,
            'imports' => $imports,
        ]);
    }

    /**
     * Download import file.
     */
    public function download(StockCountImport $import)
    {
        if (!Storage::disk('local')->exists($import->file_path)) {
            return back()->with('error', 'Arquivo não encontrado.');
        }

        return Storage::disk('local')->download($import->file_path, $import->file_name);
    }
}
