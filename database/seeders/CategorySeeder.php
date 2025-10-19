<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Eletrônicos', 'icon' => 'Laptop'],
            ['name' => 'Alimentos', 'icon' => 'Utensils'],
            ['name' => 'Vestuário', 'icon' => 'Shirt'],
            ['name' => 'Casa e Jardim', 'icon' => 'Home'],
            ['name' => 'Brinquedos', 'icon' => 'ToyBrick'],
            ['name' => 'Saúde e Beleza', 'icon' => 'Heart'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'company_id' => 1, // Assuming company_id 1 exists
                'name' => $category['name'],
                'icon' => $category['icon'],
            ]);
        }
    }
}