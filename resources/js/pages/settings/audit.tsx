import { AppContent } from '@/components/app-content';
import HeadingSmall from '@/components/heading-small';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData } from '@/types';
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
    audits: PaginatedData<Audit>;
    filters: {
        user_id?: number;
        event?: string;
        auditable_type?: string;
    };
}

const eventColors: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    created: 'secondary',
    updated: 'default',
    deleted: 'destructive',
    restored: 'outline',
};

export default function AuditPage({ audits, filters }: Props) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

    return (
        <AppLayout>
            <Head title="Auditoria" />
            <SettingsLayout>
                <HeadingSmall
                    title="Auditoria do Sistema"
                    description="Visualize todas as alterações realizadas no sistema"
                />

                <div className="space-y-6">
                    <CardContent>
                        {audits.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Nenhum registro de auditoria encontrado.
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data/Hora</TableHead>
                                                <TableHead>Usuário</TableHead>
                                                <TableHead>Evento</TableHead>
                                                <TableHead>Modelo</TableHead>
                                                <TableHead>ID</TableHead>
                                                <TableHead className="text-right">
                                                    Ações
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {audits.data.map((audit) => (
                                                <TableRow key={audit.id}>
                                                    <TableCell className="font-medium">
                                                        {formatDate(audit.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {audit.user
                                                            ? audit.user.name
                                                            : 'Sistema'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                eventColors[audit.event] ||
                                                                'default'
                                                            }
                                                        >
                                                            {getEventLabel(audit.event)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getModelName(audit.auditable_type)}
                                                    </TableCell>
                                                    <TableCell>{audit.auditable_id}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/settings/audit/${audit.id}`}
                                                            >
                                                                Ver Detalhes
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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
                            </>
                        )}
                    </CardContent>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}