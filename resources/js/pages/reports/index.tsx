import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Download,
    FileText,
    Package,
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
} from 'lucide-react';

export default function ReportsIndexPage() {
    const reportTypes = [
        {
            title: 'Relatório de Estoque',
            description: 'Visualize níveis atuais de estoque, produtos em falta e excesso',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Relatório de Movimentações',
            description: 'Histórico de entradas, saídas e transferências de produtos',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Relatório de Auditorias',
            description: 'Resumo das auditorias realizadas e divergências encontradas',
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Relatório de Produtos',
            description: 'Lista completa de produtos com detalhes e variações',
            icon: BarChart3,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Relatório de Usuários',
            description: 'Atividades e permissões dos usuários do sistema',
            icon: Users,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
        {
            title: 'Relatório Financeiro',
            description: 'Análise de custos, preços e valores de estoque',
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            title: 'Relatório por Período',
            description: 'Analise dados específicos de um intervalo de datas',
            icon: Calendar,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
    ];

    return (
        <AppLayout>
            <Head title="Relatórios" />

            <div className="space-y-6 p-6">
                <HeadingSmall
                    title="Relatórios"
                    description="Gere e visualize relatórios do sistema"
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reportTypes.map((report, index) => {
                        const Icon = report.icon;
                        return (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.bgColor}`}
                                        >
                                            <Icon className={`h-6 w-6 ${report.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{report.title}</CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                {report.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" disabled>
                                        <Download className="mr-2 h-4 w-4" />
                                        Gerar Relatório
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Funcionalidades de Relatórios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">Em desenvolvimento</h3>
                                <p className="text-sm text-muted-foreground">
                                    Os relatórios estão sendo desenvolvidos. Em breve você poderá:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li>• Gerar relatórios em PDF e Excel</li>
                                    <li>• Filtrar dados por período, área, categoria</li>
                                    <li>• Agendar relatórios automáticos por email</li>
                                    <li>• Visualizar gráficos e dashboards interativos</li>
                                    <li>• Exportar dados para análise externa</li>
                                    <li>• Comparar períodos e identificar tendências</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
