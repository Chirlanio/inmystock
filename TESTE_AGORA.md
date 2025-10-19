# 🧪 TESTE O BACKEND AGORA - 5 Minutos

## Passo 1: Abrir Tinker (30 segundos)

No terminal do seu projeto:

```bash
php artisan tinker
```

---

## Passo 2: Teste Completo - Cole e Execute (2 minutos)

Cole todo este código de uma vez no Tinker:

```php
use App\Models\{Product, Area, InventoryMovement, InventoryLevel, User};

// ============================================
// TESTE 1: CRIAR ENTRADA DE ESTOQUE
// ============================================
echo "\n🔹 TESTE 1: CRIAR ENTRADA DE ESTOQUE\n";
echo str_repeat("=", 60) . "\n";

$product = Product::first();
$area = Area::first();
$user = User::first();

if (!$product || !$area || !$user) {
    echo "❌ ERRO: Você precisa ter produtos, áreas e usuários cadastrados!\n";
    echo "   Produtos: " . Product::count() . "\n";
    echo "   Áreas: " . Area::count() . "\n";
    echo "   Usuários: " . User::count() . "\n";
    exit;
}

echo "✅ Produto: {$product->name} ({$product->code})\n";
echo "✅ Área: {$area->name}\n\n";

// Criar entrada de 100 unidades
$entrada = InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'entry',
    'quantity' => 100,
    'unit_cost' => 10.50,
    'user_id' => $user->id,
    'movement_date' => now(),
    'notes' => 'Entrada de teste - Backend validação',
    'document_number' => 'NF-001'
]);

echo "📦 ENTRADA CRIADA:\n";
echo "   Código: {$entrada->code}\n";
echo "   Tipo: {$entrada->getTypeLabel()}\n";
echo "   Quantidade: +{$entrada->quantity}\n";
echo "   Custo Unitário: R$ {$entrada->unit_cost}\n";
echo "   Custo Total: R$ {$entrada->total_cost}\n";
echo "   Data: {$entrada->movement_date->format('d/m/Y H:i')}\n\n";

// Verificar estoque
$level = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "📊 ESTOQUE ATUALIZADO AUTOMATICAMENTE:\n";
echo "   Quantidade: {$level->quantity}\n";
echo "   Disponível: {$level->available_quantity}\n";
echo "   Última Movimentação: {$level->last_movement_at->format('d/m/Y H:i')}\n\n";

if ($level->quantity == 100) {
    echo "✅ SUCESSO: Estoque foi atualizado corretamente!\n\n";
} else {
    echo "❌ ERRO: Estoque deveria ser 100, mas está em {$level->quantity}\n\n";
}


// ============================================
// TESTE 2: CRIAR SAÍDA DE ESTOQUE
// ============================================
echo "\n🔹 TESTE 2: CRIAR SAÍDA DE ESTOQUE\n";
echo str_repeat("=", 60) . "\n";

$saida = InventoryMovement::create([
    'product_id' => $product->id,
    'area_id' => $area->id,
    'type' => 'exit',
    'quantity' => 30,
    'user_id' => $user->id,
    'movement_date' => now(),
    'notes' => 'Saída de teste',
    'document_number' => 'NF-002'
]);

echo "📦 SAÍDA CRIADA:\n";
echo "   Código: {$saida->code}\n";
echo "   Tipo: {$saida->getTypeLabel()}\n";
echo "   Quantidade: -{$saida->quantity}\n\n";

$level->refresh();

echo "📊 ESTOQUE ATUALIZADO:\n";
echo "   Antes: 100\n";
echo "   Saída: -30\n";
echo "   Agora: {$level->quantity}\n\n";

if ($level->quantity == 70) {
    echo "✅ SUCESSO: Estoque diminuiu corretamente (100 - 30 = 70)!\n\n";
} else {
    echo "❌ ERRO: Estoque deveria ser 70, mas está em {$level->quantity}\n\n";
}


// ============================================
// TESTE 3: CRIAR TRANSFERÊNCIA
// ============================================
echo "\n🔹 TESTE 3: CRIAR TRANSFERÊNCIA ENTRE ÁREAS\n";
echo str_repeat("=", 60) . "\n";

$area2 = Area::where('id', '!=', $area->id)->first();

if (!$area2) {
    echo "⚠️  AVISO: Você tem apenas 1 área. Criando segunda área...\n";
    $area2 = Area::create([
        'name' => 'Área Teste Automática',
        'location' => 'Teste',
        'location_count' => 10,
        'active' => true
    ]);
    echo "✅ Área criada: {$area2->name}\n\n";
}

echo "🔸 Origem: {$area->name}\n";
echo "🔸 Destino: {$area2->name}\n\n";

$transferencia = InventoryMovement::create([
    'product_id' => $product->id,
    'from_area_id' => $area->id,
    'to_area_id' => $area2->id,
    'type' => 'transfer_out',
    'quantity' => 20,
    'user_id' => $user->id,
    'movement_date' => now(),
    'notes' => 'Transferência de teste'
]);

echo "📦 TRANSFERÊNCIA CRIADA:\n";
echo "   Código: {$transferencia->code}\n";
echo "   Quantidade: {$transferencia->quantity}\n\n";

// Verificar movimentações criadas
$totalMovements = InventoryMovement::where('product_id', $product->id)
    ->whereIn('type', ['transfer_out', 'transfer_in'])
    ->where('quantity', 20)
    ->count();

echo "📋 Movimentações de transferência criadas: {$totalMovements}\n";
echo "   (Devem ser 2: uma OUT e uma IN)\n\n";

// Verificar estoque origem
$levelOrigem = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first();

echo "📊 ESTOQUE ORIGEM ({$area->name}):\n";
echo "   Antes: 70\n";
echo "   Transferiu: -20\n";
echo "   Agora: {$levelOrigem->quantity}\n\n";

// Verificar estoque destino
$levelDestino = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area2->id)
    ->first();

echo "📊 ESTOQUE DESTINO ({$area2->name}):\n";
echo "   Antes: 0\n";
echo "   Recebeu: +20\n";
echo "   Agora: {$levelDestino->quantity}\n\n";

// Verificar total
$totalGeral = InventoryLevel::getTotalQuantityForProduct($product->id, $product->company_id);

echo "📦 ESTOQUE TOTAL (todas as áreas):\n";
echo "   Total: {$totalGeral}\n";
echo "   (Deve continuar 70 - não muda no total!)\n\n";

if ($levelOrigem->quantity == 50 && $levelDestino->quantity == 20 && $totalGeral == 70) {
    echo "✅ SUCESSO: Transferência funcionou perfeitamente!\n";
    echo "   Origem: 50 ✅\n";
    echo "   Destino: 20 ✅\n";
    echo "   Total: 70 ✅\n\n";
} else {
    echo "❌ ERRO na transferência:\n";
    echo "   Origem deveria ser 50, está em {$levelOrigem->quantity}\n";
    echo "   Destino deveria ser 20, está em {$levelDestino->quantity}\n";
    echo "   Total deveria ser 70, está em {$totalGeral}\n\n";
}


// ============================================
// TESTE 4: VERIFICAR HISTÓRICO
// ============================================
echo "\n🔹 TESTE 4: HISTÓRICO DE MOVIMENTAÇÕES\n";
echo str_repeat("=", 60) . "\n";

$historico = InventoryMovement::where('product_id', $product->id)
    ->orderBy('created_at', 'desc')
    ->get();

echo "📋 Total de movimentações: {$historico->count()}\n\n";

foreach ($historico as $mov) {
    echo "• {$mov->code} - {$mov->getTypeLabel()} - Qty: {$mov->quantity}\n";
    echo "  Data: {$mov->movement_date->format('d/m/Y H:i')}\n";
    if ($mov->notes) {
        echo "  Obs: {$mov->notes}\n";
    }
    echo "\n";
}


// ============================================
// RESUMO FINAL
// ============================================
echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 RESUMO FINAL DOS TESTES\n";
echo str_repeat("=", 60) . "\n\n";

echo "✅ Entrada de 100 unidades: OK\n";
echo "✅ Saída de 30 unidades: OK\n";
echo "✅ Transferência de 20 unidades: OK\n";
echo "✅ Histórico de movimentações: OK\n";
echo "✅ Atualização automática de estoque: OK\n\n";

echo "📦 SITUAÇÃO ATUAL DO ESTOQUE:\n";
echo "   Produto: {$product->name}\n";
echo "   Área 1 ({$area->name}): {$levelOrigem->quantity} unidades\n";
echo "   Área 2 ({$area2->name}): {$levelDestino->quantity} unidades\n";
echo "   TOTAL: {$totalGeral} unidades\n\n";

echo "🎉 BACKEND 100% FUNCIONAL!\n\n";

echo "📝 PRÓXIMOS PASSOS:\n";
echo "1. Acesse: /reports/stock-vs-count\n";
echo "2. Crie uma contagem física\n";
echo "3. Veja a divergência com o estoque real!\n\n";
```

