import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Company } from '@/types';
import { Building2, Calendar, Mail, MapPin, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';

interface CompanyViewModalProps {
    company: Company | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompanyViewModal({ company, open, onOpenChange }: CompanyViewModalProps) {
    if (!company) return null;

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
                    <DialogTitle>Detalhes da Empresa</DialogTitle>
                    <DialogDescription>
                        Visualize as informações completas da empresa
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header com nome e status */}
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{company.name}</h3>
                            {company.trade_name && (
                                <p className="text-muted-foreground">{company.trade_name}</p>
                            )}
                            <div className="mt-2">
                                {company.active ? (
                                    <Badge variant="secondary">Ativa</Badge>
                                ) : (
                                    <Badge variant="outline">Inativa</Badge>
                                )}
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
                                <p className="font-medium">#{company.id}</p>
                            </div>
                        </div>

                        {/* CNPJ */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">CNPJ</p>
                                <p className="font-medium">{company.document}</p>
                            </div>
                        </div>

                        {/* Email */}
                        {company.email && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{company.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Telefone */}
                        {company.phone && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Telefone</p>
                                    <p className="font-medium">{company.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Data de Criação */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cadastrada em</p>
                                <p className="font-medium">{formatDate(company.created_at)}</p>
                            </div>
                        </div>

                        {/* Última Atualização */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Última atualização</p>
                                <p className="font-medium">{formatDate(company.updated_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Endereço - Largura Total */}
                    {(company.address || company.city || company.state || company.zip_code) && (
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Endereço</p>
                                    {company.address && (
                                        <p className="font-medium">{company.address}</p>
                                    )}
                                    {(company.city || company.state) && (
                                        <p className="text-sm text-muted-foreground">
                                            {company.city && company.state
                                                ? `${company.city}/${company.state}`
                                                : company.city || company.state}
                                            {company.zip_code && ` - CEP: ${company.zip_code}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Detalhado */}
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                {company.active ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-orange-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Status da empresa</p>
                                <p className="font-medium">
                                    {company.active
                                        ? 'Empresa ativa e operacional'
                                        : 'Empresa inativa'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
