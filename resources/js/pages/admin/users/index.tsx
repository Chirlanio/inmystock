import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
    };
}

export default function UsersIndexPage({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role?.toString() || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            { search, role: roleFilter },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = (userId: number) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            router.delete(`/admin/users/${userId}`);
        }
    };

    const getRoleBadgeVariant = (level: number) => {
        if (level >= 100) return 'destructive';
        if (level >= 75) return 'default';
        if (level >= 50) return 'secondary';
        return 'outline';
    };

    return (
        <AppLayout>
            <Head title="Gerenciar Usuários" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Gerenciar Usuários"
                        description="Gerencie usuários e suas permissões"
                    />
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Novo Usuário
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="mb-6 flex gap-4">
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
                                    <SelectItem value="">Todas as funções</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit">Buscar</Button>
                        </form>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Função</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Nenhum usuário encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.role ? (
                                                        <Badge
                                                            variant={getRoleBadgeVariant(
                                                                user.role.level,
                                                            )}
                                                        >
                                                            {user.role.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Sem função
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {user.email_verified_at ? (
                                                        <Badge variant="secondary">
                                                            Verificado
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Não verificado
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/users/${user.id}/edit`}
                                                            >
                                                                Editar
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

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
            </div>
        </AppLayout>
    );
}