import { Column, DataTable } from '@/components/data-table';
import { CompanyViewModal } from '@/components/company-view-modal';
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
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { Company, PaginatedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building2, PlusCircle, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    companies: PaginatedData<Company>;
    filters: {
        search?: string;
        active?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function CompaniesIndexPage({ companies, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [activeFilter, setActiveFilter] = useState(filters.active || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

    // Auto-submit filters with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/admin/companies',
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
        trade_name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
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
        trade_name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        active: true,
    });

    const handleSort = (column: string) => {
        const newDirection =
            filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/admin/companies',
            {
                search: search || undefined,
                active: activeFilter === 'all' ? undefined : activeFilter,
                sort: column,
                direction: newDirection,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (companyId: number) => {
        if (confirm('Tem certeza que deseja excluir esta empresa?')) {
            router.delete(`/admin/companies/${companyId}`);
        }
    };

    const handleCreateCompany = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/companies', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleViewCompany = (company: Company) => {
        setViewingCompany(company);
        setIsViewModalOpen(true);
    };

    const handleEditCompany = (company: Company) => {
        setEditingCompany(company);
        setEditData({
            name: company.name,
            trade_name: company.trade_name || '',
            document: company.document,
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || '',
            city: company.city || '',
            state: company.state || '',
            zip_code: company.zip_code || '',
            active: company.active,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCompany = (e: FormEvent) => {
        e.preventDefault();
        if (!editingCompany) return;

        editPut(`/admin/companies/${editingCompany.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingCompany(null);
            },
        });
    };

    const columns: Column<Company>[] = [
        {
            key: 'name',
            label: 'Empresa',
            sortable: true,
            render: (company) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">{company.name}</p>
                        {company.trade_name && (
                            <p className="text-sm text-muted-foreground">{company.trade_name}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'document',
            label: 'CNPJ',
            sortable: true,
        },
        {
            key: 'city',
            label: 'Cidade/UF',
            render: (company) =>
                company.city && company.state
                    ? `${company.city}/${company.state}`
                    : company.city || company.state || '-',
        },
        {
            key: 'email',
            label: 'Email',
            render: (company) => company.email || '-',
        },
        {
            key: 'phone',
            label: 'Telefone',
            render: (company) => company.phone || '-',
        },
        {
            key: 'active',
            label: 'Status',
            render: (company) =>
                company.active ? (
                    <Badge variant="secondary">Ativa</Badge>
                ) : (
                    <Badge variant="outline">Inativa</Badge>
                ),
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (company) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewCompany(company)}>
                        Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)}>
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                    >
                        Excluir
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Gerenciar Empresas" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Gerenciar Empresas"
                        description="Gerencie as empresas do sistema"
                    />
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Empresa
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, razão social, CNPJ ou email..."
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
                            data={companies.data}
                            currentSort={
                                filters.sort
                                    ? { column: filters.sort, direction: filters.direction || 'asc' }
                                    : null
                            }
                            onSort={handleSort}
                            emptyMessage="Nenhuma empresa encontrada."
                        />

                        {companies.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {companies.links.map((link, index) => (
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
                            <DialogTitle>Criar Nova Empresa</DialogTitle>
                            <DialogDescription>
                                Adicione uma nova empresa ao sistema
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateCompany} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Razão Social *</Label>
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
                                    <Label htmlFor="trade_name">Nome Fantasia</Label>
                                    <Input
                                        id="trade_name"
                                        value={data.trade_name}
                                        onChange={(e) => setData('trade_name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document">CNPJ *</Label>
                                    <Input
                                        id="document"
                                        value={data.document}
                                        onChange={(e) => setData('document', e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                        required
                                    />
                                    {errors.document && (
                                        <p className="text-sm text-destructive">{errors.document}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zip_code">CEP</Label>
                                    <Input
                                        id="zip_code"
                                        value={data.zip_code}
                                        onChange={(e) => setData('zip_code', e.target.value)}
                                        placeholder="00000-000"
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
                                    <Label htmlFor="state">Estado (UF)</Label>
                                    <Input
                                        id="state"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        maxLength={2}
                                        placeholder="SP"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="active"
                                    checked={data.active}
                                    onCheckedChange={(checked) => setData('active', checked as boolean)}
                                />
                                <Label htmlFor="active" className="cursor-pointer">
                                    Empresa ativa
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
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Criando...' : 'Criar Empresa'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Empresa</DialogTitle>
                            <DialogDescription>
                                Atualize as informações da empresa
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateCompany} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Razão Social *</Label>
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
                                    <Label htmlFor="edit-trade_name">Nome Fantasia</Label>
                                    <Input
                                        id="edit-trade_name"
                                        value={editData.trade_name}
                                        onChange={(e) => setEditData('trade_name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-document">CNPJ *</Label>
                                    <Input
                                        id="edit-document"
                                        value={editData.document}
                                        onChange={(e) => setEditData('document', e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                        required
                                    />
                                    {editErrors.document && (
                                        <p className="text-sm text-destructive">{editErrors.document}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Telefone</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editData.phone}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-zip_code">CEP</Label>
                                    <Input
                                        id="edit-zip_code"
                                        value={editData.zip_code}
                                        onChange={(e) => setEditData('zip_code', e.target.value)}
                                        placeholder="00000-000"
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
                                    <Label htmlFor="edit-state">Estado (UF)</Label>
                                    <Input
                                        id="edit-state"
                                        value={editData.state}
                                        onChange={(e) => setEditData('state', e.target.value)}
                                        maxLength={2}
                                        placeholder="SP"
                                    />
                                </div>
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
                                    Empresa ativa
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
                                <Button type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <CompanyViewModal
                    company={viewingCompany}
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                />
            </div>
        </AppLayout>
    );
}
