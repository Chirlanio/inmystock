# InMyStock - Sistema de Gestão e Auditoria de Estoque

Sistema completo de gestão e auditoria de estoque desenvolvido com **Laravel 12** e **React 19**, utilizando **Inertia.js** para uma experiência SPA com renderização do lado do servidor.

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Comandos Úteis](#-comandos-úteis)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Modelos e Relacionamentos](#-modelos-e-relacionamentos)
- [Sistema de Permissões (RBAC)](#-sistema-de-permissões-rbac)
- [Rotas da Aplicação](#-rotas-da-aplicação)
- [Testes](#-testes)
- [Documentação Adicional](#-documentação-adicional)

## 🎯 Visão Geral

**InMyStock** é um sistema completo de gestão e auditoria de estoque projetado para empresas que necessitam de controle rigoroso sobre seus inventários. O sistema oferece:

- **Gestão Multi-tenant**: Suporte para múltiplas empresas em um único sistema
- **Auditoria Completa**: Rastreamento automático de todas as alterações em dados críticos
- **Controle de Acesso Baseado em Funções**: 5 níveis hierárquicos de permissões
- **Gestão de Produtos**: Suporte para variações de produtos (cor, tamanho, etc.)
- **Contagens de Estoque**: Fluxo completo de auditoria física com múltiplas contagens
- **Movimentações de Estoque**: Registro detalhado de entradas, saídas, transferências e ajustes
- **Relatórios Avançados**: Divergências, comparações e análises de estoque
- **Importação em Massa**: Suporte para importação de produtos e contagens via CSV
- **Autenticação Segura**: 2FA (TOTP), verificação de e-mail e gerenciamento de sessões

## 🛠 Stack Tecnológica

### Backend
- **PHP** 8.2+
- **Laravel** 12.x
- **Laravel Fortify** - Autenticação headless
- **Laravel Auditing** - Trilha de auditoria automática
- **Inertia.js** 2.x - SSR e bridge React ↔ Laravel
- **Laravel Wayfinder** - Geração de rotas type-safe

### Frontend
- **React** 19.x
- **TypeScript** 5.7
- **Tailwind CSS** 4.x
- **shadcn/ui** - Componentes baseados em Radix UI
- **Vite** 7.x - Build tool
- **Lucide React** - Ícones

### Banco de Dados
- **PostgreSQL** / **MySQL** (configurável)
- **SQLite** (para testes)

### Ferramentas de Desenvolvimento
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatação de código
- **Laravel Pint** - Formatação de código PHP
- **PHPUnit** - Testes backend
- **Laravel Sail** - Ambiente Docker (opcional)

## ✨ Funcionalidades Principais

### 1. Gestão de Produtos
- CRUD completo de produtos
- Suporte para variações (cores, tamanhos, etc.)
- Agrupamento por referência principal
- Códigos de barras e SKUs
- Categorização de produtos
- Importação em massa via CSV
- Controle de estoque mínimo/máximo

### 2. Auditoria de Estoque
- Criação de campanhas de auditoria
- Múltiplas contagens por área/localização
- Importação de contagens via CSV (delimitadores flexíveis)
- Controle de status (planejado, em andamento, concluído)
- Histórico completo de importações

### 3. Gestão de Inventário
- Níveis de estoque em tempo real por localização
- Movimentações detalhadas (entrada, saída, ajuste, transferência)
- Cálculo automático de quantidade disponível vs. reservada
- Alertas de estoque baixo
- Exportação de movimentações

### 4. Relatórios
- **Estoque Teórico vs. Contado**: Divergências entre sistema e contagem física
- **Contagem vs. Contagem**: Comparação entre duas contagens
- **Produtos Ausentes**: Produtos não incluídos em uma contagem
- Exportação para CSV

### 5. Gestão de Fornecedores
- CRUD de fornecedores
- Informações de contato e endereço
- Vinculação com produtos

### 6. Áreas de Armazenamento
- Gestão de áreas/localizações do armazém
- Controle de múltiplas localizações por área
- Vinculação com contagens de estoque

### 7. Administração
- Gestão de usuários
- Atribuição de funções e permissões
- Gestão de empresas (multi-tenant)
- Logs de auditoria do sistema
- Gestão de categorias de produtos

### 8. Configurações de Usuário
- Perfil e avatar
- Alteração de senha
- Autenticação de dois fatores (2FA)
- Tema claro/escuro
- Visualização de auditoria pessoal

## 🏗 Arquitetura do Sistema

### Padrões Arquiteturais

#### Backend (Laravel)
```
┌─────────────────────────────────────────┐
│         Inertia.js Middleware           │
│  (Compartilha dados com todas as views) │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Controllers (26 total)          │
│  - Admin, Auth, Settings, Domain        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Form Request Validators            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Eloquent Models (13 total)         │
│  - User, Product, StockAudit, etc.      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Traits & Observers              │
│  - BelongsToCompany, Auditable          │
└─────────────────────────────────────────┘
```

#### Frontend (React + Inertia)
```
┌─────────────────────────────────────────┐
│         Inertia Page Component          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            Layout Component             │
│  (App Sidebar, Auth Card, etc.)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Custom Components               │
│  (Data Tables, Modals, Forms)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         shadcn/ui Components            │
│  (Button, Input, Dialog, etc.)          │
└─────────────────────────────────────────┘
```

### Multi-Tenancy
O sistema utiliza o trait `BelongsToCompany` para garantir isolamento de dados entre empresas:

```php
// Automaticamente filtra queries por company_id
$products = Product::all(); // Retorna apenas produtos da empresa do usuário autenticado
```

### Auditoria Automática
Modelos que implementam `AuditableTrait` têm todas as alterações rastreadas:

```php
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;

class Product extends Model implements Auditable {
    use AuditableTrait;
}
```

## 📦 Instalação

### Requisitos
- PHP 8.2 ou superior
- Composer
- Node.js 18+ e NPM
- PostgreSQL ou MySQL
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/inmystock.git
cd inmystock
```

2. **Instale as dependências do PHP**
```bash
composer install
```

3. **Instale as dependências do Node.js**
```bash
npm install
```

4. **Configure o ambiente**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure o banco de dados no arquivo `.env`**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=inmystock
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

6. **Execute as migrations e seeders**
```bash
php artisan migrate
php artisan db:seed
```

7. **Compile os assets**
```bash
npm run build
```

8. **Inicie o servidor de desenvolvimento**
```bash
composer dev
# Ou separadamente:
# php artisan serve
# npm run dev
```

9. **Acesse a aplicação**
```
http://localhost:8000
```

## ⚙️ Configuração

### Configuração de E-mail
Configure o envio de e-mails no `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@inmystock.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Configuração de Auditoria
O arquivo `config/audit.php` controla o comportamento da auditoria:

```php
'enabled' => true,
'events' => ['created', 'updated', 'deleted', 'restored'],
'exclude' => ['password', 'remember_token', 'two_factor_secret'],
```

### Configuração do Fortify
O arquivo `config/fortify.php` controla funcionalidades de autenticação:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar todos os serviços de desenvolvimento
composer dev

# Iniciar com suporte SSR
composer dev:ssr

# Apenas o servidor Laravel
php artisan serve

# Apenas o Vite dev server
npm run dev
```

### Build de Produção
```bash
# Build do frontend
npm run build

# Build com SSR
npm run build:ssr
```

### Qualidade de Código
```bash
# Lint JavaScript/TypeScript
npm run lint

# Formatar código (Prettier)
npm run format

# Verificar formatação
npm run format:check

# Verificar tipos TypeScript
npm run types

# Formatar código PHP (Laravel Pint)
./vendor/bin/pint
```

### Testes
```bash
# Executar todos os testes
composer test
# Ou
php artisan test

# Executar teste específico
php artisan test --filter NomeDoTeste

# Testes com cobertura
php artisan test --coverage
```

### Banco de Dados
```bash
# Executar migrations
php artisan migrate

# Resetar banco de dados
php artisan migrate:fresh

# Executar seeders
php artisan db:seed

# Executar seeder específico
php artisan db:seed --class=RoleSeeder

# Criar nova migration
php artisan make:migration create_table_name

# Criar novo seeder
php artisan make:seeder TableSeeder
```

### Geração de Código
```bash
# Criar controller
php artisan make:controller NomeController

# Criar model com migration e factory
php artisan make:model Nome -mf

# Criar form request
php artisan make:request NomeRequest
```

## 📁 Estrutura de Diretórios

```
inmystock/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # 26 controllers organizados por domínio
│   │   │   ├── Admin/        # Gestão de usuários, empresas, logs
│   │   │   ├── Auth/         # Autenticação (login, registro, 2FA)
│   │   │   └── Settings/     # Configurações de usuário
│   │   ├── Middleware/       # CheckRole, CheckPermission, HandleInertia
│   │   └── Requests/         # Form validation requests
│   ├── Models/               # 13 Eloquent models
│   ├── Traits/               # BelongsToCompany trait
│   └── Providers/            # Service providers
│
├── database/
│   ├── factories/            # UserFactory, CompanyFactory
│   ├── migrations/           # 27 migration files
│   └── seeders/              # RoleSeeder, CategorySeeder, etc.
│
├── resources/
│   ├── js/
│   │   ├── pages/            # 40+ page components organizados por feature
│   │   │   ├── admin/        # Páginas administrativas
│   │   │   ├── auth/         # Páginas de autenticação
│   │   │   ├── settings/     # Configurações de usuário
│   │   │   ├── stock-audits/ # Auditoria de estoque
│   │   │   ├── products/     # Gestão de produtos
│   │   │   ├── reports/      # Relatórios
│   │   │   └── ...
│   │   ├── components/       # 40+ componentes reutilizáveis
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── layouts/          # Layout components
│   │   │   ├── app/          # Layouts da aplicação
│   │   │   ├── auth/         # Layouts de autenticação
│   │   │   └── settings/     # Layout de configurações
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── types/            # TypeScript type definitions
│   │   └── app.tsx           # Entry point
│   ├── css/                  # Tailwind CSS
│   └── views/                # Blade templates (mínimo)
│
├── routes/
│   ├── web.php               # Rotas principais
│   ├── auth.php              # Rotas de autenticação
│   ├── admin.php             # Rotas administrativas
│   ├── settings.php          # Rotas de configurações
│   ├── products.php          # Rotas de produtos
│   ├── suppliers.php         # Rotas de fornecedores
│   ├── areas.php             # Rotas de áreas
│   ├── inventory.php         # Rotas de inventário
│   ├── inventory-movements.php # Rotas de movimentações
│   ├── reports.php           # Rotas de relatórios
│   ├── stock-audits.php      # Rotas de auditorias
│   └── categories.php        # Rotas de categorias
│
├── tests/
│   ├── Feature/              # Feature tests
│   │   ├── Auth/             # Testes de autenticação (6 files)
│   │   ├── Settings/         # Testes de configurações (3 files)
│   │   └── Admin/            # Testes administrativos
│   └── Unit/                 # Unit tests
│
├── config/                   # 13 arquivos de configuração
├── public/                   # Assets públicos
├── storage/                  # Arquivos de storage
├── bootstrap/                # Bootstrap files
├── composer.json             # Dependências PHP
├── package.json              # Dependências Node.js
├── phpunit.xml               # Configuração PHPUnit
├── tsconfig.json             # Configuração TypeScript
├── vite.config.ts            # Configuração Vite
└── CLAUDE.md                 # Instruções para Claude Code
```

## 🗄️ Modelos e Relacionamentos

### Diagrama de Relacionamentos

```
Company (Empresa)
├── hasMany → Users
├── hasMany → Products
├── hasMany → Areas
├── hasMany → Suppliers
├── hasMany → StockAudits
├── hasMany → Categories
├── hasMany → InventoryLevels
└── hasMany → InventoryMovements

User (Usuário)
├── belongsTo → Role
├── belongsTo → Company
└── hasMany → StockCounts (como contador)

Role (Função)
├── hasMany → Users
└── Permissions (JSON array)

Product (Produto)
├── belongsTo → Company
├── belongsTo → Category
├── belongsTo → Product (parent - para variações)
├── hasMany → Product (variations)
├── hasMany → InventoryLevels
└── hasMany → InventoryMovements

StockAudit (Auditoria de Estoque)
├── belongsTo → Company
├── belongsTo → User (responsável)
└── hasMany → StockCounts

StockCount (Contagem)
├── belongsTo → StockAudit
├── belongsTo → Area
├── belongsTo → User (contador)
├── hasMany → StockCountItems
└── hasMany → StockCountImports

StockCountItem (Item Contado)
└── belongsTo → StockCount

InventoryLevel (Nível de Estoque)
├── belongsTo → Company
├── belongsTo → Product
└── belongsTo → Area

InventoryMovement (Movimentação)
├── belongsTo → Company
├── belongsTo → Product
├── belongsTo → Area
├── belongsTo → Area (fromArea - transferências)
├── belongsTo → Area (toArea - transferências)
├── belongsTo → User (criador)
└── morphTo → reference (referência polimórfica)

Area (Área/Localização)
├── belongsTo → Company
├── hasMany → StockCounts
└── hasMany → InventoryLevels

Supplier (Fornecedor)
├── belongsTo → Company
└── hasMany → Products

Category (Categoria)
├── belongsTo → Company
└── hasMany → Products
```

### Descrição dos Modelos

#### User
Representa usuários do sistema com autenticação 2FA.

**Campos principais:**
- `name`, `email`, `password`
- `role_id` - Função atribuída
- `company_id` - Empresa associada
- `avatar` - Avatar do usuário
- `status` - Status ativo/inativo
- `email_verified_at` - Verificação de e-mail
- `two_factor_secret`, `two_factor_recovery_codes` - 2FA

**Métodos:**
- `hasRole(string $role): bool`
- `hasPermission(string $permission): bool`
- `isAdmin(): bool`
- `hasLevel(int $level): bool`

#### Role
Define funções hierárquicas com permissões granulares.

**Funções predefinidas:**
1. **Administrador** (Level 100) - Acesso total
2. **Gerente** (Level 75) - Operações de gestão
3. **Auditor** (Level 50) - Focado em auditoria
4. **Operador de Estoque** (Level 25) - Operações de estoque
5. **Visualizador** (Level 10) - Apenas leitura

**Campos:**
- `name`, `slug`, `level`
- `permissions` (JSON) - Array de permissões

**Categorias de Permissões:**
- `users.*` - Gestão de usuários
- `inventory.*` - Operações de inventário
- `products.*` - Gestão de produtos
- `suppliers.*` - Gestão de fornecedores
- `reports.*` - Acesso a relatórios
- `audits.*` - Logs de auditoria
- `settings.*` - Configurações do sistema

#### Product
Produtos com suporte para variações.

**Campos principais:**
- `code` - Código único gerado automaticamente
- `core_reference` - Referência principal (agrupa variações)
- `name`, `color`, `size` - Identificação
- `unit`, `price`, `cost` - Informações comerciais
- `barcode`, `sku` - Códigos de identificação
- `min_stock`, `max_stock` - Controle de estoque
- `is_master` - Indica se é produto principal
- `parent_id` - Produto pai (para variações)
- `category_id` - Categoria

**Métodos:**
- `generateCode(): string` - Gera código único
- `extractCoreReference(): string` - Extrai referência principal
- `variationGroup()` - Query scope para agrupar variações
- `siblings()` - Retorna variações irmãs

#### StockAudit
Campanhas de auditoria de estoque.

**Campos:**
- `code` - Código único
- `title`, `description` - Informações
- `start_date`, `end_date` - Período
- `status` - planned/in_progress/completed
- `required_counts` - Número de contagens necessárias
- `responsible_id` - Usuário responsável

**Métodos:**
- `canBeEdited(): bool`
- `isCompleted(): bool`
- Scopes: `planned()`, `inProgress()`, `completed()`

#### StockCount
Contagens físicas de estoque.

**Campos:**
- `stock_audit_id` - Auditoria associada
- `area_id` - Área contada
- `counter_id` - Usuário que contou
- `count_number` - Número da contagem (1ª, 2ª, etc.)
- `status` - pending/in_progress/completed
- `started_at`, `completed_at` - Timestamps
- `notes` - Observações

**Métodos:**
- `start(): void`
- `complete(): void`
- `canBeEdited(): bool`

#### InventoryLevel
Níveis de estoque em tempo real por localização.

**Campos:**
- `product_id`, `area_id` - Identificação
- `quantity` - Quantidade total
- `reserved_quantity` - Quantidade reservada
- `available_quantity` - Quantidade disponível
- `last_movement_at` - Última movimentação

**Métodos estáticos:**
- `recalculateForProduct(Product $product): void`
- `getTotalQuantityForProduct(Product $product): int`
- `isLowStock(): bool`
- `reserve(int $quantity): void`
- `release(int $quantity): void`

#### InventoryMovement
Movimentações de estoque (entradas, saídas, transferências, ajustes).

**Tipos de Movimentação:**
- `entry` - Entrada
- `exit` - Saída
- `adjustment` - Ajuste
- `transfer_out` - Transferência saída
- `transfer_in` - Transferência entrada

**Campos:**
- `code` - Código único
- `type` - Tipo de movimentação
- `product_id`, `area_id` - Identificação
- `quantity` - Quantidade
- `unit_cost`, `total_cost` - Custos
- `movement_date` - Data da movimentação
- `document_number` - Número do documento
- `notes` - Observações
- `from_area_id`, `to_area_id` - Para transferências

**Métodos:**
- `updateInventoryLevels(): void` - Atualiza níveis automaticamente
- `getTypeLabel(): string`
- `getTypeColor(): string`
- `isTransfer(): bool`

## 🔐 Sistema de Permissões (RBAC)

### Hierarquia de Funções

| Função | Level | Descrição | Permissões Principais |
|--------|-------|-----------|----------------------|
| **Administrador** | 100 | Acesso total ao sistema | Todas as permissões |
| **Gerente** | 75 | Gestão operacional | Gestão de estoque, produtos, fornecedores, relatórios |
| **Auditor** | 50 | Focado em auditoria | Visualizar e ajustar inventário, auditoria completa |
| **Operador de Estoque** | 25 | Operações diárias | Criar/editar/transferir estoque, visualização |
| **Visualizador** | 10 | Apenas leitura | Visualizar dados (sem modificações) |

### Uso no Backend

#### Em Rotas
```php
// Requer função específica
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/users', [UserController::class, 'index']);
});

// Aceita múltiplas funções
Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    Route::resource('products', ProductController::class);
});

// Requer permissão específica
Route::middleware(['auth', 'permission:inventory.edit'])->group(function () {
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);
});
```

#### Em Controllers
```php
// Verificar função
if ($request->user()->hasRole('admin')) {
    // Código admin
}

