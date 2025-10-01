import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app-sidebar-layout';
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
import { PaginatedData } from '@/types';
import { Plus, Search } from 'lucide-react';

interface Area {
  id: number;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  created_at: string;
}

interface Props {
  areas: PaginatedData<Area>;
  filters: { search?: string; active?: boolean };
}

export default function Index({ areas, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = () => {
    router.get('/areas', { search }, { preserveState: true });
  };

  return (
    <AppSidebarLayout>
      <Head title="Áreas" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Áreas</h1>
            <p className="text-muted-foreground">
              Gerencie as áreas do estoque
            </p>
          </div>
          <Link href="/areas/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Área
            </Button>
          </Link>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhuma área encontrada
                  </TableCell>
                </TableRow>
              ) : (
                areas.data.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-mono">{area.code}</TableCell>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.description || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          area.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {area.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/areas/${area.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppSidebarLayout>
  );
}
