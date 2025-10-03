import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Edit, FileText, History, Upload } from 'lucide-react';

interface StockCountItem {
    id: number;
    product_code: string;
    product_name: string;
    quantity_counted: number;
    unit: string | null;
    location: string | null;
    notes: string | null;
}

interface StockCount {
    id: number;
    count_number: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    notes: string | null;
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
    items: StockCountItem[];
}

interface Props {
    stockCount: StockCount;
}

const statusConfig = {
    pending: { label: 'Pendente', variant: 'secondary' as const },
    in_progress: { label: 'Em Andamento', variant: 'default' as const },
    completed: { label: 'Concluído', variant: 'outline' as const },
};

export default function ShowStockCountPage({ stockCount }: Props) {
    useToastFlash();

    const handleStart = () => {
        if (confirm('Deseja iniciar esta contagem?')) {
            router.post(`/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}/start`);
        }
    };

    const handleComplete = () => {
        if (confirm('Deseja finalizar esta contagem? Esta ação não pode ser desfeita.')) {
            router.post(
                `/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}/complete`,
            );
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const config = statusConfig[stockCount.status as keyof typeof statusConfig] || {
        label: stockCount.status,
        variant: 'secondary' as const,
    };

    return (
        <AppLayout>
            <Head
                title={`Contagem #${stockCount.count_number} - ${stockCount.stock_audit.title}`}
            />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title={`Contagem #${stockCount.count_number}`}
                        description={`${stockCount.stock_audit.title} - ${stockCount.stock_audit.code}`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/stock-audits/${stockCount.stock_audit.id}`}>
                                ← Voltar
                            </Link>
                        </Button>
                        {stockCount.status !== 'completed' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/stock-counts/${stockCount.id}/import/history`}>
                                        <History className="mr-2 h-4 w-4" />
                                        Histórico
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={`/stock-counts/${stockCount.id}/import`}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Importar
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}/edit`}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Informações da Contagem */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações da Contagem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={config.variant} className="mt-1">
                                    {config.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Contador</p>
                                <p className="mt-1 font-medium">{stockCount.counter.name}</p>
                            </div>
                            {stockCount.area && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Área</p>
                                    <p className="mt-1 font-medium">{stockCount.area.name}</p>
                                </div>
                            )}
                            {stockCount.started_at && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Iniciada em</p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(stockCount.started_at)}
                                    </p>
                                </div>
                            )}
                            {stockCount.completed_at && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Concluída em</p>
                                    <p className="mt-1 font-medium">
                                        {formatDate(stockCount.completed_at)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {stockCount.notes && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">Observações</p>
                                <p className="mt-1">{stockCount.notes}</p>
                            </div>
                        )}

                        {/* Ações */}
                        {stockCount.status !== 'completed' && (
                            <div className="mt-6 flex gap-2">
                                {stockCount.status === 'pending' && (
                                    <Button onClick={handleStart}>Iniciar Contagem</Button>
                                )}
                                {stockCount.status === 'in_progress' && (
                                    <Button onClick={handleComplete}>Finalizar Contagem</Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Itens Contados */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Itens Contados ({stockCount.items.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stockCount.items.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">
                                    Nenhum item contado ainda.
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Use o botão "Importar" para adicionar itens através de um arquivo.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Produto</TableHead>
                                            <TableHead className="text-right">Quantidade</TableHead>
                                            <TableHead>Unidade</TableHead>
                                            <TableHead>Localização</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockCount.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono">
                                                    {item.product_code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.product_name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.quantity_counted}
                                                </TableCell>
                                                <TableCell>{item.unit || '-'}</TableCell>
                                                <TableCell>
                                                    {item.location || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
