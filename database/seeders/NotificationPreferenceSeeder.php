<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserNotificationPreference;
use Illuminate\Database\Seeder;

class NotificationPreferenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder creates default notification preferences for all existing users
     * who don't have preferences yet.
     */
    public function run(): void
    {
        $this->command->info('Creating default notification preferences for existing users...');

        $users = User::all();
        $created = 0;

        foreach ($users as $user) {
            // Check if user already has preferences
            $existingPreferences = $user->notificationPreferences()->count();

            if ($existingPreferences === 0) {
                UserNotificationPreference::createDefaultsForUser($user);
                $created++;
                $this->command->info("Created preferences for user: {$user->name} ({$user->email})");
            } else {
                $this->command->comment("User {$user->name} already has preferences, skipping...");
            }
        }

        $this->command->info("Done! Created preferences for {$created} users.");
    }
}
