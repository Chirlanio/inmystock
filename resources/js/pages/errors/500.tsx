import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Home, ServerCrash, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error500() {
    return (
        <>
            <Head title="500 - Erro Interno do Servidor" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-gray-900 dark:to-gray-800">
                <Card className="w-full max-w-2xl border-purple-200 dark:border-purple-900">
                    <CardContent className="p-8 text-center sm:p-12">
                        {/* 500 Icon */}
                        <div className="mb-8 flex items-center justify-center">
                            <div className="rounded-full bg-purple-100 p-6 dark:bg-purple-900/20">
                                <ServerCrash className="h-24 w-24 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Erro Interno do Servidor
                        </h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Algo deu errado no servidor. Estamos trabalhando para corrigir o
                            problema.
                        </p>

                        {/* Information Box */}
                        <div className="mb-8 rounded-lg bg-purple-50 p-6 dark:bg-purple-900/10">
                            <p className="mb-4 text-sm font-medium text-purple-900 dark:text-purple-200">
                                O que fazer:
                            </p>
                            <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                                    Tente recarregar a página
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                                    Aguarde alguns minutos e tente novamente
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                                    Se o problema persistir, contate o suporte
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Recarregar Página
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                            <Button asChild className="gap-2">
                                <Link href="/dashboard">
                                    <Home className="h-4 w-4" />
                                    Ir para o Dashboard
                                </Link>
                            </Button>
                        </div>

                        {/* Help Text */}
                        <p className="mt-8 text-xs text-muted-foreground">
                            Erro ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} •
                            Nossa equipe foi notificada automaticamente
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}