if ($request->user()->isAdmin()) {
    // Código admin (atalho)
}

// Verificar permissão
if ($request->user()->hasPermission('inventory.edit')) {
    // Permitir edição
}

// Verificar nível hierárquico
if ($request->user()->hasLevel(50)) {
    // Auditor ou superior
}
```

### Uso no Frontend

#### Em Componentes React
```tsx
import { usePage } from '@inertiajs/react';

function MyComponent() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    // Verificar função
    if (user?.role?.slug === 'admin') {
        return <AdminPanel />;
    }

    // Verificar permissão
    const canEdit = user?.role?.permissions?.includes('inventory.edit');

    // Verificar nível
    const isManager = (user?.role?.level ?? 0) >= 75;

    return (
        <>
            {canEdit && <EditButton />}
            {isManager && <ManagerTools />}
        </>
    );
}
```

### Lista Completa de Permissões

#### Gestão de Usuários
- `users.view` - Visualizar usuários
- `users.create` - Criar usuários
- `users.edit` - Editar usuários
- `users.delete` - Excluir usuários
- `users.manage_roles` - Gerenciar funções

#### Inventário
- `inventory.view` - Visualizar inventário
- `inventory.create` - Criar registros de inventário
- `inventory.edit` - Editar inventário
- `inventory.delete` - Excluir registros
- `inventory.adjust` - Ajustar quantidades
- `inventory.transfer` - Transferir entre locais

#### Produtos
- `products.view` - Visualizar produtos
- `products.create` - Criar produtos
- `products.edit` - Editar produtos
- `products.delete` - Excluir produtos

#### Fornecedores
- `suppliers.view` - Visualizar fornecedores
- `suppliers.create` - Criar fornecedores
- `suppliers.edit` - Editar fornecedores
- `suppliers.delete` - Excluir fornecedores

#### Relatórios
- `reports.view` - Visualizar relatórios
- `reports.export` - Exportar relatórios
- `reports.create` - Criar relatórios personalizados

#### Auditoria
- `audits.view` - Visualizar próprios logs
- `audits.view_all` - Visualizar todos os logs
- `audits.export` - Exportar logs de auditoria

#### Configurações
- `settings.view` - Visualizar configurações
- `settings.edit` - Editar configurações do sistema

## 🛣️ Rotas da Aplicação

### Autenticação (`/auth/*`)
- `GET /login` - Página de login
- `POST /login` - Processar login
- `POST /logout` - Logout
- `GET /register` - Página de registro
- `POST /register` - Processar registro
- `GET /forgot-password` - Solicitar reset de senha
- `POST /forgot-password` - Enviar e-mail de reset
- `GET /reset-password/{token}` - Formulário de reset
- `POST /reset-password` - Processar reset
- `GET /verify-email` - Prompt de verificação
- `GET /verify-email/{id}/{hash}` - Verificar e-mail
- `POST /email/verification-notification` - Reenviar e-mail
- `GET /two-factor-challenge` - Desafio 2FA
- `POST /two-factor-challenge` - Verificar código 2FA
- `GET /confirm-password` - Confirmar senha

### Dashboard
- `GET /` - Redireciona para login
- `GET /dashboard` - Dashboard principal com KPIs

### Produtos (`/products`)
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PUT /products/{product}` - Atualizar produto
- `DELETE /products/{product}` - Excluir produto
- `POST /products/import` - Importar CSV
- `GET /products/template/download` - Download template CSV

### Fornecedores (`/suppliers`)
- `GET /suppliers` - Listar fornecedores
- `POST /suppliers` - Criar fornecedor
- `PUT /suppliers/{supplier}` - Atualizar fornecedor
- `DELETE /suppliers/{supplier}` - Excluir fornecedor

### Áreas (`/areas`)
- `GET /areas` - Listar áreas
- `POST /areas` - Criar área
- `PUT /areas/{area}` - Atualizar área
- `DELETE /areas/{area}` - Excluir área

### Auditorias de Estoque (`/stock-audits/*`)
- `GET /stock-audits` - Listar auditorias
- `POST /stock-audits` - Criar auditoria
- `GET /stock-audits/{audit}` - Visualizar auditoria
- `PUT /stock-audits/{audit}` - Atualizar auditoria
- `DELETE /stock-audits/{audit}` - Excluir auditoria

### Contagens (`/stock-audits/{audit}/counts/*`)
- `GET /stock-audits/{audit}/counts` - Listar contagens
- `GET /stock-audits/{audit}/counts/create` - Formulário de criação
- `POST /stock-audits/{audit}/counts` - Criar contagem
- `GET /stock-audits/{audit}/counts/{count}` - Visualizar contagem
- `GET /stock-audits/{audit}/counts/{count}/edit` - Editar contagem
- `PUT /stock-audits/{audit}/counts/{count}` - Atualizar contagem
- `DELETE /stock-audits/{audit}/counts/{count}` - Excluir contagem
- `POST /stock-audits/{audit}/counts/{count}/start` - Iniciar contagem
- `POST /stock-audits/{audit}/counts/{count}/complete` - Finalizar contagem

### Importação de Contagens (`/stock-counts/{count}/import/*`)
- `GET /stock-counts/{count}/import` - Formulário de importação
- `POST /stock-counts/{count}/import` - Processar importação CSV
- `GET /stock-counts/{count}/import/history` - Histórico de importações
- `GET /stock-count-imports/{import}/download` - Download arquivo importado

### Inventário (`/inventory`)
- `GET /inventory` - Visualizar níveis de estoque

### Movimentações (`/inventory-movements`)
- `GET /inventory-movements` - Listar movimentações
- `POST /inventory-movements` - Criar movimentação
- `GET /inventory-movements/{movement}` - Visualizar movimentação
- `PUT /inventory-movements/{movement}` - Atualizar movimentação
- `DELETE /inventory-movements/{movement}` - Excluir movimentação
- `GET /inventory-movements/export` - Exportar para CSV

### Relatórios (`/reports/*`)
- `GET /reports` - Índice de relatórios
- `GET /reports/stock-vs-count` - Estoque teórico vs. contado
- `GET /reports/count-vs-count` - Comparar contagens
- `GET /reports/missing-products` - Produtos ausentes em contagem
- `GET /reports/export/{type}` - Exportar relatório em CSV

### Configurações (`/settings/*`)
- `GET /settings/profile` - Perfil do usuário
- `PATCH /settings/profile` - Atualizar perfil
- `DELETE /settings/profile` - Excluir conta
- `GET /settings/password` - Alterar senha
- `PUT /settings/password` - Atualizar senha
- `GET /settings/appearance` - Configurações de aparência
- `GET /settings/two-factor` - Gerenciar 2FA
- `POST /settings/two-factor` - Ativar 2FA
- `DELETE /settings/two-factor` - Desativar 2FA
- `GET /settings/two-factor/recovery-codes` - Códigos de recuperação
- `POST /settings/two-factor/recovery-codes` - Regenerar códigos
- `GET /settings/audit` - Logs de auditoria pessoais
- `GET /settings/audit/{audit}` - Detalhes do log
- `GET /settings/categories` - Gerenciar categorias

### Admin (`/admin/*`)
Protegido por `role:admin`

- `GET /admin/users` - Listar usuários
- `GET /admin/users/create` - Formulário de criação
- `POST /admin/users` - Criar usuário
- `GET /admin/users/{user}/edit` - Editar usuário
- `PUT /admin/users/{user}` - Atualizar usuário
- `DELETE /admin/users/{user}` - Excluir usuário
- `GET /admin/companies` - Listar empresas
- `GET /admin/logs` - Logs do sistema

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
composer test

# Testes com saída detalhada
php artisan test --parallel

# Teste específico
php artisan test --filter AuthenticationTest

# Com cobertura
php artisan test --coverage
```

### Suítes de Testes

#### Testes de Autenticação (`tests/Feature/Auth/`)
- `AuthenticationTest` - Login e logout
- `RegistrationTest` - Registro de usuários
- `PasswordResetTest` - Recuperação de senha
- `PasswordConfirmationTest` - Confirmação de senha
- `EmailVerificationTest` - Verificação de e-mail
- `TwoFactorChallengeTest` - Autenticação 2FA
- `VerificationNotificationTest` - Reenvio de notificações

#### Testes de Configurações (`tests/Feature/Settings/`)
- `ProfileUpdateTest` - Atualização de perfil
- `PasswordUpdateTest` - Alteração de senha
- `TwoFactorAuthenticationTest` - Configuração 2FA

#### Testes Administrativos (`tests/Feature/Admin/`)
- `UserControllerTest` - CRUD de usuários

#### Outros Testes
- `DashboardTest` - Renderização do dashboard

### Estrutura de um Teste

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_users_can_authenticate(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/dashboard');
    }
}
```

## 📚 Documentação Adicional

### Componentes shadcn/ui Utilizados
- Avatar - Avatares de usuários
- Badge - Etiquetas de status
- Button - Botões
- Card - Cartões de conteúdo
- Checkbox - Checkboxes
- Dialog - Modais
- Dropdown Menu - Menus suspensos
- Input - Campos de entrada
- Input OTP - Entrada de códigos 2FA
- Label - Rótulos de formulário
- Select - Seletores
- Separator - Separadores
- Sidebar - Barra lateral
- Skeleton - Loading placeholders
- Switch - Interruptores
- Table - Tabelas de dados
- Textarea - Áreas de texto
- Toggle - Botões de alternância
- Tooltip - Dicas de ferramentas

### Hooks Personalizados
- `use-appearance` - Gerenciamento de tema (claro/escuro)
- `use-mobile` - Detecção de dispositivo móvel
- `use-initials` - Geração de iniciais para avatares

### Traits Laravel
- `BelongsToCompany` - Filtro automático por empresa (multi-tenancy)
- `AuditableTrait` - Rastreamento de alterações
- `SoftDeletes` - Exclusão lógica
- `HasFactory` - Suporte para factories

### Observers
Os modelos utilizam observers para:
- Atualizar `InventoryLevel` quando `InventoryMovement` é criado/deletado
- Gerar códigos automáticos (produtos, áreas, fornecedores)
- Extrair `core_reference` de produtos

### Middleware Global
- `HandleInertiaRequests` - Compartilha dados com todas as páginas:
  - `auth.user` (com role e permissions)
  - `flash` (mensagens de sucesso/erro)
  - `theme` (preferência de tema)
  - `quote` (citação aleatória na página de login)

## 🔒 Segurança

### Medidas de Segurança Implementadas
- ✅ Autenticação de dois fatores (TOTP)
- ✅ Verificação de e-mail obrigatória
- ✅ Rate limiting em rotas de autenticação
- ✅ Confirmação de senha para ações sensíveis
- ✅ Hashing bcrypt para senhas
- ✅ CSRF protection em todos os formulários
- ✅ Soft deletes para dados críticos
- ✅ Auditoria completa de ações
- ✅ Isolamento de dados por empresa (multi-tenancy)
- ✅ Permissões granulares por função

### Campos Excluídos da Auditoria
- `password`
- `remember_token`
- `two_factor_secret`
- `two_factor_recovery_codes`

## 🚢 Deploy

### Preparação para Produção

1. **Configure o ambiente de produção**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seu-dominio.com

# Database
DB_CONNECTION=pgsql
DB_HOST=seu-host
DB_DATABASE=inmystock_prod

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

2. **Instale dependências de produção**
```bash
composer install --optimize-autoloader --no-dev
npm ci --production
```

3. **Compile assets**
```bash
npm run build:ssr
```

4. **Otimize o Laravel**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

5. **Execute migrations**
```bash
php artisan migrate --force
php artisan db:seed --class=RoleSeeder --force
```

6. **Configure permissões**
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

7. **Configure o web server (Nginx exemplo)**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/inmystock/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

8. **Configure supervisor para queues (se usar)**
```ini
[program:inmystock-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/inmystock/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/inmystock/storage/logs/worker.log
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código
- Backend: Siga o Laravel Pint (PSR-12)
- Frontend: Siga ESLint + Prettier configurado
- Commits: Use Conventional Commits

### Executar Antes de Commitar
```bash
# PHP
./vendor/bin/pint

# JavaScript/TypeScript
npm run lint
npm run format
npm run types

# Testes
composer test
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**InMyStock Team**

## 🙏 Agradecimentos

- [Laravel](https://laravel.com/)
- [React](https://react.dev/)
- [Inertia.js](https://inertiajs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Laravel Fortify](https://laravel.com/docs/fortify)
- [Laravel Auditing](https://laravel-auditing.com/)

---

**Desenvolvido com ❤️ para gestão eficiente de estoque**
