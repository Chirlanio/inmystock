import { AreaViewModal } from '@/components/area-view-modal';
import { Column, DataTable } from '@/components/data-table';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { Area, PaginatedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Eye, MapPin, PlusCircle, Search, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    areas: PaginatedData<Area>;
    filters: {
        search?: string;
        active?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function AreasIndexPage({ areas, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    const [viewingArea, setViewingArea] = useState<Area | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/areas',
                {
                    search: search || undefined,
                    active: activeFilter === 'all' ? undefined : activeFilter,
                    sort: filters.sort,
                    direction: filters.direction,
                },
                { preserveState: true, preserveScroll: true }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, activeFilter]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        location: '',
        location_count: 1,
        code: '',
        description: '',
        active: true,
    });

    const {
        data: editData,
        setData: setEditData,
        put: editPut,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        location: '',
        location_count: 1,
        code: '',
        description: '',
        active: true,
    });

    const handleSort = (column: string) => {
        const newDirection =
            filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/areas',
            {
                search: search || undefined,
                active: activeFilter === 'all' ? undefined : activeFilter,
                sort: column,
                direction: newDirection,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (areaId: number) => {
        if (confirm('Tem certeza que deseja excluir esta área?')) {
            router.delete(`/areas/${areaId}`);
        }
    };

    const handleCreateArea = (e: FormEvent) => {
        e.preventDefault();
        post('/areas', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleViewArea = (area: Area) => {
        setViewingArea(area);
        setIsViewModalOpen(true);
    };

    const handleEditArea = (area: Area) => {
        setEditingArea(area);
        setEditData({
            name: area.name,
            location: area.location || '',
            location_count: area.location_count,
            code: area.code,
            description: area.description || '',
            active: area.active,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateArea = (e: FormEvent) => {
        e.preventDefault();
        if (!editingArea) return;

        editPut(`/areas/${editingArea.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingArea(null);
            },
        });
    };

    const columns: Column<Area>[] = [
        {
            key: 'name',
            label: 'Área',
            sortable: true,
            render: (area) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">{area.name}</p>
                        {area.location && (
                            <p className="text-sm text-muted-foreground">{area.location}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'code',
            label: 'Código',
            sortable: true,
        },
        {
            key: 'location_count',
            label: 'Qtd. Locais',
            render: (area) => (
                <Badge variant="outline">
                    {area.location_count} {area.location_count === 1 ? 'local' : 'locais'}
                </Badge>
            ),
        },
        {
            key: 'active',
            label: 'Status',
            render: (area) =>
                area.active ? (
                    <Badge variant="secondary">Ativa</Badge>
                ) : (
                    <Badge variant="outline">Inativa</Badge>
                ),
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (area) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleViewArea(area)}
                        title="Visualizar"
                    >
                        <Eye />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditArea(area)}
                        title="Editar"
                    >
                        <Edit />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(area.id)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Gerenciar Áreas" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Gerenciar Áreas"
                        description="Gerencie as áreas de auditoria de estoque"
                    />
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        leftIcon={<PlusCircle />}
                    >
                        Nova Área
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, local ou código..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="1">Ativas</SelectItem>
                                    <SelectItem value="0">Inativas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DataTable
                            columns={columns}
                            data={areas.data}
                            currentSort={
                                filters.sort
                                    ? { column: filters.sort, direction: filters.direction || 'asc' }
                                    : null
                            }
                            onSort={handleSort}
                            emptyMessage="Nenhuma área encontrada."
                        />

                        {areas.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {areas.links.map((link, index) => (
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Nova Área</DialogTitle>
                            <DialogDescription>
                                Adicione uma nova área de auditoria de estoque
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateArea} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Local</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Ex: Armazém 1, Setor A"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location_count">Quantidade de Locais *</Label>
                                    <Input
                                        id="location_count"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={data.location_count}
                                        onChange={(e) =>
                                            setData('location_count', parseInt(e.target.value) || 1)
                                        }
                                        required
                                    />
                                    {errors.location_count && (
                                        <p className="text-sm text-destructive">
                                            {errors.location_count}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Gerado automaticamente se vazio"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Deixe vazio para gerar automaticamente
                                    </p>
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

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="active"
                                    checked={data.active}
                                    onCheckedChange={(checked) => setData('active', checked as boolean)}
                                />
                                <Label htmlFor="active" className="cursor-pointer">
                                    Área ativa
                                </Label>
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
                                    Criar Área
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Área</DialogTitle>
                            <DialogDescription>
                                Atualize as informações da área
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateArea} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nome *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        required
                                    />
                                    {editErrors.name && (
                                        <p className="text-sm text-destructive">{editErrors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-location">Local</Label>
                                    <Input
                                        id="edit-location"
                                        value={editData.location}
                                        onChange={(e) => setEditData('location', e.target.value)}
                                        placeholder="Ex: Armazém 1, Setor A"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-location_count">Quantidade de Locais *</Label>
                                    <Input
                                        id="edit-location_count"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={editData.location_count}
                                        onChange={(e) =>
                                            setEditData('location_count', parseInt(e.target.value) || 1)
                                        }
                                        required
                                    />
                                    {editErrors.location_count && (
                                        <p className="text-sm text-destructive">
                                            {editErrors.location_count}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-code">Código</Label>
                                    <Input
                                        id="edit-code"
                                        value={editData.code}
                                        onChange={(e) => setEditData('code', e.target.value)}
                                        placeholder="Código da área"
                                    />
                                    {editErrors.code && (
                                        <p className="text-sm text-destructive">{editErrors.code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-active"
                                    checked={editData.active}
                                    onCheckedChange={(checked) =>
                                        setEditData('active', checked as boolean)
                                    }
                                />
                                <Label htmlFor="edit-active" className="cursor-pointer">
                                    Área ativa
                                </Label>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" loading={editProcessing}>
                                    Salvar Alterações
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <AreaViewModal
                    area={viewingArea}
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                />
            </div>
        </AppLayout>
    );
}
