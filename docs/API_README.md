# API REST Externa - InMyStock

## Status da Implementação

### ✅ **Fase 1 Completa** (Core Infrastructure)

O sistema de API REST está **implementado e pronto para uso** com autenticação Sanctum, versionamento, rate limiting e documentação completa.

---

## 📦 O Que Foi Implementado

### 1. Laravel Sanctum

- ✅ **Instalado e configurado** - Autenticação via tokens de API
- ✅ **Expiração de tokens**: 30 dias (configurável via `.env`)
- ✅ **Múltiplos tokens por usuário** com nomes descritivos
- ✅ **Abilities/Scopes** baseados em permissões do usuário
- ✅ **Revogação de tokens** individual ou em massa

### 2. Infraestrutura (Trait + Middlewares)

#### `ApiResponses` Trait (`app/Traits/ApiResponses.php`)

Trait reutilizável para responses padronizadas em todos controllers:

**Métodos disponíveis:**
- `successResponse()` - Response de sucesso (200)
- `createdResponse()` - Resource criado (201)
- `noContentResponse()` - Sem conteúdo (204)
- `errorResponse()` - Erro genérico
- `validationErrorResponse()` - Erro de validação (422)
- `notFoundResponse()` - Resource não encontrado (404)
- `unauthorizedResponse()` - Não autorizado (401)
- `forbiddenResponse()` - Sem permissão (403)
- `rateLimitResponse()` - Rate limit excedido (429)
- `serverErrorResponse()` - Erro do servidor (500)

#### `EnsureJsonResponse` Middleware

- Garante que todas responses da API sejam JSON
- Define automaticamente `Accept: application/json`
- Define `Content-Type: application/json` em responses

#### `AddRequestId` Middleware

- Adiciona ID único para cada requisição
- Header: `X-Request-ID`
- Útil para tracking e logs

#### `ForceHttps` Middleware

- Força HTTPS em produção
- Adiciona header `Strict-Transport-Security` (HSTS)
- Retorna 426 (Upgrade Required) se HTTP em produção

### 3. Controllers

#### `AuthController` (`app/Http/Controllers/Api/V1/AuthController.php`)

**Endpoints implementados:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login e obter token |
| POST | `/api/v1/auth/logout` | Revogar token atual |
| GET | `/api/v1/auth/me` | Dados do usuário autenticado |
| GET | `/api/v1/auth/tokens` | Listar todos tokens do usuário |
| DELETE | `/api/v1/auth/tokens/{id}` | Revogar token específico |
| DELETE | `/api/v1/auth/tokens` | Revogar todos exceto atual |

**Abilities gerados automaticamente:**
- `inventory:read` / `inventory:write`
- `products:read` / `products:write`
- `audits:read` / `audits:write`
- `reports:read`
- `admin:all` (apenas para admins)

### 4. Resources

#### `UserResource` (`app/Http/Resources/Api/V1/UserResource.php`)

Transforma dados do usuário para API:
- Remove dados sensíveis (password, tokens 2FA)
- Inclui role e permissions
- Inclui company (se carregado)
- Timestamps em formato ISO 8601

### 5. Rotas (`routes/api.php`)

**Estrutura:**
```
/api/v1/
  ├── /auth
  │   ├── POST /login (público, rate limit: 10/min)
  │   ├── POST /logout (protegido)
  │   ├── GET /me (protegido)
  │   ├── GET /tokens (protegido)
  │   ├── DELETE /tokens/{id} (protegido)
  │   └── DELETE /tokens (protegido)
  │
  ├── /products (placeholders para Fase 2)
  ├── /inventory (placeholders para Fase 2)
  ├── /movements (placeholders para Fase 2)
  ├── /audits (placeholders para Fase 3)
  ├── /counts (placeholders para Fase 3)
  └── /reports (placeholders para Fase 4)
```

**Middlewares aplicados:**
- `EnsureJsonResponse` - Garante responses JSON
- `AddRequestId` - Adiciona request ID
- `ForceHttps` - Força HTTPS em produção
- `throttle:120,1` - Rate limit de 120 req/min (autenticados)
- `throttle:10,1` - Rate limit de 10 req/min (login)

### 6. Configuração

#### `config/sanctum.php`
- Token expiration: 30 dias (43200 minutos)
- Token prefix: configurável via `SANCTUM_TOKEN_PREFIX`

#### `config/cors.php`
- Origins permitidos: configurável via `.env`
- Methods: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- Exposed headers: `X-Request-ID`, `X-RateLimit-*`
- Max age: 24 horas

---

## 🚀 Como Usar a API

### 1. Autenticação

#### Obter Token

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "token_name": "My Integration Token" // opcional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123xyz789...",
    "token_type": "Bearer",
    "expires_at": "2025-12-13T10:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "company_id": 1,
      "is_active": true,
      "role": {
        "id": 1,
        "name": "Gerente",
        "slug": "manager",
        "level": 75,
        "permissions": ["inventory.view", "inventory.edit", ...]
      }
    },
    "abilities": [
      "inventory:read",
      "inventory:write",
      "products:read",
      "products:write",
      "reports:read"
    ]
  },
  "message": "Authentication successful"
}
```

**Errors:**

```json
// Credenciais inválidas (401)
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  },
  "meta": {
    "timestamp": "2025-11-13T10:30:00Z",
    "request_id": "req_abc123xyz"
  }
}

