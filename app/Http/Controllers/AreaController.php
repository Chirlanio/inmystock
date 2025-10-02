<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = Area::query();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Active filter
        if ($request->has('active') && $request->active !== 'all') {
            $query->where('active', $request->active === '1');
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $areas = $query->paginate(10)->withQueryString();

        return Inertia::render('areas/index', [
            'areas' => $areas,
            'filters' => $request->only(['search', 'active', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        // Not used - creation handled via modal
        return redirect()->route('areas.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'location_count' => 'required|integer|min:1|max:1000',
            'code' => 'nullable|string|max:255|unique:areas,code',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        Area::create($validated);

        return back()->with('success', 'Área criada com sucesso!');
    }

    public function show(Area $area)
    {
        $area->load(['stockCounts.stockAudit', 'stockCounts.counter', 'company']);

        return Inertia::render('areas/show', [
            'area' => $area,
        ]);
    }

    public function edit(Area $area)
    {
        // Not used - editing handled via modal
        return redirect()->route('areas.index');
    }

    public function update(Request $request, Area $area)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'location_count' => 'required|integer|min:1|max:1000',
            'code' => 'nullable|string|max:255|unique:areas,code,' . $area->id,
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $area->update($validated);

        return back()->with('success', 'Área atualizada com sucesso!');
    }

    public function destroy(Area $area)
    {
        // Check if area has counts
        if ($area->stockCounts()->exists()) {
            return back()->with('error', 'Esta área possui contagens associadas e não pode ser excluída.');
        }

        $area->delete();

        return back()->with('success', 'Área excluída com sucesso!');
    }
}
