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
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Download, XCircle } from 'lucide-react';

interface StockCountImport {
    id: number;
    file_name: string;
    file_format: string;
    delimiter: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_lines: number;
    processed_lines: number;
    successful_lines: number;
    failed_lines: number;
    errors: Array<{
        line?: number;
        content?: string;
        barcode?: string;
        error: string;
        quantity?: number;
    }> | null;
    created_at: string;
    completed_at: string | null;
    user: {
        id: number;
        name: string;
    };
}

interface StockCount {
    id: number;
    count_number: number;
    stock_audit: {
        id: number;
        name: string;
    };
}

interface Props {
    stockCount: StockCount;
    imports: PaginatedData<StockCountImport>;
}

const statusConfig = {
    pending: {
        label: 'Pendente',
        variant: 'secondary' as const,
        icon: Clock,
    },
    processing: {
        label: 'Processando',
        variant: 'default' as const,
        icon: Clock,
    },
    completed: {
        label: 'Concluído',
        variant: 'outline' as const,
        icon: CheckCircle,
    },
    failed: {
        label: 'Falhou',
        variant: 'destructive' as const,
        icon: XCircle,
    },
};

const formatConfig = {
    barcode_only: 'Somente Código',
    barcode_quantity: 'Código + Quantidade',
};

export default function ImportHistoryPage({ stockCount, imports }: Props) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={`Histórico de Importações - ${stockCount.stock_audit.name}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Histórico de Importações"
                        description={`${stockCount.stock_audit.name} - Contagem #${stockCount.count_number}`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/stock-counts/${stockCount.id}`}>
                                ← Voltar para Contagem
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/stock-counts/${stockCount.id}/import`}>
                                Nova Importação
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {imports.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                Nenhuma importação realizada ainda.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {imports.data.map((importRecord) => {
                                    const config = statusConfig[importRecord.status];
                                    const Icon = config.icon;
                                    const successRate =
                                        importRecord.total_lines > 0
                                            ? (
                                                  (importRecord.successful_lines /
                                                      importRecord.total_lines) *
                                                  100
                                              ).toFixed(1)
                                            : '0';

                                    return (
                                        <Card key={importRecord.id}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                            <Icon className="h-4 w-4" />
                                                            {importRecord.file_name}
                                                        </CardTitle>
                                                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                            <span>
                                                                Por: {importRecord.user.name}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {formatDate(
                                                                    importRecord.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={config.variant}>
                                                            {config.label}
                                                        </Badge>
                                                        <a
                                                            href={`/stock-count-imports/${importRecord.id}/download`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Baixar
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Informações do Arquivo */}
                                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Formato
                                                        </p>
                                                        <p className="font-medium">
                                                            {
                                                                formatConfig[
                                                                    importRecord.file_format as keyof typeof formatConfig
                                                                ]
                                                            }
                                                        </p>
                                                        {importRecord.file_format ===
                                                            'barcode_quantity' && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Separador:{' '}
                                                                {importRecord.delimiter ===
                                                                '\t'
                                                                    ? 'Tab'
                                                                    : importRecord.delimiter}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Total de Linhas
                                                        </p>
                                                        <p className="font-medium">
                                                            {importRecord.total_lines}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Sucesso
                                                        </p>
                                                        <p className="font-medium text-green-600">
                                                            {importRecord.successful_lines}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Falhas
                                                        </p>
                                                        <p className="font-medium text-red-600">
                                                            {importRecord.failed_lines}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Barra de Progresso */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Taxa de Sucesso</span>
                                                        <span className="font-medium">
                                                            {successRate}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full bg-green-500 transition-all"
                                                            style={{
                                                                width: `${successRate}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Erros */}
                                                {importRecord.errors &&
                                                    importRecord.errors.length > 0 && (
                                                        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                                                            <div className="mb-2 flex items-center gap-2 font-semibold text-red-800 dark:text-red-200">
                                                                <AlertCircle className="h-4 w-4" />
                                                                Erros Encontrados (
                                                                {importRecord.errors.length})
                                                            </div>
                                                            <div className="max-h-60 space-y-2 overflow-y-auto text-sm">
                                                                {importRecord.errors
                                                                    .slice(0, 10)
                                                                    .map((error, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="rounded border border-red-300 bg-white p-2 dark:border-red-800 dark:bg-red-900/20"
                                                                        >
                                                                            {error.line && (
                                                                                <p className="font-mono text-xs text-red-600 dark:text-red-400">
                                                                                    Linha{' '}
                                                                                    {error.line}
                                                                                </p>
                                                                            )}
                                                                            {error.barcode && (
                                                                                <p className="font-mono text-xs text-red-600 dark:text-red-400">
                                                                                    Código:{' '}
                                                                                    {
                                                                                        error.barcode
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                            {error.content && (
                                                                                <p className="font-mono text-xs text-muted-foreground">
                                                                                    {error.content}
                                                                                </p>
                                                                            )}
                                                                            <p className="text-xs text-red-700 dark:text-red-300">
                                                                                {error.error}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                {importRecord.errors.length >
                                                                    10 && (
                                                                    <p className="text-xs italic text-muted-foreground">
                                                                        ... e mais{' '}
                                                                        {importRecord.errors
                                                                            .length - 10}{' '}
                                                                        erro(s)
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* Paginação */}
                        {imports.links.length > 3 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                {imports.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
