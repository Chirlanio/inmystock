# Módulo de Movimentações de Estoque - Implementado

## Status: Backend 100% Completo | Frontend Pendente

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. Database Layer (100%)

#### Tabela: `inventory_movements`
- **Código auto-gerado**: `MOV-YYYYMMDD-XXXX` (ex: MOV-20251019-0001)
- **Campos principais**:
  - `company_id`, `product_id`, `area_id`
  - `type`: entry, exit, adjustment, transfer_out, transfer_in
  - `quantity`: Quantidade (decimal 15,3)
  - `unit_cost`, `total_cost`: Custos (decimal 15,2)
  - `movement_date`: Data da movimentação
  - `user_id`: Usuário que registrou
  - `document_number`: Número do documento (NF, pedido, etc)
  - `notes`: Observações

- **Transferências**:
  - `from_area_id`: Área de origem
  - `to_area_id`: Área de destino

- **Rastreabilidade**:
  - `reference_type`: Tipo do documento origem (polimórfico)
  - `reference_id`: ID do documento origem

- **Indexes criados**:
  - `[company_id, product_id, movement_date]`
  - `[company_id, type]`
  - `[reference_type, reference_id]`

#### Tabela: `inventory_levels`
- **Unique constraint**: Um registro por `[company_id, product_id, area_id]`
- **Campos**:
  - `quantity`: Quantidade atual
  - `reserved_quantity`: Quantidade reservada
  - `available_quantity`: Disponível = quantity - reserved
  - `last_movement_at`: Última movimentação

- **Indexes criados**:
  - `[company_id, product_id]`
  - `[company_id, area_id]`

---

### 2. Models (100%)

#### `App\Models\InventoryMovement`

**Traits**: `BelongsToCompany`, `AuditableTrait`

**Constantes de Tipo**:
```php
const TYPE_ENTRY = 'entry';          // Entrada
const TYPE_EXIT = 'exit';            // Saída
const TYPE_ADJUSTMENT = 'adjustment'; // Ajuste
const TYPE_TRANSFER_OUT = 'transfer_out'; // Transferência saída
const TYPE_TRANSFER_IN = 'transfer_in';   // Transferência entrada
```

**Relacionamentos**:
- `product()`: BelongsTo Product
- `area()`: BelongsTo Area
- `fromArea()`: BelongsTo Area (transferências)
- `toArea()`: BelongsTo Area (transferências)
- `user()`: BelongsTo User
- `reference()`: MorphTo (polimórfico)

**Métodos Principais**:
- `generateCode()`: Gera código único MOV-YYYYMMDD-XXXX
- `updateInventoryLevels()`: Atualiza níveis de estoque automaticamente
- `recalculateInventoryLevels()`: Recalcula após deleção
- `getTypeLabel()`: Retorna label em português
- `getTypeColor()`: Retorna cor para badges (success, danger, warning, info)
- `isTransfer()`: Verifica se é transferência

**Comportamento Automático** (via boot):
1. Gera código se vazio
2. Calcula `total_cost` se `unit_cost` fornecido
3. Define `movement_date` como now() se vazio
4. **Após criar**: Atualiza `inventory_levels` automaticamente
5. **Após deletar**: Recalcula `inventory_levels`

---

#### `App\Models\InventoryLevel`

**Traits**: `BelongsToCompany`

**Relacionamentos**:
- `product()`: BelongsTo Product
- `area()`: BelongsTo Area

**Métodos Estáticos**:
- `recalculateForProduct($productId, $areaId, $companyId)`: Recalcula estoque somando todas as movimentações
- `getTotalQuantityForProduct($productId, $companyId)`: Total de estoque em todas as áreas
- `getAvailableQuantityForProduct($productId, $companyId)`: Total disponível

**Métodos de Instância**:
- `isLowStock()`: Verifica se está abaixo do mínimo (min_stock)
- `reserve($quantity)`: Reserva quantidade
- `release($quantity)`: Libera quantidade reservada

---

### 3. Controller (100%)

#### `App\Http\Controllers\InventoryMovementController`

