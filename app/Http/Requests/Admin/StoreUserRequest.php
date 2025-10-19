<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasPermission('users.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id', function ($attribute, $value, $fail) {
                $selectedRole = \App\Models\Role::find($value);
                $currentUserRole = $this->user()->role;

                if ($selectedRole && $currentUserRole && $selectedRole->level > $currentUserRole->level) {
                    $fail('Você não pode atribuir uma função superior à sua própria função.');
                }
            }],
            'company_id' => ['required', 'exists:companies,id'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:2048'], // 2MB max
            'status' => ['nullable', 'in:active,inactive,suspended'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'email' => 'e-mail',
            'password' => 'senha',
            'password_confirmation' => 'confirmação de senha',
            'role_id' => 'função',
            'company_id' => 'empresa',
            'avatar' => 'foto de perfil',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'password.confirmed' => 'A confirmação de senha não corresponde.',
            'avatar.image' => 'O arquivo deve ser uma imagem.',
            'avatar.mimes' => 'A foto deve ser do tipo: jpg, jpeg, png ou gif.',
            'avatar.max' => 'A foto não pode ser maior que 2MB.',
        ];
    }
}
