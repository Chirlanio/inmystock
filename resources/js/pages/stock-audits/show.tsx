import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import HeadingSmall from '@/components/heading-small';
import { ArrowLeft, Edit, Plus, Upload } from 'lucide-react';

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
    <AppLayout>
      <Head title={audit.title} />

      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/stock-audits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <HeadingSmall
              title={audit.title}
              description={`Código: ${audit.code}`}
            />
          </div>
          <div className="flex gap-2">
            {audit.status !== 'completed' && (
              <Link href={`/stock-audits/${audit.id}/edit`}>
                <Button variant="outline" leftIcon={<Edit />}>
                  Editar
                </Button>
              </Link>
            )}
            <Link href={`/stock-audits/${audit.id}/counts/create`}>
              <Button leftIcon={<Plus />}>
                Nova Contagem
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações da Auditoria</h2>
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
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="mt-1">{audit.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">
              Contagens ({audit.stock_counts.length})
            </h2>
            {audit.stock_counts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma contagem criada ainda.</p>
            ) : (
              <div className="space-y-2">
                {audit.stock_counts.map((count) => (
                  <div
                    key={count.id}
                    className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <Link
                      href={`/stock-audits/${audit.id}/counts/${count.id}`}
                      className="flex-1 hover:bg-accent transition-colors rounded p-2 -m-2"
                    >
                      <div>
                        <p className="font-medium">Contagem #{count.count_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {count.area?.name || 'Sem área'} - {count.counter.name}
                        </p>
                        {count.items_count !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {count.items_count} {count.items_count === 1 ? 'item' : 'itens'}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge>{count.status}</Badge>
                      {count.status !== 'completed' && (
                        <Link href={`/stock-counts/${count.id}/import`}>
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Importar
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
