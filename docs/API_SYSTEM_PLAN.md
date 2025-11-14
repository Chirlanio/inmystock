# Sistema de API REST Externa - InMyStock

## Visão Geral

Sistema de API REST completo para permitir integrações externas com o InMyStock, seguindo padrões RESTful, versionamento de API, autenticação via tokens (Laravel Sanctum), controle de acesso baseado em permissões, rate limiting e documentação completa.

---

## Objetivos

1. **Permitir integrações externas** com sistemas ERP, WMS, e-commerce, etc.
2. **Autenticação segura** via tokens de API (Laravel Sanctum)
3. **Controle de acesso granular** baseado em permissões de usuário
4. **Versionamento de API** para garantir compatibilidade futura
5. **Rate limiting** para prevenir abuso
6. **Documentação completa** com OpenAPI/Swagger
7. **Responses padronizadas** com código HTTP apropriado

---

## Arquitetura

### 1. Autenticação - Laravel Sanctum

**Por que Sanctum?**
- Tokens de API leves e seguros
- Suporte a múltiplos tokens por usuário
- Revogação granular de tokens
- Nativo do Laravel (sem dependências externas pesadas)

**Fluxo de Autenticação:**
```
1. Cliente solicita token em POST /api/v1/auth/login
   Body: { email, password }

2. Servidor valida credenciais

3. Servidor gera token Sanctum e retorna
   Response: { token, expires_at, user }

4. Cliente usa token em todas requisições
   Header: Authorization: Bearer {token}

5. Cliente pode revogar token em POST /api/v1/auth/logout
```

**Abilities (Scopes):**
- `inventory:read` - Ler dados de inventário
- `inventory:write` - Criar/atualizar inventário
- `products:read` - Ler produtos
- `products:write` - Criar/atualizar produtos
- `audits:read` - Ler auditorias
- `audits:write` - Criar/atualizar auditorias
- `reports:read` - Gerar relatórios
- `admin:all` - Acesso administrativo completo

---

### 2. Versionamento

**Estratégia:** URL-based versioning

**Estrutura:**
```
/api/v1/...  (versão atual)
/api/v2/...  (futura, se necessário)
```

**Por que URL-based?**
- Mais explícito e fácil de entender
- Permite cache de versões diferentes
- Facilita testes e documentação

---

### 3. Endpoints Principais

#### Authentication (`/api/v1/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/login` | Obter token de acesso | Não |
| POST | `/logout` | Revogar token atual | Sim |
| GET | `/me` | Dados do usuário autenticado | Sim |
| GET | `/tokens` | Listar tokens do usuário | Sim |
| DELETE | `/tokens/{id}` | Revogar token específico | Sim |

#### Products (`/api/v1/products`)

| Método | Endpoint | Descrição | Ability |
|--------|----------|-----------|---------|
| GET | `/` | Listar produtos (paginado) | `products:read` |
| GET | `/{id}` | Detalhes de produto | `products:read` |
| POST | `/` | Criar produto | `products:write` |
| PUT | `/{id}` | Atualizar produto | `products:write` |
| DELETE | `/{id}` | Deletar produto | `products:write` |
| GET | `/{id}/inventory` | Níveis de estoque | `inventory:read` |

#### Inventory Levels (`/api/v1/inventory`)

| Método | Endpoint | Descrição | Ability |
|--------|----------|-----------|---------|
| GET | `/` | Listar níveis (paginado) | `inventory:read` |
| GET | `/{id}` | Detalhes de nível | `inventory:read` |
| POST | `/adjust` | Ajustar estoque | `inventory:write` |
| POST | `/transfer` | Transferir estoque | `inventory:write` |
| GET | `/low-stock` | Produtos com estoque baixo | `inventory:read` |

#### Inventory Movements (`/api/v1/movements`)

