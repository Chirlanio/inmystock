import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: string[];
    level: number;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: number;
    name: string;
    trade_name: string | null;
    document: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Area {
    id: number;
    company_id: number | null;
    name: string;
    location: string | null;
    location_count: number;
    code: string;
    description: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Supplier {
    id: number;
    company_id: number;
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    contact_name: string | null;
    notes: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    company_id: number | null;
    parent_product_id: number | null;
    code: string;
    core_reference: string | null;
    name: string;
    description: string | null;
    category: string | null;
    color: string | null;
    size: string | null;
    unit: string;
    price: string | null;
    cost: string | null;
    barcode: string | null;
    sku: string | null;
    min_stock: number;
    max_stock: number;
    active: boolean;
    is_master: boolean;
    created_at: string;
    updated_at: string;
    full_name?: string;
    parent?: Product;
    variations?: Product[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role_id?: number | null;
    role?: Role;
    company_id?: number | null;
    company?: Company;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
