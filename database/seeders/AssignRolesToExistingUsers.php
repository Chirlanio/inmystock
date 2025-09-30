<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssignRolesToExistingUsers extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the admin role
        $adminRole = Role::where('slug', 'admin')->first();

        if (!$adminRole) {
            $this->command->error('Admin role not found. Please run RoleSeeder first.');
            return;
        }

        // Assign admin role to all users without a role
        $usersWithoutRole = User::whereNull('role_id')->get();

        foreach ($usersWithoutRole as $user) {
            $user->role_id = $adminRole->id;
            $user->save();
            $this->command->info("Assigned admin role to user: {$user->email}");
        }

        if ($usersWithoutRole->isEmpty()) {
            $this->command->info('All users already have roles assigned.');
        }
    }
}
