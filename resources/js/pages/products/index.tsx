import { ProductViewModal } from '@/components/product-view-modal';
import { Column, DataTable } from '@/components/data-table';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData, Product } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Download, Package, PlusCircle, Search, Upload } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

interface Props {
    products: PaginatedData<Product>;
    categories: string[];
    filters: {
        search?: string;
        active?: string;
        category?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function ProductsIndexPage({ products, categories, filters }: Props) {
    useToastFlash();

    const { props } = usePage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/products',
                {
                    search: search || undefined,
                    active: activeFilter === 'all' ? undefined : activeFilter,
                    category: categoryFilter === 'all' ? undefined : categoryFilter,
                    sort: filters.sort,
                    direction: filters.direction,
                },
                { preserveState: true, preserveScroll: true }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, activeFilter, categoryFilter]);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        description: '',
        category: '',
        unit: 'UN',
        price: '',
        cost: '',
        barcode: '',
        sku: '',
        min_stock: 0,
        max_stock: 0,
        active: true,
    });

    const {
        data: editData,
        setData: setEditData,
        put: editPut,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        code: '',
        name: '',
        description: '',
        category: '',
        unit: 'UN',
        price: '',
        cost: '',
        barcode: '',
        sku: '',
        min_stock: 0,
        max_stock: 0,
        active: true,
    });

    const handleSort = (column: string) => {
        const newDirection =
            filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/products',
            {
                search: search || undefined,
                active: activeFilter === 'all' ? undefined : activeFilter,
                category: categoryFilter === 'all' ? undefined : categoryFilter,
                sort: column,
                direction: newDirection,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (productId: number) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            router.delete(`/products/${productId}`);
        }
    };

    const handleCreateProduct = (e: FormEvent) => {
        e.preventDefault();
        post('/products', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleViewProduct = (product: Product) => {
        setViewingProduct(product);
        setIsViewModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setEditData({
            code: product.code,
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            unit: product.unit,
            price: product.price ? String(product.price) : '',
            cost: product.cost ? String(product.cost) : '',
            barcode: product.barcode || '',
            sku: product.sku || '',
            min_stock: product.min_stock,
            max_stock: product.max_stock,
            active: product.active,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = (e: FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        editPut(`/products/${editingProduct.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingProduct(null);
            },
        });
    };

    const handleImportFile = async (e: FormEvent) => {
        e.preventDefault();

        if (!importFile) return;

        setImporting(true);

        const formData = new FormData();
        formData.append('file', importFile);

        router.post('/products/import', formData, {
            onSuccess: () => {
                setIsImportModalOpen(false);
                setImportFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onFinish: () => {
                setImporting(false);
            },
        });
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/products/template/download';
    };

    const formatCurrency = (value: string | number | null) => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(Number(value));
    };

    const columns: Column<Product>[] = [
        {
            key: 'name',
            label: 'Produto',
            sortable: true,
            render: (product) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">{product.name}</p>
                        {product.category && (
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'code',
            label: 'Código',
            sortable: true,
        },
        {
            key: 'unit',
            label: 'Unidade',
            render: (product) => <Badge variant="outline">{product.unit}</Badge>,
        },
        {
            key: 'price',
            label: 'Preço',
            render: (product) => (
                <span className="font-medium">{formatCurrency(product.price)}</span>
            ),
        },
        {
            key: 'active',
            label: 'Status',
            render: (product) =>
                product.active ? (
                    <Badge variant="secondary">Ativo</Badge>
                ) : (
                    <Badge variant="outline">Inativo</Badge>
                ),
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (product) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                        Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                    >
                        Excluir
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Gerenciar Produtos" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Gerenciar Produtos"
                        description="Gerencie o catálogo de produtos"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar
                        </Button>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Novo Produto
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, código, barcode, SKU ou categoria..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas categorias</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="1">Ativos</SelectItem>
                                    <SelectItem value="0">Inativos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DataTable
                            columns={columns}
                            data={products.data}
                            currentSort={
                                filters.sort
                                    ? { column: filters.sort, direction: filters.direction || 'asc' }
                                    : null
                            }
                            onSort={handleSort}
                            emptyMessage="Nenhum produto encontrado."
                        />

                        {products.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {products.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url);
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Produto</DialogTitle>
                            <DialogDescription>
                                Adicione um novo produto ao catálogo
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateProduct} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Gerado automaticamente se vazio"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Deixe vazio para gerar automaticamente
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Input
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="Ex: Eletrônicos, Alimentos"
                                    />
                                    {errors.category && (
                                        <p className="text-sm text-destructive">{errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unidade *</Label>
                                    <Select
                                        value={data.unit}
                                        onValueChange={(value) => setData('unit', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UN">Unidade (UN)</SelectItem>
                                            <SelectItem value="KG">Quilograma (KG)</SelectItem>
                                            <SelectItem value="G">Grama (G)</SelectItem>
                                            <SelectItem value="L">Litro (L)</SelectItem>
                                            <SelectItem value="ML">Mililitro (ML)</SelectItem>
                                            <SelectItem value="M">Metro (M)</SelectItem>
                                            <SelectItem value="CM">Centímetro (CM)</SelectItem>
                                            <SelectItem value="CX">Caixa (CX)</SelectItem>
                                            <SelectItem value="PC">Peça (PC)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.unit && (
                                        <p className="text-sm text-destructive">{errors.unit}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço de Venda</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">{errors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cost">Custo</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cost}
                                        onChange={(e) => setData('cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.cost && (
                                        <p className="text-sm text-destructive">{errors.cost}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Código de Barras</Label>
                                    <Input
                                        id="barcode"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        placeholder="Ex: 7891234567890"
                                    />
                                    {errors.barcode && (
                                        <p className="text-sm text-destructive">{errors.barcode}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        placeholder="Stock Keeping Unit"
                                    />
                                    {errors.sku && (
                                        <p className="text-sm text-destructive">{errors.sku}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_stock">Estoque Mínimo</Label>
                                    <Input
                                        id="min_stock"
                                        type="number"
                                        min="0"
                                        value={data.min_stock}
                                        onChange={(e) =>
                                            setData('min_stock', parseInt(e.target.value) || 0)
                                        }
                                    />
                                    {errors.min_stock && (
                                        <p className="text-sm text-destructive">{errors.min_stock}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_stock">Estoque Máximo</Label>
                                    <Input
                                        id="max_stock"
                                        type="number"
                                        min="0"
                                        value={data.max_stock}
                                        onChange={(e) =>
                                            setData('max_stock', parseInt(e.target.value) || 0)
                                        }
                                    />
                                    {errors.max_stock && (
                                        <p className="text-sm text-destructive">{errors.max_stock}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="active"
                                    checked={data.active}
                                    onCheckedChange={(checked) => setData('active', checked as boolean)}
                                />
                                <Label htmlFor="active" className="cursor-pointer">
                                    Produto ativo
                                </Label>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Criando...' : 'Criar Produto'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Produto</DialogTitle>
                            <DialogDescription>Atualize as informações do produto</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateProduct} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nome *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        required
                                    />
                                    {editErrors.name && (
                                        <p className="text-sm text-destructive">{editErrors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-code">Código</Label>
                                    <Input
                                        id="edit-code"
                                        value={editData.code}
                                        onChange={(e) => setEditData('code', e.target.value)}
                                        placeholder="Código do produto"
                                    />
                                    {editErrors.code && (
                                        <p className="text-sm text-destructive">{editErrors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">Categoria</Label>
                                    <Input
                                        id="edit-category"
                                        value={editData.category}
                                        onChange={(e) => setEditData('category', e.target.value)}
                                        placeholder="Ex: Eletrônicos, Alimentos"
                                    />
                                    {editErrors.category && (
                                        <p className="text-sm text-destructive">
                                            {editErrors.category}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-unit">Unidade *</Label>
                                    <Select
                                        value={editData.unit}
                                        onValueChange={(value) => setEditData('unit', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UN">Unidade (UN)</SelectItem>
                                            <SelectItem value="KG">Quilograma (KG)</SelectItem>
                                            <SelectItem value="G">Grama (G)</SelectItem>
                                            <SelectItem value="L">Litro (L)</SelectItem>
                                            <SelectItem value="ML">Mililitro (ML)</SelectItem>
                                            <SelectItem value="M">Metro (M)</SelectItem>
                                            <SelectItem value="CM">Centímetro (CM)</SelectItem>
                                            <SelectItem value="CX">Caixa (CX)</SelectItem>
                                            <SelectItem value="PC">Peça (PC)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editErrors.unit && (
                                        <p className="text-sm text-destructive">{editErrors.unit}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Preço de Venda</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editData.price}
                                        onChange={(e) => setEditData('price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {editErrors.price && (
                                        <p className="text-sm text-destructive">{editErrors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-cost">Custo</Label>
                                    <Input
                                        id="edit-cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editData.cost}
                                        onChange={(e) => setEditData('cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {editErrors.cost && (
                                        <p className="text-sm text-destructive">{editErrors.cost}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-barcode">Código de Barras</Label>
                                    <Input
                                        id="edit-barcode"
                                        value={editData.barcode}
                                        onChange={(e) => setEditData('barcode', e.target.value)}
                                        placeholder="Ex: 7891234567890"
                                    />
                                    {editErrors.barcode && (
                                        <p className="text-sm text-destructive">
                                            {editErrors.barcode}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-sku">SKU</Label>
                                    <Input
                                        id="edit-sku"
                                        value={editData.sku}
                                        onChange={(e) => setEditData('sku', e.target.value)}
                                        placeholder="Stock Keeping Unit"
                                    />
                                    {editErrors.sku && (
                                        <p className="text-sm text-destructive">{editErrors.sku}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-min_stock">Estoque Mínimo</Label>
                                    <Input
                                        id="edit-min_stock"
                                        type="number"
                                        min="0"
                                        value={editData.min_stock}
                                        onChange={(e) =>
                                            setEditData('min_stock', parseInt(e.target.value) || 0)
                                        }
                                    />
                                    {editErrors.min_stock && (
                                        <p className="text-sm text-destructive">
                                            {editErrors.min_stock}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-max_stock">Estoque Máximo</Label>
                                    <Input
                                        id="edit-max_stock"
                                        type="number"
                                        min="0"
                                        value={editData.max_stock}
                                        onChange={(e) =>
                                            setEditData('max_stock', parseInt(e.target.value) || 0)
                                        }
                                    />
                                    {editErrors.max_stock && (
                                        <p className="text-sm text-destructive">
                                            {editErrors.max_stock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-active"
                                    checked={editData.active}
                                    onCheckedChange={(checked) =>
                                        setEditData('active', checked as boolean)
                                    }
                                />
                                <Label htmlFor="edit-active" className="cursor-pointer">
                                    Produto ativo
                                </Label>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <ProductViewModal
                    product={viewingProduct}
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                />

                {/* Import Modal */}
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Importar Produtos</DialogTitle>
                            <DialogDescription>
                                Faça upload de um arquivo CSV para importar produtos em lote
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleImportFile} className="space-y-6">
                            <div className="space-y-4">
                                <div className="rounded-lg border border-dashed border-muted-foreground/25 p-6">
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Selecione um arquivo CSV
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Máximo 10MB. Formato: CSV com separador ponto e
                                                vírgula (;)
                                            </p>
                                        </div>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.txt"
                                            onChange={(e) =>
                                                setImportFile(e.target.files?.[0] || null)
                                            }
                                            className="mt-2"
                                        />
                                        {importFile && (
                                            <p className="text-sm text-muted-foreground">
                                                Arquivo selecionado: {importFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-muted p-4">
                                    <p className="mb-2 text-sm font-medium">
                                        Formato do arquivo CSV:
                                    </p>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        <li>
                                            • Colunas: code, name, description, category, unit,
                                            price, cost, barcode, sku, min_stock, max_stock, active
                                        </li>
                                        <li>• Separador: ponto e vírgula (;)</li>
                                        <li>• Codificação: UTF-8</li>
                                        <li>
                                            • Campo "name" é obrigatório, demais campos são
                                            opcionais
                                        </li>
                                        <li>
                                            • Campo "code" pode ficar vazio para gerar
                                            automaticamente
                                        </li>
                                        <li>• Campo "active": usar "sim" ou "1" para ativo</li>
                                    </ul>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleDownloadTemplate}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar Template CSV
                                </Button>

                                {props.import_errors &&
                                    Array.isArray(props.import_errors) &&
                                    props.import_errors.length > 0 && (
                                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                                            <p className="mb-2 text-sm font-medium text-destructive">
                                                Erros encontrados durante a importação:
                                            </p>
                                            <ul className="space-y-1 text-xs text-destructive">
                                                {props.import_errors.map(
                                                    (error: string, index: number) => (
                                                        <li key={index}>• {error}</li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    disabled={importing}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={!importFile || importing}>
                                    {importing ? 'Importando...' : 'Importar Produtos'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
