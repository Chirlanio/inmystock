import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Product } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    Building2,
    ClipboardCheck,
    MapPin,
    Package,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

interface StockAudit {
    id: number;
    title: string;
    code: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    start_date: string;
    responsible: {
        id: number;
        name: string;
    };
}

interface Props {
    stats: {
        products: {
            total: number;
            active: number;
            inactive: number;
        };
        suppliers: {
            total: number;
            active: number;
            inactive: number;
        };
        areas: {
            total: number;
            active: number;
            inactive: number;
        };
        audits: {
            total: number;
            planned: number;
            in_progress: number;
            completed: number;
            cancelled: number;
        };
    };
    recentAudits: StockAudit[];
    lowStockProducts: Product[];
    productsByCategory: Array<{
        category: string;
        total: number;
    }>;
}

const statusColors = {
    planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusLabels = {
    planned: 'Planejada',
    in_progress: 'Em Andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
};

export default function Dashboard({ stats, recentAudits, lowStockProducts, productsByCategory }: Props) {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Dashboard"
                    description="Visão geral do sistema de auditoria de estoque"
                />

                {/* Main Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Products Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.products.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.products.active} ativos, {stats.products.inactive} inativos
                            </p>
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.visit('/products')}
                                >
                                    Ver Produtos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suppliers Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.suppliers.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.suppliers.active} ativos, {stats.suppliers.inactive} inativos
                            </p>
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.visit('/suppliers')}
                                >
                                    Ver Fornecedores
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Areas Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Áreas</CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.areas.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.areas.active} ativas, {stats.areas.inactive} inativas
                            </p>
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.visit('/areas')}
                                >
                                    Ver Áreas
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audits Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Auditorias</CardTitle>
                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.audits.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.audits.in_progress} em andamento
                            </p>
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.visit('/stock-audits')}
                                >
                                    Ver Auditorias
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audits Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Planejadas</CardTitle>
                            <Archive className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.audits.planned}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.audits.in_progress}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                            <ClipboardCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.audits.completed}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.audits.cancelled}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Audits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Auditorias Recentes</CardTitle>
                            <CardDescription>
                                Últimas 5 auditorias criadas no sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentAudits.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    Nenhuma auditoria encontrada
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {recentAudits.map((audit) => (
                                        <div
                                            key={audit.id}
                                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium leading-none">
                                                    {audit.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {audit.code} • {audit.responsible.name}
                                                </p>
                                            </div>
                                            <Badge className={statusColors[audit.status]}>
                                                {statusLabels[audit.status]}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Products by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Produtos por Categoria</CardTitle>
                            <CardDescription>Top 5 categorias com mais produtos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productsByCategory.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    Nenhuma categoria encontrada
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {productsByCategory.map((category, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium leading-none">
                                                    {category.category}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {category.total}{' '}
                                                    {category.total === 1 ? 'produto' : 'produtos'}
                                                </p>
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                <span className="text-sm font-bold">
                                                    {category.total}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Products */}
                {lowStockProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                Produtos com Estoque Baixo
                            </CardTitle>
                            <CardDescription>
                                Produtos que podem estar abaixo do estoque mínimo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lowStockProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium leading-none">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product.code}
                                                {product.category && ` • ${product.category}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                Mín: {product.min_stock} {product.unit}
                                            </p>
                                            {product.max_stock > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    Máx: {product.max_stock} {product.unit}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
