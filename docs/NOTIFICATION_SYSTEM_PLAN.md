# Sistema de Notificações - InMyStock

## Visão Geral

Implementação completa de um sistema de notificações multi-canal para o InMyStock, permitindo alertas em tempo real e comunicação com usuários.

## Arquitetura

### Canais de Notificação
1. **Database** - Notificações in-app (sempre ativo)
2. **Email** - Notificações por e-mail (configurável por usuário)
3. **Broadcast** (futuro) - Real-time via WebSockets

### Tipos de Notificação

#### 1. Estoque
- `LowStockAlert` - Produto abaixo do estoque mínimo
- `StockLevelCritical` - Estoque zerado ou negativo
- `StockAdjustmentNotification` - Ajuste significativo realizado

#### 2. Auditoria
- `AuditCreated` - Nova auditoria criada
- `AuditAssigned` - Auditoria atribuída ao usuário
- `AuditDueSoon` - Auditoria próxima do prazo
- `AuditCompleted` - Auditoria concluída
- `CountCompleted` - Contagem concluída

#### 3. Importação
- `ImportCompleted` - Importação CSV concluída
- `ImportFailed` - Importação CSV falhou

#### 4. Sistema
- `WelcomeNotification` - Boas-vindas a novos usuários
- `PasswordChanged` - Senha alterada com sucesso
- `TwoFactorEnabled` - 2FA ativado
- `UserRoleChanged` - Função do usuário alterada

#### 5. Divergências
- `CriticalDiscrepancy` - Divergência crítica detectada em contagem

## Estrutura de Arquivos

```
app/
├── Notifications/
│   ├── Stock/
│   │   ├── LowStockAlert.php
│   │   ├── StockLevelCritical.php
│   │   └── StockAdjustmentNotification.php
│   ├── Audit/
│   │   ├── AuditCreated.php
│   │   ├── AuditAssigned.php
│   │   ├── AuditDueSoon.php
│   │   ├── AuditCompleted.php
│   │   └── CountCompleted.php
│   ├── Import/
│   │   ├── ImportCompleted.php
│   │   └── ImportFailed.php
│   ├── System/
│   │   ├── WelcomeNotification.php
│   │   ├── PasswordChanged.php
│   │   ├── TwoFactorEnabled.php
│   │   └── UserRoleChanged.php
│   └── Discrepancy/
│       └── CriticalDiscrepancy.php
├── Http/Controllers/
│   └── NotificationController.php
├── Models/
│   └── UserNotificationPreference.php
└── Observers/
    ├── ProductObserver.php (updated)
    ├── StockAuditObserver.php (new)
    └── StockCountObserver.php (new)

database/
└── migrations/
    ├── xxxx_create_notifications_table.php (Laravel default)
    └── xxxx_create_user_notification_preferences_table.php

resources/
├── js/
│   ├── components/
│   │   ├── notifications-dropdown.tsx
│   │   ├── notification-item.tsx
│   │   └── notification-preferences.tsx
│   └── pages/
│       └── settings/
│           └── notifications.tsx
└── views/
    └── emails/
        └── notifications/
            ├── low-stock-alert.blade.php
            ├── audit-assigned.blade.php
            ├── import-completed.blade.php
            └── ... (outros templates)

routes/
└── notifications.php (new)
```

## Migrations

### 1. Notifications Table
Laravel já inclui o Notifiable trait, mas precisamos rodar a migration:
```bash
php artisan notifications:table
php artisan migrate
```

### 2. User Notification Preferences Table
```php
Schema::create('user_notification_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('notification_type'); // 'low_stock', 'audit', 'import', etc.
    $table->boolean('email_enabled')->default(true);
    $table->boolean('database_enabled')->default(true);
    $table->json('settings')->nullable(); // Configurações extras
    $table->timestamps();

    $table->unique(['user_id', 'notification_type']);
});
```

## Rotas