**Rotas implementadas**:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/inventory-movements` | Lista movimentações com filtros |
| GET | `/inventory-movements/create` | Formulário de criação |
| POST | `/inventory-movements` | Criar movimentação |
| GET | `/inventory-movements/{id}` | Visualizar movimentação |
| GET | `/inventory-movements/{id}/edit` | Editar (apenas ajustes do dia) |
| PUT | `/inventory-movements/{id}` | Atualizar movimentação |
| DELETE | `/inventory-movements/{id}` | Deletar (apenas do dia) |
| GET | `/inventory-movements/export` | Exportar CSV |

**Filtros Implementados** (index):
- Busca por texto (código, documento, observações, produto)
- Filtro por tipo de movimentação
- Filtro por produto
- Filtro por área (inclui from/to)
- Filtro por período (date_from, date_to)
- Ordenação configurável

**Regras de Negócio**:

1. **Criação de Movimentações**:
   - Tipos entry/exit/adjustment: Requer `area_id`
   - Tipo transfer: Requer `from_area_id` e `to_area_id` (devem ser diferentes)
   - Transferências criam 2 movimentações automaticamente (OUT + IN)
   - Auto-calcula `total_cost` se `unit_cost` fornecido

2. **Edição**:
   - ✅ Permitido: Apenas AJUSTES
   - ✅ Permitido: Apenas movimentações do DIA ATUAL
   - ❌ Bloqueado: Entradas, saídas e transferências
   - ❌ Bloqueado: Movimentações de dias anteriores

3. **Deleção**:
   - ✅ Permitido: Apenas movimentações do DIA ATUAL
   - ❌ Bloqueado: Dias anteriores
   - ❌ Bloqueado: Transferências vinculadas (deve deletar ambas)

4. **Exportação CSV**:
   - Aplica mesmos filtros da listagem
   - Formato Excel-friendly (UTF-8 BOM, delimitador `;`)
   - Inclui todas as colunas relevantes

---

### 4. Routes (100%)

**Arquivo**: `routes/inventory-movements.php`

```php
Route::middleware(['auth'])->group(function () {
    Route::get('inventory-movements/export', [InventoryMovementController::class, 'export'])
        ->name('inventory-movements.export');
    Route::resource('inventory-movements', InventoryMovementController::class);
});
```

**Registrado em**: `routes/web.php` (linha 21)

---

## ❌ O QUE FALTA IMPLEMENTAR

### 1. Frontend React/Inertia (0%)

**Páginas necessárias**:

1. **`resources/js/pages/inventory-movements/index.tsx`**
   - Tabela de movimentações com DataTable
   - Filtros: busca, tipo, produto, área, período
   - Botões: Nova Movimentação, Exportar CSV
   - Colunas: Código, Data, Tipo (badge), Produto, Área, Quantidade, Custo, Usuário
   - Ações: Visualizar, Editar (se ajuste + hoje), Deletar (se hoje)

2. **`resources/js/pages/inventory-movements/create.tsx`**
   - Formulário com seleção de tipo de movimentação
   - Campos condicionais baseados no tipo:
     - Entry/Exit/Adjustment: produto, área, quantidade, custo, data, documento, notas
     - Transfer: produto, de área, para área, quantidade, custo, data, notas
   - Validação frontend
   - Submit com Inertia

3. **`resources/js/pages/inventory-movements/edit.tsx`**
   - Similar ao create mas apenas para ajustes
   - Pre-popula dados da movimentação
   - Validação de permissão (apenas ajustes do dia)

4. **`resources/js/pages/inventory-movements/show.tsx`**
   - Visualização detalhada da movimentação
   - Exibe todos os campos formatados
   - Para transferências, mostra link para a movimentação par
   - Botões: Editar (se permitido), Deletar (se permitido), Voltar

**Componentes necessários**:

5. **`resources/js/components/inventory/movement-type-badge.tsx`**
   - Badge colorido para tipos de movimentação
   - Verde: Entrada
   - Vermelho: Saída
   - Amarelo: Ajuste
   - Azul: Transferências

6. **`resources/js/components/inventory/movement-form.tsx`** (opcional)
   - Formulário reutilizável para create/edit
   - Lógica de campos condicionais

---

### 2. Navegação (0%)

**Atualizar**: `resources/js/components/app-sidebar.tsx`

Adicionar item de menu:
```tsx
{
  title: "Movimentações",
  url: "/inventory-movements",
  icon: ArrowLeftRight, // ou Package
  permission: "inventory.view" // ou criar nova permissão
}
```

---

### 3. TypeScript Types (0%)

**Atualizar**: `resources/js/types/index.d.ts`

```typescript
export interface InventoryMovement {
  id: number;
  code: string;
  company_id: number;
  product_id: number;
  product?: Product;
  area_id?: number;
  area?: Area;
  type: 'entry' | 'exit' | 'adjustment' | 'transfer_out' | 'transfer_in';
  quantity: string;
  unit_cost?: string;
  total_cost?: string;
  from_area_id?: number;
  from_area?: Area;
  to_area_id?: number;
  to_area?: Area;
  reference_type?: string;
  reference_id?: number;
  document_number?: string;
  notes?: string;
  user_id: number;
  user?: User;
  movement_date: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryLevel {
  id: number;
  company_id: number;
  product_id: number;
  product?: Product;
  area_id?: number;
  area?: Area;
  quantity: string;
  reserved_quantity: string;
  available_quantity: string;
  last_movement_at?: string;
  created_at: string;
  updated_at: string;
}
```

---

### 4. Atualizar Relatórios (Crítico!)

**Arquivo**: `app/Http/Controllers/ReportController.php`

**Linha 54** - Substituir hardcoded `0`:
```php
// ANTES (hardcoded):
'theoretical_stock' => 0,

// DEPOIS (real):
'theoretical_stock' => InventoryLevel::getTotalQuantityForProduct($item->product_id, auth()->user()->company_id),
```

**Adicionar import**:
```php
use App\Models\InventoryLevel;
```

**Considerar**: Adicionar filtro por área nos relatórios

---

### 5. Seeder (Opcional)

**Criar**: `database/seeders/InventoryLevelSeeder.php`

Para popular níveis de estoque iniciais com base em:
- Produtos existentes
- Áreas existentes
- Movimentações históricas (se houver)

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Prioridade 1 - Essencial
1. ✅ Criar página `index.tsx` (listagem)
2. ✅ Criar página `create.tsx` (formulário)
3. ✅ Atualizar sidebar com link de navegação
4. ✅ Testar criação de movimentações
5. ✅ **Atualizar ReportController** para usar estoque real

### Prioridade 2 - Importante
6. ✅ Criar página `show.tsx` (visualização)
7. ✅ Criar página `edit.tsx` (edição de ajustes)
8. ✅ Criar componente `movement-type-badge.tsx`
9. ✅ Adicionar TypeScript types
10. ✅ Testar todos os fluxos (CRUD completo)

### Prioridade 3 - Desejável
11. ✅ Criar seeder para dados de teste
12. ✅ Adicionar testes unitários (PHPUnit)
13. ✅ Adicionar testes de integração
14. ✅ Documentação de uso para usuários finais

---

## 📊 FLUXO DE DADOS

### Criação de Movimentação (Entry/Exit/Adjustment)

```
1. User preenche formulário (create.tsx)
   ↓
2. POST /inventory-movements
   ↓
3. InventoryMovementController::store()
   - Valida dados
   - Cria registro InventoryMovement
   ↓
4. Model Event: InventoryMovement::created()
   - Chama updateInventoryLevels()
   ↓
5. InventoryLevel::firstOrCreate()
   - Busca ou cria registro de estoque
   - Atualiza quantity (+/-)
   - Atualiza available_quantity
   - Atualiza last_movement_at
   ↓
6. Redirect para index com mensagem de sucesso
```

### Criação de Transferência

```
1. User preenche formulário com type='transfer_out'
   ↓
2. POST /inventory-movements
   ↓
3. Controller cria 2 movimentações:

