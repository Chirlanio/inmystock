import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  users: User[];
}

export default function Create({ users }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    code: '',
    description: '',
    responsible_id: '',
    start_date: '',
    end_date: '',
    required_counts: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/stock-audits');
  };

  return (
    <AppLayout>
      <Head title="Nova Auditoria" />

      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/stock-audits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <HeadingSmall
            title="Nova Auditoria"
            description="Crie uma nova auditoria de estoque"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={errors.title}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
                error={errors.code}
              />
              {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_id">Responsável *</Label>
              <Select
                value={data.responsible_id.toString()}
                onValueChange={(value) => setData('responsible_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.responsible_id && (
                <p className="text-sm text-red-600">{errors.responsible_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={data.start_date}
                onChange={(e) => setData('start_date', e.target.value)}
                error={errors.start_date}
              />
              {errors.start_date && (
                <p className="text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={data.end_date}
                onChange={(e) => setData('end_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_counts">Número de Contagens Requeridas *</Label>
              <Input
                id="required_counts"
                type="number"
                min="1"
                max="10"
                value={data.required_counts}
                onChange={(e) => setData('required_counts', parseInt(e.target.value))}
                error={errors.required_counts}
              />
              {errors.required_counts && (
                <p className="text-sm text-red-600">{errors.required_counts}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={processing}>
              {processing ? 'Criando...' : 'Criar Auditoria'}
            </Button>
            <Link href="/stock-audits">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
