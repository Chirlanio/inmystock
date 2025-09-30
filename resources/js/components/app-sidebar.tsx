import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Package,
    FileText,
    Users,
    ClipboardList,
    Settings,
    Shield
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const user = auth?.user;

    // Build navigation items based on user permissions
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Inventory - visible to all authenticated users
    if (user) {
        mainNavItems.push({
            title: 'Estoque',
            href: '/inventory',
            icon: Package,
        });
    }

    // Products - visible to users with products.view permission
    if (user?.role?.permissions?.includes('products.view')) {
        mainNavItems.push({
            title: 'Produtos',
            href: '/products',
            icon: ClipboardList,
        });
    }

    // Suppliers - visible to users with suppliers.view permission
    if (user?.role?.permissions?.includes('suppliers.view')) {
        mainNavItems.push({
            title: 'Fornecedores',
            href: '/suppliers',
            icon: Users,
        });
    }

    // Reports - visible to users with reports.view permission
    if (user?.role?.permissions?.includes('reports.view')) {
        mainNavItems.push({
            title: 'Relatórios',
            href: '/reports',
            icon: FileText,
        });
    }

    // Audit - visible to users with audits.view permission
    if (user?.role?.permissions?.includes('audits.view')) {
        mainNavItems.push({
            title: 'Auditoria',
            href: '/settings/audit',
            icon: Shield,
        });
    }

    // Admin - only for admins
    if (user?.role?.slug === 'admin') {
        mainNavItems.push({
            title: 'Administração',
            href: '/admin/users',
            icon: Settings,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
