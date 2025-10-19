# Guia de Teste Rápido - Módulo de Movimentações

## 🚀 Teste 1: Criar Entrada de Estoque (3 minutos)

Abra o terminal e execute:

```bash
php artisan tinker
```

Cole o seguinte código:

```php
use App\Models\{Product, Area, InventoryMovement, InventoryLevel};

// 1. Buscar primeiro produto e área
$product = Product::first();
$area = Area::first();

if (!$product || !$area) {
    echo "❌ Crie produtos e áreas primeiro!\n";
    exit;
}

echo "🔹 Produto: {$product->name} (Código: {$product->code})\n";
echo "🔹 Área: {$area->name}\n\n";

// 2. Criar ENTRADA de 100 unidades
$movement = InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'entry',
    'quantity' => 100,
    'unit_cost' => 10.50,
    'user_id' => 1,
    'movement_date' => now(),
    'notes' => 'Teste de entrada via Tinker'
]);

echo "✅ Movimentação criada: {$movement->code}\n";
echo "   Tipo: {$movement->getTypeLabel()}\n";
echo "   Quantidade: {$movement->quantity}\n";
echo "   Custo Total: R$ {$movement->total_cost}\n\n";

// 3. Verificar estoque atualizado
$level = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "📊 Estoque Atual:\n";
echo "   Quantidade: {$level->quantity}\n";
echo "   Disponível: {$level->available_quantity}\n";
echo "   Última movimentação: {$level->last_movement_at}\n\n";

// 4. Verificar estoque total do produto
$totalStock = InventoryLevel::getTotalQuantityForProduct($product->id, auth()->user()->company_id);
echo "📦 Estoque Total do Produto (todas as áreas): {$totalStock}\n";
```

**Resultado Esperado**:
```
✅ Movimentação criada: MOV-20251019-0001
   Tipo: Entrada
   Quantidade: 100
   Custo Total: R$ 1050.00

📊 Estoque Atual:
   Quantidade: 100
   Disponível: 100
   Última movimentação: 2025-10-19 22:57:30

📦 Estoque Total do Produto (todas as áreas): 100
```

---

## 🚀 Teste 2: Criar Saída de Estoque (2 minutos)

No mesmo Tinker (ou reabrir):

```php
use App\Models\{Product, Area, InventoryMovement, InventoryLevel};

$product = Product::first();
$area = Area::first();

// Criar SAÍDA de 30 unidades
$movement = InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'exit',
    'quantity' => 30,
    'user_id' => 1,
    'movement_date' => now(),
    'notes' => 'Teste de saída via Tinker',
    'document_number' => 'NF-12345'
]);

echo "✅ Saída criada: {$movement->code}\n";
echo "   Quantidade: -{$movement->quantity}\n\n";

// Verificar estoque atualizado
$level = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "📊 Estoque Atual: {$level->quantity}\n";
echo "   (Antes: 100, Saída: 30, Agora: 70)\n";
```

**Resultado Esperado**:
```
✅ Saída criada: MOV-20251019-0002
   Quantidade: -30

📊 Estoque Atual: 70
   (Antes: 100, Saída: 30, Agora: 70)
```

---

## 🚀 Teste 3: Criar Transferência Entre Áreas (3 minutos)

```php
use App\Models\{Product, Area, InventoryMovement, InventoryLevel};

$product = Product::first();
$areaOrigem = Area::first();
$areaDestino = Area::skip(1)->first(); // Segunda área

if (!$areaDestino) {
    echo "❌ Crie pelo menos 2 áreas!\n";
    exit;
}

echo "🔸 Origem: {$areaOrigem->name}\n";
echo "🔸 Destino: {$areaDestino->name}\n\n";

// Criar TRANSFERÊNCIA de 20 unidades
$movement = InventoryMovement::create([
    'product_id' => $product->id,
    'from_area_id' => $areaOrigem->id,
    'to_area_id' => $areaDestino->id,
    'type' => 'transfer_out',
    'quantity' => 20,
    'user_id' => 1,
    'movement_date' => now(),
    'notes' => 'Teste de transferência'
]);

echo "✅ Transferência criada: {$movement->code}\n\n";

// Verificar estoque ORIGEM
$levelOrigin = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $areaOrigem->id)
    ->first();

echo "📊 Estoque Origem ({$areaOrigem->name}): {$levelOrigin->quantity}\n";
echo "   (Antes: 70, Transferiu: 20, Agora: 50)\n\n";

// Verificar estoque DESTINO
$levelDest = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $areaDestino->id)
    ->first();

echo "📊 Estoque Destino ({$areaDestino->name}): {$levelDest->quantity}\n";
echo "   (Antes: 0, Recebeu: 20, Agora: 20)\n\n";

// Estoque total continua o mesmo
$totalStock = InventoryLevel::getTotalQuantityForProduct($product->id, auth()->user()->company_id);
echo "📦 Estoque Total: {$totalStock} (não mudou!)\n";
```