// Conta desativada (403)
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Your account has been deactivated"
  }
}

// Validação falhou (422)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid",
    "details": {
      "email": ["The email field is required."]
    }
  }
}
```

---

### 2. Usando o Token

Todas as requisições autenticadas devem incluir o token no header `Authorization`:

```bash
GET /api/v1/auth/me
Authorization: Bearer 1|abc123xyz789...
Accept: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "company_id": 1,
    "is_active": true,
    "email_verified_at": "2025-01-15T10:00:00Z",
    "two_factor_enabled": false,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-11-13T10:30:00Z",
    "role": {
      "id": 2,
      "name": "Gerente",
      "slug": "manager",
      "level": 75,
      "permissions": ["inventory.view", "inventory.edit", ...]
    }
  }
}
```

---

### 3. Gerenciar Tokens

#### Listar Tokens

```bash
GET /api/v1/auth/tokens
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Integration Token",
      "abilities": ["inventory:read", "inventory:write"],
      "last_used_at": "2025-11-13T10:30:00Z",
      "created_at": "2025-11-01T00:00:00Z",
      "expires_at": "2025-12-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Mobile App Token",
      "abilities": ["*"],
      "last_used_at": null,
      "created_at": "2025-11-10T00:00:00Z",
      "expires_at": "2025-12-10T00:00:00Z"
    }
  ]
}
```

#### Revogar Token Específico

```bash
DELETE /api/v1/auth/tokens/2
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Token revoked successfully"
}
```

#### Revogar Todos Exceto o Atual

```bash
DELETE /api/v1/auth/tokens
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revoked_count": 3
  },
  "message": "All other tokens revoked successfully"
}
```

#### Logout (Revogar Token Atual)

```bash
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Token revoked successfully"
}
```

---

## 📊 Rate Limiting

A API possui rate limiting para prevenir abuso:

| Endpoint | Limite |
|----------|--------|
| `/auth/login` | 10 req/min |
| Outros endpoints (autenticados) | 120 req/min |

**Headers de Response:**
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1699876800
```

**Response ao exceder limite (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60
    }
  },
  "meta": {
    "timestamp": "2025-11-13T10:30:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente (`.env`)

```env
# API Configuration
SANCTUM_TOKEN_EXPIRATION=43200  # 30 dias em minutos
SANCTUM_TOKEN_PREFIX=           # Opcional: prefixo para tokens

# CORS Configuration
API_CORS_ALLOWED_ORIGINS=https://erp.example.com,https://app.example.com
# Use "*" para permitir todos (não recomendado em produção)

# Throttling (opcional - padrão: 120/min)
API_THROTTLE_LIMIT=120
API_THROTTLE_LOGIN_LIMIT=10
```

### Configurar CORS

Edite `config/cors.php` se precisar de mais controle:

```php
'allowed_origins' => ['https://specific-domain.com'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'exposed_headers' => ['X-Request-ID', 'X-RateLimit-Limit'],
```

---

## 🧪 Testando a API

### cURL

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "admin@inmystock.com",
    "password": "password"
  }'

# Usar token
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer 1|abc123xyz..." \
  -H "Accept: application/json"
```

### Postman

1. **Import Collection**: (em breve - ver Fase 5)
2. **Configurar Environment:**
   - `base_url`: `http://localhost:8000`
   - `token`: (deixar vazio, será preenchido após login)

3. **Login:**
   - POST `{{base_url}}/api/v1/auth/login`
   - Body: `{ "email": "...", "password": "..." }`
   - Test Script: `pm.environment.set("token", pm.response.json().data.token);`

4. **Usar Token:**
   - GET `{{base_url}}/api/v1/auth/me`
   - Header: `Authorization: Bearer {{token}}`

### JavaScript (Fetch)

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const { data } = await loginResponse.json();
const token = data.token;

// Usar token
const userResponse = await fetch('http://localhost:8000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
});

const userData = await userResponse.json();
console.log(userData.data);
```

### PHP (Guzzle)

```php
use GuzzleHttp\Client;

$client = new Client(['base_uri' => 'http://localhost:8000/api/v1/']);

// Login
$response = $client->post('auth/login', [
    'json' => [
        'email' => 'user@example.com',
        'password' => 'password123',
    ],
]);

$data = json_decode($response->getBody(), true);
$token = $data['data']['token'];

// Usar token
$response = $client->get('auth/me', [
    'headers' => [
        'Authorization' => "Bearer {$token}",
        'Accept' => 'application/json',
    ],
]);

$user = json_decode($response->getBody(), true);
print_r($user['data']);
```

### Python (Requests)

```python
import requests

base_url = 'http://localhost:8000/api/v1'

# Login
response = requests.post(f'{base_url}/auth/login', json={
    'email': 'user@example.com',
    'password': 'password123'
})

data = response.json()
token = data['data']['token']

# Usar token
headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json'
}

