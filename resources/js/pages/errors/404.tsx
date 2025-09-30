import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <Head title="404 - Página não encontrada" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-8 text-center sm:p-12">
                        {/* 404 Number */}
                        <div className="mb-8 flex items-center justify-center">
                            <div className="relative">
                                <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">
                                    404
                                </h1>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Search className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Página não encontrada
                        </h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Desculpe, a página que você está procurando não existe ou foi movida.
                        </p>

                        {/* Suggestions */}
                        <div className="mb-8 rounded-lg bg-muted/50 p-6">
                            <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Você pode tentar:
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Verificar se o endereço foi digitado corretamente
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Voltar para a página anterior
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Ir para a página inicial
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
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
                            Se você acredita que isto é um erro, entre em contato com o suporte.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}