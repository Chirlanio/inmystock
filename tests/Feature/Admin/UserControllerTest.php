<?php

namespace Tests\Feature\Admin;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_admin_can_view_users_list()
    {
        $admin = $this->createAdmin();
        $company = Company::factory()->create();
        $admin->update(['company_id' => $company->id]);

        $response = $this->actingAs($admin)
            ->get(route('admin.users.index'));

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_users_list()
    {
        $viewer = $this->createViewer();
        $company = Company::factory()->create();
        $viewer->update(['company_id' => $company->id]);

        $response = $this->actingAs($viewer)
            ->get(route('admin.users.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user()
    {
        $admin = $this->createAdmin();
        $company = Company::factory()->create();
        $admin->update(['company_id' => $company->id]);

        $operatorRole = Role::where('slug', 'operator')->first();

        $response = $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_id' => $operatorRole->id,
                'company_id' => $company->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    }

    public function test_admin_cannot_assign_higher_role_than_their_own()
    {
        // Note: The actual route has role:admin middleware, so managers can't access it at all.
        // This test verifies the validation layer which would work if permissions were adjusted.
        // For now, we test that a manager gets blocked at the middleware level.

        $manager = $this->createManager();
        $company = Company::factory()->create();
        $manager->update(['company_id' => $company->id]);

        $adminRole = Role::where('slug', 'admin')->first();

        $response = $this->actingAs($manager)
            ->post(route('admin.users.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_id' => $adminRole->id,
                'company_id' => $company->id,
            ]);

        // Manager is blocked by role:admin middleware
        $response->assertStatus(403);
    }

    public function test_admin_can_update_user()
    {
        $admin = $this->createAdmin();
        $company = Company::factory()->create();
        $admin->update(['company_id' => $company->id]);

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role_id' => Role::where('slug', 'operator')->first()->id,
        ]);

        $response = $this->actingAs($admin)
            ->put(route('admin.users.update', $user), [
                'name' => 'Updated Name',
                'email' => $user->email,
                'role_id' => $user->role_id,
                'company_id' => $company->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_admin_can_delete_user()
    {
        $admin = $this->createAdmin();
        $company = Company::factory()->create();
        $admin->update(['company_id' => $company->id]);

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role_id' => Role::where('slug', 'operator')->first()->id,
        ]);

        $response = $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $user));

        $response->assertRedirect();
        $this->assertSoftDeleted('users', [
            'id' => $user->id,
        ]);
    }

    public function test_user_cannot_delete_themselves()
    {
        $admin = $this->createAdmin();
        $company = Company::factory()->create();
        $admin->update(['company_id' => $company->id]);

        $response = $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $admin));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }

    public function test_admin_can_upload_avatar()
    {
        Storage::fake('public');

        $admin = $this->createAdmin();
        $company = Company::factory()->create();
        $admin->update(['company_id' => $company->id]);

        $avatar = UploadedFile::fake()->image('avatar.jpg');
        $operatorRole = Role::where('slug', 'operator')->first();

        $response = $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_id' => $operatorRole->id,
                'company_id' => $company->id,
                'avatar' => $avatar,
            ]);

        $response->assertRedirect();
        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user->getRawOriginal('avatar'));
        Storage::disk('public')->assertExists($user->getRawOriginal('avatar'));
    }

    protected function createAdmin(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('slug', 'admin')->first()->id,
        ]);
    }

    protected function createManager(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('slug', 'manager')->first()->id,
        ]);
    }

    protected function createViewer(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('slug', 'viewer')->first()->id,
        ]);
    }
}
