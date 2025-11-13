# Sistema de Notificações - InMyStock

## Status da Implementação

### ✅ **Fase 1 Completa** (Backend)

O sistema de notificações backend está **100% implementado e funcional**.

---

## 📦 O Que Foi Implementado

### 1. Migrations (2 arquivos)

- **`create_notifications_table.php`** - Tabela Laravel padrão para notificações
- **`create_user_notification_preferences_table.php`** - Preferências de notificação por usuário

### 2. Models (1 arquivo)

- **`UserNotificationPreference.php`**
  - 5 tipos de notificação: `low_stock`, `audit`, `import`, `system`, `discrepancy`
  - Preferências padrão configuráveis
  - Métodos helper para verificar canais habilitados
  - Auto-criação de preferências para novos usuários

### 3. Notificações (8 classes)

#### Estoque (`app/Notifications/Stock/`)
- ✅ **`LowStockAlert`** - Alerta de estoque baixo

#### Auditoria (`app/Notifications/Audit/`)
- ✅ **`AuditAssigned`** - Auditoria atribuída ao responsável
- ✅ **`AuditCompleted`** - Auditoria concluída
- ✅ **`CountCompleted`** - Contagem concluída

#### Importação (`app/Notifications/Import/`)
- ✅ **`ImportCompleted`** - Importação CSV concluída com sucesso
- ✅ **`ImportFailed`** - Importação CSV falhou

#### Sistema (`app/Notifications/System/`)
- ✅ **`WelcomeNotification`** - Boas-vindas a novos usuários

#### Divergências (`app/Notifications/Discrepancy/`)
- ✅ **`CriticalDiscrepancy`** - Divergência crítica detectada em contagem

**Todas** as notificações suportam:
- ✅ E-mail (com templates HTML formatados)
- ✅ Database (notificações in-app)
- ✅ Respeito às preferências do usuário
- ✅ Fila (implementam `ShouldQueue` para processamento assíncrono)

### 4. Controllers (2 arquivos)

#### `NotificationController`
- `index()` - Listar notificações com filtros
- `unreadCount()` - Contador de não lidas
- `latest()` - Últimas 10 não lidas
- `markAsRead()` - Marcar como lida
- `markAllAsRead()` - Marcar todas como lidas
- `destroy()` - Deletar notificação
- `destroyAllRead()` - Deletar todas lidas

#### `NotificationPreferenceController`
- `index()` - Listar preferências do usuário
- `update()` - Atualizar múltiplas preferências
- `updateSingle()` - Atualizar uma preferência específica

### 5. Rotas (`routes/notifications.php`)

```php
GET    /notifications                          → index
GET    /notifications/latest                   → latest (10 mais recentes)
GET    /notifications/unread-count             → unreadCount
POST   /notifications/{id}/read                → markAsRead
POST   /notifications/mark-all-read            → markAllAsRead
DELETE /notifications/{id}                     → destroy
DELETE /notifications/read/all                 → destroyAllRead

GET    /notification-preferences               → index
PUT    /notification-preferences               → update (múltiplas)
PUT    /notification-preferences/{type}        → updateSingle
```

### 6. Observers (3 arquivos)

#### `InventoryLevelObserver`
- Monitora mudanças no estoque
- Dispara `LowStockAlert` quando estoque < mínimo
- Respeita threshold configurado por usuário
- Notifica apenas admins, gerentes e auditores

#### `StockAuditObserver`
- Dispara `AuditAssigned` quando auditoria é criada ou responsável muda
- Dispara `AuditCompleted` quando auditoria é concluída

#### `StockCountObserver`
- Dispara `CountCompleted` quando contagem é concluída
- Calcula divergências automaticamente
- Dispara `CriticalDiscrepancy` para divergências > 10%

### 7. Integrações

- ✅ **User Model** - Adicionada relação `notificationPreferences()`
- ✅ **User Model** - Hook `created()` cria preferências padrão
- ✅ **AppServiceProvider** - Observers registrados
- ✅ **HandleInertiaRequests** - Compartilha `unread_count` com frontend
- ✅ **Bootstrap** - Rotas de notificações registradas

### 8. Seeder

- **`NotificationPreferenceSeeder`** - Cria preferências para usuários existentes

