import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface Audit {
    id: number;
    user_id: number | null;
    event: string;
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    url: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    auditable?: {
        id: number;
        [key: string]: any;
    };
}

interface Props {
    audit: Audit;
}

const eventColors: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    created: 'secondary',
    updated: 'default',
    deleted: 'destructive',
    restored: 'outline',
};

export default function AuditDetailPage({ audit }: Props) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getModelName = (type: string) => {
        return type.split('\\').pop() || type;
    };

    const getEventLabel = (event: string) => {
        const labels: Record<string, string> = {
            created: 'Criado',
            updated: 'Atualizado',
            deleted: 'Excluído',
            restored: 'Restaurado',
        };
        return labels[event] || event;
    };

    const renderValue = (value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-muted-foreground">null</span>;
        }
        if (typeof value === 'boolean') {
            return <span className="text-blue-600">{value ? 'true' : 'false'}</span>;
        }
        if (typeof value === 'object') {
            return (
                <pre className="mt-1 rounded bg-muted p-2 text-sm">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }
        return <span>{String(value)}</span>;
    };

    const changedFields = Object.keys({
        ...audit.old_values,
        ...audit.new_values,
    });

    return (
        <AppLayout>
            <Head title={`Auditoria #${audit.id}`} />
            <SettingsLayout>
                <div className="mb-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/settings/audit">← Voltar para Auditoria</Link>
                    </Button>
                </div>

                <HeadingSmall title={`Detalhes da Auditoria #${audit.id}`} />

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Data/Hora
                                    </div>
                                    <div className="mt-1">{formatDate(audit.created_at)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Evento
                                    </div>
                                    <div className="mt-1">
                                        <Badge variant={eventColors[audit.event] || 'default'}>
                                            {getEventLabel(audit.event)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Usuário
                                    </div>
                                    <div className="mt-1">
                                        {audit.user ? (
                                            <div>
                                                <div className="font-medium">{audit.user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {audit.user.email}
                                                </div>
                                            </div>
                                        ) : (
                                            'Sistema'
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Modelo
                                    </div>
                                    <div className="mt-1">
                                        {getModelName(audit.auditable_type)} #{audit.auditable_id}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        IP Address
                                    </div>
                                    <div className="mt-1">{audit.ip_address}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        URL
                                    </div>
                                    <div className="mt-1 truncate text-sm">{audit.url}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    User Agent
                                </div>
                                <div className="mt-1 text-sm">{audit.user_agent}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Changes */}
                    {changedFields.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Alterações</CardTitle>
                                <CardDescription>
                                    Comparação entre valores antigos e novos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {changedFields.map((field) => (
                                        <div
                                            key={field}
                                            className="grid grid-cols-2 gap-4 border-b pb-4 last:border-b-0"
                                        >
                                            <div>
                                                <div className="mb-2 font-medium">{field}</div>
                                                <div className="space-y-2">
                                                    {audit.old_values?.[field] !== undefined && (
                                                        <div className="rounded border border-red-200 bg-red-50 p-3">
                                                            <div className="mb-1 text-xs font-medium text-red-700">
                                                                Valor Anterior
                                                            </div>
                                                            {renderValue(audit.old_values[field])}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-2 font-medium opacity-0">
                                                    {field}
                                                </div>
                                                <div className="space-y-2">
                                                    {audit.new_values?.[field] !== undefined && (
                                                        <div className="rounded border border-green-200 bg-green-50 p-3">
                                                            <div className="mb-1 text-xs font-medium text-green-700">
                                                                Valor Novo
                                                            </div>
                                                            {renderValue(audit.new_values[field])}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}