| Método | Endpoint | Descrição | Ability |
|--------|----------|-----------|---------|
| GET | `/` | Listar movimentações | `inventory:read` |
| GET | `/{id}` | Detalhes de movimentação | `inventory:read` |
| POST | `/` | Criar movimentação | `inventory:write` |
| GET | `/product/{id}` | Movimentações de produto | `inventory:read` |

#### Stock Audits (`/api/v1/audits`)

| Método | Endpoint | Descrição | Ability |
|--------|----------|-----------|---------|
| GET | `/` | Listar auditorias | `audits:read` |
| GET | `/{id}` | Detalhes de auditoria | `audits:read` |
| POST | `/` | Criar auditoria | `audits:write` |
| PUT | `/{id}` | Atualizar auditoria | `audits:write` |
| POST | `/{id}/complete` | Concluir auditoria | `audits:write` |
| GET | `/{id}/discrepancies` | Ver divergências | `audits:read` |

#### Stock Counts (`/api/v1/counts`)

| Método | Endpoint | Descrição | Ability |
|--------|----------|-----------|---------|
| GET | `/` | Listar contagens | `audits:read` |
| GET | `/{id}` | Detalhes de contagem | `audits:read` |
| POST | `/` | Criar contagem | `audits:write` |
| PUT | `/{id}` | Atualizar contagem | `audits:write` |
| POST | `/{id}/items` | Adicionar itens | `audits:write` |

#### Reports (`/api/v1/reports`)

| Método | Endpoint | Descrição | Ability |
|--------|----------|-----------|---------|
| GET | `/inventory-valuation` | Valoração de estoque | `reports:read` |
| GET | `/stock-movement` | Relatório de movimentações | `reports:read` |
| GET | `/audit-summary` | Resumo de auditorias | `reports:read` |
| GET | `/abc-analysis` | Análise ABC | `reports:read` |

---

### 4. Formato de Response

#### Success Response (200-299)

```json
{
  "success": true,
  "data": {
    // Resource data or array of resources
  },
  "message": "Optional success message",
  "meta": {
    // Pagination, timestamps, etc.
    "current_page": 1,
    "per_page": 15,
    "total": 150,
    "last_page": 10
  }
}
```

#### Error Response (400-599)

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested product was not found",
    "details": {
      "product_id": 123
    }
  },
  "meta": {
    "timestamp": "2025-11-13T10:30:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

#### Validation Error (422)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid",
    "details": {
      "name": ["The name field is required."],
      "quantity": ["The quantity must be a number."]
    }
  }
}
```

---

### 5. Status Codes

| Code | Significado | Quando Usar |
|------|-------------|-------------|
| 200 | OK | GET, PUT bem-sucedidos |
| 201 | Created | POST bem-sucedido (recurso criado) |
| 204 | No Content | DELETE bem-sucedido |
| 400 | Bad Request | Requisição malformada |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Token válido mas sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 422 | Unprocessable Entity | Validação falhou |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro do servidor |

---

### 6. Rate Limiting

**Estratégia:** Throttle baseado em token/IP

**Limites:**
- **Authenticated requests**: 120 req/min
- **Unauthenticated requests** (login): 10 req/min
- **Admin users**: 300 req/min

**Headers de Response:**
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1699876800
```