---

## 🚀 Como Usar

### Enviar uma Notificação Manualmente

```php
use App\Notifications\Stock\LowStockAlert;

$user->notify(new LowStockAlert($product, $currentStock, $minStock));
```

### Verificar Preferências do Usuário

```php
$preference = $user->notificationPreferences()
    ->where('notification_type', UserNotificationPreference::TYPE_LOW_STOCK)
    ->first();

if ($preference->isEmailEnabled()) {
    // Enviar e-mail
}
```

### Obter Notificações Não Lidas

```php
$unread = $user->unreadNotifications;
$count = $user->unreadNotifications()->count();
```

### Marcar Como Lida

```php
$notification = $user->notifications()->find($id);
$notification->markAsRead();

// Ou todas
$user->unreadNotifications->markAsRead();
```

---

## 📧 Canais Disponíveis

### 1. Database (In-App)
- Notificações armazenadas na tabela `notifications`
- Acessíveis via `$user->notifications`
- Suportam lida/não lida
- Podem ser deletadas

### 2. Email
- Templates HTML formatados
- Suporte a ações (botões)
- Personalizados por tipo de notificação
- Respeitam preferências do usuário

### 3. Queue (Assíncrono)
- Todas as notificações implementam `ShouldQueue`
- Processamento em background quando jobs estiverem configurados
- Não bloqueia a resposta HTTP

---

## ⚙️ Configuração

### Criar Preferências para Usuários Existentes

```bash
php artisan db:seed --class=NotificationPreferenceSeeder
```

### Rodar Migrations

```bash
php artisan migrate
```

### Configurar Filas (Opcional)

No `.env`:
```env
QUEUE_CONNECTION=database
```

Depois:
```bash
php artisan queue:table
php artisan migrate
php artisan queue:work
```

---

## 🎯 Triggers Automáticos

As notificações são enviadas automaticamente nos seguintes eventos:

| Evento | Notificação | Destinatários |
|--------|-------------|---------------|
| Estoque cai abaixo do mínimo | `LowStockAlert` | Admins, Gerentes, Auditores |
| Auditoria criada | `AuditAssigned` | Responsável pela auditoria |
| Responsável de auditoria muda | `AuditAssigned` | Novo responsável |
| Auditoria concluída | `AuditCompleted` | Responsável pela auditoria |
| Contagem concluída | `CountCompleted` | Responsável pela auditoria |
| Divergência > 10% detectada | `CriticalDiscrepancy` | Responsável pela auditoria |
| Usuário criado | `WelcomeNotification` | Novo usuário |
| Importação concluída | `ImportCompleted` | Usuário que iniciou importação |
| Importação falhou | `ImportFailed` | Usuário que iniciou importação |

---

## 🔧 Tipos de Notificação e Preferências

### Tipos Disponíveis

1. **`low_stock`** - Estoque Baixo
   - Threshold padrão: 20% abaixo do mínimo
   - E-mail: Habilitado por padrão
   - Database: Habilitado por padrão

2. **`audit`** - Auditorias
   - Lembrete: 3 dias antes do prazo
   - E-mail: Habilitado por padrão
   - Database: Habilitado por padrão

3. **`import`** - Importações
   - Notifica conclusão e falhas
   - E-mail: Habilitado por padrão
   - Database: Habilitado por padrão

4. **`system`** - Sistema
   - Boas-vindas, alterações de conta
   - E-mail: **Desabilitado** por padrão
   - Database: Habilitado por padrão

5. **`discrepancy`** - Divergências Críticas
   - Threshold padrão: Divergências > 10%
   - E-mail: Habilitado por padrão
   - Database: Habilitado por padrão

### Personalizar Preferências

```php
$preference->update([
    'email_enabled' => false, // Desabilitar e-mail
    'database_enabled' => true, // Manter in-app
    'settings' => [
        'threshold_percentage' => 15, // Customizar threshold
    ],
]);
```

---

## 📊 Endpoints da API

### Listar Notificações
```
GET /notifications?filter=unread&type=low_stock
```

### Contador de Não Lidas
```
GET /notifications/unread-count

Response: { "count": 5 }
```

### Últimas Notificações
```
GET /notifications/latest

Response: { "notifications": [...] }
```

