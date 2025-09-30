# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Laravel 12 + React + Inertia.js + TypeScript** full-stack application for **inventory auditing management** with authentication (Laravel Fortify), role-based access control, and audit logging. Uses **Tailwind CSS v4** and **shadcn/ui** components.

## Key Commands

### Development
- `composer dev` - Start all dev services concurrently (Laravel server, queue listener, Vite dev server)
- `composer dev:ssr` - Start with SSR support (includes Inertia SSR server and logs via Pail)
- `npm run dev` - Start Vite dev server only
- `php artisan serve` - Start Laravel development server (default: http://localhost:8000)

### Building
- `npm run build` - Build frontend assets for production
- `npm run build:ssr` - Build both client and SSR bundles

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changes
- `npm run types` - Type check TypeScript (no emit)
- `composer test` - Run PHPUnit tests (clears config cache first)
- `php artisan test` - Run tests directly

### Testing
- `php artisan test` - Run all tests
- `php artisan test --filter TestName` - Run specific test
- `phpunit.xml` configures two suites: Unit and Feature

### Database
- `php artisan migrate` - Run migrations
- `php artisan migrate:fresh` - Drop all tables and re-run migrations
- `php artisan db:seed` - Run database seeders
- `php artisan db:seed --class=RoleSeeder` - Seed roles and permissions

## Architecture

### Backend (Laravel)

**Controllers** are organized by domain:
- `app/Http/Controllers/Auth/` - Authentication controllers (registration, login, password reset, email verification)
- `app/Http/Controllers/Settings/` - User settings controllers (profile, password, 2FA, audits)
- `app/Http/Controllers/Admin/` - Admin controllers (user management)

**Models**:
- `User` - User model with role relationship and permission helpers
- `Role` - Role model with permissions array and level-based hierarchy
- Uses Laravel Auditing (`owen-it/laravel-auditing`) for automatic audit logging

**Fortify Integration**: Laravel Fortify handles authentication logic. Custom views are registered in `FortifyServiceProvider`:
- Two-factor challenge view
- Password confirmation view
- Rate limiting for 2FA attempts

**Middleware**:
- `HandleInertiaRequests` - Shares data with all Inertia views (includes user with role)
- `HandleAppearance` - Manages theme/appearance preferences
- `CheckRole` - Role-based access control (usage: `middleware(['role:admin,manager'])`)
- `CheckPermission` - Permission-based access control (usage: `middleware(['permission:inventory.edit'])`)

**Routes** are split across files:
- `routes/web.php` - Main routes (home, dashboard)
- `routes/auth.php` - Authentication routes
- `routes/settings.php` - Settings routes (profile, password, 2FA, audit logs)
- `routes/admin.php` - Admin routes (user management, protected by role:admin)

### Frontend (React + Inertia)

**Structure**:
- `resources/js/pages/` - Inertia page components organized by feature
  - `pages/admin/users/` - User management pages (index, create, edit)
  - `pages/settings/` - Settings pages (profile, password, 2FA, appearance, audit)
  - `pages/auth/` - Authentication pages
- `resources/js/layouts/` - Layout components (auth layouts, app layouts, settings layout)
- `resources/js/components/` - Reusable components
- `resources/js/components/ui/` - shadcn/ui components (Table, Badge, etc.)
- `resources/js/hooks/` - Custom React hooks
- `resources/js/actions/` - Auto-generated TypeScript types from Laravel routes (via Wayfinder)
- `resources/js/lib/` - Utility functions

**Navigation**: The sidebar (`app-sidebar.tsx`) dynamically shows menu items based on user permissions:
- All users see: Dashboard, Estoque (Inventory)
- Permission-based: Produtos, Fornecedores, Relatórios, Auditoria
- Admin only: Administração (User Management)

**Page Resolution**: Inertia resolves pages from `./pages/{name}.tsx` using Vite's glob import

**Layouts**: Two main layout patterns:
- Auth layouts (`auth-card-layout`, `auth-simple-layout`, `auth-split-layout`)
- App layouts (`app-header-layout`, `app-sidebar-layout`)

**Wayfinder**: The Laravel Vite Plugin Wayfinder generates type-safe route helpers in `resources/js/actions/`. It provides TypeScript types and functions for all Laravel routes.

### Styling

- **Tailwind CSS v4** configured via `@tailwindcss/vite` plugin
- Theme system with light/dark mode support via `use-appearance` hook
- Theme initialized on app load in `app.tsx`

### Type Safety

- TypeScript configured with strict checking (`tsconfig.json`)
- Shared types in `resources/js/types/index.d.ts` (User, Role, PaginatedData, etc.)
- Form validation requests in `app/Http/Requests/` namespace

## Role-Based Access Control (RBAC)

### Roles & Permissions

The system has 5 predefined roles for inventory auditing:

1. **Administrador** (Level 100) - Full system access
   - User management, system configuration
   - All inventory, products, suppliers operations
   - View and export all audits and reports

2. **Gerente** (Level 75) - Management operations
   - Manage inventory, products, suppliers
   - Create/edit/adjust inventory
   - View and export reports
   - Cannot manage users or system settings

3. **Auditor** (Level 50) - Audit focused
   - View and adjust inventory
   - Full audit log access and export
   - View reports and products (read-only)
   - Cannot create/delete resources

4. **Operador de Estoque** (Level 25) - Stock operations
   - Create, edit, transfer inventory
   - View products and suppliers (read-only)
   - Basic report viewing
   - Cannot delete or audit

5. **Visualizador** (Level 10) - Read-only access
   - View inventory, products, suppliers, reports
   - No modification permissions

### Permission System

Permissions are stored as JSON array in roles table. Categories include:
- `users.*` - User management
- `inventory.*` - Inventory operations (view, create, edit, delete, adjust, transfer)
- `products.*` - Product management
- `suppliers.*` - Supplier management
- `reports.*` - Report access
- `audits.*` - Audit log access
- `settings.*` - System settings

### Usage in Code

**Backend (Routes)**:
```php
// Require specific role
Route::middleware(['auth', 'role:admin'])->group(function () {});

// Require any of multiple roles
Route::middleware(['auth', 'role:admin,manager'])->group(function () {});

// Require specific permission
Route::middleware(['auth', 'permission:inventory.edit'])->group(function () {});
```

**Backend (Controller/Logic)**:
```php
if ($user->hasRole('admin')) { }
if ($user->hasPermission('inventory.edit')) { }
if ($user->isAdmin()) { }
if ($user->hasLevel(50)) { } // Auditor or higher
```

**Frontend (React/TypeScript)**:
```tsx
const { auth } = usePage().props;
const user = auth?.user;

// Check role
if (user?.role?.slug === 'admin') { }

// Check permission
if (user?.role?.permissions?.includes('inventory.edit')) { }

// Check level
if (user?.role?.level >= 75) { }
```

## Audit Logging

Uses `owen-it/laravel-auditing` package. Configuration in `config/audit.php`.

**Auditable Models**: Add trait to any model:
```php
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class YourModel extends Model implements Auditable {
    use AuditableTrait;
}
```

**Viewing Audits**:
- `/settings/audit` - List all audit logs (filtered by permission)
- `/settings/audit/{id}` - View specific audit details with old/new values diff

**Excluded Fields**: Sensitive fields automatically excluded (password, tokens, 2FA secrets)