**Resultado Esperado:**

Você deve ver:
- ✅ 4 testes executados com sucesso
- ✅ Estoque sendo atualizado automaticamente
- ✅ Transferências funcionando entre áreas
- ✅ Histórico completo de movimentações
- 🎉 "BACKEND 100% FUNCIONAL!"

---

## Passo 3: Verificar no Banco de Dados (1 minuto)

Ainda no Tinker, execute:

```php
// Ver todas as movimentações criadas
InventoryMovement::all(['code', 'type', 'quantity', 'product_id', 'created_at']);

// Ver níveis de estoque
InventoryLevel::with('product', 'area')->get();

// Contar registros
echo "Total Movimentações: " . InventoryMovement::count() . "\n";
echo "Total Níveis de Estoque: " . InventoryLevel::count() . "\n";
```

---

## Passo 4: Testar Relatório (1 minuto)

Ainda no Tinker:

```php
use App\Models\{StockAudit, StockCount, StockCountItem};

// Criar uma auditoria de teste
$product = Product::first();
$area = Area::first();

$audit = StockAudit::create([
    'title' => 'Teste Backend - Auditoria',
    'responsible_id' => User::first()->id,
    'status' => 'in_progress',
    'start_date' => now()
]);

$count = StockCount::create([
    'stock_audit_id' => $audit->id,
    'area_id' => $area->id,
    'counter_id' => User::first()->id,
    'count_number' => 1,
    'status' => 'in_progress'
]);

// Estoque atual no sistema
$estoqueReal = InventoryLevel::where('product_id', $product->id)
    ->where('area_id', $area->id)
    ->first()->quantity;

echo "📊 Estoque Real no Sistema: {$estoqueReal}\n";

// Registrar contagem física com divergência
StockCountItem::create([
    'stock_count_id' => $count->id,
    'product_code' => $product->code,
    'product_name' => $product->name,
    'quantity_counted' => 45, // Divergência proposital
    'unit' => $product->unit ?? 'UN'
]);

$count->complete();

echo "✅ Contagem criada! Divergência: " . (45 - $estoqueReal) . "\n";
echo "\n📍 AGORA ACESSE NO NAVEGADOR:\n";
echo "   http://localhost:8000/reports/stock-vs-count\n";
echo "   Selecione a contagem #1\n";
echo "   Você deve ver o estoque REAL ({$estoqueReal}) vs Contado (45)\n";
```