**Response quando excedido (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60
    }
  }
}
```

---

### 7. CORS Configuration

**Permitir:**
- Origins configuráveis via `.env` (default: *)
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: Content-Type, Authorization, X-Requested-With
- Exposed Headers: X-RateLimit-*, X-Request-ID
- Max Age: 86400 (24 horas)

**Variáveis `.env`:**
```env
API_CORS_ALLOWED_ORIGINS=https://erp.example.com,https://app.example.com
API_CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH
```

---

### 8. Segurança

#### Token Management
- Tokens têm expiração configurável (default: 30 dias)
- Usuário pode ter múltiplos tokens (diferentes integrações)
- Cada token pode ter nome descritivo
- Revogação individual ou em massa

#### Permissions
- Tokens herdam permissões do usuário
- Abilities adicionais podem restringir ainda mais
- Admin pode criar tokens com abilities específicos

#### HTTPS Only
- API só aceita requisições HTTPS em produção
- Middleware força HTTPS

#### Request ID
- Cada requisição recebe ID único para tracking
- Incluído em logs e responses
- Header: `X-Request-ID`

---

## Estrutura de Arquivos

```
app/
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── AuthController.php
│   │   ├── ProductController.php
│   │   ├── InventoryLevelController.php
│   │   ├── InventoryMovementController.php
│   │   ├── StockAuditController.php
│   │   ├── StockCountController.php
│   │   └── ReportController.php
│   │
│   ├── Resources/Api/V1/
│   │   ├── ProductResource.php
│   │   ├── ProductCollection.php
│   │   ├── InventoryLevelResource.php
│   │   ├── InventoryMovementResource.php
│   │   ├── StockAuditResource.php
│   │   ├── StockCountResource.php
│   │   └── UserResource.php
│   │
│   ├── Requests/Api/V1/
│   │   ├── LoginRequest.php
│   │   ├── StoreProductRequest.php
│   │   ├── UpdateProductRequest.php
│   │   ├── AdjustInventoryRequest.php
│   │   ├── TransferInventoryRequest.php
│   │   └── ...
│   │
│   └── Middleware/
│       ├── EnsureJsonResponse.php
│       ├── AddRequestId.php
│       └── ForceHttps.php
│
└── Traits/
    └── ApiResponses.php

routes/
└── api.php  (organized with route groups for v1)

config/
├── sanctum.php  (token configuration)
└── cors.php     (CORS settings)

docs/
├── API_SYSTEM_PLAN.md       (este arquivo)
├── API_README.md            (usage guide)
└── api/
    └── openapi.yaml         (OpenAPI/Swagger spec)