   a) TRANSFER_OUT
      - from_area_id → área origem
      - to_area_id → área destino
      ↓
      Atualiza InventoryLevel da área DESTINO (+)
      Atualiza InventoryLevel da área ORIGEM (-)

   b) TRANSFER_IN
      - Referencia TRANSFER_OUT via reference_id
      - Mesmos dados
      ↓
      Atualiza InventoryLevel da área DESTINO (+)
   ↓
4. Ambas as movimentações ficam vinculadas
```

### Deleção de Movimentação

```
1. DELETE /inventory-movements/{id}
   ↓
2. Controller valida:
   - É do dia atual? ✓
   - Não é transferência vinculada? ✓
   ↓
3. InventoryMovement::delete()
   ↓
4. Model Event: InventoryMovement::deleted()
   - Chama recalculateInventoryLevels()
   ↓
5. InventoryLevel::recalculateForProduct()
   - Soma TODAS as movimentações
   - Recalcula quantity do zero
   - Garante consistência
```

---

## 🔧 COMO TESTAR (Backend já funcional)

### Via Artisan Tinker

```php
php artisan tinker

// 1. Criar entrada de produto
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Area;

$product = Product::first();
$area = Area::first();

InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'entry',
    'quantity' => 100,
    'unit_cost' => 10.50,
    'user_id' => 1,
    'movement_date' => now(),
    'notes' => 'Teste de entrada'
]);