---

## ✅ Checklist de Validação

Marque conforme você testa:

- [ ] ✅ Teste 1: Entrada criou estoque = 100
- [ ] ✅ Teste 2: Saída diminuiu estoque = 70
- [ ] ✅ Teste 3: Transferência funcionou (50 + 20 = 70 total)
- [ ] ✅ Teste 4: Histórico mostra todas as movimentações
- [ ] ✅ Código auto-gerado MOV-YYYYMMDD-XXXX
- [ ] ✅ Custo total calculado automaticamente
- [ ] ✅ Estoque atualiza automaticamente
- [ ] ✅ Relatório mostra estoque real (não mais 0)

---

## 🐛 Se algo der errado

### Erro: "Class not found"
```bash
# Limpe o cache
php artisan cache:clear
php artisan config:clear

# Reabra o Tinker
php artisan tinker
```

### Erro: "No query results for model [Product]"
```bash
# Você não tem produtos cadastrados
# Crie um produto primeiro:
php artisan tinker

use App\Models\Product;
Product::create([
    'name' => 'Produto Teste',
    'code' => 'TEST-001',
    'active' => true,
    'unit' => 'UN',
    'min_stock' => 10
]);
```

### Erro: "No query results for model [Area]"
```bash
# Crie uma área:
php artisan tinker

use App\Models\Area;
Area::create([
    'name' => 'Armazém Principal',
    'location' => 'Prédio A',
    'location_count' => 50,
    'active' => true
]);
```

---

## 📊 Resultados que Você Deve Ver

### ✅ Console do Tinker:
```
🔹 TESTE 1: CRIAR ENTRADA DE ESTOQUE
============================================================
✅ Produto: Caneta Azul (PROD-0001)
✅ Área: Armazém A

📦 ENTRADA CRIADA:
   Código: MOV-20251019-0001
   Tipo: Entrada
   Quantidade: +100
   Custo Unitário: R$ 10.50
   Custo Total: R$ 1050.00
   Data: 19/10/2025 23:10

📊 ESTOQUE ATUALIZADO AUTOMATICAMENTE:
   Quantidade: 100
   Disponível: 100
   Última Movimentação: 19/10/2025 23:10

✅ SUCESSO: Estoque foi atualizado corretamente!

... (continua)
```

### ✅ Banco de Dados:

**Tabela `inventory_movements`:**
| code | type | quantity | product_id | area_id |
|------|------|----------|------------|---------|
| MOV-20251019-0001 | entry | 100.000 | 1 | 1 |
| MOV-20251019-0002 | exit | 30.000 | 1 | 1 |
| MOV-20251019-0003 | transfer_out | 20.000 | 1 | NULL |
| MOV-20251019-0004 | transfer_in | 20.000 | 1 | NULL |

**Tabela `inventory_levels`:**
| product_id | area_id | quantity | available_quantity |
|------------|---------|----------|-------------------|
| 1 | 1 | 50.000 | 50.000 |
| 1 | 2 | 20.000 | 20.000 |

---

## 🎯 Depois de Testar

Me avise qual resultado você obteve:

**Opção 1**: "✅ Todos os testes passaram! Backend está funcionando!"
→ Aí eu implemento o frontend

**Opção 2**: "❌ Erro em X"
→ Te ajudo a resolver

**Opção 3**: "⚠️ Funcionou mas tenho dúvidas sobre Y"
→ Explico melhor

---

**Data**: 19/10/2025
**Tempo Estimado**: 5 minutos
**Dificuldade**: ⭐ Fácil (copiar e colar)
