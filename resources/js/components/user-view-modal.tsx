import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/types';
import { Calendar, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

interface UserViewModalProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserViewModal({ user, open, onOpenChange }: UserViewModalProps) {
    if (!user) return null;

    const getRoleBadgeVariant = (level: number) => {
        if (level >= 100) return 'destructive';
        if (level >= 75) return 'default';
        if (level >= 50) return 'secondary';
        return 'outline';
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Nunca';
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Informações do Usuário</DialogTitle>
                    <DialogDescription>
                        Visualize os detalhes completos do usuário
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Avatar e Nome */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={user.avatar ? `/storage/${user.avatar}` : undefined}
                                alt={user.name}
                            />
                            <AvatarFallback className="text-2xl">
                                {user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-semibold">{user.name}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    {/* Informações em Grid */}
                    <div className="grid gap-4 rounded-lg border p-4">
                        {/* ID */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <span className="text-sm font-semibold">ID</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Identificador único
                                </p>
                                <p className="font-medium">#{user.id}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Endereço de email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        {/* Função */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Função no sistema</p>
                                {user.role ? (
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={getRoleBadgeVariant(user.role.level)}
                                            className="font-medium"
                                        >
                                            {user.role.name}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Nível {user.role.level}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="font-medium text-muted-foreground">
                                        Sem função atribuída
                                    </p>
                                )}
                                {user.role?.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {user.role.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status de Verificação */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                {user.email_verified_at ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-orange-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status da conta</p>
                                {user.email_verified_at ? (
                                    <div>
                                        <Badge variant="secondary" className="font-medium">
                                            Email Verificado
                                        </Badge>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {formatDate(user.email_verified_at)}
                                        </p>
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="font-medium">
                                        Email Não Verificado
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Data de Criação */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Membro desde</p>
                                <p className="font-medium">{formatDate(user.created_at)}</p>
                            </div>
                        </div>

                        {/* Última Atualização */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Última atualização</p>
                                <p className="font-medium">{formatDate(user.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Permissões */}
                    {user.role?.permissions && user.role.permissions.length > 0 && (
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-3 font-semibold">Permissões</h4>
                            <div className="flex flex-wrap gap-2">
                                {user.role.permissions.map((permission) => (
                                    <Badge key={permission} variant="outline" className="text-xs">
                                        {permission}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}