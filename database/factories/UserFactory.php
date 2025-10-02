<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role_id' => Role::where('slug', 'viewer')->first()?->id,
            'company_id' => Company::inRandomOrder()->first()?->id,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Assign a specific role to the user.
     */
    public function withRole(string $roleSlug): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('slug', $roleSlug)->first()?->id,
        ]);
    }

    /**
     * Assign admin role to the user.
     */
    public function admin(): static
    {
        return $this->withRole('admin');
    }

    /**
     * Assign manager role to the user.
     */
    public function manager(): static
    {
        return $this->withRole('manager');
    }

    /**
     * Assign auditor role to the user.
     */
    public function auditor(): static
    {
        return $this->withRole('auditor');
    }

    /**
     * Assign operator role to the user.
     */
    public function operator(): static
    {
        return $this->withRole('operator');
    }
}
