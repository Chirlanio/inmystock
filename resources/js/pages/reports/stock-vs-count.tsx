import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface StockCount {
    id: number;
    count_number: string;
    completed_at: string;
    area: {
        id: number;
        name: string;
    };
}

interface DiscrepancyItem {
    id: number;
    stock_count: {
        id: number;
        count_number: string;
        completed_at: string;
        area: {
            id: number;
            name: string;
        };
        counter: {
            id: number;
            name: string;
        };
    };
    product_code: string;
    product_name: string;
    unit: string;
    location: string | null;
    theoretical_stock: number;
    counted_stock: number;
    difference: number;
    percentage_diff: number;
    has_discrepancy: boolean;
    product_exists: boolean;
}

interface Props {
    items: DiscrepancyItem[];
    stockCounts: StockCount[];
    filters: {
        stock_count_id?: number;
        area_id?: number;
        date_from?: string;
        date_to?: string;
        only_discrepancies?: boolean;
    };
    summary: {
        total_items: number;
        items_with_discrepancy: number;
        total_positive_diff: number;
        total_negative_diff: number;
    };
}

export default function StockVsCountReportPage({ items, stockCounts, filters, summary }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/reports/stock-vs-count',
            localFilters as Record<string, string>,
            { preserveState: true }
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams(localFilters as Record<string, string>);
        window.location.href = `/reports/export/stock-vs-count?${params.toString()}`;
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Relatório: Estoque vs Contagem" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Divergências: Estoque vs Contagem"
                    description="Compare o estoque teórico com as quantidades contadas"
                />

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label>Contagem</Label>
                                    <Select
                                        value={localFilters.stock_count_id?.toString()}
                                        onValueChange={(value) =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                stock_count_id: value ? parseInt(value) : undefined,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas as contagens" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stockCounts.map((count) => (
                                                <SelectItem key={count.id} value={count.id.toString()}>
                                                    {count.count_number} - {count.area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Data Início</Label>
                                    <Input
                                        type="date"
                                        value={localFilters.date_from || ''}
                                        onChange={(e) =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                date_from: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Data Fim</Label>
                                    <Input
                                        type="date"
                                        value={localFilters.date_to || ''}
                                        onChange={(e) =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                date_to: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-end space-x-2">
                                    <Switch
                                        id="only-discrepancies"
                                        checked={localFilters.only_discrepancies || false}
                                        onCheckedChange={(checked) =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                only_discrepancies: checked,
                                            }))
                                        }
                                    />
                                    <Label htmlFor="only-discrepancies" className="text-sm">
                                        Apenas divergências
                                    </Label>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filtrar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setLocalFilters({});
                                        router.get('/reports/stock-vs-count');
                                    }}
                                >
                                    Limpar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleExport}
                                    className="ml-auto"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar CSV
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Resumo */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total de Itens</CardDescription>
                            <CardTitle className="text-3xl">{summary.total_items}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Com Divergência</CardDescription>
                            <CardTitle className="text-3xl text-red-600">
                                {summary.items_with_discrepancy}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Sobras</CardDescription>
                            <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
                                <TrendingUp className="h-6 w-6" />
                                {formatNumber(summary.total_positive_diff)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Faltas</CardDescription>
                            <CardTitle className="text-3xl text-red-600 flex items-center gap-2">
                                <TrendingDown className="h-6 w-6" />
                                {formatNumber(Math.abs(summary.total_negative_diff))}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Tabela de divergências */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhamento de Divergências</CardTitle>
                        <CardDescription>
                            {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Localização</TableHead>
                                        <TableHead className="text-right">Teórico</TableHead>
                                        <TableHead className="text-right">Contado</TableHead>
                                        <TableHead className="text-right">Divergência</TableHead>
                                        <TableHead className="text-right">%</TableHead>
                                        <TableHead>Contagem</TableHead>
                                        <TableHead>Área</TableHead>
                                        <TableHead>Data</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center text-muted-foreground">
                                                Nenhum item encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {item.product_code}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{item.product_name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.unit}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.location || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatNumber(item.theoretical_stock)}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {formatNumber(item.counted_stock)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.difference !== 0 ? (
                                                        <Badge
                                                            variant={
                                                                item.difference > 0 ? 'default' : 'destructive'
                                                            }
                                                        >
                                                            {item.difference > 0 ? '+' : ''}
                                                            {formatNumber(item.difference)}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.percentage_diff !== 0 ? (
                                                        <span
                                                            className={
                                                                item.difference > 0
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }
                                                        >
                                                            {item.percentage_diff > 0 ? '+' : ''}
                                                            {formatNumber(item.percentage_diff)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.stock_count.count_number}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {item.stock_count.area.name}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDate(item.stock_count.completed_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