```

---

## Implementação

### Fase 1: Core API Infrastructure ✅ PLANEJADO

**Prioridade:** ALTA

**Tarefas:**
1. Instalar e configurar Laravel Sanctum
2. Criar migrations para tokens (se necessário)
3. Criar trait ApiResponses para responses padronizadas
4. Criar middlewares (EnsureJsonResponse, AddRequestId, ForceHttps)
5. Configurar routes/api.php com versionamento
6. Configurar CORS
7. Configurar rate limiting
8. Criar AuthController com login/logout/me/tokens

**Arquivos:**
- `config/sanctum.php`
- `config/cors.php`
- `app/Traits/ApiResponses.php`
- `app/Http/Middleware/EnsureJsonResponse.php`
- `app/Http/Middleware/AddRequestId.php`
- `app/Http/Middleware/ForceHttps.php`
- `app/Http/Controllers/Api/V1/AuthController.php`
- `routes/api.php`
- `.env` (API_* variables)

---

### Fase 2: Core Resource APIs ⏳ PENDENTE

**Prioridade:** ALTA

**Recursos:**
1. Products API
   - CRUD completo
   - Filtros (search, category, status)
   - Include inventory levels

2. Inventory Levels API
   - List with filters (warehouse, product, low stock)
   - Adjust endpoint
   - Transfer endpoint

3. Inventory Movements API
   - List with filters (type, date range, product)
   - Create movement
   - Track history

**Arquivos:**
- Controllers: `ProductController`, `InventoryLevelController`, `InventoryMovementController`
- Resources: `ProductResource`, `InventoryLevelResource`, `InventoryMovementResource`
- Requests: Validation requests for each endpoint
- Tests: Feature tests for each endpoint

---

### Fase 3: Audit & Count APIs ⏳ PENDENTE

**Prioridade:** MÉDIA

**Recursos:**
1. Stock Audits API
   - CRUD audits
   - Complete audit
   - View discrepancies

2. Stock Counts API
   - CRUD counts
   - Add items
   - Import CSV

**Arquivos:**
- Controllers: `StockAuditController`, `StockCountController`
- Resources: `StockAuditResource`, `StockCountResource`, `StockCountItemResource`
- Requests: Validation requests
- Tests: Feature tests

---

### Fase 4: Reports API ⏳ PENDENTE

**Prioridade:** MÉDIA

**Recursos:**
1. Inventory Valuation Report
2. Stock Movement Report
3. Audit Summary Report
4. ABC Analysis Report

**Arquivos:**
- Controller: `ReportController`
- Resources: Report-specific resources
- Tests: Feature tests

---

### Fase 5: Documentation ⏳ PENDENTE

**Prioridade:** ALTA

**Tarefas:**
1. Criar OpenAPI/Swagger specification
2. Gerar documentação interativa (Swagger UI ou similar)
3. Criar README com exemplos de uso
4. Documentar autenticação e errors
5. Criar Postman collection

**Arquivos:**
- `docs/api/openapi.yaml`
- `docs/API_README.md`
- `docs/api/InMyStock.postman_collection.json`
- Public swagger UI (optional)

---

### Fase 6: Token Management UI (Frontend) ⏳ PENDENTE

**Prioridade:** BAIXA

**Tarefas:**
1. Página de gerenciamento de tokens (/settings/api-tokens)
2. Criar novo token (com nome e abilities)
3. Listar tokens existentes
4. Revogar tokens
5. Copiar token recém-criado (mostrar apenas 1x)

**Arquivos:**
- `resources/js/pages/settings/api-tokens/index.tsx`
- `resources/js/pages/settings/api-tokens/create.tsx`
- `app/Http/Controllers/Settings/ApiTokenController.php`
- `routes/settings.php` (add token routes)

---

## Exemplos de Uso

### 1. Autenticação

```bash
# Login e obter token
curl -X POST https://api.inmystock.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
{
  "success": true,
  "data": {
    "token": "1|abc123xyz...",
    "token_type": "Bearer",
    "expires_at": "2025-12-13T10:30:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

### 2. Listar Produtos

```bash
curl -X GET https://api.inmystock.com/api/v1/products?page=1&per_page=20 \
  -H "Authorization: Bearer 1|abc123xyz..." \
  -H "Accept: application/json"

# Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "PROD-0001",
      "name": "Product Name",
      "description": "...",
      "min_stock": 10,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  }
}
```

### 3. Ajustar Estoque

```bash
curl -X POST https://api.inmystock.com/api/v1/inventory/adjust \
  -H "Authorization: Bearer 1|abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "warehouse_id": 1,
    "quantity": 50,
    "type": "adjustment",
    "reason": "Physical count correction",
    "notes": "Found additional units"
  }'

# Response:
{
  "success": true,
  "data": {
    "id": 123,
    "product_id": 1,
    "warehouse_id": 1,
    "type": "adjustment",
    "quantity": 50,
    "balance_after": 150,
    "created_at": "2025-11-13T10:30:00Z"
  },
  "message": "Inventory adjusted successfully"
}
```

---

## Benefícios

### Antes (Sem API)
- ❌ Nenhuma integração externa possível
- ❌ Entrada manual de dados
- ❌ Dados isolados em silos
- ❌ Impossível automatizar processos
- ❌ Dependência de interface web

### Depois (Com API REST)
- ✅ Integração com ERPs, WMS, e-commerce
- ✅ Automação de importação/exportação de dados
- ✅ Sincronização em tempo real
- ✅ Desenvolvimento de apps mobile
- ✅ Webhooks e notificações externas
- ✅ Acesso programático a todos recursos
- ✅ Documentação completa e interativa
- ✅ Rate limiting e segurança robusta

---

## Casos de Uso

### 1. Integração com ERP
**Cenário:** Empresa usa SAP/TOTVS e quer sincronizar produtos e estoque

**Solução:**
- ERP faz GET `/api/v1/products` diariamente para sincronizar catálogo
- ERP faz POST `/api/v1/inventory/adjust` quando estoque muda
- InMyStock envia webhook quando auditoria detecta divergência

### 2. App Mobile de Contagem
**Cenário:** Auditores usam tablets para contagem física

**Solução:**
- App faz GET `/api/v1/audits/{id}` para buscar auditoria
- App faz POST `/api/v1/counts/{id}/items` conforme auditor conta
- App faz POST `/api/v1/audits/{id}/complete` ao finalizar

### 3. E-commerce Sync
**Cenário:** Loja online precisa saber estoque disponível

**Solução:**
- E-commerce faz GET `/api/v1/inventory?warehouse_id=1` a cada venda
- InMyStock retorna estoque atual
- E-commerce previne venda sem estoque

### 4. Dashboard Externo
**Cenário:** CEO quer dashboard executivo em Power BI

**Solução:**
- Power BI conecta via API REST
- Faz GET `/api/v1/reports/inventory-valuation`
- Faz GET `/api/v1/reports/abc-analysis`
- Atualiza dashboards automaticamente

---

## Monitoramento

### Logs
- Todas requisições de API são logadas
- Incluem: request_id, user_id, endpoint, status, duration
- Formato: `storage/logs/api.log`

### Métricas
- Requests por endpoint
- Taxa de erro por endpoint
- Latência média
- Rate limit hits
- Tokens ativos

### Alertas
- Taxa de erro > 5%
- Latência > 2s
- Rate limit abuse (mesmo IP/token)
- Tentativas de login falhadas

---

## Segurança - Checklist

- [ ] HTTPS obrigatório em produção
- [ ] Tokens com expiração configurável
- [ ] Rate limiting por token/IP
- [ ] Validation em todos inputs
- [ ] CORS configurado corretamente
- [ ] Logs de auditoria para ações sensíveis
- [ ] Abilities/scopes granulares
- [ ] Revogação de tokens comprometidos
- [ ] Headers de segurança (HSTS, CSP, etc.)
- [ ] Request ID para tracking

---

## Testes

### Feature Tests (Prioritários)

```php
// tests/Feature/Api/V1/AuthTest.php
- test_user_can_login_and_receive_token()
- test_user_cannot_login_with_invalid_credentials()
- test_user_can_logout_and_revoke_token()
- test_user_can_get_own_profile()

// tests/Feature/Api/V1/ProductTest.php
- test_can_list_products_with_pagination()
- test_can_get_single_product()
- test_can_create_product_with_valid_data()
- test_cannot_create_product_without_permission()
- test_can_update_product()
- test_can_delete_product()

// tests/Feature/Api/V1/InventoryTest.php
- test_can_list_inventory_levels()
- test_can_adjust_inventory()
- test_can_transfer_inventory()
- test_cannot_adjust_without_permission()

// tests/Feature/Api/V1/RateLimitTest.php
- test_rate_limit_is_enforced()
- test_rate_limit_headers_are_present()
```

---

## Roadmap

### v1.0 (MVP) - 2-3 semanas
- ✅ Planejamento e arquitetura
- ⏳ Core infrastructure (Sanctum, middlewares, CORS)
- ⏳ Authentication endpoints
- ⏳ Products API
- ⏳ Inventory API
- ⏳ Basic documentation

### v1.1 - 1 semana
- ⏳ Audits & Counts API
- ⏳ Reports API
- ⏳ OpenAPI/Swagger docs
- ⏳ Postman collection

### v1.2 - 1 semana
- ⏳ Token management UI
- ⏳ Webhook system (opcional)
- ⏳ API analytics dashboard

### v2.0 (Futuro)
- GraphQL endpoint (opcional)
- WebSocket support para real-time
- Bulk operations endpoints
- Advanced filtering (GraphQL-like)

---

**Autor:** Claude (Anthropic)
**Data:** 13/11/2025
**Versão:** 1.0 - Planejamento Completo
**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO
