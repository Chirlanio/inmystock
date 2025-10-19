<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Active filter
        if ($request->has('active') && $request->active !== 'all') {
            $query->where('active', $request->active === '1');
        }

        // Category filter
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate(10)->withQueryString();

        // Get all categories for filter
        $categories = Category::query()->orderBy('name')->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'active', 'category', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        // Not used - creation handled via modal
        return redirect()->route('products.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_product_id' => 'nullable|exists:products,id',
            'core_reference' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'unit' => 'required|string|max:10',
            'price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'barcode' => 'nullable|string|max:255|unique:products,barcode',
            'sku' => 'nullable|string|max:255',
            'min_stock' => 'nullable|integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'active' => 'boolean',
            'is_master' => 'boolean',
        ]);

        Product::create($validated);

        return back()->with('success', 'Produto criado com sucesso!');
    }

    public function show(Product $product)
    {
        $product->load(['company']);

        return Inertia::render('products/show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product)
    {
        // Not used - editing handled via modal
        return redirect()->route('products.index');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'parent_product_id' => 'nullable|exists:products,id',
            'core_reference' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'unit' => 'required|string|max:10',
            'price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'barcode' => 'nullable|string|max:255|unique:products,barcode,' . $product->id,
            'sku' => 'nullable|string|max:255',
            'min_stock' => 'nullable|integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'active' => 'boolean',
            'is_master' => 'boolean',
        ]);

        $product->update($validated);

        return back()->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('success', 'Produto excluído com sucesso!');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        // Parse CSV with semicolon delimiter
        $csv = array_map(function($line) {
            return str_getcsv($line, ';');
        }, file($path));
        $header = array_shift($csv); // Remove header row

        // Normalize header to lowercase and trim
        $header = array_map(function ($col) {
            return strtolower(trim($col));
        }, $header);

        $imported = 0;
        $skipped = 0;
        $errors = [];

        foreach ($csv as $index => $row) {
            $lineNumber = $index + 2; // +2 because we removed header and array is 0-indexed

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Combine header with row data
            $data = array_combine($header, $row);

            try {
                // Validate required fields
                if (empty($data['name'])) {
                    $errors[] = "Linha {$lineNumber}: Nome é obrigatório";
                    $skipped++;
                    continue;
                }

                // Prepare product data
                $productData = [
                    'name' => trim($data['name']),
                    'description' => !empty($data['description']) ? trim($data['description']) : null,
                    'color' => !empty($data['color']) ? trim($data['color']) : null,
                    'size' => !empty($data['size']) ? trim($data['size']) : null,
                    'unit' => !empty($data['unit']) ? strtoupper(trim($data['unit'])) : 'UN',
                    'price' => !empty($data['price']) ? (float) str_replace(',', '.', $data['price']) : null,
                    'cost' => !empty($data['cost']) ? (float) str_replace(',', '.', $data['cost']) : null,
                    'barcode' => !empty($data['barcode']) ? trim($data['barcode']) : null,
                    'sku' => !empty($data['sku']) ? trim($data['sku']) : null,
                    'min_stock' => !empty($data['min_stock']) ? (int) $data['min_stock'] : 0,
                    'max_stock' => !empty($data['max_stock']) ? (int) $data['max_stock'] : 0,
                    'active' => empty($data['active']) || strtolower($data['active']) === 'sim' || $data['active'] === '1',
                ];

                // Handle category
                if (!empty($data['category'])) {
                    $category = Category::firstOrCreate(
                        [
                            'name' => trim($data['category']),
                            'company_id' => auth()->user()->company_id,
                        ]
                    );
                    $productData['category_id'] = $category->id;
                }

                // Handle code - if provided, use it; otherwise it will be auto-generated
                if (!empty($data['code'])) {
                    $productData['code'] = trim($data['code']);
                }

                // Handle core reference
                if (!empty($data['core_reference'])) {
                    $productData['core_reference'] = trim($data['core_reference']);
                }

                // Check for duplicate barcode
                if ($productData['barcode']) {
                    $exists = Product::where('barcode', $productData['barcode'])->exists();
                    if ($exists) {
                        $errors[] = "Linha {$lineNumber}: Código de barras '{$productData['barcode']}' já existe";
                        $skipped++;
                        continue;
                    }
                }

                // Check for duplicate code
                if (!empty($productData['code'])) {
                    $exists = Product::where('code', $productData['code'])->exists();
                    if ($exists) {
                        $errors[] = "Linha {$lineNumber}: Código '{$productData['code']}' já existe";
                        $skipped++;
                        continue;
                    }
                }

                Product::create($productData);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Linha {$lineNumber}: {$e->getMessage()}";
                $skipped++;
            }
        }

        $message = "Importação concluída: {$imported} produto(s) importado(s)";
        if ($skipped > 0) {
            $message .= ", {$skipped} linha(s) ignorada(s)";
        }

        return back()->with([
            'success' => $message,
            'import_errors' => $errors,
        ]);
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_produtos.csv"',
        ];

        $columns = [
            'code',
            'core_reference',
            'name',
            'description',
            'category',
            'color',
            'size',
            'unit',
            'price',
            'cost',
            'barcode',
            'sku',
            'min_stock',
            'max_stock',
            'active',
        ];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');

            // Add BOM for UTF-8
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header
            fputcsv($file, $columns, ';');

            // Example row 1 - Produto com variações (preto)
            fputcsv($file, [
                'C3065000020003', // code
                'C306500002', // core_reference
                'Camiseta Básica',
                'Camiseta 100% algodão',
                'Vestuário',
                'Preto', // color
                'M', // size
                'UN',
                '49.90',
                '25.00',
                '7891234567890',
                'CAM-BAS-P-M',
                '10',
                '100',
                'sim',
            ], ';');

            // Example row 2 - Variação branca
            fputcsv($file, [
                'C3065000020007', // code
                'C306500002', // core_reference - mesmo core
                'Camiseta Básica',
                'Camiseta 100% algodão',
                'Vestuário',
                'Branco', // color
                'M', // size
                'UN',
                '49.90',
                '25.00',
                '7891234567891',
                'CAM-BAS-B-M',
                '10',
                '100',
                'sim',
            ], ';');

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