**Resultado Esperado**:
```
🔸 Origem: Armazém A
🔸 Destino: Armazém B

✅ Transferência criada: MOV-20251019-0003

📊 Estoque Origem (Armazém A): 50
   (Antes: 70, Transferiu: 20, Agora: 50)

📊 Estoque Destino (Armazém B): 20
   (Antes: 0, Recebeu: 20, Agora: 20)

📦 Estoque Total: 70 (não mudou!)
```

---

## 🚀 Teste 4: Verificar Relatório Stock vs Count (5 minutos)

```php
use App\Models\{Product, Area, StockAudit, StockCount, StockCountItem, InventoryLevel};

$product = Product::first();
$area = Area::first();

// 1. Verificar estoque atual
$currentStock = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "📊 Estoque Atual no Sistema: {$currentStock->quantity}\n\n";

// 2. Criar auditoria
$audit = StockAudit::create([
    'title' => 'Auditoria Teste',
    'responsible_id' => 1,
    'status' => 'in_progress',
    'start_date' => now()
]);

// 3. Criar contagem
$count = StockCount::create([
    'stock_audit_id' => $audit->id,
    'area_id' => $area->id,
    'counter_id' => 1,
    'count_number' => 1,
    'status' => 'in_progress'
]);

// 4. Registrar contagem física (com divergência proposital)
$countedQty = 45; // Contamos 45, mas sistema tem 50
StockCountItem::create([
    'stock_count_id' => $count->id,
    'product_code' => $product->code,
    'product_name' => $product->name,
    'quantity_counted' => $countedQty,
    'unit' => $product->unit ?? 'UN'
]);

echo "📝 Contagem Física Registrada: {$countedQty}\n";

// 5. Completar contagem
$count->complete();

echo "✅ Contagem #{$count->count_number} concluída!\n\n";

// 6. Calcular divergência
$diff = $countedQty - $currentStock->quantity;
$diffPct = ($diff / $currentStock->quantity) * 100;

echo "📊 RELATÓRIO DE DIVERGÊNCIA:\n";
echo "   Estoque Teórico: {$currentStock->quantity}\n";
echo "   Contado Físico: {$countedQty}\n";
echo "   Divergência: {$diff}\n";
echo "   % Divergência: " . round($diffPct, 2) . "%\n\n";

echo "🌐 Agora acesse: /reports/stock-vs-count\n";
echo "   Selecione a contagem #{$count->count_number}\n";
echo "   Você deve ver esta divergência!\n";
```

**Resultado Esperado**:
```
📊 Estoque Atual no Sistema: 50

📝 Contagem Física Registrada: 45
✅ Contagem #1 concluída!

📊 RELATÓRIO DE DIVERGÊNCIA:
   Estoque Teórico: 50
   Contado Físico: 45
   Divergência: -5
   % Divergência: -10%

🌐 Agora acesse: /reports/stock-vs-count
   Selecione a contagem #1
   Você deve ver esta divergência!
```

---

## 🚀 Teste 5: Verificar Dashboard - Estoque Baixo (3 minutos)

```php
use App\Models\{Product, Area, InventoryMovement, InventoryLevel};

// 1. Criar produto com estoque mínimo definido
$product = Product::create([
    'code' => 'LOW-STOCK-001',
    'name' => 'Produto com Estoque Baixo (Teste)',
    'min_stock' => 100, // Mínimo: 100
    'active' => true,
    'unit' => 'UN'
]);

echo "✅ Produto criado: {$product->name}\n";
echo "   Estoque Mínimo: {$product->min_stock}\n\n";

// 2. Criar entrada INSUFICIENTE
$area = Area::first();
InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'entry',
    'quantity' => 30, // Só 30, mas mínimo é 100
    'user_id' => 1,
    'movement_date' => now()
]);

echo "📦 Entrada de estoque: 30 unidades\n";
echo "   (Menor que o mínimo de 100!)\n\n";

// 3. Verificar se está em estoque baixo
$level = InventoryLevel::where('product_id', $product->id)->first();
$isLow = $level->quantity < $product->min_stock;

echo "⚠️  Está com estoque baixo? " . ($isLow ? "SIM" : "NÃO") . "\n";
echo "   Estoque Atual: {$level->quantity}\n";
echo "   Estoque Mínimo: {$product->min_stock}\n";
echo "   Diferença: " . ($level->quantity - $product->min_stock) . "\n\n";

echo "🌐 Agora acesse: /dashboard\n";
echo "   Você deve ver '{$product->name}' na seção 'Produtos com Estoque Baixo'\n";
```