### Marcar Como Lida
```
POST /notifications/{id}/read

Response: { "message": "Notificação marcada como lida." }
```

### Marcar Todas Como Lidas
```
POST /notifications/mark-all-read

Response: { "message": "Todas as notificações foram marcadas como lidas." }
```

### Deletar Notificação
```
DELETE /notifications/{id}

Response: { "message": "Notificação excluída com sucesso." }
```

### Deletar Todas Lidas
```
DELETE /notifications/read/all

Response: { "message": "10 notificações lidas foram excluídas.", "count": 10 }
```

---

## 📝 Estrutura de Dados

### Notificação (Database)

```json
{
  "id": "uuid",
  "type": "App\\Notifications\\Stock\\LowStockAlert",
  "data": {
    "type": "low_stock",
    "product_id": 123,
    "product_code": "PROD-0001",
    "product_name": "Produto Exemplo",
    "current_stock": 5,
    "min_stock": 10,
    "unit": "UN",
    "message": "Produto Exemplo está com estoque baixo (5 UN)",
    "action_url": "/products?search=PROD-0001"
  },
  "read_at": null,
  "created_at": "2025-11-06T10:30:00Z"
}
```

### Preferência de Notificação

```json
{
  "id": 1,
  "user_id": 1,
  "notification_type": "low_stock",
  "email_enabled": true,
  "database_enabled": true,
  "settings": {
    "threshold_percentage": 20
  },
  "created_at": "2025-11-06T10:00:00Z",
  "updated_at": "2025-11-06T10:00:00Z"
}
```

---

## 🔄 Próximos Passos (Fase 2)

### Frontend (Pendente)

1. **Componente NotificationDropdown**
   - Ícone de sino no header
   - Badge com contador de não lidas
   - Dropdown com últimas 10 notificações
   - Botão "Marcar todas como lidas"
   - Link para página completa

2. **Página de Notificações** (`/notifications`)
   - Lista paginada de todas as notificações
   - Filtros: lida/não lida, por tipo
   - Ações: marcar como lida, deletar
   - Cards formatados por tipo de notificação

3. **Página de Preferências** (`/notification-preferences`)
   - Toggle para habilitar/desabilitar e-mail/database
   - Configurações personalizadas por tipo
   - Salvar preferências via API

4. **Real-time** (Opcional)
   - Laravel Echo + Pusher/Soketi
   - Notificações em tempo real sem refresh
   - Contador atualizado automaticamente

5. **PWA Push Notifications** (Opcional)
   - Service Worker
   - Push notifications no navegador
   - Notificações mesmo com app fechado

---

## 🧪 Testando

### Testar Notificação de Estoque Baixo

```bash
# No tinker
php artisan tinker

$user = User::find(1);
$product = Product::first();
$user->notify(new \App\Notifications\Stock\LowStockAlert($product, 5, 10));

# Verificar
$user->unreadNotifications;
```

### Testar Preferências

```bash
php artisan tinker

$user = User::find(1);
$user->notificationPreferences;

# Atualizar
$pref = $user->notificationPreferences()->where('notification_type', 'low_stock')->first();
$pref->update(['email_enabled' => false]);
```

---

## 📚 Documentação Adicional

- [Plano Completo](./NOTIFICATION_SYSTEM_PLAN.md) - Arquitetura detalhada
- [Laravel Notifications](https://laravel.com/docs/notifications) - Documentação oficial

---

## ✅ Checklist de Implementação

### Backend (Fase 1) - ✅ **COMPLETO**
- [x] Migrations
- [x] Models
- [x] 8 Classes de Notificação
- [x] 2 Controllers
- [x] Rotas
- [x] 3 Observers
- [x] Integração com User
- [x] Middleware Inertia
- [x] Seeder
- [x] Documentação

### Frontend (Fase 2) - ⏳ **PENDENTE**
- [ ] NotificationDropdown component
- [ ] Notifications index page
- [ ] Notification preferences page
- [ ] Types definitions
- [ ] API integration
- [ ] Real-time (opcional)

---

**Implementado por:** Claude (Anthropic)
**Data:** 06/11/2025
**Versão:** 1.0 (Backend completo)