// 2. Verificar nível de estoque
use App\Models\InventoryLevel;
$level = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "Quantidade: " . $level->quantity; // Deve ser 100

// 3. Criar saída
InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'exit',
    'quantity' => 30,
    'user_id' => 1,
    'movement_date' => now(),
]);

// 4. Verificar estoque atualizado
$level->refresh();
echo "Quantidade: " . $level->quantity; // Deve ser 70

// 5. Criar transferência
$area2 = Area::skip(1)->first();

InventoryMovement::create([
    'product_id' => $product->id,
    'from_area_id' => $area->id,
    'to_area_id' => $area2->id,
    'type' => 'transfer_out',
    'quantity' => 20,
    'user_id' => 1,
    'movement_date' => now(),
]);

// Verificar estoque nas duas áreas
$level1 = InventoryLevel::where('product_id', $product->id)->where('area_id', $area->id)->first();
echo "Área 1: " . $level1->quantity; // Deve ser 50

$level2 = InventoryLevel::where('product_id', $product->id)->where('area_id', $area2->id)->first();
echo "Área 2: " . $level2->quantity; // Deve ser 20
```

---

## 📝 RESUMO

### Backend: ✅ 100% COMPLETO E FUNCIONAL

- ✅ Migrations criadas e executadas
- ✅ Models com lógica de negócio completa
- ✅ Controller com CRUD e exportação
- ✅ Rotas registradas
- ✅ Atualização automática de estoque
- ✅ Validações implementadas
- ✅ Multi-tenancy (company scoping)
- ✅ Audit logging automático
- ✅ Código auto-gerado

### Frontend: ❌ 0% PENDENTE

- ❌ Páginas React não criadas
- ❌ Componentes não criados
- ❌ TypeScript types não adicionados
- ❌ Navegação não atualizada

### Integração: ⚠️ PARCIAL

- ✅ Backend pronto para receber requisições
- ❌ Frontend não pode chamar o backend ainda
- ⚠️ Relatórios ainda usam estoque hardcoded (precisa atualizar)

---

## 🚀 COMANDOS ÚTEIS

```bash
# Verificar rotas criadas
php artisan route:list --name=inventory-movements

# Gerar types do Wayfinder
npm run build

# Ver migrations aplicadas
php artisan migrate:status

# Rollback (se necessário)
php artisan migrate:rollback --step=2

# Criar seeder
php artisan make:seeder InventoryLevelSeeder

# Rodar testes
php artisan test --filter=InventoryMovement
```

---

## 🎓 APRENDIZADOS E PADRÕES

### 1. Auto-atualização de Níveis de Estoque
Utilizamos **Model Events** (`created`, `deleted`) para garantir que o estoque seja sempre atualizado automaticamente quando uma movimentação é criada ou removida.

### 2. Código Auto-gerado com Data
O padrão `MOV-YYYYMMDD-XXXX` permite identificar rapidamente a data da movimentação e garante unicidade dentro do dia.

### 3. Transferências como Par de Movimentações
Criar duas movimentações separadas (OUT + IN) permite rastreamento individual e facilita relatórios por área.

### 4. Recálculo vs Incremento
- **Incremento**: Mais rápido (usado na criação)
- **Recálculo**: Mais seguro (usado na deleção para garantir consistência)

### 5. Validação por Tipo
Campos obrigatórios mudam conforme o tipo de movimentação, implementado via regras dinâmicas no controller.

---

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Verifique os logs: `storage/logs/laravel.log`
2. Use `php artisan tinker` para testar models
3. Verifique migrations: `php artisan migrate:status`
4. Consulte este documento para referência da estrutura

---

**Data de Implementação**: 19/10/2025
**Versão**: 1.0
**Status**: Backend Completo | Frontend Pendente
