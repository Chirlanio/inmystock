import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Download,
    FileText,
    Package,
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    AlertTriangle,
    GitCompare,
    PackageX,
} from 'lucide-react';

export default function ReportsIndexPage() {
    const reportTypes = [
        {
            title: 'Divergências: Estoque vs Contagem',
            description: 'Compare o estoque teórico com contagens realizadas',
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            href: '/reports/stock-vs-count',
            available: true,
        },
        {
            title: 'Divergências entre Contagens',
            description: 'Compare duas contagens diferentes e identifique discrepâncias',
            icon: GitCompare,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            href: '/reports/count-vs-count',
            available: true,
        },
        {
            title: 'Produtos Não Contados',
            description: 'Identifique produtos que não foram incluídos em uma contagem',
            icon: PackageX,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            href: '/reports/missing-products',
            available: true,
        },
        {
            title: 'Relatório de Estoque',
            description: 'Visualize níveis atuais de estoque, produtos em falta e excesso',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            available: false,
        },
        {
            title: 'Relatório de Movimentações',
            description: 'Histórico de entradas, saídas e transferências de produtos',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            available: false,
        },
        {
            title: 'Relatório de Auditorias',
            description: 'Resumo das auditorias realizadas e divergências encontradas',
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            available: false,
        },
        {
            title: 'Relatório de Produtos',
            description: 'Lista completa de produtos com detalhes e variações',
            icon: BarChart3,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            available: false,
        },
        {
            title: 'Relatório Financeiro',
            description: 'Análise de custos, preços e valores de estoque',
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            available: false,
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
                        const CardWrapper = report.available && report.href ? Link : 'div';
                        const cardProps = report.available && report.href
                            ? { href: report.href }
                            : {};

                        return (
                            <Card
                                key={index}
                                className={report.available ? "hover:shadow-md transition-shadow cursor-pointer" : "opacity-75"}
                            >
                                <CardWrapper {...cardProps} className="block">
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
                                        {report.available ? (
                                            <Button variant="outline" className="w-full">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Visualizar
                                            </Button>
                                        ) : (
                                            <Button variant="outline" className="w-full" disabled>
                                                <Download className="mr-2 h-4 w-4" />
                                                Em breve
                                            </Button>
                                        )}
                                    </CardContent>
                                </CardWrapper>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Relatórios de Divergências</CardTitle>
                        <CardDescription>
                            Análise e comparação de contagens de estoque
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <h3 className="mb-2 font-semibold text-red-900">Divergências: Estoque vs Contagem</h3>
                                <p className="text-sm text-red-700">
                                    Compare o estoque teórico com as quantidades contadas fisicamente.
                                    Identifique sobras, faltas e discrepâncias para ajustes.
                                </p>
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <h3 className="mb-2 font-semibold text-amber-900">Divergências entre Contagens</h3>
                                <p className="text-sm text-amber-700">
                                    Compare duas contagens físicas diferentes do mesmo inventário.
                                    Útil para validar contagens e identificar erros de contagem.
                                </p>
                            </div>

                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                <h3 className="mb-2 font-semibold text-orange-900">Produtos Não Contados</h3>
                                <p className="text-sm text-orange-700">
                                    Identifique produtos cadastrados que não foram incluídos em uma contagem.
                                    Garanta cobertura completa do inventário.
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <h3 className="mb-2 font-semibold">Recursos Disponíveis</h3>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li>• Filtros por período, área e contagem</li>
                                    <li>• Visualização de divergências em tabela</li>
                                    <li>• Exportação para CSV</li>
                                    <li>• Resumos estatísticos de divergências</li>
                                    <li>• Cálculo de percentual de variação</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