### API Endpoints
```php
// routes/notifications.php
Route::middleware(['auth'])->group(function () {
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']); // Listar
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']); // Contador
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']); // Marcar como lida
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']); // Todas como lidas
        Route::delete('/{id}', [NotificationController::class, 'destroy']); // Deletar
    });

    Route::prefix('notification-preferences')->group(function () {
        Route::get('/', [NotificationPreferenceController::class, 'index']);
        Route::put('/', [NotificationPreferenceController::class, 'update']);
    });
});
```

## Componentes Frontend

### 1. Notifications Dropdown
Ícone de sino no header com dropdown de notificações

### 2. Notification Item
Componente individual para cada notificação

### 3. Notification Preferences
Página de configurações de preferências de notificações

## Triggers de Notificação

### Observers
```php
// ProductObserver - Estoque Baixo
public function updated(Product $product)
{
    if ($this->isStockLow($product)) {
        $this->notifyLowStock($product);
    }
}

// StockCountObserver - Contagem Concluída
public function updated(StockCount $count)
{
    if ($count->wasChanged('status') && $count->status === 'completed') {
        $count->stockAudit->responsible->notify(
            new CountCompleted($count)
        );
    }
}
```

### Controllers
```php
// StockCountImportController - Importação Concluída
public function store(Request $request)
{
    // ... processar importação

    $user->notify(new ImportCompleted($import));
}
```

### Commands (Agendados)
```php
// app/Console/Commands/CheckLowStock.php
php artisan schedule:run
// Verifica estoque baixo diariamente
```

## Preferências Padrão

Quando um usuário é criado, criar preferências com valores padrão:

```php
UserNotificationPreference::create([
    'user_id' => $user->id,
    'notification_type' => 'low_stock',
    'email_enabled' => true,
    'database_enabled' => true,
]);
```

## Templates de E-mail

### Layout Base
```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        /* Estilos responsivos */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>InMyStock</h1>
        </div>

        <div class="content">
            @yield('content')
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} InMyStock. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
```

## Testes

### Unit Tests
- `LowStockAlertTest` - Testa notificação de estoque baixo
- `AuditAssignedTest` - Testa notificação de auditoria atribuída

### Feature Tests
- `NotificationControllerTest` - Testa endpoints de notificações
- `NotificationPreferenceTest` - Testa preferências

## Comandos Artisan

### Enviar notificações de teste
```bash
php artisan notify:test user@example.com --type=low_stock
```

### Limpar notificações antigas
```bash
php artisan notifications:clean --days=30
```

## Integração com Jobs (Fase 2)

Quando jobs assíncronos forem implementados:
```php
// Processar notificações em fila
dispatch(new SendNotificationJob($user, $notification));
```

## Configuração

### config/notifications.php (novo)
```php
return [
    'channels' => [
        'database' => true,
        'mail' => env('NOTIFICATION_MAIL_ENABLED', true),
        'broadcast' => env('NOTIFICATION_BROADCAST_ENABLED', false),
    ],

    'defaults' => [
        'low_stock_threshold_percentage' => 20, // 20% do estoque mínimo
        'audit_due_reminder_days' => 3, // Avisar 3 dias antes
        'critical_discrepancy_percentage' => 10, // 10% de divergência
    ],

    'retention' => [
        'read_days' => 30, // Manter lidas por 30 dias
        'unread_days' => 90, // Manter não lidas por 90 dias
    ],
];
```

## Fases de Implementação

### Fase 1 (Semana 1)
- ✅ Migration de notificações
- ✅ Migration de preferências
- ✅ Notificações básicas (Low Stock, Audit, Import)
- ✅ Controller de notificações
- ✅ Rotas

### Fase 2 (Semana 2)
- ✅ Templates de e-mail
- ✅ Frontend (dropdown, componentes)
- ✅ Página de preferências
- ✅ Observers e triggers

### Fase 3 (Opcional)
- Real-time com WebSockets (Laravel Echo + Pusher/Soketi)
- Notificações push (PWA)
- Agrupamento de notificações
- Resumo diário/semanal por e-mail

## Métricas de Sucesso

- Taxa de abertura de notificações > 70%
- Taxa de cliques em ações > 40%
- Redução de 50% em estoque crítico não identificado
- Alertas enviados em < 5 minutos do evento
