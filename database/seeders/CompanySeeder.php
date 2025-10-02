<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = [
            [
                'name' => 'InMyStock Ltda',
                'trade_name' => 'InMyStock',
                'document' => '12.345.678/0001-90',
                'email' => 'contato@inmystock.com.br',
                'phone' => '(11) 98765-4321',
                'address' => 'Rua das Flores, 123',
                'city' => 'São Paulo',
                'state' => 'SP',
                'zip_code' => '01234-567',
                'active' => true,
            ],
            [
                'name' => 'Comercial Silva & Cia Ltda',
                'trade_name' => 'Silva Comércio',
                'document' => '98.765.432/0001-10',
                'email' => 'comercial@silva.com.br',
                'phone' => '(21) 91234-5678',
                'address' => 'Avenida Paulista, 1000',
                'city' => 'Rio de Janeiro',
                'state' => 'RJ',
                'zip_code' => '20000-000',
                'active' => true,
            ],
            [
                'name' => 'Tech Solutions LTDA',
                'trade_name' => 'Tech Solutions',
                'document' => '11.222.333/0001-44',
                'email' => 'contato@techsolutions.com.br',
                'phone' => '(31) 99876-5432',
                'address' => 'Rua da Tecnologia, 500',
                'city' => 'Belo Horizonte',
                'state' => 'MG',
                'zip_code' => '30000-000',
                'active' => true,
            ],
        ];

        foreach ($companies as $companyData) {
            Company::updateOrCreate(
                ['document' => $companyData['document']],
                $companyData
            );
        }
    }
}
