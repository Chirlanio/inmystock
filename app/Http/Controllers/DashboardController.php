<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Product;
use App\Models\StockAudit;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $companyId = $user->company_id;

        // Total de produtos
        $totalProducts = Product::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->count();

        // Produtos ativos
        $activeProducts = Product::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->where('active', true)->count();

        // Total de fornecedores
        $totalSuppliers = Supplier::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->count();

        // Fornecedores ativos
        $activeSuppliers = Supplier::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->where('active', true)->count();

        // Total de áreas
        $totalAreas = Area::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->count();

        // Áreas ativas
        $activeAreas = Area::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->where('active', true)->count();

        // Auditorias
        $totalAudits = StockAudit::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })->count();

        $auditsByStatus = StockAudit::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();

        // Auditorias recentes
        $recentAudits = StockAudit::with('responsible')
            ->when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->latest()
            ->take(5)
            ->get();

        // Produtos com estoque baixo (min_stock)
        $lowStockProducts = Product::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })
            ->where('active', true)
            ->whereColumn('min_stock', '>', DB::raw('0'))
            ->take(5)
            ->get();

        // Estatísticas por categoria
        $productsByCategory = Product::when($companyId && !$user->isAdmin(), function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })
            ->select('category', DB::raw('count(*) as total'))
            ->whereNotNull('category')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'products' => [
                    'total' => $totalProducts,
                    'active' => $activeProducts,
                    'inactive' => $totalProducts - $activeProducts,
                ],
                'suppliers' => [
                    'total' => $totalSuppliers,
                    'active' => $activeSuppliers,
                    'inactive' => $totalSuppliers - $activeSuppliers,
                ],
                'areas' => [
                    'total' => $totalAreas,
                    'active' => $activeAreas,
                    'inactive' => $totalAreas - $activeAreas,
                ],
                'audits' => [
                    'total' => $totalAudits,
                    'planned' => $auditsByStatus['planned'] ?? 0,
                    'in_progress' => $auditsByStatus['in_progress'] ?? 0,
                    'completed' => $auditsByStatus['completed'] ?? 0,
                    'cancelled' => $auditsByStatus['cancelled'] ?? 0,
                ],
            ],
            'recentAudits' => $recentAudits,
            'lowStockProducts' => $lowStockProducts,
            'productsByCategory' => $productsByCategory,
        ]);
    }
}
