import { Column, DataTable } from '@/components/data-table';
import HeadingSmall from '@/components/heading-small';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { destroy, index, store, update } from '@/routes/admin/users';
import { Company, PaginatedData, Role, User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusCircle, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    users: PaginatedData<User>;
    roles: Role[];
    companies: Company[];
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UsersIndexPage({ users, roles, companies, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                index.url({
                    query: {
                        search: search || undefined,
                        role: roleFilter === 'all' ? undefined : roleFilter,
                    },
                }),
                {},
                { preserveState: true, preserveScroll: true }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, roleFilter]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        company_id: '',
        avatar: null as File | null,
    });

    const {
        data: editData,
        setData: setEditData,
        post: editPost,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        company_id: '',
        avatar: null as File | null,
        _method: 'PUT',
    });

    const handleDelete = (userId: number) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            router.delete(destroy.url(userId));
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateUser = (e: FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setAvatarPreview(null);
            },
        });
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role_id: String(user.role.id),
            company_id: String(user.company.id),
            avatar: null,
            _method: 'PUT',
        });
        setEditAvatarPreview(user.avatar || null);
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = (e: FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editPost(update.url(editingUser.id), {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingUser(null);
                setEditAvatarPreview(null);
            },
        });
    };

    const columns: Column<User>[] = [
        {
            key: 'name',
            label: 'Nome',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            label: 'Função',
            render: (user) => <Badge variant="outline">{user.role.name}</Badge>,
        },
        {
            key: 'company',
            label: 'Empresa',
            render: (user) => <Badge variant="secondary">{user.company.name}</Badge>,
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (user) => (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                    >
                        Excluir
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Gerenciar Usuários" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Gerenciar Usuários"
                        description="Adicione, edite e remova os usuários do sistema"
                    />
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Usuário
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome ou e-mail..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por função" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas funções</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.slug}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DataTable
                            columns={columns}
                            data={users.data}
                            emptyMessage="Nenhum usuário encontrado."
                        />

                        {users.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {users.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                            <DialogDescription>
                                Adicione um novo usuário ao sistema
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                    <Label htmlFor="email">E-mail *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirmar Senha *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role_id">Função *</Label>
                                    <Select
                                        value={data.role_id}
                                        onValueChange={(value) => setData('role_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={String(role.id)}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role_id && (
                                        <p className="text-sm text-destructive">{errors.role_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_id">Empresa *</Label>
                                    <Select
                                        value={data.company_id}
                                        onValueChange={(value) => setData('company_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={String(company.id)}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.company_id && (
                                        <p className="text-sm text-destructive">{errors.company_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avatar">Foto do Perfil</Label>
                                <div className="flex items-center gap-4">
                                    {avatarPreview && (
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={avatarPreview} alt="Preview" />
                                            <AvatarFallback>
                                                {data.name.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            id="avatar"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            JPG, PNG ou GIF (máx. 2MB)
                                        </p>
                                    </div>
                                </div>
                                {errors.avatar && (
                                    <p className="text-sm text-destructive">{errors.avatar}</p>
                                )}
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
                                    {processing ? 'Criando...' : 'Criar Usuário'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                            <DialogDescription>
                                Atualize as informações do usuário
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateUser} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                    <Label htmlFor="edit-email">E-mail *</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                        required
                                    />
                                    {editErrors.email && (
                                        <p className="text-sm text-destructive">{editErrors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-password">Senha</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editData.password}
                                        onChange={(e) => setEditData('password', e.target.value)}
                                        placeholder="Deixe vazio para manter a senha atual"
                                    />
                                    {editErrors.password && (
                                        <p className="text-sm text-destructive">{editErrors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-password_confirmation">Confirmar Senha</Label>
                                    <Input
                                        id="edit-password_confirmation"
                                        type="password"
                                        value={editData.password_confirmation}
                                        onChange={(e) => setEditData('password_confirmation', e.target.value)}
                                        placeholder="Confirme a nova senha"
                                    />
                                    {editErrors.password_confirmation && (
                                        <p className="text-sm text-destructive">{editErrors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-role_id">Função *</Label>
                                    <Select
                                        value={editData.role_id}
                                        onValueChange={(value) => setEditData('role_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={String(role.id)}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editErrors.role_id && (
                                        <p className="text-sm text-destructive">{editErrors.role_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-company_id">Empresa *</Label>
                                    <Select
                                        value={editData.company_id}
                                        onValueChange={(value) => setEditData('company_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={String(company.id)}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editErrors.company_id && (
                                        <p className="text-sm text-destructive">{editErrors.company_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-avatar">Foto do Perfil</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={editAvatarPreview || undefined}
                                            alt={editingUser?.name || 'User'}
                                        />
                                        <AvatarFallback>
                                            {editData.name.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Input
                                            id="edit-avatar"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditAvatarChange}
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Deixe em branco para manter a foto atual. JPG, PNG ou GIF (máx. 2MB)
                                        </p>
                                    </div>
                                </div>
                                {editErrors.avatar && (
                                    <p className="text-sm text-destructive">{editErrors.avatar}</p>
                                )}
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
            </div>
        </AppLayout>
    );
}