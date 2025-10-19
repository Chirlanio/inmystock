import { Column, DataTable } from '@/components/data-table';
import HeadingSmall from '@/components/heading-small';
import { iconList } from '@/components/icon-list';
import { LucideIcon } from '@/components/lucide-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Category, PaginatedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusCircle, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    categories: PaginatedData<Category>;
    filters: {
        search?: string;
    };
}

export default function CategoriesIndexPage({ categories, filters }: Props) {
    useToastFlash();

    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('admin.categories.index'),
                {
                    search: search || undefined,
                },
                { preserveState: true, preserveScroll: true }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        icon: '',
    });

    const {
        data: editData,
        setData: setEditData,
        put: editPut,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        icon: '',
    });

    const handleDelete = (categoryId: number) => {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            router.delete(route('admin.categories.destroy', categoryId));
        }
    };

    const handleCreateCategory = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setEditData({
            name: category.name,
            icon: category.icon || '',
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCategory = (e: FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        editPut(route('admin.categories.update', editingCategory.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
                setEditingCategory(null);
            },
        });
    };

    const columns: Column<Category>[] = [
        {
            key: 'name',
            label: 'Nome',
            render: (category) => (
                <div className="flex items-center gap-2">
                    {category.icon && <LucideIcon name={category.icon as any} className="h-5 w-5" />}
                    <span>{category.name}</span>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (category) => (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                    >
                        Excluir
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Gerenciar Categorias" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <HeadingSmall
                        title="Gerenciar Categorias"
                        description="Adicione, edite e remova as categorias de produtos"
                    />
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Categoria
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <DataTable
                            columns={columns}
                            data={categories.data}
                            emptyMessage="Nenhuma categoria encontrada."
                        />

                        {categories.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {categories.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Nova Categoria</DialogTitle>
                            <DialogDescription>
                                Adicione uma nova categoria para seus produtos
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateCategory} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Ícone</Label>
                                <Select value={data.icon} onValueChange={(value) => setData('icon', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um ícone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconList.map((icon) => (
                                            <SelectItem key={icon} value={icon}>
                                                <div className="flex items-center gap-2">
                                                    <LucideIcon name={icon as any} className="h-5 w-5" />
                                                    <span>{icon}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.icon && (
                                    <p className="text-sm text-destructive">{errors.icon}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Criando...' : 'Criar Categoria'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Categoria</DialogTitle>
                            <DialogDescription>
                                Atualize o nome e o ícone da categoria
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateCategory} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nome *</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    required
                                />
                                {editErrors.name && (
                                    <p className="text-sm text-destructive">{editErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-icon">Ícone</Label>
                                <Select value={editData.icon} onValueChange={(value) => setEditData('icon', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um ícone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconList.map((icon) => (
                                            <SelectItem key={icon} value={icon}>
                                                <div className="flex items-center gap-2">
                                                    <LucideIcon name={icon as any} className="h-5 w-5" />
                                                    <span>{icon}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.icon && (
                                    <p className="text-sm text-destructive">{editErrors.icon}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
