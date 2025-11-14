<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\StockAudit;
use App\Models\StockCount;
use App\Models\User;
use App\Services\StockCountComparisonService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockCountController extends Controller
{
    public function index(StockAudit $stockAudit)
    {
        $counts = $stockAudit->stockCounts()
            ->with(['area', 'counter', 'items'])
            ->get();

        return Inertia::render('stock-counts/index', [
            'audit' => $stockAudit,
            'counts' => $counts,
        ]);
    }

    public function create(StockAudit $stockAudit)
    {
        $stockAudit->loadCount('stockCounts');

        $areas = Area::where('active', true)->get();
        $users = User::select('id', 'name', 'email')
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager', 'auditor', 'operator']);
            })
            ->get();

        return Inertia::render('stock-counts/create', [
            'stockAudit' => $stockAudit,
            'areas' => $areas,
            'users' => $users,
        ]);
    }

    public function store(Request $request, StockAudit $stockAudit)
    {
        $validated = $request->validate([
            'area_id' => 'nullable|exists:areas,id',
            'counter_id' => 'required|exists:users,id',
            'count_number' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        // Check if count already exists
        $exists = StockCount::where('stock_audit_id', $stockAudit->id)
            ->where('area_id', $validated['area_id'])
            ->where('count_number', $validated['count_number'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'count_number' => 'Já existe uma contagem com este número para esta área.'
            ]);
        }

        $count = $stockAudit->stockCounts()->create($validated);

        return redirect()->route('stock-counts.show', [
            'stockAudit' => $stockAudit->id,
            'stockCount' => $count->id
        ])->with('success', 'Contagem criada com sucesso!');
    }

    public function show(StockAudit $stockAudit, StockCount $stockCount)
    {
        $stockCount->load(['stockAudit', 'area', 'counter', 'items']);

        return Inertia::render('stock-counts/show', [
            'stockCount' => $stockCount,
        ]);
    }

    public function edit(StockAudit $stockAudit, StockCount $stockCount)
    {
        if (!$stockCount->canBeEdited()) {
            return redirect()->route('stock-counts.show', [$stockAudit, $stockCount])
                ->with('error', 'Esta contagem não pode mais ser editada.');
        }

        $areas = Area::where('active', true)->get();
        $users = User::select('id', 'name', 'email')
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager', 'auditor', 'operator']);
            })
            ->get();

        $stockCount->load(['stockAudit', 'area', 'counter', 'items']);

        return Inertia::render('stock-counts/edit', [
            'stockCount' => $stockCount,
            'areas' => $areas,
            'users' => $users,
        ]);
    }

    public function update(Request $request, StockAudit $stockAudit, StockCount $stockCount)
    {
        if (!$stockCount->canBeEdited()) {
            return redirect()->route('stock-counts.show', [$stockAudit, $stockCount])
                ->with('error', 'Esta contagem não pode mais ser editada.');
        }

        $validated = $request->validate([
            'area_id' => 'nullable|exists:areas,id',
            'counter_id' => 'required|exists:users,id',
            'count_number' => 'required|integer|min:1',
            'status' => 'required|in:pending,in_progress,completed',
            'notes' => 'nullable|string',
            'items' => 'array',
            'items.*.product_code' => 'required|string',
            'items.*.product_name' => 'required|string',
            'items.*.quantity_counted' => 'required|numeric|min:0',
            'items.*.unit' => 'nullable|string',
            'items.*.location' => 'nullable|string',
            'items.*.notes' => 'nullable|string',
        ]);

        $stockCount->update([
            'area_id' => $validated['area_id'],
            'counter_id' => $validated['counter_id'],
            'count_number' => $validated['count_number'],
            'status' => $validated['status'],
            'notes' => $validated['notes'],
        ]);

        // Update items if provided
        if (isset($validated['items'])) {
            $stockCount->items()->delete();
            $stockCount->items()->createMany($validated['items']);
        }

        // Update timestamps based on status
        if ($validated['status'] === 'in_progress' && !$stockCount->started_at) {
            $stockCount->update(['started_at' => now()]);
        } elseif ($validated['status'] === 'completed' && !$stockCount->completed_at) {
            $stockCount->update(['completed_at' => now()]);
        }

        return redirect()->route('stock-counts.show', [$stockAudit, $stockCount])
            ->with('success', 'Contagem atualizada com sucesso!');
    }

    public function destroy(StockAudit $stockAudit, StockCount $stockCount)
    {
        if ($stockCount->status === 'completed') {
            return redirect()->route('stock-counts.index', $stockAudit)
                ->with('error', 'Contagens concluídas não podem ser excluídas.');
        }

        $stockCount->delete();

        return redirect()->route('stock-counts.index', $stockAudit)
            ->with('success', 'Contagem excluída com sucesso!');
    }

    public function start(StockAudit $stockAudit, StockCount $stockCount)
    {
        if ($stockCount->status !== 'pending') {
            return back()->with('error', 'Esta contagem já foi iniciada.');
        }

        $stockCount->start();

        return back()->with('success', 'Contagem iniciada com sucesso!');
    }

    public function complete(StockAudit $stockAudit, StockCount $stockCount)
    {
        if ($stockCount->status === 'completed') {
            return back()->with('error', 'Esta contagem já foi concluída.');
        }

        if ($stockCount->items()->count() === 0) {
            return back()->with('error', 'Adicione pelo menos um item antes de concluir a contagem.');
        }

        $stockCount->complete();

        return back()->with('success', 'Contagem concluída com sucesso!');
    }

    /**
     * Show comparison between count and system inventory.
     */
    public function comparison(StockAudit $stockAudit, StockCount $stockCount, StockCountComparisonService $comparisonService)
    {
        $stockCount->load(['stockAudit', 'area', 'counter']);

        $comparison = $comparisonService->compare($stockCount);
        $summary = $comparisonService->getSummary($stockCount);
        $critical = $comparisonService->getCriticalDiscrepancies($stockCount);

        return Inertia::render('stock-counts/comparison', [
            'stockCount' => $stockCount,
            'comparison' => $comparison,
            'summary' => $summary,
            'criticalDiscrepancies' => $critical,
        ]);
    }

    /**
     * Export comparison to CSV.
     */
    public function exportComparison(StockAudit $stockAudit, StockCount $stockCount, StockCountComparisonService $comparisonService)
    {
        $comparison = $comparisonService->compare($stockCount);

        $fileName = sprintf(
            'contagem_%s_%s.csv',
            $stockCount->id,
            now()->format('Y-m-d_His')
        );

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($comparison) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 support
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header
            fputcsv($file, [
                'Código',
                'Produto',
                'Qtd. Contada',
                'Qtd. Sistema',
                'Divergência',
                'Divergência %',
                'Status',
                'Unidade',
                'Localização',
                'Valor Unitário',
                'Valor da Divergência',
                'Observações'
            ], ';');

            // Data
            foreach ($comparison['items'] as $item) {
                fputcsv($file, [
                    $item['product_code'],
                    $item['product_name'],
                    number_format($item['quantity_counted'], 2, ',', '.'),
                    number_format($item['quantity_system'], 2, ',', '.'),
                    number_format($item['discrepancy'], 2, ',', '.'),
                    number_format($item['discrepancy_percentage'], 2, ',', '.') . '%',
                    $this->translateStatus($item['status']),
                    $item['unit'],
                    $item['location'] ?? '',
                    number_format($item['product_cost'], 2, ',', '.'),
                    number_format($item['discrepancy_value'], 2, ',', '.'),
                    $item['notes'] ?? ''
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Translate status to Portuguese.
     */
    private function translateStatus(string $status): string
    {
        $translations = [
            'matched' => 'Confere',
            'discrepancy' => 'Divergência',
            'missing_in_count' => 'Não contado',
            'missing_in_system' => 'Não existe no sistema',
        ];

        return $translations[$status] ?? $status;
    }

    /**
     * Apply inventory adjustments based on stock count discrepancies.
     */
    public function applyAdjustments(
        StockAudit $stockAudit,
        StockCount $stockCount,
        StockCountComparisonService $comparisonService
    ) {
        // Only allow applying adjustments for completed counts
        if ($stockCount->status !== 'completed') {
            return back()->with('error', 'Somente contagens concluídas podem gerar ajustes de estoque.');
        }

        // Check if adjustments were already applied
        if ($stockCount->adjustments_applied_at) {
            return back()->with('error', 'Os ajustes já foram aplicados para esta contagem.');
        }

        DB::beginTransaction();

        try {
            $comparison = $comparisonService->compare($stockCount);
            $adjustmentsCreated = 0;
            $area = $stockCount->area;

            foreach ($comparison['items'] as $item) {
                // Skip items that match perfectly
                if ($item['status'] === 'matched') {
                    continue;
                }

                // Skip items not in system (need to be created first)
                if ($item['status'] === 'missing_in_system') {
                    continue;
                }

                // Get the product
                $product = null;
                if ($item['product_id']) {
                    $product = Product::find($item['product_id']);
                }

                if (!$product) {
                    continue;
                }

                // Determine movement type and quantity based on discrepancy
                $discrepancy = $item['discrepancy'];

                if ($discrepancy == 0) {
                    continue;
                }

                // For positive discrepancy (counted more than system), use adjustment
                // For negative discrepancy (counted less than system), use exit
                $movementType = $discrepancy > 0
                    ? InventoryMovement::TYPE_ADJUSTMENT
                    : InventoryMovement::TYPE_EXIT;

                $adjustmentQuantity = abs($discrepancy);

                // Create inventory movement
                InventoryMovement::create([
                    'company_id' => auth()->user()->company_id,
                    'product_id' => $product->id,
                    'area_id' => $area?->id,
                    'type' => $movementType,
                    'quantity' => $adjustmentQuantity,
                    'unit_cost' => $item['product_cost'],
                    'reference_type' => StockCount::class,
                    'reference_id' => $stockCount->id,
                    'notes' => sprintf(
                        'Ajuste da contagem #%d - Divergência: %s %s (Sistema: %s, Contado: %s)',
                        $stockCount->count_number,
                        $discrepancy > 0 ? '+' : '',
                        number_format($discrepancy, 2, ',', '.'),
                        number_format($item['quantity_system'], 2, ',', '.'),
                        number_format($item['quantity_counted'], 2, ',', '.')
                    ),
                    'document_number' => sprintf('COUNT-%d', $stockCount->id),
                    'user_id' => auth()->id(),
                    'movement_date' => now(),
                ]);

                $adjustmentsCreated++;
            }

            // Mark adjustments as applied
            $stockCount->update([
                'adjustments_applied_at' => now(),
                'adjustments_applied_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()
                ->route('stock-counts.comparison', [$stockAudit, $stockCount])
                ->with('success', sprintf(
                    '%d ajuste(s) de estoque criado(s) com sucesso!',
                    $adjustmentsCreated
                ));
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erro ao aplicar ajustes: ' . $e->getMessage());
        }
    }
}
