import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Home, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Error403() {
    return (
        <>
            <Head title="403 - Acesso Negado" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800">
                <Card className="w-full max-w-2xl border-red-200 dark:border-red-900">
                    <CardContent className="p-8 text-center sm:p-12">
                        {/* 403 Icon */}
                        <div className="mb-8 flex items-center justify-center">
                            <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                                <ShieldAlert className="h-24 w-24 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Acesso Negado
                        </h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Você não tem permissão para acessar esta página ou realizar esta ação.
                        </p>

                        {/* Information Box */}
                        <div className="mb-8 rounded-lg bg-red-50 p-6 dark:bg-red-900/10">
                            <p className="mb-4 text-sm font-medium text-red-900 dark:text-red-200">
                                Possíveis razões:
                            </p>
                            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                    Você não possui as permissões necessárias
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                    Seu nível de acesso não é suficiente para esta ação
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                    Esta funcionalidade é restrita a determinadas funções
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
                            Se você precisa de acesso a esta área, entre em contato com um
                            administrador.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}