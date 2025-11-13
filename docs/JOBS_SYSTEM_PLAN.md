# Sistema de Jobs Assíncronos - InMyStock

## Visão Geral

Implementação completa de um sistema de processamento assíncrono para operações pesadas, melhorando a performance e experiência do usuário.

## Por Que Jobs Assíncronos?

### Problemas Atuais (Processamento Síncrono)
- ❌ Importações CSV travam o navegador
- ❌ Relatórios grandes causam timeout
- ❌ Recálculo de inventário bloqueia requests
- ❌ Notificações em massa atrasam respostas
- ❌ Má experiência do usuário
- ❌ Impossível escalar

### Soluções com Jobs
- ✅ Processamento em background
- ✅ Resposta HTTP imediata
- ✅ Barra de progresso em tempo real
- ✅ Retry automático em caso de falha
- ✅ Múltiplos workers processando em paralelo
- ✅ Escalabilidade horizontal

## Arquitetura

### Filas Disponíveis

1. **`default`** - Fila padrão para jobs gerais
2. **`imports`** - Importações CSV (alta prioridade)
3. **`reports`** - Geração de relatórios (média prioridade)
4. **`notifications`** - Envio de notificações (já implementado)
5. **`calculations`** - Recálculos de inventário (baixa prioridade)

### Driver de Fila

- **Desenvolvimento**: `database` (simples, sem dependências)
- **Produção**: `redis` (recomendado, mais performático)

## Jobs a Implementar

### 1. Importações (`app/Jobs/Import/`)

#### ProcessStockCountImport
- **Função**: Processar importação CSV de contagens
- **Input**: StockCountImport ID
- **Output**: Atualiza import com resultados
- **Notifica**: ImportCompleted ou ImportFailed
- **Queue**: `imports`
- **Timeout**: 10 minutos
- **Retries**: 3

#### ProcessProductImport
- **Função**: Processar importação CSV de produtos
- **Input**: Arquivo CSV, Company ID
- **Output**: Produtos criados/atualizados
- **Notifica**: Conclusão via notificação
- **Queue**: `imports`
- **Timeout**: 15 minutos
- **Retries**: 3

### 2. Relatórios (`app/Jobs/Report/`)

#### GenerateStockVsCountReport
- **Função**: Gerar relatório de divergências
- **Input**: Filtros, formato (CSV/PDF)
- **Output**: Arquivo para download
- **Notifica**: Relatório pronto
- **Queue**: `reports`
- **Timeout**: 5 minutos
- **Retries**: 2

#### GenerateInventoryValuationReport
- **Função**: Calcular valoração de estoque
- **Input**: Data de referência, método (FIFO/LIFO/Média)
- **Output**: Relatório financeiro
- **Notifica**: Conclusão
- **Queue**: `reports`
- **Timeout**: 10 minutos
- **Retries**: 2

#### ExportData
- **Função**: Exportar grandes volumes de dados
- **Input**: Modelo, filtros, formato
- **Output**: Arquivo CSV/Excel
- **Notifica**: Download pronto
- **Queue**: `reports`
- **Timeout**: 15 minutos
- **Retries**: 1

### 3. Inventário (`app/Jobs/Inventory/`)

#### RecalculateInventoryLevels
- **Função**: Recalcular níveis de estoque por produto
- **Input**: Product ID ou Company ID (todos)
- **Output**: InventoryLevel atualizado
- **Queue**: `calculations`
- **Timeout**: 20 minutos
- **Retries**: 2

#### RecalculateProductCosts
- **Função**: Recalcular custos (FIFO/Média)
- **Input**: Product ID, método
- **Output**: Custo atualizado
- **Queue**: `calculations`
- **Timeout**: 10 minutos
- **Retries**: 2

#### SyncInventoryMovements
- **Função**: Sincronizar movimentações com ERP externo
- **Input**: Data range
- **Output**: Movimentações sincronizadas
- **Queue**: `default`
- **Timeout**: 30 minutos
- **Retries**: 3

### 4. Notificações (`app/Jobs/Notification/`)

#### SendBulkNotifications
- **Função**: Enviar notificações para múltiplos usuários
- **Input**: Notificação, lista de usuários
- **Output**: Notificações enviadas
- **Queue**: `notifications`
- **Timeout**: 10 minutos
- **Retries**: 2

#### CheckLowStockAlerts
- **Função**: Verificar estoque baixo e notificar
- **Input**: Company ID ou todos
- **Output**: Alertas enviados
- **Queue**: `notifications`
- **Timeout**: 5 minutos
- **Retries**: 1
- **Schedule**: Diário às 8h

