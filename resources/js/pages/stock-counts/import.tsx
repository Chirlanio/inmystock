import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToastFlash } from '@/hooks/use-toast-flash';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, FileUp, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface StockCount {
    id: number;
    count_number: number;
    status: string;
    stock_audit: {
        id: number;
        name: string;
    };
    area?: {
        id: number;
        name: string;
    };
    counter: {
        id: number;
        name: string;
    };
}

interface Props {
    stockCount: StockCount;
}

export default function StockCountImportPage({ stockCount }: Props) {
    useToastFlash();

    const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
        file_format: 'barcode_only',
        delimiter: ',',
    });

    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
            setFileName(file.name);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/stock-counts/${stockCount.id}/import`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`Importar Contagem - ${stockCount.stock_audit.name}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Importar Arquivo de Contagem"
                        description={`${stockCount.stock_audit.name} - Contagem #${stockCount.count_number}${stockCount.area ? ` - ${stockCount.area.name}` : ''}`}
                    />
                    <Button variant="outline" asChild>
                        <Link href={`/stock-counts/${stockCount.id}`}>← Voltar</Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Formulário de Upload */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Enviar Arquivo</CardTitle>
                                <CardDescription>
                                    Selecione o formato do arquivo e faça o upload dos dados de contagem
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="file_format">Formato do Arquivo</Label>
                                        <Select
                                            value={data.file_format}
                                            onValueChange={(value) => setData('file_format', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="barcode_only">
                                                    Somente Código de Barras
                                                </SelectItem>
                                                <SelectItem value="barcode_quantity">
                                                    Código de Barras + Quantidade
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.file_format && (
                                            <p className="text-sm text-destructive">
                                                {errors.file_format}
                                            </p>
                                        )}
                                    </div>

                                    {data.file_format === 'barcode_quantity' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="delimiter">Separador de Colunas</Label>
                                            <Select
                                                value={data.delimiter}
                                                onValueChange={(value) => setData('delimiter', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value=",">Vírgula (,)</SelectItem>
                                                    <SelectItem value=";">Ponto e Vírgula (;)</SelectItem>
                                                    <SelectItem value="\t">Tabulação (Tab)</SelectItem>
                                                    <SelectItem value="|">Pipe (|)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.delimiter && (
                                                <p className="text-sm text-destructive">
                                                    {errors.delimiter}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="file">Arquivo de Contagem</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="file"
                                                type="file"
                                                accept=".txt,.csv"
                                                onChange={handleFileChange}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        {fileName && (
                                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileUp className="h-4 w-4" />
                                                {fileName}
                                            </p>
                                        )}
                                        {errors.file && (
                                            <p className="text-sm text-destructive">{errors.file}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Formatos aceitos: TXT, CSV (máx. 10MB)
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing || !data.file}
                                        className="w-full"
                                    >
                                        {processing ? (
                                            'Processando...'
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Importar Arquivo
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Instruções */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Como Preparar o Arquivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {data.file_format === 'barcode_only' ? (
                                    <>
                                        <div>
                                            <h4 className="mb-2 font-semibold">
                                                Formato: Somente Código de Barras
                                            </h4>
                                            <p className="text-muted-foreground">
                                                Um código de barras por linha. Códigos repetidos serão
                                                contados automaticamente.
                                            </p>
                                        </div>

                                        <div className="rounded-md bg-muted p-3 font-mono text-xs">
                                            <div>7891234567890</div>
                                            <div>7891234567890</div>
                                            <div>7895678901234</div>
                                            <div>7891234567890</div>
                                        </div>

                                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                                <strong>Resultado:</strong>
                                                <br />
                                                7891234567890: 3 unidades
                                                <br />
                                                7895678901234: 1 unidade
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h4 className="mb-2 font-semibold">
                                                Formato: Código + Quantidade
                                            </h4>
                                            <p className="text-muted-foreground">
                                                Cada linha contém o código de barras e a quantidade,
                                                separados pelo delimitador escolhido.
                                            </p>
                                        </div>

                                        <div className="rounded-md bg-muted p-3 font-mono text-xs">
                                            <div>
                                                7891234567890
                                                {data.delimiter === '\t' ? '[TAB]' : data.delimiter}5
                                            </div>
                                            <div>
                                                7895678901234
                                                {data.delimiter === '\t' ? '[TAB]' : data.delimiter}
                                                12
                                            </div>
                                            <div>
                                                7896543210987
                                                {data.delimiter === '\t' ? '[TAB]' : data.delimiter}8
                                            </div>
                                        </div>

                                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                                <strong>Formato:</strong> código
                                                {data.delimiter === '\t' ? '[TAB]' : data.delimiter}
                                                quantidade
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertCircle className="h-4 w-4" />
                                    Importante
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Arquivos TXT ou CSV são aceitos</p>
                                <p>• Tamanho máximo: 10MB</p>
                                <p>• Linhas vazias serão ignoradas</p>
                                <p>• Produtos não encontrados serão reportados como erro</p>
                                <p>
                                    • Se um produto já existe na contagem, a quantidade será
                                    somada
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