**Resultado Esperado**:
```
✅ Produto criado: Produto com Estoque Baixo (Teste)
   Estoque Mínimo: 100

📦 Entrada de estoque: 30 unidades
   (Menor que o mínimo de 100!)

⚠️  Está com estoque baixo? SIM
   Estoque Atual: 30
   Estoque Mínimo: 100
   Diferença: -70

🌐 Agora acesse: /dashboard
   Você deve ver 'Produto com Estoque Baixo (Teste)' na seção 'Produtos com Estoque Baixo'
```

---

## 🚀 Teste 6: Listar Todas as Movimentações (1 minuto)

```php
use App\Models\InventoryMovement;

echo "📋 HISTÓRICO DE MOVIMENTAÇÕES:\n";
echo str_repeat("=", 80) . "\n\n";

InventoryMovement::with(['product', 'area', 'user'])
    ->orderBy('movement_date', 'desc')
    ->take(10)
    ->get()
    ->each(function ($mov) {
        echo "🔹 {$mov->code}\n";
        echo "   Data: {$mov->movement_date->format('d/m/Y H:i')}\n";
        echo "   Tipo: {$mov->getTypeLabel()}\n";
        echo "   Produto: {$mov->product->name}\n";
        echo "   Área: " . ($mov->area ? $mov->area->name : 'N/A') . "\n";
        echo "   Quantidade: {$mov->quantity}\n";
        echo "   Usuário: {$mov->user->name}\n";
        if ($mov->notes) {
            echo "   Observações: {$mov->notes}\n";
        }
        echo "\n";
    });
```

---

## 🚀 Teste 7: Recalcular Estoque (Verificação de Integridade)

```php
use App\Models\{Product, Area, InventoryLevel};

$product = Product::first();
$area = Area::first();

echo "🔄 TESTE DE RECÁLCULO\n";
echo str_repeat("=", 50) . "\n\n";

// 1. Estoque atual
$level = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "📊 Estoque Antes: {$level->quantity}\n\n";

// 2. Forçar recálculo
InventoryLevel::recalculateForProduct(
    $product->id,
    $area->id,
    auth()->user()->company_id
);

// 3. Verificar após recálculo
$level->refresh();

echo "📊 Estoque Depois (recalculado): {$level->quantity}\n";
echo "   (Deve ser o mesmo!)\n\n";

echo "✅ Se os valores são iguais, o sistema está consistente!\n";
```

---

## 📊 Resumo dos Testes

| # | Teste | Tempo | Status |
|---|-------|-------|--------|
| 1 | Criar Entrada | 3 min | ⬜ |
| 2 | Criar Saída | 2 min | ⬜ |
| 3 | Criar Transferência | 3 min | ⬜ |
| 4 | Relatório Stock vs Count | 5 min | ⬜ |
| 5 | Dashboard Estoque Baixo | 3 min | ⬜ |
| 6 | Listar Movimentações | 1 min | ⬜ |
| 7 | Recalcular Estoque | 1 min | ⬜ |

**Tempo Total**: ~18 minutos

---

## ✅ Checklist de Validação

Após executar todos os testes, verifique:

- [ ] Entradas aumentam o estoque
- [ ] Saídas diminuem o estoque
- [ ] Transferências movem estoque entre áreas sem alterar total
- [ ] Códigos são auto-gerados (MOV-YYYYMMDD-XXXX)
- [ ] Custo total é calculado automaticamente
- [ ] InventoryLevel é atualizado automaticamente
- [ ] Relatórios mostram estoque real (não mais 0)
- [ ] Dashboard mostra alertas de estoque baixo corretos
- [ ] Recálculo mantém integridade dos dados
- [ ] Audit log registra todas as operações

---

## 🐛 Problemas Comuns

### Erro: "Class 'InventoryLevel' not found"
**Solução**: Adicione o `use` completo:
```php
use App\Models\InventoryLevel;
```

### Erro: "Attempt to read property on null"
**Solução**: Verifique se há produtos e áreas cadastrados:
```php
Product::count(); // Deve ser > 0
Area::count();    // Deve ser > 0
```

### Estoque não atualiza
**Solução**: Verifique se as migrations foram executadas:
```bash
php artisan migrate:status
```

### Relatório ainda mostra 0
**Solução**: Limpe o cache:
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

---

## 📝 Próximos Passos

Após validar todos os testes:

1. ✅ Frontend React (páginas de movimentações)
2. ✅ Navegação no sidebar
3. ✅ Componentes visuais (badges, formulários)
4. ✅ Seeder com dados de exemplo
5. ✅ Testes automatizados (PHPUnit)

---

**Data**: 19/10/2025
**Versão**: 1.0
**Status**: Pronto para Teste
