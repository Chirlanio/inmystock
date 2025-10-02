<?php

namespace App\Http\Controllers;

use App\Models\StockAudit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockAuditController extends Controller
{
    public function index(Request $request)
    {
        $audits = StockAudit::with(['responsible', 'stockCounts'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Get users for the create modal
        $users = User::select('id', 'name', 'email')
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager', 'auditor']);
            })
            ->get();

        return Inertia::render('stock-audits/index', [
            'audits' => $audits,
            'users' => $users,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        // Not used - creation handled via modal
        return redirect()->route('stock-audits.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'nullable|string|max:255|unique:stock_audits,code',
            'description' => 'nullable|string',
            'responsible_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'required_counts' => 'required|integer|min:1|max:10',
        ]);

        StockAudit::create($validated);

        return back()->with('success', 'Auditoria criada com sucesso!');
    }

    public function show(StockAudit $stockAudit)
    {
        $stockAudit->load([
            'responsible',
            'stockCounts.area',
            'stockCounts.counter',
            'stockCounts.items'
        ]);

        return Inertia::render('stock-audits/show', [
            'audit' => $stockAudit,
        ]);
    }

    public function edit(StockAudit $stockAudit)
    {
        if (!$stockAudit->canBeEdited()) {
            return redirect()->route('stock-audits.show', $stockAudit)
                ->with('error', 'Esta auditoria não pode mais ser editada.');
        }

        $users = User::select('id', 'name', 'email')
            ->whereHas('role', function ($query) {
                $query->whereIn('slug', ['admin', 'manager', 'auditor']);
            })
            ->get();

        return Inertia::render('stock-audits/edit', [
            'audit' => $stockAudit,
            'users' => $users,
        ]);
    }

    public function update(Request $request, StockAudit $stockAudit)
    {
        if (!$stockAudit->canBeEdited()) {
            return back()->with('error', 'Esta auditoria não pode mais ser editada.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'responsible_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:planned,in_progress,completed,cancelled',
            'required_counts' => 'required|integer|min:1|max:10',
        ]);

        $stockAudit->update($validated);

        return back()->with('success', 'Auditoria atualizada com sucesso!');
    }

    public function destroy(StockAudit $stockAudit)
    {
        if ($stockAudit->status !== 'planned') {
            return back()->with('error', 'Apenas auditorias planejadas podem ser excluídas.');
        }

        $stockAudit->delete();

        return back()->with('success', 'Auditoria excluída com sucesso!');
    }
}
