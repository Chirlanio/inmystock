import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Product } from '@/types';
import {
    Barcode,
    Calendar,
    CheckCircle,
    DollarSign,
    FileText,
    Hash,
    Package,
    Tag,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react';

interface ProductViewModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductViewModal({ product, open, onOpenChange }: ProductViewModalProps) {
    if (!product) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatCurrency = (value: string | number | null) => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(Number(value));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes do Produto</DialogTitle>
                    <DialogDescription>Visualize as informações completas do produto</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header com nome e status */}
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            {product.category && (
                                <p className="text-muted-foreground">{product.category}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                                {product.active ? (
                                    <Badge variant="secondary">Ativo</Badge>
                                ) : (
                                    <Badge variant="outline">Inativo</Badge>
                                )}
                                <Badge variant="default">{product.unit}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Informações em Grid */}
                    <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* ID */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <span className="text-sm font-semibold">ID</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Identificador</p>
                                <p className="font-medium">#{product.id}</p>
                            </div>
                        </div>

                        {/* Código */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Código</p>
                                <p className="font-medium">{product.code}</p>
                            </div>
                        </div>

                        {/* Código de Barras */}
                        {product.barcode && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Barcode className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Código de Barras</p>
                                    <p className="font-medium">{product.barcode}</p>
                                </div>
                            </div>
                        )}

                        {/* SKU */}
                        {product.sku && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">SKU</p>
                                    <p className="font-medium">{product.sku}</p>
                                </div>
                            </div>
                        )}

                        {/* Preço */}
                        {product.price && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Preço de Venda</p>
                                    <p className="font-medium">{formatCurrency(product.price)}</p>
                                </div>
                            </div>
                        )}

                        {/* Custo */}
                        {product.cost && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <DollarSign className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Custo</p>
                                    <p className="font-medium">{formatCurrency(product.cost)}</p>
                                </div>
                            </div>
                        )}

                        {/* Estoque Mínimo */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <TrendingDown className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                                <p className="font-medium">{product.min_stock}</p>
                            </div>
                        </div>

                        {/* Estoque Máximo */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estoque Máximo</p>
                                <p className="font-medium">{product.max_stock}</p>
                            </div>
                        </div>

                        {/* Data de Criação */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Criado em</p>
                                <p className="font-medium">{formatDate(product.created_at)}</p>
                            </div>
                        </div>

                        {/* Última Atualização */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Última atualização</p>
                                <p className="font-medium">{formatDate(product.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Descrição - Largura Total */}
                    {product.description && (
                        <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                            <p className="mt-2">{product.description}</p>
                        </div>
                    )}

                    {/* Status Detalhado */}
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                {product.active ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-orange-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Status do produto</p>
                                <p className="font-medium">
                                    {product.active
                                        ? 'Produto ativo e disponível para uso'
                                        : 'Produto inativo'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
