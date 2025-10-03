import HeadingSmall from '@/components/heading-small';
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
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    level: number;
}

interface Props {
    roles: Role[];
}

export default function CreateUserPage({ roles }: Props) {
    useToastFlash();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        avatar: null as File | null,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Criar Usuário" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Criar Novo Usuário"
                        description="Adicione um novo usuário ao sistema"
                    />
                    <Button variant="outline" asChild>
                        <Link href="/admin/users">← Voltar</Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                    <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avatar">Foto do Usuário</Label>
                                <div className="flex items-center gap-4">
                                    {avatarPreview && (
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage
                                                src={avatarPreview}
                                                alt="Preview"
                                            />
                                            <AvatarFallback>
                                                {data.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2) || 'US'}
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
                                            Formatos aceitos: JPG, PNG, GIF (máx. 2MB)
                                        </p>
                                    </div>
                                </div>
                                {errors.avatar && (
                                    <p className="text-sm text-destructive">{errors.avatar}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/admin/users">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Criando...' : 'Criar Usuário'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}