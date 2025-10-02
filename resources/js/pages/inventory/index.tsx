import HeadingSmall from '@/components/heading-small';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

export default function InventoryIndexPage() {
    return (
        <AppLayout>
            <Head title="Estoque" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Controle de Estoque"
                    description="Visão geral do inventário e movimentações"
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Produtos cadastrados no sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Produtos disponíveis para uso
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                            <TrendingDown className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Produtos abaixo do estoque mínimo
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Produtos que requerem atenção
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Funcionalidades do Estoque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">Em desenvolvimento</h3>
                                <p className="text-sm text-muted-foreground">
                                    As funcionalidades de controle de estoque estão sendo
                                    desenvolvidas. Em breve você poderá:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li>• Visualizar níveis de estoque em tempo real</li>
                                    <li>• Registrar entradas e saídas de produtos</li>
                                    <li>• Realizar transferências entre áreas</li>
                                    <li>• Gerar relatórios de movimentação</li>
                                    <li>• Receber alertas de estoque baixo</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
