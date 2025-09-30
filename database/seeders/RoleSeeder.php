<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Acesso total ao sistema, incluindo configurações, usuários e todas as funcionalidades',
                'level' => 100,
                'permissions' => [
                    // Gerenciamento de usuários
                    'users.view',
                    'users.create',
                    'users.edit',
                    'users.delete',
                    'users.manage_roles',

                    // Gerenciamento de estoque
                    'inventory.view',
                    'inventory.create',
                    'inventory.edit',
                    'inventory.delete',
                    'inventory.adjust',
                    'inventory.transfer',

                    // Auditoria
                    'audits.view',
                    'audits.view_all',
                    'audits.export',

                    // Relatórios
                    'reports.view',
                    'reports.export',
                    'reports.create',

                    // Fornecedores
                    'suppliers.view',
                    'suppliers.create',
                    'suppliers.edit',
                    'suppliers.delete',

                    // Produtos
                    'products.view',
                    'products.create',
                    'products.edit',
                    'products.delete',

                    // Configurações
                    'settings.view',
                    'settings.edit',
                ],
            ],
            [
                'name' => 'Gerente',
                'slug' => 'manager',
                'description' => 'Gerencia estoque, produtos, fornecedores e visualiza relatórios',
                'level' => 75,
                'permissions' => [
                    // Gerenciamento de estoque
                    'inventory.view',
                    'inventory.create',
                    'inventory.edit',
                    'inventory.adjust',
                    'inventory.transfer',

                    // Auditoria (apenas visualização)
                    'audits.view',

                    // Relatórios
                    'reports.view',
                    'reports.export',

                    // Fornecedores
                    'suppliers.view',
                    'suppliers.create',
                    'suppliers.edit',

                    // Produtos
                    'products.view',
                    'products.create',
                    'products.edit',
                ],
            ],
            [
                'name' => 'Auditor',
                'slug' => 'auditor',
                'description' => 'Realiza auditorias de estoque, visualiza relatórios e registra divergências',
                'level' => 50,
                'permissions' => [
                    // Gerenciamento de estoque (leitura e ajustes)
                    'inventory.view',
                    'inventory.adjust',

                    // Auditoria
                    'audits.view',
                    'audits.view_all',
                    'audits.export',

                    // Relatórios
                    'reports.view',
                    'reports.export',

                    // Fornecedores (apenas leitura)
                    'suppliers.view',

                    // Produtos (apenas leitura)
                    'products.view',
                ],
            ],
            [
                'name' => 'Operador de Estoque',
                'slug' => 'operator',
                'description' => 'Movimenta estoque, registra entradas e saídas',
                'level' => 25,
                'permissions' => [
                    // Gerenciamento de estoque
                    'inventory.view',
                    'inventory.create',
                    'inventory.edit',
                    'inventory.transfer',

                    // Fornecedores (apenas leitura)
                    'suppliers.view',

                    // Produtos (apenas leitura)
                    'products.view',

                    // Relatórios (apenas visualização básica)
                    'reports.view',
                ],
            ],
            [
                'name' => 'Visualizador',
                'slug' => 'viewer',
                'description' => 'Apenas visualiza informações do estoque e produtos',
                'level' => 10,
                'permissions' => [
                    // Apenas leitura
                    'inventory.view',
                    'products.view',
                    'suppliers.view',
                    'reports.view',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );
        }
    }
}
