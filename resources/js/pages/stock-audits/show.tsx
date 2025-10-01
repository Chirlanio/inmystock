import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus } from 'lucide-react';

interface StockAudit {
  id: number;
  title: string;
  code: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  required_counts: number;
  responsible: { id: number; name: string; email: string };
  stock_counts: Array<{
    id: number;
    count_number: number;
    status: string;
    area?: { id: number; name: string };
    counter: { id: number; name: string };
    items_count?: number;
  }>;
}

interface Props {
  audit: StockAudit;
}

const statusColors = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Show({ audit }: Props) {
  return (
    <AppSidebarLayout>
      <Head title={audit.title} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/stock-audits">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{audit.title}</h1>
              <p className="text-muted-foreground">Código: {audit.code}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {audit.status !== 'completed' && (
              <Link href={`/stock-audits/${audit.id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>
            )}
            <Link href={`/stock-audits/${audit.id}/counts/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Contagem
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Informações da Auditoria</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[audit.status]}>
                  {audit.status === 'planned' && 'Planejada'}
                  {audit.status === 'in_progress' && 'Em Andamento'}
                  {audit.status === 'completed' && 'Concluída'}
                  {audit.status === 'cancelled' && 'Cancelada'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">{audit.responsible.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">
                  {new Date(audit.start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contagens Requeridas</p>
                <p className="font-medium">{audit.required_counts}</p>
              </div>
            </div>
            {audit.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="mt-1">{audit.description}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Contagens ({audit.stock_counts.length})
            </h2>
            {audit.stock_counts.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma contagem criada ainda.</p>
            ) : (
              <div className="space-y-2">
                {audit.stock_counts.map((count) => (
                  <Link
                    key={count.id}
                    href={`/stock-audits/${audit.id}/counts/${count.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">Contagem #{count.count_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {count.area?.name || 'Sem área'} - {count.counter.name}
                      </p>
                    </div>
                    <Badge>{count.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
}
