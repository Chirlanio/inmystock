import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Download,
    File,
    Info,
    RefreshCw,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface LogFile {
    name: string;
    path: string;
    size: string;
    size_bytes: number;
    modified: number;
    modified_formatted: string;
}

interface LogEntry {
    timestamp: string;
    environment: string;
    level: string;
    message: string;
    context: string;
}

interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

interface Props {
    logFiles: LogFile[];
    selectedFile: string | null;
    logEntries: LogEntry[];
    pagination: Pagination | null;
    filters: {
        level?: string;
        search?: string;
    };
}

const levelColors: Record<
    string,
    { variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: any }
> = {
    DEBUG: { variant: 'secondary', icon: Info },
    INFO: { variant: 'default', icon: CheckCircle },
    NOTICE: { variant: 'outline', icon: Info },
    WARNING: { variant: 'outline', icon: AlertTriangle },
    ERROR: { variant: 'destructive', icon: XCircle },
    CRITICAL: { variant: 'destructive', icon: AlertCircle },
    ALERT: { variant: 'destructive', icon: AlertCircle },
    EMERGENCY: { variant: 'destructive', icon: AlertCircle },
};

export default function SystemLogsPage({
    logFiles,
    selectedFile,
    logEntries,
    pagination,
    filters,
}: Props) {
    const [levelFilter, setLevelFilter] = useState(filters.level || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

    const handleFileSelect = (fileName: string) => {
        router.get('/admin/logs', { file: fileName }, { preserveState: true });
    };

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        const params: any = {};

        if (selectedFile) params.file = selectedFile;
        if (levelFilter !== 'all') params.level = levelFilter;
        if (searchQuery) params.search = searchQuery;

        router.get('/admin/logs', params, { preserveState: true });
    };

    const handleDownload = (fileName: string) => {
        window.location.href = `/admin/logs/download?file=${fileName}`;
    };

    const handleDelete = (fileName: string) => {
        if (confirm(`Tem certeza que deseja excluir o arquivo ${fileName}?`)) {
            router.delete(`/admin/logs?file=${fileName}`);
        }
    };

    const handleClear = (fileName: string) => {
        if (confirm(`Tem certeza que deseja limpar o conteúdo do arquivo ${fileName}?`)) {
            router.post('/admin/logs/clear', { file: fileName });
        }
    };

    const getLevelIcon = (level: string) => {
        const config = levelColors[level] || levelColors.INFO;
        const Icon = config.icon;
        return <Icon className="h-4 w-4" />;
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Logs do Sistema" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Logs do Sistema"
                    description="Visualize e gerencie os logs de erros e eventos do sistema"
                />

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Lista de Arquivos de Log */}
                    <Card className="lg:col-span-1">
                        <CardContent className="p-4">
                            <h3 className="mb-4 font-semibold">Arquivos de Log</h3>
                            <div className="space-y-2">
                                {logFiles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum arquivo de log encontrado.
                                    </p>
                                ) : (
                                    logFiles.map((file) => (
                                        <button
                                            key={file.name}
                                            onClick={() => handleFileSelect(file.name)}
                                            className={`flex w-full items-start gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-muted ${
                                                selectedFile === file.name
                                                    ? 'bg-muted font-medium'
                                                    : ''
                                            }`}
                                        >
                                            <File className="mt-0.5 h-4 w-4 shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {file.size} • {file.modified_formatted}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conteúdo dos Logs */}
                    <div className="space-y-4 lg:col-span-3">
                        {selectedFile ? (
                            <>
                                {/* Ações e Filtros */}
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold">{selectedFile}</h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(selectedFile)}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Baixar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleClear(selectedFile)}
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Limpar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(selectedFile)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleFilter} className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Nível</Label>
                                                    <Select
                                                        value={levelFilter}
                                                        onValueChange={setLevelFilter}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">
                                                                Todos os níveis
                                                            </SelectItem>
                                                            <SelectItem value="debug">DEBUG</SelectItem>
                                                            <SelectItem value="info">INFO</SelectItem>
                                                            <SelectItem value="notice">
                                                                NOTICE
                                                            </SelectItem>
                                                            <SelectItem value="warning">
                                                                WARNING
                                                            </SelectItem>
                                                            <SelectItem value="error">ERROR</SelectItem>
                                                            <SelectItem value="critical">
                                                                CRITICAL
                                                            </SelectItem>
                                                            <SelectItem value="alert">ALERT</SelectItem>
                                                            <SelectItem value="emergency">
                                                                EMERGENCY
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Buscar</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Buscar nos logs..."
                                                            value={searchQuery}
                                                            onChange={(e) =>
                                                                setSearchQuery(e.target.value)
                                                            }
                                                        />
                                                        <Button type="submit" size="icon">
                                                            <Search className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Tabela de Logs */}
                                <Card>
                                    <CardContent className="p-0">
                                        {logEntries.length === 0 ? (
                                            <div className="py-8 text-center text-muted-foreground">
                                                Nenhum registro de log encontrado com os filtros
                                                aplicados.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[180px]">
                                                                    Data/Hora
                                                                </TableHead>
                                                                <TableHead className="w-[120px]">
                                                                    Nível
                                                                </TableHead>
                                                                <TableHead>Mensagem</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {logEntries.map((entry, index) => (
                                                                <>
                                                                    <TableRow
                                                                        key={index}
                                                                        className="cursor-pointer hover:bg-muted/50"
                                                                        onClick={() =>
                                                                            setExpandedEntry(
                                                                                expandedEntry ===
                                                                                    index
                                                                                    ? null
                                                                                    : index,
                                                                            )
                                                                        }
                                                                    >
                                                                        <TableCell className="font-mono text-xs">
                                                                            {formatTimestamp(
                                                                                entry.timestamp,
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                variant={
                                                                                    levelColors[
                                                                                        entry.level
                                                                                    ]?.variant ||
                                                                                    'default'
                                                                                }
                                                                                className="flex w-fit items-center gap-1"
                                                                            >
                                                                                {getLevelIcon(
                                                                                    entry.level,
                                                                                )}
                                                                                {entry.level}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="max-w-2xl truncate">
                                                                            {entry.message}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    {expandedEntry === index &&
                                                                        entry.context && (
                                                                            <TableRow>
                                                                                <TableCell
                                                                                    colSpan={3}
                                                                                    className="bg-muted/30"
                                                                                >
                                                                                    <div className="space-y-2">
                                                                                        <p className="text-sm font-semibold">
                                                                                            Detalhes:
                                                                                        </p>
                                                                                        <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
                                                                                            {
                                                                                                entry.context
                                                                                            }
                                                                                        </pre>
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                </>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                {/* Paginação */}
                                                {pagination && pagination.last_page > 1 && (
                                                    <div className="flex items-center justify-between border-t px-4 py-3">
                                                        <p className="text-sm text-muted-foreground">
                                                            Mostrando {logEntries.length} de{' '}
                                                            {pagination.total} registros
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {Array.from(
                                                                { length: pagination.last_page },
                                                                (_, i) => i + 1,
                                                            ).map((page) => (
                                                                <Button
                                                                    key={page}
                                                                    variant={
                                                                        pagination.current_page ===
                                                                        page
                                                                            ? 'default'
                                                                            : 'outline'
                                                                    }
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const params: any = {
                                                                            file: selectedFile,
                                                                            page,
                                                                        };
                                                                        if (levelFilter !== 'all')
                                                                            params.level =
                                                                                levelFilter;
                                                                        if (searchQuery)
                                                                            params.search =
                                                                                searchQuery;
                                                                        router.get(
                                                                            '/admin/logs',
                                                                            params,
                                                                            {
                                                                                preserveState: true,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    {page}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <File className="mx-auto mb-4 h-12 w-12 opacity-20" />
                                    <p>Selecione um arquivo de log para visualizar</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
