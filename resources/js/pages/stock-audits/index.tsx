import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app-sidebar-layout';
import * as stockAuditsRoutes from '@/routes/stock-audits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaginatedData } from '@/types';
import { Plus, Search } from 'lucide-react';

interface StockAudit {
  id: number;
  title: string;
  code: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  responsible: {
    id: number;
    name: string;
  };
  stock_counts_count?: number;
  created_at: string;
}

interface Props {
  audits: PaginatedData<StockAudit>;
  filters: {
    search?: string;
    status?: string;
  };
}

const statusColors = {
  planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusLabels = {
  planned: 'Planejada',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export default function Index({ audits, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleSearch = () => {
    router.get(
      '/stock-audits',
      { search, status },
      { preserveState: true }
    );
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    router.get('/stock-audits');
  };

  return (
    <AppSidebarLayout>
      <Head title="Auditorias de Estoque" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Auditorias de Estoque</h1>
            <p className="text-muted-foreground">
              Gerencie as auditorias de contagem de estoque
            </p>
          </div>
          <Link href="/stock-audits/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Auditoria
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos</SelectItem>
              <SelectItem value="planned">Planejada</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Limpar
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contagens</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhuma auditoria encontrada
                  </TableCell>
                </TableRow>
              ) : (
                audits.data.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-mono">{audit.code}</TableCell>
                    <TableCell className="font-medium">{audit.title}</TableCell>
                    <TableCell>{audit.responsible.name}</TableCell>
                    <TableCell>
                      {new Date(audit.start_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[audit.status]}>
                        {statusLabels[audit.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{audit.stock_counts_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/stock-audits/${audit.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {audits.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {audits.from} a {audits.to} de {audits.total} resultados
            </p>
            <div className="flex gap-2">
              {audits.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => link.url && router.visit(link.url)}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppSidebarLayout>
  );
}
