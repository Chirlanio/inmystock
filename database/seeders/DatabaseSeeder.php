<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and companies first
        $this->call([
            RoleSeeder::class,
            CompanySeeder::class,
            CategorySeeder::class,
        ]);

        // Get first company
        $company = \App\Models\Company::first();

        // Create test users with different roles
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $adminUser->role()->associate(\App\Models\Role::where('slug', 'admin')->first());
        $adminUser->company()->associate($company);
        $adminUser->save();

        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $testUser->role()->associate(\App\Models\Role::where('slug', 'viewer')->first());
        $testUser->company()->associate($company);
        $testUser->save();
    }
}
