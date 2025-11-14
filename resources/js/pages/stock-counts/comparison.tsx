import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle, Download, Minus } from 'lucide-react';
import { useState } from 'react';

interface ComparisonItem {
    id: number | null;
    product_code: string;
    product_name: string;
    product_id: number | null;
    quantity_counted: number;
    quantity_system: number;
    discrepancy: number;
    discrepancy_percentage: number;
    status: 'matched' | 'discrepancy' | 'missing_in_count' | 'missing_in_system';
    unit: string;
    location: string | null;
    notes: string | null;
    product_cost: number;
    discrepancy_value: number;
}

interface StockCount {
    id: number;
    count_number: number;
    status: string;
    adjustments_applied_at: string | null;
    adjustments_applied_by: number | null;
    stock_audit: {
        id: number;
        title: string;
        code: string;
    };
    area: {
        id: number;
        name: string;
    } | null;
    counter: {
        id: number;
        name: string;
    };
}

interface Comparison {
    total_counted: number;
    total_system: number;
    matched_items: number;
    discrepancy_items: number;
    missing_in_count: number;
    missing_in_system: number;
    total_discrepancy_value: number;
    items: ComparisonItem[];
}

interface Summary {
    total_items: number;
    matched_items: number;
    discrepancy_items: number;
    accuracy_percentage: number;
    total_counted: number;
    total_system: number;
    total_discrepancy_value: number;
}

interface Props {
    stockCount: StockCount;
    comparison: Comparison;
    summary: Summary;
    criticalDiscrepancies: ComparisonItem[];
}

const statusConfig = {
    matched: { label: 'Confere', variant: 'outline' as const, color: 'text-green-600' },
    discrepancy: { label: 'Divergência', variant: 'destructive' as const, color: 'text-red-600' },
    missing_in_count: {
        label: 'Não contado',
        variant: 'secondary' as const,
        color: 'text-orange-600',
    },
    missing_in_system: {
        label: 'Não existe no sistema',
        variant: 'default' as const,
        color: 'text-blue-600',
    },
};

export default function ComparisonPage({
    stockCount,
    comparison,
    summary,
    criticalDiscrepancies,
}: Props) {
    useToastFlash();
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredItems =
        statusFilter === 'all'
            ? comparison.items
            : comparison.items.filter((item) => item.status === statusFilter);

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const handleExport = () => {
        window.location.href = `/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}/comparison/export`;
    };

    const handleApplyAdjustments = () => {
        if (
            confirm(
                'Deseja aplicar os ajustes de estoque? Isso criará movimentações de estoque para corrigir as divergências. Esta ação não pode ser desfeita.',
            )
        ) {
            router.post(
                `/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}/apply-adjustments`,
            );
        }
    };

    const getDiscrepancyIcon = (discrepancy: number) => {
        if (discrepancy > 0) {
            return <ArrowUp className="h-4 w-4 text-green-600" />;
        } else if (discrepancy < 0) {
            return <ArrowDown className="h-4 w-4 text-red-600" />;
        }
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <AppLayout>
            <Head
                title={`Comparação - Contagem #${stockCount.count_number} - ${stockCount.stock_audit.title}`}
            />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <HeadingSmall
                            title={`Comparação - Contagem #${stockCount.count_number}`}
                            description={`${stockCount.stock_audit.title} - ${stockCount.stock_audit.code}`}
                        />
                        {stockCount.adjustments_applied_at && (
                            <Badge variant="outline" className="mt-2">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Ajustes aplicados em{' '}
                                {new Date(stockCount.adjustments_applied_at).toLocaleString(
                                    'pt-BR',
                                )}
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}`}
                            >
                                ← Voltar
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </Button>
                        {stockCount.status === 'completed' &&
                            !stockCount.adjustments_applied_at &&
                            summary.discrepancy_items > 0 && (
                                <Button onClick={handleApplyAdjustments}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Aplicar Ajustes
                                </Button>
                            )}
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Precisão
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(summary.accuracy_percentage)}%
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {summary.matched_items} de {summary.total_items} itens conferem
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total de Itens
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_items}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {summary.discrepancy_items} com divergência
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Quantidade Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Contada:</span>
                                    <span className="font-medium">
                                        {formatNumber(summary.total_counted)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Sistema:</span>
                                    <span className="font-medium">
                                        {formatNumber(summary.total_system)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Valor da Divergência
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    summary.total_discrepancy_value > 0
                                        ? 'text-green-600'
                                        : summary.total_discrepancy_value < 0
                                          ? 'text-red-600'
                                          : ''
                                }`}
                            >
                                {formatCurrency(summary.total_discrepancy_value)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Impacto financeiro estimado
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Critical Discrepancies Alert */}
                {criticalDiscrepancies.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                                <AlertCircle className="h-5 w-5" />
                                Divergências Críticas ({criticalDiscrepancies.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                Itens com divergência superior a 10% que requerem atenção especial:
                            </p>
                            <div className="mt-4 space-y-2">
                                {criticalDiscrepancies.slice(0, 5).map((item) => (
                                    <div
                                        key={item.product_code}
                                        className="flex items-center justify-between rounded-md bg-white p-3 dark:bg-gray-950"
                                    >
                                        <div>
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.product_code}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-orange-600">
                                                {item.discrepancy_percentage > 0 ? '+' : ''}
                                                {formatNumber(item.discrepancy_percentage)}%
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(item.discrepancy_value)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {criticalDiscrepancies.length > 5 && (
                                    <p className="text-sm text-muted-foreground">
                                        + {criticalDiscrepancies.length - 5} outros itens críticos
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Comparison Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Itens da Comparação ({filteredItems.length})</CardTitle>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os itens</SelectItem>
                                    <SelectItem value="matched">Confere</SelectItem>
                                    <SelectItem value="discrepancy">Com divergência</SelectItem>
                                    <SelectItem value="missing_in_count">Não contados</SelectItem>
                                    <SelectItem value="missing_in_system">
                                        Não existe no sistema
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="text-right">Qtd. Contada</TableHead>
                                        <TableHead className="text-right">Qtd. Sistema</TableHead>
                                        <TableHead className="text-right">Divergência</TableHead>
                                        <TableHead className="text-right">Div. %</TableHead>
                                        <TableHead className="text-right">Valor Div.</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Unidade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Nenhum item encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredItems.map((item, index) => {
                                            const config =
                                                statusConfig[item.status] || statusConfig.matched;
                                            return (
                                                <TableRow key={item.id || `item-${index}`}>
                                                    <TableCell className="font-mono">
                                                        {item.product_code}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.product_name}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(item.quantity_counted)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(item.quantity_system)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {getDiscrepancyIcon(item.discrepancy)}
                                                            <span className={config.color}>
                                                                {item.discrepancy > 0 ? '+' : ''}
                                                                {formatNumber(item.discrepancy)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={config.color}>
                                                            {item.discrepancy_percentage > 0
                                                                ? '+'
                                                                : ''}
                                                            {formatNumber(
                                                                item.discrepancy_percentage,
                                                            )}
                                                            %
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={config.color}>
                                                            {formatCurrency(item.discrepancy_value)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={config.variant}>
                                                            {config.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{item.unit}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Itens Conferidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {comparison.matched_items}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Sem divergências detectadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Produtos Não Contados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {comparison.missing_in_count}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Existem no sistema mas não foram contados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Produtos Não Cadastrados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {comparison.missing_in_system}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Contados mas não existem no sistema
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
