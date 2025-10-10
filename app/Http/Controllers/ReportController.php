<?php

namespace App\Http\Controllers;

use App\Models\StockCount;
use App\Models\StockCountItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('reports/index');
    }

    /**
     * Relatório de divergências entre contagem e estoque teórico
     */
    public function stockVsCount(Request $request)
    {
        $query = StockCountItem::with(['stockCount.area', 'stockCount.counter'])
            ->select('stock_count_items.*')
            ->join('stock_counts', 'stock_count_items.stock_count_id', '=', 'stock_counts.id')
            ->where('stock_counts.status', 'completed');

        // Filtros
        if ($request->stock_count_id) {
            $query->where('stock_count_id', $request->stock_count_id);
        }

        if ($request->area_id) {
            $query->where('stock_counts.area_id', $request->area_id);
        }

        if ($request->date_from) {
            $query->where('stock_counts.completed_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('stock_counts.completed_at', '<=', $request->date_to);
        }

        // Buscar produtos correspondentes e calcular divergências
        $items = $query->orderBy('stock_counts.completed_at', 'desc')
            ->get()
            ->map(function ($item) {
                $product = Product::where('code', $item->product_code)->first();

                // Estoque teórico seria baseado em movimentações (por enquanto usamos 0 como base)
                // TODO: Implementar cálculo real de estoque teórico baseado em movimentações
                $theoreticalStock = $product ? 0 : 0;
                $countedStock = $item->quantity_counted;
                $difference = $countedStock - $theoreticalStock;
                $percentageDiff = $theoreticalStock > 0
                    ? (($difference / $theoreticalStock) * 100)
                    : ($countedStock > 0 ? 100 : 0);

                return [
                    'id' => $item->id,
                    'stock_count' => [
                        'id' => $item->stockCount->id,
                        'count_number' => $item->stockCount->count_number,
                        'completed_at' => $item->stockCount->completed_at,
                        'area' => $item->stockCount->area,
                        'counter' => $item->stockCount->counter,
                    ],
                    'product_code' => $item->product_code,
                    'product_name' => $item->product_name,
                    'unit' => $item->unit,
                    'location' => $item->location,
                    'theoretical_stock' => $theoreticalStock,
                    'counted_stock' => $countedStock,
                    'difference' => $difference,
                    'percentage_diff' => round($percentageDiff, 2),
                    'has_discrepancy' => abs($difference) > 0,
                    'product_exists' => $product !== null,
                ];
            });

        // Filtrar apenas divergências se solicitado
        if ($request->only_discrepancies) {
            $items = $items->filter(fn($item) => $item['has_discrepancy']);
        }

        $stockCounts = StockCount::with('area')
            ->completed()
            ->orderBy('completed_at', 'desc')
            ->get();

        return Inertia::render('reports/stock-vs-count', [
            'items' => $items->values(),
            'stockCounts' => $stockCounts,
            'filters' => $request->only(['stock_count_id', 'area_id', 'date_from', 'date_to', 'only_discrepancies']),
            'summary' => [
                'total_items' => $items->count(),
                'items_with_discrepancy' => $items->filter(fn($i) => $i['has_discrepancy'])->count(),
                'total_positive_diff' => $items->filter(fn($i) => $i['difference'] > 0)->sum('difference'),
                'total_negative_diff' => $items->filter(fn($i) => $i['difference'] < 0)->sum('difference'),
            ],
        ]);
    }

    /**
     * Relatório de divergências entre duas contagens
     */
    public function countVsCount(Request $request)
    {
        $request->validate([
            'stock_count_1' => 'required|exists:stock_counts,id',
            'stock_count_2' => 'required|exists:stock_counts,id|different:stock_count_1',
        ]);

        $count1 = StockCount::with(['items', 'area', 'counter'])->findOrFail($request->stock_count_1);
        $count2 = StockCount::with(['items', 'area', 'counter'])->findOrFail($request->stock_count_2);

        // Agrupar itens por código de produto
        $items1 = $count1->items->keyBy('product_code');
        $items2 = $count2->items->keyBy('product_code');

        // Combinar todos os códigos de produtos
        $allCodes = $items1->keys()->merge($items2->keys())->unique();

        $comparisons = $allCodes->map(function ($code) use ($items1, $items2) {
            $item1 = $items1->get($code);
            $item2 = $items2->get($code);

            $qty1 = $item1 ? $item1->quantity_counted : 0;
            $qty2 = $item2 ? $item2->quantity_counted : 0;
            $difference = $qty2 - $qty1;
            $percentageDiff = $qty1 > 0
                ? (($difference / $qty1) * 100)
                : ($qty2 > 0 ? 100 : 0);

            return [
                'product_code' => $code,
                'product_name' => $item1 ? $item1->product_name : ($item2 ? $item2->product_name : 'N/A'),
                'unit' => $item1 ? $item1->unit : ($item2 ? $item2->unit : 'UN'),
                'count_1_qty' => $qty1,
                'count_2_qty' => $qty2,
                'difference' => $difference,
                'percentage_diff' => round($percentageDiff, 2),
                'has_discrepancy' => abs($difference) > 0,
                'in_count_1' => $item1 !== null,
                'in_count_2' => $item2 !== null,
            ];
        });

        // Filtrar apenas divergências se solicitado
        if ($request->only_discrepancies) {
            $comparisons = $comparisons->filter(fn($item) => $item['has_discrepancy']);
        }

        $availableCounts = StockCount::with('area')
            ->completed()
            ->orderBy('completed_at', 'desc')
            ->get();

        return Inertia::render('reports/count-vs-count', [
            'count1' => [
                'id' => $count1->id,
                'count_number' => $count1->count_number,
                'completed_at' => $count1->completed_at,
                'area' => $count1->area,
                'counter' => $count1->counter,
            ],
            'count2' => [
                'id' => $count2->id,
                'count_number' => $count2->count_number,
                'completed_at' => $count2->completed_at,
                'area' => $count2->area,
                'counter' => $count2->counter,
            ],
            'comparisons' => $comparisons->values(),
            'availableCounts' => $availableCounts,
            'filters' => $request->only(['stock_count_1', 'stock_count_2', 'only_discrepancies']),
            'summary' => [
                'total_items' => $comparisons->count(),
                'items_with_discrepancy' => $comparisons->filter(fn($i) => $i['has_discrepancy'])->count(),
                'only_in_count_1' => $comparisons->filter(fn($i) => $i['in_count_1'] && !$i['in_count_2'])->count(),
                'only_in_count_2' => $comparisons->filter(fn($i) => !$i['in_count_1'] && $i['in_count_2'])->count(),
                'in_both' => $comparisons->filter(fn($i) => $i['in_count_1'] && $i['in_count_2'])->count(),
            ],
        ]);
    }

    /**
     * Relatório de produtos não contados
     */
    public function missingProducts(Request $request)
    {
        $request->validate([
            'stock_count_id' => 'required|exists:stock_counts,id',
        ]);

        $stockCount = StockCount::with(['items', 'area'])->findOrFail($request->stock_count_id);

        // Obter todos os códigos contados
        $countedCodes = $stockCount->items->pluck('product_code')->unique();

        // Buscar produtos que não foram contados
        // TODO: Filtrar por área/localização quando implementado
        $missingProducts = Product::whereNotIn('code', $countedCodes)
            ->where('active', true)
            ->orderBy('code')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'code' => $product->code,
                    'name' => $product->name,
                    'category' => $product->category,
                    'color' => $product->color,
                    'size' => $product->size,
                    'unit' => $product->unit,
                ];
            });

        $availableCounts = StockCount::with('area')
            ->completed()
            ->orderBy('completed_at', 'desc')
            ->get();

        return Inertia::render('reports/missing-products', [
            'stockCount' => [
                'id' => $stockCount->id,
                'count_number' => $stockCount->count_number,
                'completed_at' => $stockCount->completed_at,
                'area' => $stockCount->area,
            ],
            'missingProducts' => $missingProducts,
            'availableCounts' => $availableCounts,
            'summary' => [
                'total_products_counted' => $countedCodes->count(),
                'total_products_missing' => $missingProducts->count(),
            ],
        ]);
    }

    /**
     * Exportar relatório para CSV
     */
    public function export(Request $request, string $type)
    {
        $fileName = "relatorio-{$type}-" . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($request, $type) {
            $file = fopen('php://output', 'w');

            // BOM para UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            switch ($type) {
                case 'stock-vs-count':
                    $this->exportStockVsCount($file, $request);
                    break;
                case 'count-vs-count':
                    $this->exportCountVsCount($file, $request);
                    break;
                case 'missing-products':
                    $this->exportMissingProducts($file, $request);
                    break;
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportStockVsCount($file, $request)
    {
        fputcsv($file, ['Código', 'Produto', 'Unidade', 'Localização', 'Estoque Teórico', 'Contado', 'Divergência', '% Divergência', 'Contagem', 'Área', 'Data'], ';');

        // Replicar a lógica do método stockVsCount para obter os dados
        $query = StockCountItem::with(['stockCount.area'])
            ->select('stock_count_items.*')
            ->join('stock_counts', 'stock_count_items.stock_count_id', '=', 'stock_counts.id')
            ->where('stock_counts.status', 'completed');

        if ($request->stock_count_id) {
            $query->where('stock_count_id', $request->stock_count_id);
        }

        $items = $query->get();

        foreach ($items as $item) {
            $product = Product::where('code', $item->product_code)->first();
            $theoreticalStock = 0;
            $difference = $item->quantity_counted - $theoreticalStock;

            fputcsv($file, [
                $item->product_code,
                $item->product_name,
                $item->unit,
                $item->location,
                $theoreticalStock,
                $item->quantity_counted,
                $difference,
                $theoreticalStock > 0 ? round(($difference / $theoreticalStock) * 100, 2) : 0,
                $item->stockCount->count_number,
                $item->stockCount->area->name ?? 'N/A',
                $item->stockCount->completed_at ? $item->stockCount->completed_at->format('d/m/Y H:i') : '',
            ], ';');
        }
    }

    private function exportCountVsCount($file, $request)
    {
        fputcsv($file, ['Código', 'Produto', 'Unidade', 'Contagem 1', 'Contagem 2', 'Divergência', '% Divergência'], ';');

        $count1 = StockCount::with('items')->findOrFail($request->stock_count_1);
        $count2 = StockCount::with('items')->findOrFail($request->stock_count_2);

        $items1 = $count1->items->keyBy('product_code');
        $items2 = $count2->items->keyBy('product_code');
        $allCodes = $items1->keys()->merge($items2->keys())->unique();

        foreach ($allCodes as $code) {
            $item1 = $items1->get($code);
            $item2 = $items2->get($code);
            $qty1 = $item1 ? $item1->quantity_counted : 0;
            $qty2 = $item2 ? $item2->quantity_counted : 0;
            $difference = $qty2 - $qty1;

            fputcsv($file, [
                $code,
                $item1 ? $item1->product_name : ($item2 ? $item2->product_name : 'N/A'),
                $item1 ? $item1->unit : ($item2 ? $item2->unit : 'UN'),
                $qty1,
                $qty2,
                $difference,
                $qty1 > 0 ? round(($difference / $qty1) * 100, 2) : 0,
            ], ';');
        }
    }

    private function exportMissingProducts($file, $request)
    {
        fputcsv($file, ['Código', 'Produto', 'Categoria', 'Cor', 'Tamanho', 'Unidade'], ';');

        $stockCount = StockCount::with('items')->findOrFail($request->stock_count_id);
        $countedCodes = $stockCount->items->pluck('product_code')->unique();

        $missingProducts = Product::whereNotIn('code', $countedCodes)
            ->where('active', true)
            ->get();

        foreach ($missingProducts as $product) {
            fputcsv($file, [
                $product->code,
                $product->name,
                $product->category,
                $product->color,
                $product->size,
                $product->unit,
            ], ';');
        }
    }
}
