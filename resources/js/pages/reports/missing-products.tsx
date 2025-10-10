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
import { Download, Filter, PackageX } from 'lucide-react';
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

interface MissingProduct {
    id: number;
    code: string;
    name: string;
    category: string | null;
    color: string | null;
    size: string | null;
    unit: string;
}

interface Props {
    stockCount?: StockCount;
    missingProducts: MissingProduct[];
    availableCounts: StockCount[];
    summary: {
        total_products_counted: number;
        total_products_missing: number;
    };
}

export default function MissingProductsReportPage({
    stockCount,
    missingProducts,
    availableCounts,
    summary,
}: Props) {
    const [selectedCountId, setSelectedCountId] = useState<string | undefined>(
        stockCount?.id.toString()
    );

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedCountId) {
            alert('Selecione uma contagem');
            return;
        }
        router.get('/reports/missing-products', {
            stock_count_id: selectedCountId,
        });
    };

    const handleExport = () => {
        if (!selectedCountId) {
            alert('Selecione uma contagem para exportar');
            return;
        }
        window.location.href = `/reports/export/missing-products?stock_count_id=${selectedCountId}`;
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
            <Head title="Relatório: Produtos Não Contados" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Produtos Não Contados"
                    description="Identifique produtos cadastrados que não foram incluídos em uma contagem"
                />

                {/* Seleção de contagem */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Seleção de Contagem
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Contagem</Label>
                                    <Select
                                        value={selectedCountId}
                                        onValueChange={setSelectedCountId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma contagem" />
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

                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filtrar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCountId('');
                                        router.get('/reports/missing-products');
                                    }}
                                >
                                    Limpar
                                </Button>
                                {stockCount && (
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

                {stockCount && (
                    <>
                        {/* Informações da contagem */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informações da Contagem</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Número</div>
                                        <div className="font-semibold">{stockCount.count_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Área</div>
                                        <div className="font-semibold">{stockCount.area.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Data Conclusão</div>
                                        <div className="font-semibold">
                                            {formatDate(stockCount.completed_at)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumo */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Produtos Contados</CardDescription>
                                    <CardTitle className="text-3xl text-green-600">
                                        {summary.total_products_counted}
                                    </CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Produtos Não Contados</CardDescription>
                                    <CardTitle className="text-3xl text-red-600">
                                        {summary.total_products_missing}
                                    </CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Taxa de Cobertura</CardDescription>
                                    <CardTitle className="text-3xl">
                                        {summary.total_products_counted + summary.total_products_missing > 0
                                            ? (
                                                  (summary.total_products_counted /
                                                      (summary.total_products_counted +
                                                          summary.total_products_missing)) *
                                                  100
                                              ).toFixed(1)
                                            : 0}
                                        %
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Tabela de produtos não contados */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <PackageX className="h-5 w-5 text-red-600" />
                                    <div>
                                        <CardTitle>Produtos Não Contados</CardTitle>
                                        <CardDescription>
                                            {missingProducts.length}{' '}
                                            {missingProducts.length === 1
                                                ? 'produto não contado'
                                                : 'produtos não contados'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Produto</TableHead>
                                                <TableHead>Categoria</TableHead>
                                                <TableHead>Cor</TableHead>
                                                <TableHead>Tamanho</TableHead>
                                                <TableHead>Unidade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {missingProducts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="text-center text-muted-foreground"
                                                    >
                                                        <div className="py-8">
                                                            <PackageX className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                                                            <p className="font-semibold">
                                                                Todos os produtos foram contados!
                                                            </p>
                                                            <p className="text-sm">
                                                                Não há produtos faltantes nesta contagem.
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                missingProducts.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {product.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {product.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {product.category ? (
                                                                <Badge variant="outline">
                                                                    {product.category}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {product.color || (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {product.size || (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{product.unit}</Badge>
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

                {!stockCount && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <PackageX className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Selecione uma contagem
                            </h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                Escolha uma contagem acima para visualizar os produtos que não foram
                                incluídos nela.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
