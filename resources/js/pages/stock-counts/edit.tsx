import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Area {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface StockAudit {
    id: number;
    title: string;
    code: string;
}

interface StockCount {
    id: number;
    count_number: number;
    area_id: number | null;
    counter_id: number;
    notes: string | null;
    stock_audit: StockAudit;
}

interface Props {
    stockCount: StockCount;
    areas: Area[];
    users: User[];
}

export default function EditStockCountPage({ stockCount, areas, users }: Props) {
    useToastFlash();

    const { data, setData, put, processing, errors } = useForm({
        area_id: stockCount.area_id?.toString() || '',
        counter_id: stockCount.counter_id.toString(),
        count_number: stockCount.count_number,
        notes: stockCount.notes || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/stock-audits/${stockCount.stock_audit.id}/counts/${stockCount.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar Contagem #${stockCount.count_number} - ${stockCount.stock_audit.title}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title={`Editar Contagem #${stockCount.count_number}`}
                        description={`${stockCount.stock_audit.title} - ${stockCount.stock_audit.code}`}
                    />
                    <Button variant="outline" asChild>
                        <Link href={`/stock-counts/${stockCount.id}`}>← Voltar</Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="count_number">Número da Contagem</Label>
                                    <Input
                                        id="count_number"
                                        type="number"
                                        min="1"
                                        value={data.count_number}
                                        onChange={(e) =>
                                            setData('count_number', parseInt(e.target.value) || 1)
                                        }
                                        required
                                    />
                                    {errors.count_number && (
                                        <p className="text-sm text-destructive">
                                            {errors.count_number}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="counter_id">Contador Responsável *</Label>
                                    <Select
                                        value={data.counter_id}
                                        onValueChange={(value) => setData('counter_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o contador" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.counter_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.counter_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area_id">Área (Opcional)</Label>
                                    <Select
                                        value={data.area_id || undefined}
                                        onValueChange={(value) => setData('area_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma área" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem key={area.id} value={area.id.toString()}>
                                                    {area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.area_id && (
                                        <p className="text-sm text-destructive">{errors.area_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    placeholder="Observações sobre esta contagem..."
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">{errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" asChild>
                                    <Link href={`/stock-counts/${stockCount.id}`}>Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
