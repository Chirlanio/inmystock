<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\StockAudit;
use App\Models\StockCount;
use App\Models\User;
use Illuminate\Http\Request;
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
        $areas = Area::where('active', true)->get();
        $counters = User::select('id', 'name', 'email')
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager', 'auditor', 'operator']);
            })
            ->get();

        return Inertia::render('stock-counts/create', [
            'audit' => $stockAudit,
            'areas' => $areas,
            'counters' => $counters,
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

        return redirect()->route('stock-counts.show', [$stockAudit, $count])
            ->with('success', 'Contagem criada com sucesso!');
    }

    public function show(StockAudit $stockAudit, StockCount $stockCount)
    {
        $stockCount->load(['area', 'counter', 'items']);

        return Inertia::render('stock-counts/show', [
            'audit' => $stockAudit,
            'count' => $stockCount,
        ]);
    }

    public function edit(StockAudit $stockAudit, StockCount $stockCount)
    {
        if (!$stockCount->canBeEdited()) {
            return redirect()->route('stock-counts.show', [$stockAudit, $stockCount])
                ->with('error', 'Esta contagem não pode mais ser editada.');
        }

        $areas = Area::where('active', true)->get();
        $counters = User::select('id', 'name', 'email')
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager', 'auditor', 'operator']);
            })
            ->get();

        $stockCount->load(['area', 'counter', 'items']);

        return Inertia::render('stock-counts/edit', [
            'audit' => $stockAudit,
            'count' => $stockCount,
            'areas' => $areas,
            'counters' => $counters,
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
}