response = requests.get(f'{base_url}/auth/me', headers=headers)
user = response.json()
print(user['data'])
```

---

## 🔒 Segurança

### Boas Práticas

1. **HTTPS Obrigatório em Produção**
   - O middleware `ForceHttps` garante isso
   - Tokens nunca devem ser enviados via HTTP

2. **Armazenar Tokens com Segurança**
   - Backend: Variáveis de ambiente seguras
   - Frontend: localStorage/sessionStorage (não cookies)
   - Mobile: Keychain (iOS) ou Keystore (Android)

3. **Revogar Tokens Comprometidos**
   - DELETE `/api/v1/auth/tokens/{id}`
   - Ou revogar todos: DELETE `/api/v1/auth/tokens`

4. **Monitorar Uso de Tokens**
   - Verifique `last_used_at` regularmente
   - Remova tokens não usados há muito tempo

5. **Usar Abilities Mínimos**
   - Não use `['*']` em produção
   - Especifique apenas o necessário: `['inventory:read', 'products:read']`

6. **Rate Limiting**
   - Respeite os limites da API
   - Implemente backoff exponencial em caso de 429

---

## 📈 Próximas Fases

### Fase 2: Core Resource APIs ⏳ PENDENTE

**Prioridade:** ALTA

- [ ] Products API (CRUD completo)
- [ ] Inventory Levels API (list, adjust, transfer)
- [ ] Inventory Movements API (list, create, history)

**Estimativa:** 1-2 semanas

---

### Fase 3: Audit & Count APIs ⏳ PENDENTE

**Prioridade:** MÉDIA

- [ ] Stock Audits API (CRUD, complete, discrepancies)
- [ ] Stock Counts API (CRUD, add items, import CSV)

**Estimativa:** 1 semana

---

### Fase 4: Reports API ⏳ PENDENTE

**Prioridade:** MÉDIA

- [ ] Inventory Valuation Report
- [ ] Stock Movement Report
- [ ] Audit Summary Report
- [ ] ABC Analysis Report

**Estimativa:** 1 semana

---

### Fase 5: Documentation ⏳ PENDENTE

**Prioridade:** ALTA

- [ ] OpenAPI/Swagger specification
- [ ] Interactive documentation (Swagger UI)
- [ ] Postman collection
- [ ] Code examples for common use cases

**Estimativa:** 2-3 dias

---

### Fase 6: Frontend Token Management ⏳ PENDENTE

**Prioridade:** BAIXA

- [ ] Página `/settings/api-tokens`
- [ ] Criar novo token com nome e abilities
- [ ] Listar tokens existentes
- [ ] Revogar tokens
- [ ] Copiar token (mostrar apenas 1x)

**Estimativa:** 1-2 dias

---

## 🐛 Troubleshooting

### Erro: "Unauthenticated"

**Causa:** Token ausente, inválido ou expirado

**Solução:**
1. Verifique se o header `Authorization` está presente
2. Verifique se o formato é `Bearer {token}`
3. Verifique se o token não expirou (GET `/auth/tokens`)
4. Faça login novamente se necessário

---

### Erro: "HTTPS_REQUIRED" (426)

**Causa:** Tentando usar HTTP em produção

**Solução:**
- Use HTTPS em produção
- Em desenvolvimento, defina `APP_ENV=local` no `.env`

---

### Erro: "RATE_LIMIT_EXCEEDED" (429)

**Causa:** Muitas requisições em pouco tempo

**Solução:**
- Aguarde `retry_after` segundos (fornecido na response)
- Implemente backoff exponencial
- Considere cachear responses quando possível

---

### Erro: "CORS Policy"

**Causa:** Domínio não autorizado em CORS

**Solução:**
1. Adicione seu domínio em `API_CORS_ALLOWED_ORIGINS` no `.env`
2. Ou configure `config/cors.php` manualmente
3. Reinicie o servidor após mudanças

---

### Migração não rodou (personal_access_tokens)

**Causa:** Database não configurado ou em produção sem `--force`

**Solução:**
```bash
# Desenvolvimento
php artisan migrate

# Produção
php artisan migrate --force
```

---

## 📝 Changelog

### v1.0 - 13/11/2025 ✅ COMPLETO

**Infraestrutura:**
- ✅ Laravel Sanctum instalado e configurado
- ✅ Trait ApiResponses criado
- ✅ Middlewares criados (EnsureJsonResponse, AddRequestId, ForceHttps)
- ✅ CORS configurado
- ✅ Rate limiting configurado

**Autenticação:**
- ✅ AuthController completo
- ✅ Login e obter token
- ✅ Logout e revogar tokens
- ✅ Listar tokens do usuário
- ✅ Abilities automáticos baseados em permissões
- ✅ UserResource para transformação de dados

**Rotas:**
- ✅ API v1 estruturado com versionamento
- ✅ Placeholders para endpoints futuros

**Documentação:**
- ✅ API_SYSTEM_PLAN.md (arquitetura completa)
- ✅ API_README.md (guia de uso)

---

**Autor:** Claude (Anthropic)
**Data:** 13/11/2025
**Versão:** 1.0 - Core Infrastructure
**Status:** ✅ PRONTO PARA USO
