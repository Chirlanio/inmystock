<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $areas = Area::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($request->has('active'), function ($query) use ($request) {
                $query->where('active', $request->boolean('active'));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('areas/index', [
            'areas' => $areas,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    public function create()
    {
        return Inertia::render('areas/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:areas,code',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $area = Area::create($validated);

        return redirect()->route('areas.index')
            ->with('success', 'Área criada com sucesso!');
    }

    public function show(Area $area)
    {
        $area->load(['stockCounts.stockAudit', 'stockCounts.counter']);

        return Inertia::render('areas/show', [
            'area' => $area,
        ]);
    }

    public function edit(Area $area)
    {
        return Inertia::render('areas/edit', [
            'area' => $area,
        ]);
    }

    public function update(Request $request, Area $area)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:areas,code,' . $area->id,
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $area->update($validated);

        return redirect()->route('areas.index')
            ->with('success', 'Área atualizada com sucesso!');
    }

    public function destroy(Area $area)
    {
        // Check if area has counts
        if ($area->stockCounts()->exists()) {
            return redirect()->route('areas.index')
                ->with('error', 'Esta área possui contagens associadas e não pode ser excluída.');
        }

        $area->delete();

        return redirect()->route('areas.index')
            ->with('success', 'Área excluída com sucesso!');
    }
}
