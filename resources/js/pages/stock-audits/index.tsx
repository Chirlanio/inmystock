import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToastFlash } from '@/hooks/use-toast-flash';
import { PaginatedData } from '@/types';
import { ClipboardCheck, Eye, Edit, Plus, Search, Trash2, ExternalLink } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface StockAudit {
    id: number;
    title: string;
    code: string;
    description?: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    start_date: string;
    end_date?: string;
    required_counts: number;
    responsible: {
        id: number;
        name: string;
    };
    stock_counts_count?: number;
    created_at: string;
}

interface Props {
    audits: PaginatedData<StockAudit>;
    users: User[];
    filters: {
        search?: string;
        status?: string;
    };
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

export default function StockAuditsIndexPage({ audits, users, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<StockAudit | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/stock-audits',
                {
                    search: search || undefined,
                    status: status === ' ' ? undefined : status,
                },
                { preserveState: true, preserveScroll: true }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, status]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        responsible_id: '',
        start_date: '',
        end_date: '',
        required_counts: 1,
        status: 'planned',
    });

    const handleCreateAudit = (e: FormEvent) => {
        e.preventDefault();
        post('/stock-audits', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleViewAudit = (audit: StockAudit) => {
        setSelectedAudit(audit);
        setIsViewModalOpen(true);
    };

    const handleEditAudit = (audit: StockAudit) => {
        setSelectedAudit(audit);
        setData({
            title: audit.title,
            description: audit.description || '',
            responsible_id: audit.responsible.id.toString(),
            start_date: audit.start_date,
            end_date: audit.end_date || '',
            required_counts: audit.required_counts || 1,
            status: audit.status,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateAudit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAudit) return;

        router.put(`/stock-audits/${selectedAudit.id}`, data, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedAudit(null);
                reset();
            },
        });
    };

    const handleDeleteAudit = (audit: StockAudit) => {
        if (confirm('Tem certeza que deseja excluir esta auditoria?')) {
            router.delete(`/stock-audits/${audit.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Auditorias de Estoque" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Auditorias de Estoque"
                        description="Gerencie as auditorias de contagem de estoque"
                    />
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        leftIcon={<Plus />}
                    >
                        Nova Auditoria
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {/* Filters */}
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título ou código..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">Todos</SelectItem>
                                    <SelectItem value="planned">Planejada</SelectItem>
                                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                                    <SelectItem value="completed">Concluída</SelectItem>
                                    <SelectItem value="cancelled">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Responsável</TableHead>
                                        <TableHead>Data Início</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Contagens</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {audits.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                Nenhuma auditoria encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        audits.data.map((audit) => (
                                            <TableRow key={audit.id}>
                                                <TableCell className="font-mono">
                                                    {audit.code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {audit.title}
                                                </TableCell>
                                                <TableCell>{audit.responsible.name}</TableCell>
                                                <TableCell>
                                                    {new Date(audit.start_date).toLocaleDateString(
                                                        'pt-BR'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[audit.status]}>
                                                        {statusLabels[audit.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{audit.stock_counts_count || 0}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleViewAudit(audit)}
                                                            title="Visualizar"
                                                        >
                                                            <Eye />
                                                        </Button>
                                                        {audit.status !== 'completed' && audit.status !== 'cancelled' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                onClick={() => handleEditAudit(audit)}
                                                                title="Editar"
                                                            >
                                                                <Edit />
                                                            </Button>
                                                        )}
                                                        {audit.status === 'planned' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                onClick={() => handleDeleteAudit(audit)}
                                                                title="Excluir"
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {audits.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {audits.links.map((link, index) => (
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
                            <DialogTitle>Criar Nova Auditoria</DialogTitle>
                            <DialogDescription>
                                Adicione uma nova auditoria de contagem de estoque
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateAudit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="responsible_id">Responsável *</Label>
                                    <Select
                                        value={data.responsible_id}
                                        onValueChange={(value) => setData('responsible_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um responsável" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.responsible_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.responsible_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Data de Início *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Data de Término</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">{errors.end_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="required_counts">
                                        Contagens Necessárias *
                                    </Label>
                                    <Input
                                        id="required_counts"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.required_counts}
                                        onChange={(e) =>
                                            setData('required_counts', parseInt(e.target.value) || 1)
                                        }
                                        required
                                    />
                                    {errors.required_counts && (
                                        <p className="text-sm text-destructive">
                                            {errors.required_counts}
                                        </p>
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

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" loading={processing}>
                                    Criar Auditoria
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedAudit?.title}</DialogTitle>
                            <DialogDescription>
                                Código: {selectedAudit?.code}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedAudit && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Status</Label>
                                        <div className="mt-1">
                                            <Badge className={statusColors[selectedAudit.status]}>
                                                {statusLabels[selectedAudit.status]}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Responsável</Label>
                                        <p className="mt-1 font-medium">{selectedAudit.responsible.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Data de Início</Label>
                                        <p className="mt-1 font-medium">
                                            {new Date(selectedAudit.start_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    {selectedAudit.end_date && (
                                        <div>
                                            <Label className="text-muted-foreground">Data de Término</Label>
                                            <p className="mt-1 font-medium">
                                                {new Date(selectedAudit.end_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-muted-foreground">Contagens Necessárias</Label>
                                        <p className="mt-1 font-medium">{selectedAudit.required_counts}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Contagens Realizadas</Label>
                                        <p className="mt-1 font-medium">{selectedAudit.stock_counts_count || 0}</p>
                                    </div>
                                </div>

                                {selectedAudit.description && (
                                    <div>
                                        <Label className="text-muted-foreground">Descrição</Label>
                                        <p className="mt-1">{selectedAudit.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsViewModalOpen(false)}
                            >
                                Fechar
                            </Button>
                            {selectedAudit && (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        router.visit(`/stock-audits/${selectedAudit.id}`);
                                    }}
                                    leftIcon={<ExternalLink />}
                                >
                                    Ver Detalhes Completos
                                </Button>
                            )}
                            {selectedAudit && selectedAudit.status !== 'completed' && selectedAudit.status !== 'cancelled' && (
                                <Button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleEditAudit(selectedAudit);
                                    }}
                                    leftIcon={<Edit />}
                                >
                                    Editar
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Auditoria</DialogTitle>
                            <DialogDescription>
                                Atualize as informações da auditoria
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateAudit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-title">Título *</Label>
                                    <Input
                                        id="edit-title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-responsible_id">Responsável *</Label>
                                    <Select
                                        value={data.responsible_id}
                                        onValueChange={(value) => setData('responsible_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um responsável" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.responsible_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.responsible_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as StockAudit['status'])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Planejada</SelectItem>
                                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                                            <SelectItem value="completed">Concluída</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">{errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-start_date">Data de Início *</Label>
                                    <Input
                                        id="edit-start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-end_date">Data de Término</Label>
                                    <Input
                                        id="edit-end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">{errors.end_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-required_counts">
                                        Contagens Necessárias *
                                    </Label>
                                    <Input
                                        id="edit-required_counts"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.required_counts}
                                        onChange={(e) =>
                                            setData('required_counts', parseInt(e.target.value) || 1)
                                        }
                                        required
                                    />
                                    {errors.required_counts && (
                                        <p className="text-sm text-destructive">
                                            {errors.required_counts}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Textarea
                                    id="edit-description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedAudit(null);
                                        reset();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" loading={processing}>
                                    Atualizar Auditoria
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
