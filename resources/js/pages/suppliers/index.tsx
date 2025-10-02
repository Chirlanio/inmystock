import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData, Supplier } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    suppliers: PaginatedData<Supplier>;
    filters: {
        search?: string;
        active?: string;
    };
}

export default function SuppliersIndexPage({ suppliers, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/suppliers',
                {
                    search: search || undefined,
                    active: activeFilter === 'all' ? undefined : activeFilter,
                },
                { preserveState: true, preserveScroll: true }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, activeFilter]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        contact_name: '',
        notes: '',
        active: true,
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        contact_name: '',
        notes: '',
        active: true,
    });

    const handleCreateSupplier = (e: FormEvent) => {
        e.preventDefault();
        post('/suppliers', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleViewSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsViewModalOpen(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setEditData({
            name: supplier.name,
            code: supplier.code,
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            city: supplier.city || '',
            state: supplier.state || '',
            zip_code: supplier.zip_code || '',
            contact_name: supplier.contact_name || '',
            notes: supplier.notes || '',
            active: supplier.active,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSupplier = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;

        put(`/suppliers/${selectedSupplier.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedSupplier(null);
                resetEdit();
            },
        });
    };

    const handleDeleteSupplier = (supplier: Supplier) => {
        if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
            router.delete(`/suppliers/${supplier.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Fornecedores" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Fornecedores"
                        description="Gerencie os fornecedores de produtos"
                    />
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        leftIcon={<Plus />}
                    >
                        Novo Fornecedor
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {/* Filters */}
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, código, email ou telefone..."
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
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="1">Ativos</SelectItem>
                                    <SelectItem value="0">Inativos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fornecedor</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Contato</TableHead>
                                        <TableHead>Localização</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Nenhum fornecedor encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        suppliers.data.map((supplier) => (
                                            <TableRow key={supplier.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                            <Building2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{supplier.name}</p>
                                                            {supplier.contact_name && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {supplier.contact_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono">
                                                    {supplier.code}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {supplier.email && (
                                                            <p className="text-sm">{supplier.email}</p>
                                                        )}
                                                        {supplier.phone && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {supplier.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {supplier.city && supplier.state ? (
                                                        <span className="text-sm">
                                                            {supplier.city}, {supplier.state}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {supplier.active ? (
                                                        <Badge variant="secondary">Ativo</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Inativo</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleViewSupplier(supplier)}
                                                            title="Visualizar"
                                                        >
                                                            <Eye />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleEditSupplier(supplier)}
                                                            title="Editar"
                                                        >
                                                            <Edit />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleDeleteSupplier(supplier)}
                                                            title="Excluir"
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {suppliers.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {suppliers.links.map((link, index) => (
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
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Novo Fornecedor</DialogTitle>
                            <DialogDescription>
                                Adicione um novo fornecedor ao sistema
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSupplier} className="space-y-6">
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
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Auto-gerado se vazio"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_name">Nome do Contato</Label>
                                    <Input
                                        id="contact_name"
                                        value={data.contact_name}
                                        onChange={(e) => setData('contact_name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zip_code">CEP</Label>
                                    <Input
                                        id="zip_code"
                                        value={data.zip_code}
                                        onChange={(e) => setData('zip_code', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Endereço</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">Estado</Label>
                                    <Input
                                        id="state"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        maxLength={2}
                                        placeholder="UF"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
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
                                    Criar Fornecedor
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
                            <DialogDescription>
                                Código: {selectedSupplier?.code}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSupplier && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Status</Label>
                                        <div className="mt-1">
                                            {selectedSupplier.active ? (
                                                <Badge variant="secondary">Ativo</Badge>
                                            ) : (
                                                <Badge variant="outline">Inativo</Badge>
                                            )}
                                        </div>
                                    </div>
                                    {selectedSupplier.contact_name && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Nome do Contato
                                            </Label>
                                            <p className="mt-1 font-medium">
                                                {selectedSupplier.contact_name}
                                            </p>
                                        </div>
                                    )}
                                    {selectedSupplier.email && (
                                        <div>
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="mt-1 font-medium">
                                                {selectedSupplier.email}
                                            </p>
                                        </div>
                                    )}
                                    {selectedSupplier.phone && (
                                        <div>
                                            <Label className="text-muted-foreground">Telefone</Label>
                                            <p className="mt-1 font-medium">
                                                {selectedSupplier.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {(selectedSupplier.address ||
                                    selectedSupplier.city ||
                                    selectedSupplier.state ||
                                    selectedSupplier.zip_code) && (
                                    <div>
                                        <Label className="text-muted-foreground">Endereço</Label>
                                        <div className="mt-1 space-y-1">
                                            {selectedSupplier.address && (
                                                <p>{selectedSupplier.address}</p>
                                            )}
                                            {(selectedSupplier.city || selectedSupplier.state) && (
                                                <p>
                                                    {selectedSupplier.city}
                                                    {selectedSupplier.city && selectedSupplier.state && ', '}
                                                    {selectedSupplier.state}
                                                </p>
                                            )}
                                            {selectedSupplier.zip_code && (
                                                <p>CEP: {selectedSupplier.zip_code}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedSupplier.notes && (
                                    <div>
                                        <Label className="text-muted-foreground">Observações</Label>
                                        <p className="mt-1">{selectedSupplier.notes}</p>
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
                            {selectedSupplier && (
                                <Button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleEditSupplier(selectedSupplier);
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
                            <DialogTitle>Editar Fornecedor</DialogTitle>
                            <DialogDescription>
                                Atualize as informações do fornecedor
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateSupplier} className="space-y-6">
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
                                    <Label htmlFor="edit-code">Código</Label>
                                    <Input
                                        id="edit-code"
                                        value={editData.code}
                                        onChange={(e) => setEditData('code', e.target.value)}
                                    />
                                    {editErrors.code && (
                                        <p className="text-sm text-destructive">{editErrors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-contact_name">Nome do Contato</Label>
                                    <Input
                                        id="edit-contact_name"
                                        value={editData.contact_name}
                                        onChange={(e) => setEditData('contact_name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                    />
                                    {editErrors.email && (
                                        <p className="text-sm text-destructive">{editErrors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Telefone</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editData.phone}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-zip_code">CEP</Label>
                                    <Input
                                        id="edit-zip_code"
                                        value={editData.zip_code}
                                        onChange={(e) => setEditData('zip_code', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="edit-address">Endereço</Label>
                                    <Input
                                        id="edit-address"
                                        value={editData.address}
                                        onChange={(e) => setEditData('address', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-city">Cidade</Label>
                                    <Input
                                        id="edit-city"
                                        value={editData.city}
                                        onChange={(e) => setEditData('city', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-state">Estado</Label>
                                    <Input
                                        id="edit-state"
                                        value={editData.state}
                                        onChange={(e) => setEditData('state', e.target.value)}
                                        maxLength={2}
                                        placeholder="UF"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-active">Status</Label>
                                    <Select
                                        value={editData.active ? '1' : '0'}
                                        onValueChange={(value) => setEditData('active', value === '1')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Ativo</SelectItem>
                                            <SelectItem value="0">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-notes">Observações</Label>
                                <Textarea
                                    id="edit-notes"
                                    value={editData.notes}
                                    onChange={(e) => setEditData('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedSupplier(null);
                                        resetEdit();
                                    }}
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
            </div>
        </AppLayout>
    );
}
