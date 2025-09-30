import { Column, DataTable } from '@/components/data-table';
import HeadingSmall from '@/components/heading-small';
import { UserViewModal } from '@/components/user-view-modal';
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
import { PaginatedData } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PlusCircle, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    level: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role_id: number | null;
    role?: Role;
    created_at: string;
    updated_at: string;
}

interface Props {
    users: PaginatedData<User>;
    roles: Role[];
    filters: {
        search?: string;
        role?: number;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

export default function UsersIndexPage({ users, roles, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role?.toString() || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    // Auto-submit filters with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/admin/users',
                {
                    search: search || undefined,
                    role: roleFilter === 'all' ? undefined : roleFilter,
                    sort: filters.sort,
                    direction: filters.direction,
                },
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
        role_id: '',
        password: '',
        password_confirmation: '',
        avatar: null as File | null,
        _method: 'PUT' as const,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

    const handleSort = (column: string) => {
        const newDirection =
            filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/admin/users',
            {
                search: search || undefined,
                role: roleFilter === 'all' ? undefined : roleFilter,
                sort: column,
                direction: newDirection,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (userId: number) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            router.delete(`/admin/users/${userId}`);
        }
    };

    const handleCreateUser = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setAvatarPreview(null);
            },
        });
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

    const handleViewUser = (user: User) => {
        setViewingUser(user);
        setIsViewModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            role_id: user.role_id?.toString() || '',
            password: '',
            password_confirmation: '',
            avatar: null,
            _method: 'PUT',
        });
        setEditAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null);
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = (e: FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editPost(`/admin/users/${editingUser.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingUser(null);
                setEditAvatarPreview(null);
            },
        });
    };

    const getRoleBadgeVariant = (level: number) => {
        if (level >= 100) return 'destructive';
        if (level >= 75) return 'default';
        if (level >= 50) return 'secondary';
        return 'outline';
    };

    const columns: Column<User>[] = [
        {
            key: 'name',
            label: 'Usuário',
            sortable: true,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage
                            src={user.avatar ? `/storage/${user.avatar}` : undefined}
                            alt={user.name}
                        />
                        <AvatarFallback>
                            {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
        },
        {
            key: 'role',
            label: 'Função',
            render: (user) =>
                user.role ? (
                    <Badge variant={getRoleBadgeVariant(user.role.level)}>
                        {user.role.name}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">Sem função</span>
                ),
        },
        {
            key: 'email_verified_at',
            label: 'Status',
            render: (user) =>
                user.email_verified_at ? (
                    <Badge variant="secondary">Verificado</Badge>
                ) : (
                    <Badge variant="outline">Não verificado</Badge>
                ),
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (user) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                        Visualizar
                    </Button>
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
                        description="Gerencie usuários e suas permissões"
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
                                    placeholder="Buscar por nome ou email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filtrar por função" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as funções</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DataTable
                            columns={columns}
                            data={users.data}
                            currentSort={
                                filters.sort
                                    ? { column: filters.sort, direction: filters.direction || 'asc' }
                                    : null
                            }
                            onSort={handleSort}
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

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                            <DialogDescription>
                                Adicione um novo usuário ao sistema
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
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
                                <Label htmlFor="email">Email</Label>
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
                                <Label htmlFor="role">Função</Label>
                                <Select
                                    value={data.role_id}
                                    onValueChange={(value) => setData('role_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.description && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {role.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && (
                                    <p className="text-sm text-destructive">{errors.role_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avatar">Foto do Usuário</Label>
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                {avatarPreview && (
                                    <div className="mt-2">
                                        <img
                                            src={avatarPreview}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    </div>
                                )}
                                {errors.avatar && (
                                    <p className="text-sm text-destructive">{errors.avatar}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
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
                                <Label htmlFor="password_confirmation">Confirmar Senha</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive">
                                        {errors.password_confirmation}
                                    </p>
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

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                            <DialogDescription>
                                Atualize as informações do usuário
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nome</Label>
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
                                <Label htmlFor="edit-email">Email</Label>
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
                                <Label htmlFor="edit-role">Função</Label>
                                <Select
                                    value={editData.role_id}
                                    onValueChange={(value) => setEditData('role_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.description && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {role.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.role_id && (
                                    <p className="text-sm text-destructive">{editErrors.role_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-avatar">Foto do Usuário</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={editAvatarPreview || undefined}
                                            alt={editingUser?.name}
                                        />
                                        <AvatarFallback>
                                            {editingUser?.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)}
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
                                            Deixe em branco para manter a foto atual
                                        </p>
                                    </div>
                                </div>
                                {editErrors.avatar && (
                                    <p className="text-sm text-destructive">{editErrors.avatar}</p>
                                )}
                            </div>

                            <div className="rounded-md border border-muted p-4">
                                <h3 className="mb-4 font-medium">Alterar Senha (Opcional)</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Deixe em branco se não quiser alterar a senha
                                </p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password">Nova Senha</Label>
                                        <Input
                                            id="edit-password"
                                            type="password"
                                            value={editData.password}
                                            onChange={(e) => setEditData('password', e.target.value)}
                                        />
                                        {editErrors.password && (
                                            <p className="text-sm text-destructive">
                                                {editErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password_confirmation">
                                            Confirmar Nova Senha
                                        </Label>
                                        <Input
                                            id="edit-password_confirmation"
                                            type="password"
                                            value={editData.password_confirmation}
                                            onChange={(e) =>
                                                setEditData('password_confirmation', e.target.value)
                                            }
                                        />
                                        {editErrors.password_confirmation && (
                                            <p className="text-sm text-destructive">
                                                {editErrors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>
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

                <UserViewModal
                    user={viewingUser}
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                />
            </div>
        </AppLayout>
    );
}