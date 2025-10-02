import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Area } from '@/types';
import { Calendar, CheckCircle, FileText, Hash, MapPin, XCircle } from 'lucide-react';

interface AreaViewModalProps {
    area: Area | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AreaViewModal({ area, open, onOpenChange }: AreaViewModalProps) {
    if (!area) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes da Área</DialogTitle>
                    <DialogDescription>
                        Visualize as informações completas da área
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header com nome e status */}
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{area.name}</h3>
                            {area.location && (
                                <p className="text-muted-foreground">{area.location}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                                {area.active ? (
                                    <Badge variant="secondary">Ativa</Badge>
                                ) : (
                                    <Badge variant="outline">Inativa</Badge>
                                )}
                                <Badge variant="default">
                                    {area.location_count} {area.location_count === 1 ? 'local' : 'locais'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Informações em Grid */}
                    <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* ID */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <span className="text-sm font-semibold">ID</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Identificador</p>
                                <p className="font-medium">#{area.id}</p>
                            </div>
                        </div>

                        {/* Código */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Código</p>
                                <p className="font-medium">{area.code}</p>
                            </div>
                        </div>

                        {/* Quantidade de Locais */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quantidade de Locais</p>
                                <p className="font-medium">{area.location_count}</p>
                            </div>
                        </div>

                        {/* Data de Criação */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Criada em</p>
                                <p className="font-medium">{formatDate(area.created_at)}</p>
                            </div>
                        </div>

                        {/* Última Atualização */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Última atualização</p>
                                <p className="font-medium">{formatDate(area.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Descrição - Largura Total */}
                    {area.description && (
                        <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                            <p className="mt-2">{area.description}</p>
                        </div>
                    )}

                    {/* Status Detalhado */}
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                {area.active ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-orange-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Status da área</p>
                                <p className="font-medium">
                                    {area.active
                                        ? 'Área ativa e disponível para uso'
                                        : 'Área inativa'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
