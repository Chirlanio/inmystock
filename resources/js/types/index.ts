export interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export interface Product {
    id: number;
    name: string;
    code: string;
    category: Category | null;
    description: string | null;
    unit: string;
    price: number | null;
    cost: number | null;
    barcode: string | null;
    sku: string | null;
    min_stock: number;
    max_stock: number;
    active: boolean;
}

export interface Category {
    id: number;
    name: string;
    icon?: string;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
}

export interface Company {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    company: Company;
    avatar?: string;
}