#### CheckAuditDueReminders
- **Função**: Lembrar auditorias próximas do prazo
- **Input**: -
- **Output**: Lembretes enviados
- **Queue**: `notifications`
- **Timeout**: 5 minutos
- **Retries**: 1
- **Schedule**: Diário às 7h

### 5. Limpeza (`app/Jobs/Cleanup/`)

#### CleanOldNotifications
- **Função**: Deletar notificações antigas
- **Input**: -
- **Output**: Notificações deletadas
- **Queue**: `default`
- **Timeout**: 5 minutos
- **Retries**: 1
- **Schedule**: Semanal (domingos à meia-noite)

#### CleanFailedJobs
- **Função**: Limpar jobs falhados antigos
- **Input**: -
- **Output**: Jobs deletados
- **Queue**: `default`
- **Timeout**: 5 minutos
- **Retries**: 1
- **Schedule**: Mensal

## Estrutura de Arquivos

```
app/
├── Jobs/
│   ├── Import/
│   │   ├── ProcessStockCountImport.php
│   │   └── ProcessProductImport.php
│   ├── Report/
│   │   ├── GenerateStockVsCountReport.php
│   │   ├── GenerateInventoryValuationReport.php
│   │   └── ExportData.php
│   ├── Inventory/
│   │   ├── RecalculateInventoryLevels.php
│   │   ├── RecalculateProductCosts.php
│   │   └── SyncInventoryMovements.php
│   ├── Notification/
│   │   ├── SendBulkNotifications.php
│   │   ├── CheckLowStockAlerts.php
│   │   └── CheckAuditDueReminders.php
│   └── Cleanup/
│       ├── CleanOldNotifications.php
│       └── CleanFailedJobs.php
└── Console/
    └── Commands/
        ├── ProcessQueue.php (wrapper)
        ├── RetryFailedJobs.php
        └── PruneFailedJobs.php

database/
└── migrations/
    └── xxxx_create_jobs_table.php (já existe)

config/
└── queue.php (atualizar)

routes/
└── jobs.php (novo - APIs de status)
```

## Migrations

### Jobs Table (já existe no Laravel)
```bash
php artisan queue:table
php artisan queue:failed-table
php artisan migrate
```

## Configuration

### config/queue.php

```php
'default' => env('QUEUE_CONNECTION', 'database'),

'connections' => [
    'database' => [
        'driver' => 'database',
        'table' => 'jobs',
        'queue' => 'default',
        'retry_after' => 90,
        'after_commit' => false,
    ],

    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
        'after_commit' => false,
    ],
],

// Define queues priority
'queues' => [
    'imports',      // Highest priority
    'notifications',
    'reports',
    'calculations',
    'default',      // Lowest priority
],
```

## Como Usar

### Disparar um Job

```php
use App\Jobs\Import\ProcessStockCountImport;

// Dispatch para a fila
ProcessStockCountImport::dispatch($import);

// Dispatch para fila específica
ProcessStockCountImport::dispatch($import)
    ->onQueue('imports');

// Dispatch com delay
ProcessStockCountImport::dispatch($import)
    ->delay(now()->addMinutes(5));

// Dispatch síncrono (não usar em produção)
ProcessStockCountImport::dispatchSync($import);

// Chain de jobs
ProcessStockCountImport::withChain([
    new SendNotification($user, 'import_completed'),
])->dispatch($import);
```

### Processar Filas

```bash
# Processar fila específica
php artisan queue:work --queue=imports,notifications,default

# Processar com timeout
php artisan queue:work --timeout=300

# Processar apenas 1 job e parar
php artisan queue:work --once

# Processar com sleep entre jobs
php artisan queue:work --sleep=3

# Processar com limite de memória
php artisan queue:work --memory=128

# Processar até a fila esvaziar
php artisan queue:work --stop-when-empty
```

### Monitorar Filas

```bash
# Ver jobs falhados
php artisan queue:failed

# Retentar job falhado específico
php artisan queue:retry {id}

# Retentar todos os falhados
php artisan queue:retry all

# Limpar jobs falhados
php artisan queue:flush
```

## Supervisor (Produção)

### Configuração

```ini
[program:inmystock-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/inmystock/artisan queue:work database --sleep=3 --tries=3 --max-time=3600 --queue=imports,notifications,reports,calculations,default
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/inmystock/storage/logs/worker.log
stopwaitsecs=3600
```

