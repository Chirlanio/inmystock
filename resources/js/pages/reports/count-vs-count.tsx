import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Download, Filter, GitCompare } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface StockCount {
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
}

interface Comparison {
    product_code: string;
    product_name: string;
    unit: string;
    count_1_qty: number;
    count_2_qty: number;
    difference: number;
    percentage_diff: number;
    has_discrepancy: boolean;
    in_count_1: boolean;
    in_count_2: boolean;
}

interface Props {
    count1?: StockCount;
    count2?: StockCount;
    comparisons: Comparison[];
    availableCounts: StockCount[];
    filters: {
        stock_count_1?: number;
        stock_count_2?: number;
        only_discrepancies?: boolean;
    };
    summary: {
        total_items: number;
        items_with_discrepancy: number;
        only_in_count_1: number;
        only_in_count_2: number;
        in_both: number;
    };
}

export default function CountVsCountReportPage({
    count1,
    count2,
    comparisons,
    availableCounts,
    filters,
    summary,
}: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        if (!localFilters.stock_count_1 || !localFilters.stock_count_2) {
            alert('Selecione duas contagens para comparar');
            return;
        }
        router.get(
            '/reports/count-vs-count',
            localFilters as Record<string, string>,
            { preserveState: true }
        );
    };

    const handleExport = () => {
        if (!localFilters.stock_count_1 || !localFilters.stock_count_2) {
            alert('Selecione duas contagens para exportar');
            return;
        }
        const params = new URLSearchParams(localFilters as Record<string, string>);
        window.location.href = `/reports/export/count-vs-count?${params.toString()}`;
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
            <Head title="Relatório: Comparação entre Contagens" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Divergências entre Contagens"
                    description="Compare duas contagens físicas e identifique discrepâncias"
                />

                {/* Seleção de contagens */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitCompare className="h-5 w-5" />
                            Seleção de Contagens
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Contagem 1</Label>
                                    <Select
                                        value={localFilters.stock_count_1?.toString()}
                                        onValueChange={(value) =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                stock_count_1: value ? parseInt(value) : undefined,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a primeira contagem" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCounts.map((count) => (
                                                <SelectItem key={count.id} value={count.id.toString()}>
                                                    {count.count_number} - {count.area.name} (
                                                    {formatDate(count.completed_at)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Contagem 2</Label>
                                    <Select
                                        value={localFilters.stock_count_2?.toString()}
                                        onValueChange={(value) =>
                                            setLocalFilters((prev) => ({
                                                ...prev,
                                                stock_count_2: value ? parseInt(value) : undefined,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a segunda contagem" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCounts.map((count) => (
                                                <SelectItem key={count.id} value={count.id.toString()}>
                                                    {count.count_number} - {count.area.name} (
                                                    {formatDate(count.completed_at)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
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
                                    Mostrar apenas itens com divergências
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Comparar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setLocalFilters({});
                                        router.get('/reports/count-vs-count');
                                    }}
                                >
                                    Limpar
                                </Button>
                                {count1 && count2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleExport}
                                        className="ml-auto"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Exportar CSV
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {count1 && count2 && (
                    <>
                        {/* Informações das contagens */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Contagem 1</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Número</div>
                                        <div className="font-semibold">{count1.count_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Área</div>
                                        <div className="font-semibold">{count1.area.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Contador</div>
                                        <div className="font-semibold">{count1.counter.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Data</div>
                                        <div className="font-semibold">{formatDate(count1.completed_at)}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Contagem 2</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Número</div>
                                        <div className="font-semibold">{count2.count_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Área</div>
                                        <div className="font-semibold">{count2.area.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Contador</div>
                                        <div className="font-semibold">{count2.counter.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Data</div>
                                        <div className="font-semibold">{formatDate(count2.completed_at)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Resumo */}
                        <div className="grid gap-4 md:grid-cols-5">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total</CardDescription>
                                    <CardTitle className="text-2xl">{summary.total_items}</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Com Divergência</CardDescription>
                                    <CardTitle className="text-2xl text-red-600">
                                        {summary.items_with_discrepancy}
                                    </CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Em Ambas</CardDescription>
                                    <CardTitle className="text-2xl text-green-600">
                                        {summary.in_both}
                                    </CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Só na 1ª</CardDescription>
                                    <CardTitle className="text-2xl text-orange-600">
                                        {summary.only_in_count_1}
                                    </CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Só na 2ª</CardDescription>
                                    <CardTitle className="text-2xl text-blue-600">
                                        {summary.only_in_count_2}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Tabela de comparações */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Comparação Detalhada</CardTitle>
                                <CardDescription>
                                    {comparisons.length}{' '}
                                    {comparisons.length === 1 ? 'item encontrado' : 'itens encontrados'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Produto</TableHead>
                                                <TableHead className="text-right">Contagem 1</TableHead>
                                                <TableHead className="text-right">Contagem 2</TableHead>
                                                <TableHead className="text-right">Divergência</TableHead>
                                                <TableHead className="text-right">%</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {comparisons.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        className="text-center text-muted-foreground"
                                                    >
                                                        Nenhum item encontrado
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                comparisons.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-mono text-sm">
                                                            {item.product_code}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {item.product_name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {item.unit}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {item.in_count_1 ? (
                                                                formatNumber(item.count_1_qty)
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {item.in_count_2 ? (
                                                                formatNumber(item.count_2_qty)
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {item.has_discrepancy ? (
                                                                <Badge
                                                                    variant={
                                                                        item.difference > 0
                                                                            ? 'default'
                                                                            : 'destructive'
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
                                                            {item.has_discrepancy ? (
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
                                                        <TableCell>
                                                            {!item.in_count_1 ? (
                                                                <Badge variant="outline" className="bg-orange-50">
                                                                    Só na 2ª
                                                                </Badge>
                                                            ) : !item.in_count_2 ? (
                                                                <Badge variant="outline" className="bg-blue-50">
                                                                    Só na 1ª
                                                                </Badge>
                                                            ) : item.has_discrepancy ? (
                                                                <Badge variant="destructive">Divergente</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Igual</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
