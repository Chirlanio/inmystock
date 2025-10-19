<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryMovementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = InventoryMovement::with(['product', 'area', 'user', 'fromArea', 'toArea']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
            });
        }

        // Type filter
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Product filter
        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        // Area filter
        if ($request->has('area_id') && $request->area_id) {
            $query->where(function ($q) use ($request) {
                $q->where('area_id', $request->area_id)
                    ->orWhere('from_area_id', $request->area_id)
                    ->orWhere('to_area_id', $request->area_id);
            });
        }

        // Date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->where('movement_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('movement_date', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort', 'movement_date');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $movements = $query->paginate(15)->withQueryString();

        // Get filter options
        $products = Product::where('active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $areas = Area::where('active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $movementTypes = [
            ['value' => InventoryMovement::TYPE_ENTRY, 'label' => 'Entrada'],
            ['value' => InventoryMovement::TYPE_EXIT, 'label' => 'Saída'],
            ['value' => InventoryMovement::TYPE_ADJUSTMENT, 'label' => 'Ajuste'],
            ['value' => InventoryMovement::TYPE_TRANSFER_OUT, 'label' => 'Transferência (Saída)'],
            ['value' => InventoryMovement::TYPE_TRANSFER_IN, 'label' => 'Transferência (Entrada)'],
        ];

        return Inertia::render('inventory-movements/index', [
            'movements' => $movements,
            'filters' => $request->only(['search', 'type', 'product_id', 'area_id', 'date_from', 'date_to', 'sort', 'direction']),
            'products' => $products,
            'areas' => $areas,
            'movementTypes' => $movementTypes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::where('active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'unit', 'cost']);

        $areas = Area::where('active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'location']);

        $movementTypes = [
            ['value' => InventoryMovement::TYPE_ENTRY, 'label' => 'Entrada', 'description' => 'Registrar entrada de produtos no estoque'],
            ['value' => InventoryMovement::TYPE_EXIT, 'label' => 'Saída', 'description' => 'Registrar saída de produtos do estoque'],
            ['value' => InventoryMovement::TYPE_ADJUSTMENT, 'label' => 'Ajuste', 'description' => 'Ajustar quantidade de estoque (correção)'],
            ['value' => InventoryMovement::TYPE_TRANSFER_OUT, 'label' => 'Transferência', 'description' => 'Transferir produtos entre áreas'],
        ];

        return Inertia::render('inventory-movements/create', [
            'products' => $products,
            'areas' => $areas,
            'movementTypes' => $movementTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:entry,exit,adjustment,transfer_out,transfer_in',
            'quantity' => 'required|numeric|min:0.001',
            'unit_cost' => 'nullable|numeric|min:0',
            'movement_date' => 'required|date',
            'document_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];

        // For non-transfer movements, require area_id
        if (!in_array($request->type, ['transfer_out', 'transfer_in'])) {
            $rules['area_id'] = 'required|exists:areas,id';
        }

        // For transfers, require from_area_id and to_area_id
        if ($request->type === 'transfer_out') {
            $rules['from_area_id'] = 'required|exists:areas,id';
            $rules['to_area_id'] = 'required|exists:areas,id|different:from_area_id';
        }

        $validated = $request->validate($rules);

        // Set user_id
        $validated['user_id'] = auth()->id();

        // Handle transfers: create both movements (out and in)
        if ($request->type === 'transfer_out') {
            // Create transfer OUT movement
            $transferOut = InventoryMovement::create([
                ...$validated,
                'type' => InventoryMovement::TYPE_TRANSFER_OUT,
                'area_id' => null,
            ]);

            // Create transfer IN movement
            InventoryMovement::create([
                ...$validated,
                'type' => InventoryMovement::TYPE_TRANSFER_IN,
                'area_id' => null,
                'reference_type' => InventoryMovement::class,
                'reference_id' => $transferOut->id,
            ]);

            return redirect()->route('inventory-movements.index')
                ->with('success', 'Transferência registrada com sucesso!');
        }

        // Create regular movement
        InventoryMovement::create($validated);

        return redirect()->route('inventory-movements.index')
            ->with('success', 'Movimentação registrada com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(InventoryMovement $inventoryMovement)
    {
        $inventoryMovement->load(['product', 'area', 'user', 'fromArea', 'toArea', 'reference']);

        return Inertia::render('inventory-movements/show', [
            'movement' => $inventoryMovement,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryMovement $inventoryMovement)
    {
        // Only allow editing of adjustments and within the same day
        if ($inventoryMovement->type !== InventoryMovement::TYPE_ADJUSTMENT) {
            return back()->with('error', 'Apenas ajustes podem ser editados.');
        }

        if ($inventoryMovement->movement_date->isToday() === false) {
            return back()->with('error', 'Apenas movimentações do dia atual podem ser editadas.');
        }

        $products = Product::where('active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'unit', 'cost']);

        $areas = Area::where('active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'location']);

        return Inertia::render('inventory-movements/edit', [
            'movement' => $inventoryMovement,
            'products' => $products,
            'areas' => $areas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryMovement $inventoryMovement)
    {
        // Only allow updating adjustments
        if ($inventoryMovement->type !== InventoryMovement::TYPE_ADJUSTMENT) {
            return back()->with('error', 'Apenas ajustes podem ser editados.');
        }

        if ($inventoryMovement->movement_date->isToday() === false) {
            return back()->with('error', 'Apenas movimentações do dia atual podem ser editadas.');
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'area_id' => 'required|exists:areas,id',
            'quantity' => 'required|numeric|min:0.001',
            'unit_cost' => 'nullable|numeric|min:0',
            'movement_date' => 'required|date',
            'document_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $inventoryMovement->update($validated);

        return redirect()->route('inventory-movements.index')
            ->with('success', 'Movimentação atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryMovement $inventoryMovement)
    {
        // Only allow deleting movements from today
        if ($inventoryMovement->movement_date->isToday() === false) {
            return back()->with('error', 'Apenas movimentações do dia atual podem ser excluídas.');
        }

        // Don't allow deleting if it's part of a transfer pair
        if ($inventoryMovement->isTransfer() && $inventoryMovement->reference_id) {
            return back()->with('error', 'Movimentações de transferência não podem ser excluídas individualmente. Exclua a transferência completa.');
        }

        $inventoryMovement->delete();

        return back()->with('success', 'Movimentação excluída com sucesso!');
    }

    /**
     * Export movements to CSV
     */
    public function export(Request $request)
    {
        $query = InventoryMovement::with(['product', 'area', 'user', 'fromArea', 'toArea']);

        // Apply same filters as index
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('product_id') && $request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('area_id') && $request->area_id) {
            $query->where(function ($q) use ($request) {
                $q->where('area_id', $request->area_id)
                    ->orWhere('from_area_id', $request->area_id)
                    ->orWhere('to_area_id', $request->area_id);
            });
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('movement_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('movement_date', '<=', $request->date_to);
        }

        $movements = $query->orderBy('movement_date', 'desc')->get();

        $filename = 'movimentacoes-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($movements) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header
            fputcsv($file, [
                'Código',
                'Data',
                'Tipo',
                'Produto',
                'Área',
                'De (Área)',
                'Para (Área)',
                'Quantidade',
                'Custo Unitário',
                'Custo Total',
                'Documento',
                'Observações',
                'Usuário',
            ], ';');

            // Data
            foreach ($movements as $movement) {
                fputcsv($file, [
                    $movement->code,
                    $movement->movement_date->format('d/m/Y H:i'),
                    $movement->getTypeLabel(),
                    $movement->product ? $movement->product->name : '',
                    $movement->area ? $movement->area->name : '',
                    $movement->fromArea ? $movement->fromArea->name : '',
                    $movement->toArea ? $movement->toArea->name : '',
                    $movement->quantity,
                    $movement->unit_cost ?? '',
                    $movement->total_cost ?? '',
                    $movement->document_number ?? '',
                    $movement->notes ?? '',
                    $movement->user ? $movement->user->name : '',
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
