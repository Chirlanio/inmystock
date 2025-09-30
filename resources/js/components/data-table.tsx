import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ReactNode } from 'react';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    currentSort?: { column: string; direction: 'asc' | 'desc' } | null;
    emptyMessage?: string;
    onSort?: (column: string) => void;
}

export function DataTable<T extends { id: number }>({
    columns,
    data,
    currentSort,
    emptyMessage = 'Nenhum registro encontrado.',
    onSort,
}: DataTableProps<T>) {
    const handleSort = (columnKey: string) => {
        if (onSort) {
            onSort(columnKey);
        }
    };

    const getSortIcon = (columnKey: string) => {
        if (!currentSort || currentSort.column !== columnKey) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return currentSort.direction === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column.key}>
                                {column.sortable ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort(column.key)}
                                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                                    >
                                        {column.label}
                                        {getSortIcon(column.key)}
                                    </Button>
                                ) : (
                                    column.label
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id}>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
                                        {column.render
                                            ? column.render(item)
                                            : String((item as any)[column.key] ?? '')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}