Iniciar:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start inmystock-worker:*
```

## Agendamento (Scheduler)

### app/Console/Kernel.php

```php
protected function schedule(Schedule $schedule)
{
    // Verificar estoque baixo diariamente às 8h
    $schedule->job(new CheckLowStockAlerts)
        ->dailyAt('08:00')
        ->timezone('America/Sao_Paulo');

    // Lembrar auditorias diariamente às 7h
    $schedule->job(new CheckAuditDueReminders)
        ->dailyAt('07:00')
        ->timezone('America/Sao_Paulo');

    // Limpar notificações antigas semanalmente
    $schedule->job(new CleanOldNotifications)
        ->weekly()
        ->sundays()
        ->at('00:00');

    // Limpar jobs falhados mensalmente
    $schedule->job(new CleanFailedJobs)
        ->monthly();
}
```

Executar scheduler:
```bash
# No cron
* * * * * cd /var/www/inmystock && php artisan schedule:run >> /dev/null 2>&1
```

## Frontend Integration

### Rastrear Progresso de Job

```typescript
// Polling para verificar status
const checkJobStatus = async (jobId: string) => {
  const response = await fetch(`/api/jobs/${jobId}/status`);
  const data = await response.json();

  if (data.status === 'completed') {
    // Mostrar sucesso
  } else if (data.status === 'failed') {
    // Mostrar erro
  } else {
    // Atualizar barra de progresso
    // Continuar polling
    setTimeout(() => checkJobStatus(jobId), 2000);
  }
};
```

### Barra de Progresso

```tsx
<Progress value={progress} max={100} />
<p>{progress}% concluído</p>
```

## Métricas e Monitoramento

### Laravel Horizon (Recomendado para Redis)

```bash
composer require laravel/horizon
php artisan horizon:install
php artisan horizon
```

Interface web: `http://localhost/horizon`

### Métricas Manuais

```php
// Total de jobs na fila
DB::table('jobs')->count();

// Jobs falhados
DB::table('failed_jobs')->count();

// Jobs por fila
DB::table('jobs')->select('queue', DB::raw('count(*) as total'))
    ->groupBy('queue')
    ->get();
```

## Benefícios da Implementação

### Performance
- ✅ Resposta HTTP < 200ms (vs. minutos antes)
- ✅ Importações não bloqueiam sistema
- ✅ Relatórios gerados em background
- ✅ Múltiplos jobs processados em paralelo

### Experiência do Usuário
- ✅ Feedback imediato
- ✅ Barra de progresso
- ✅ Notificação quando concluir
- ✅ Pode continuar usando o sistema

### Confiabilidade
- ✅ Retry automático (3x por padrão)
- ✅ Logs de erros
- ✅ Timeouts configuráveis
- ✅ Graceful shutdown

### Escalabilidade
- ✅ Adicionar mais workers facilmente
- ✅ Priorização de filas
- ✅ Distribuição de carga
- ✅ Escalabilidade horizontal

## Fases de Implementação

### Fase 1 (Semana 1)
- ✅ Configurar sistema de filas (database)
- ✅ Criar job ProcessStockCountImport
- ✅ Refatorar StockCountImportController
- ✅ Testar importação assíncrona

### Fase 2 (Semana 2)
- ✅ Criar jobs de relatórios
- ✅ Criar jobs de inventário
- ✅ Criar jobs de notificações agendadas
- ✅ Implementar scheduler

### Fase 3 (Semana 3)
- ✅ Frontend - rastreamento de progresso
- ✅ APIs de status de jobs
- ✅ Monitoramento e alertas
- ✅ Documentação

### Fase 4 (Opcional - Produção)
- Migrar para Redis
- Configurar Supervisor
- Instalar Laravel Horizon
- Configurar múltiplos workers

## Troubleshooting

### Job não processa

```bash
# Verificar se worker está rodando
ps aux | grep "queue:work"

# Verificar jobs na fila
php artisan queue:work --once

# Ver logs
tail -f storage/logs/laravel.log
```

### Job falha constantemente

```bash
# Ver detalhes do erro
php artisan queue:failed

# Reprocessar após correção
php artisan queue:retry {id}
```

### Fila muito grande

```bash
# Adicionar mais workers (Supervisor)
sudo supervisorctl restart inmystock-worker:*

# Ou processar manualmente
php artisan queue:work --stop-when-empty
```

## Próximos Passos

1. Implementar batch jobs (Laravel 8+)
2. Implementar job events (JobProcessing, JobProcessed, JobFailed)
3. Adicionar webhook notifications
4. Implementar rate limiting para jobs
5. Criar dashboard customizado de monitoramento
