# Análise de Nível de Desenvolvimento - InMyStock

**Data da Análise:** 06 de Novembro de 2025
**Versão Analisada:** Branch `claude/inmystock-project-analysis-011CUsGrnpJSasibyL9TTSbg`

---

## 📊 Resumo Executivo

### Nível de Desenvolvimento: **75% - MVP AVANÇADO**

O projeto **InMyStock** encontra-se em um **estágio avançado de desenvolvimento**, com os módulos principais completamente implementados e funcionais. O sistema já é **utilizável em produção** para os casos de uso principais de auditoria de estoque, mas existem módulos complementares importantes que podem ser adicionados para tornar o sistema mais completo.

### Pontuação por Categoria

| Categoria | Completude | Status |
|-----------|------------|---------|
| **Autenticação e Segurança** | 95% | ✅ Completo |
| **Gestão de Estoque (Core)** | 85% | ✅ Muito Bom |
| **Auditoria de Estoque** | 90% | ✅ Completo |
| **Relatórios Básicos** | 70% | ⚠️ Funcional |
| **Gestão de Produtos** | 80% | ✅ Muito Bom |
| **Movimentações** | 75% | ⚠️ Funcional |
| **Integrações** | 20% | ❌ Básico |
| **Notificações** | 10% | ❌ Não Implementado |
| **Jobs Assíncronos** | 10% | ❌ Não Implementado |
| **API Externa** | 0% | ❌ Não Existe |
| **Rastreabilidade Avançada** | 30% | ❌ Parcial |
| **Planejamento de Estoque** | 40% | ⚠️ Básico |

---

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO (Funcional)

### 1. Autenticação e Segurança (95%)
- ✅ Login/Logout completo
- ✅ Registro de usuários
- ✅ Autenticação de dois fatores (2FA/TOTP)
- ✅ Verificação de e-mail
- ✅ Recuperação de senha
- ✅ Confirmação de senha para ações sensíveis
- ✅ Gestão de sessões
- ✅ Rate limiting

### 2. RBAC - Controle de Acesso (100%)
- ✅ 5 Roles hierárquicas (Admin, Gerente, Auditor, Operador, Visualizador)
- ✅ Sistema de permissões granulares
- ✅ Middleware de verificação de roles e permissões
- ✅ Proteção de rotas por permissão
- ✅ Verificação no frontend e backend

### 3. Gestão de Produtos (80%)
- ✅ CRUD completo de produtos
- ✅ Suporte para variações (cor, tamanho, etc.)
- ✅ Agrupamento por referência principal
- ✅ Códigos de barras e SKUs
- ✅ Categorização de produtos
- ✅ Importação em massa via CSV
- ✅ Controle de estoque mínimo/máximo
- ✅ Geração automática de códigos
- ⚠️ **Falta:** Lotes/batches, datas de validade, múltiplos fornecedores por produto

### 4. Auditorias de Estoque (90%)
- ✅ Criação de campanhas de auditoria
- ✅ Múltiplas contagens por auditoria
- ✅ Controle de status (planejado, em andamento, concluído)
- ✅ Importação de contagens via CSV
- ✅ Suporte para delimitadores flexíveis
- ✅ Histórico completo de importações
- ✅ Vinculação com áreas/localizações
- ✅ Atribuição de responsáveis e contadores
- ⚠️ **Falta:** Agendamento automático de auditorias recorrentes

### 5. Gestão de Inventário (75%)
- ✅ Níveis de estoque em tempo real
- ✅ Controle por produto e área
- ✅ Quantidade disponível vs. reservada
- ✅ Cálculo automático de disponibilidade
- ✅ Alertas de estoque baixo
- ⚠️ **Falta:** Reservas automáticas, integração com vendas, FIFO/FEFO

### 6. Movimentações de Estoque (75%)
- ✅ Entrada de produtos
- ✅ Saída de produtos
- ✅ Ajustes de estoque
- ✅ Transferências entre áreas
- ✅ Registro de custos (unitário e total)
- ✅ Referência polimórfica (para vincular a documentos)
- ✅ Atualização automática de níveis de estoque
- ✅ Exportação para CSV
- ⚠️ **Falta:** Vinculação com pedidos de compra/venda, aprovação de movimentações

### 7. Fornecedores (70%)
- ✅ CRUD completo
- ✅ Informações de contato completas
- ✅ Status ativo/inativo
- ✅ Geração automática de códigos
- ⚠️ **Falta:** Histórico de compras, avaliação de fornecedores, múltiplos contatos

### 8. Áreas/Localizações (70%)
- ✅ CRUD completo
- ✅ Suporte para múltiplas localizações por área
- ✅ Códigos únicos
- ✅ Descrição e status
- ⚠️ **Falta:** Endereçamento detalhado (prateleiras, corredores), mapeamento visual

### 9. Relatórios (70%)
- ✅ Estoque Teórico vs. Contado (divergências)
- ✅ Contagem vs. Contagem (comparação)
- ✅ Produtos Ausentes em contagem
- ✅ Exportação para CSV
- ✅ Filtros avançados
- ✅ Resumos estatísticos
- ⚠️ **Falta:** Giro de estoque, curva ABC, valoração de estoque, obsolescência, acuracidade

### 10. Dashboard (80%)
- ✅ KPIs principais (produtos, fornecedores, áreas, auditorias)
- ✅ Produtos com estoque baixo
- ✅ Auditorias recentes
- ✅ Estatísticas por categoria
- ✅ Indicadores por status
- ⚠️ **Falta:** Gráficos visuais, tendências, previsões

### 11. Multi-tenancy (90%)
- ✅ Suporte completo para múltiplas empresas
- ✅ Isolamento automático de dados via trait `BelongsToCompany`
- ✅ Gestão de empresas
- ⚠️ **Falta:** Configurações por empresa, branding personalizado

### 12. Auditoria Automática (95%)
- ✅ Rastreamento automático de todas as alterações
- ✅ Registro de valores antigos e novos
- ✅ Identificação de usuário responsável
- ✅ Timestamps completos
- ✅ Exclusão de campos sensíveis (password, tokens, 2FA)
- ✅ Visualização de logs pessoais
- ✅ Visualização de todos os logs (admin)

### 13. Configurações de Usuário (85%)
- ✅ Perfil e avatar
- ✅ Alteração de senha
- ✅ 2FA (ativar/desativar)
- ✅ Tema claro/escuro
- ✅ Visualização de auditoria pessoal
- ✅ Gestão de categorias
- ⚠️ **Falta:** Preferências de notificações, idioma

### 14. Administração (75%)
- ✅ Gestão de usuários (CRUD)
- ✅ Atribuição de roles
- ✅ Gestão de empresas
- ✅ Visualização de logs do sistema
- ⚠️ **Falta:** Configurações globais, manutenção do sistema, backups

---

## ⚠️ MÓDULOS CRÍTICOS FALTANTES

### 1. Sistema de Notificações (Prioridade: ALTA) - 0%
**Status:** NÃO IMPLEMENTADO

O sistema não possui nenhum mecanismo de notificação, o que é crítico para:
- Alertas de estoque baixo
- Notificação de auditorias pendentes
- Aprovações de movimentações
- Conclusão de importações
- Alertas de divergências críticas

**O que falta:**
- ❌ Pasta `app/Notifications/` não existe
- ❌ Nenhuma classe de notificação criada
- ❌ Sem envio de e-mails automáticos
- ❌ Sem notificações in-app
- ❌ Sem sistema de alertas em tempo real

**Impacto:** ALTO - Usuários não recebem alertas importantes

**Esforço estimado:** 2-3 semanas

### 2. Jobs Assíncronos/Background (Prioridade: ALTA) - 0%
**Status:** NÃO IMPLEMENTADO

O sistema processa tudo de forma síncrona, causando:
- Lentidão em importações grandes
- Timeout em operações pesadas
- Má experiência do usuário

**O que falta:**
- ❌ Pasta `app/Jobs/` não existe
- ❌ Queue configurado como 'sync' (síncrono)
- ❌ Importações CSV processadas em tempo real
- ❌ Relatórios grandes gerados síncronamente
- ❌ Sem workers para processar filas

**Onde seria útil:**
- Importação de produtos via CSV
- Importação de contagens via CSV
- Geração de relatórios complexos
- Recalculo em massa de inventário
- Envio de e-mails em lote
- Processamento de auditorias grandes

**Impacto:** ALTO - Performance e escalabilidade limitadas

**Esforço estimado:** 1-2 semanas

### 3. API REST Externa (Prioridade: MÉDIA) - 0%
**Status:** NÃO EXISTE

O sistema não expõe nenhuma API REST para integração externa.

**O que falta:**
- ❌ Nenhuma rota em `routes/api.php`
- ❌ Sem autenticação via token (Sanctum)
- ❌ Sem versionamento de API
- ❌ Sem documentação de API (Swagger/OpenAPI)
- ❌ Sem rate limiting para API
- ❌ Sem webhooks

**Casos de uso bloqueados:**
- Integração com ERP externo
- Integração com e-commerce
- Integração com coletores de código de barras
- Integração com aplicativos mobile de terceiros
- Sincronização com outros sistemas

**Impacto:** MÉDIO - Limita integrações externas

**Esforço estimado:** 3-4 semanas

---

## ⚠️ MÓDULOS IMPORTANTES FALTANTES

### 4. Gestão de Compras (Prioridade: ALTA) - 0%
**Status:** NÃO IMPLEMENTADO

Sem módulo de compras, o ciclo de estoque fica incompleto.

**O que falta:**
- ❌ Pedidos de Compra
- ❌ Ordens de Compra
- ❌ Recebimento de Mercadorias
- ❌ Notas Fiscais de Entrada
- ❌ Conferência de Recebimento
- ❌ Vinculação entre Pedido → Recebimento → Estoque

**Impacto:** ALTO - Processo de entrada manual e sem rastreabilidade

**Esforço estimado:** 4-5 semanas

### 5. Gestão de Vendas/Expedição (Prioridade: ALTA) - 0%
**Status:** NÃO IMPLEMENTADO

Sem módulo de vendas, as saídas não têm contexto.

**O que falta:**
- ❌ Pedidos de Venda
- ❌ Picking/Separação
- ❌ Expedição
- ❌ Gestão de Clientes
- ❌ Notas Fiscais de Saída
- ❌ Vinculação entre Pedido → Separação → Expedição

**Impacto:** ALTO - Saídas são genéricas, sem rastreabilidade

**Esforço estimado:** 4-5 semanas

### 6. Rastreabilidade Avançada (Prioridade: ALTA) - 30%
**Status:** PARCIALMENTE IMPLEMENTADO

O sistema tem rastreabilidade básica via movimentações, mas falta:

**O que falta:**
- ❌ Gestão de Lotes/Batches
- ❌ Números de Série
- ❌ Datas de Validade
- ❌ Rastreamento FIFO (First In, First Out)
- ❌ Rastreamento FEFO (First Expired, First Out)
- ❌ Recall de produtos por lote
- ❌ Histórico completo de um item específico

**O que existe:**
- ✅ Histórico de movimentações por produto
- ✅ Referência polimórfica para documentos

**Impacto:** ALTO - Crítico para indústrias reguladas (alimentos, medicamentos)

**Esforço estimado:** 3-4 semanas

### 7. Planejamento de Estoque (Prioridade: MÉDIA) - 40%
**Status:** BÁSICO

O sistema tem estoque mínimo/máximo, mas falta inteligência.

**O que existe:**
- ✅ Estoque mínimo e máximo por produto
- ✅ Alertas de estoque baixo no dashboard

**O que falta:**
- ❌ Reposição automática baseada em min/max
- ❌ Previsão de demanda
- ❌ Análise de Curva ABC
- ❌ Ponto de Recompra (ROP)
- ❌ Lead time de fornecedores
- ❌ Quantidade Econômica de Pedido (EOQ)
- ❌ Análise de giro de estoque
- ❌ Sugestões de compra

**Impacto:** MÉDIO - Gestão de estoque é reativa, não proativa

**Esforço estimado:** 3-4 semanas

### 8. Relatórios Avançados (Prioridade: MÉDIA) - 30%
**Status:** BÁSICO

Existem 3 relatórios básicos, mas faltam análises críticas.

**O que existe:**
- ✅ Estoque vs. Contagem
- ✅ Contagem vs. Contagem
- ✅ Produtos Ausentes

**O que falta:**
- ❌ Giro de Estoque
- ❌ Valoração de Estoque (FIFO, LIFO, Custo Médio)
- ❌ Curva ABC de Produtos
- ❌ Análise de Obsolescência
- ❌ Acuracidade de Inventário (%)
- ❌ Produtos com Baixo Giro
- ❌ Análise de Divergências por Período
- ❌ Performance de Contadores
- ❌ Relatórios customizáveis
- ❌ Exportação para PDF
- ❌ Gráficos e dashboards visuais

**Impacto:** MÉDIO - Decisões estratégicas limitadas

**Esforço estimado:** 2-3 semanas

### 9. Localização Física Detalhada (Prioridade: MÉDIA) - 40%
**Status:** BÁSICO

O sistema tem "áreas", mas falta granularidade.

**O que existe:**
- ✅ Áreas (ex: Armazém A, Armazém B)
- ✅ Campo `location_count` (contador de localizações)

**O que falta:**
- ❌ Endereçamento hierárquico (Armazém → Corredor → Prateleira → Posição)
- ❌ Mapeamento visual do armazém
- ❌ Otimização de rotas de picking
- ❌ Sugestão de localização para armazenagem
- ❌ Densidade de ocupação por área
- ❌ Capacidade máxima por localização

**Impacto:** MÉDIO - Dificulta operações em armazéns grandes

**Esforço estimado:** 2-3 semanas

### 10. Custos e Financeiro (Prioridade: MÉDIA) - 40%
**Status:** BÁSICO

O sistema registra custos, mas não faz cálculos avançados.

**O que existe:**
- ✅ `unit_cost` e `total_cost` em movimentações
- ✅ `cost` e `price` em produtos

**O que falta:**
- ❌ Cálculo de Custo Médio Ponderado
- ❌ Custo FIFO/LIFO
- ❌ Valoração total de estoque
- ❌ Custo de armazenagem
- ❌ Margem de lucro por produto
- ❌ Relatórios financeiros de estoque
- ❌ Histórico de variação de custos
- ❌ Integração com módulo financeiro

**Impacto:** MÉDIO - Análise financeira limitada

**Esforço estimado:** 2-3 semanas

---

## 🔧 MELHORIAS TÉCNICAS NECESSÁRIAS

### 1. Testes Automatizados (Cobertura: ~30%)
**Status:** PARCIAL

**O que existe:**
- ✅ 14 testes Feature (autenticação, settings, admin)
- ✅ PHPUnit configurado
- ✅ Testes de autenticação completos

**O que falta:**
- ❌ Testes para ProductController
- ❌ Testes para InventoryMovementController
- ❌ Testes para StockAuditController
- ❌ Testes para ReportController
- ❌ Testes unitários de Models
- ❌ Testes de integração de workflows completos
- ❌ Testes de frontend (Jest/Vitest)
- ❌ Testes E2E (Cypress/Playwright)

**Impacto:** MÉDIO - Regressões não são detectadas automaticamente

**Esforço estimado:** 3-4 semanas

### 2. Documentação de Código (Cobertura: ~50%)
**Status:** PARCIAL

**O que existe:**
- ✅ README.md completo
- ✅ CLAUDE.md com instruções
- ✅ DocBlocks em alguns métodos

**O que falta:**
- ❌ Documentação de API (caso seja criada)
- ❌ Diagramas de fluxo
- ❌ Guia de contribuição detalhado
- ❌ Changelog estruturado
- ❌ Documentação de componentes React
- ❌ Guia de deploy detalhado
- ❌ Troubleshooting guide

**Impacto:** BAIXO - Mas dificulta onboarding de novos desenvolvedores

**Esforço estimado:** 1-2 semanas

### 3. Logs e Monitoramento (Prioridade: BAIXA) - 30%
**Status:** BÁSICO

**O que existe:**
- ✅ Laravel Pail para logs em desenvolvimento
- ✅ Logs padrão do Laravel

**O que falta:**
- ❌ Monitoramento de performance (New Relic, Datadog)
- ❌ Tracking de erros (Sentry, Bugsnag)
- ❌ Métricas de negócio (Mixpanel, Amplitude)
- ❌ Logs estruturados
- ❌ Dashboards de monitoramento

**Impacto:** BAIXO em desenvolvimento, ALTO em produção

**Esforço estimado:** 1 semana

---

## 📱 FUNCIONALIDADES COMPLEMENTARES

### 1. Aplicativo Mobile/PWA (Prioridade: ALTA) - 0%
**Status:** NÃO EXISTE

**O que falta:**
- ❌ Progressive Web App (PWA)
- ❌ App mobile nativo (iOS/Android)
- ❌ Scanner de código de barras via câmera
- ❌ Contagem offline
- ❌ Sincronização automática

**Impacto:** ALTO - Contagem em campo é limitada

**Esforço estimado:** 6-8 semanas

### 2. Impressão de Documentos (Prioridade: MÉDIA) - 0%
**Status:** NÃO IMPLEMENTADO

**O que falta:**
- ❌ Impressão de etiquetas de produtos
- ❌ Impressão de etiquetas de localização
- ❌ Relatórios em PDF
- ❌ Documentos de movimentação
- ❌ Fichas de contagem para impressão

**Impacto:** MÉDIO - Dificulta operações físicas

**Esforço estimado:** 2 semanas

### 3. Dashboards Visuais (Prioridade: MÉDIA) - 40%
**Status:** BÁSICO

**O que existe:**
- ✅ KPIs numéricos no dashboard
- ✅ Listas de produtos com estoque baixo

**O que falta:**
- ❌ Gráficos de linha (tendências)
- ❌ Gráficos de pizza (distribuição)
- ❌ Gráficos de barras (comparações)
- ❌ Mapas de calor
- ❌ Widgets customizáveis
- ❌ Exportação de dashboards

**Impacto:** MÉDIO - Visualização de dados limitada

**Esforço estimado:** 2-3 semanas

---

## 🎯 ROADMAP RECOMENDADO

### Fase 1: Estabilização (Curto Prazo - 1-2 meses)
**Objetivo:** Tornar o MVP atual robusto e pronto para produção

1. **Implementar Sistema de Notificações** ⭐⭐⭐
   - E-mails de alertas
   - Notificações in-app
   - Alertas de estoque baixo

2. **Implementar Jobs Assíncronos** ⭐⭐⭐
   - Processar importações em background
   - Melhorar performance
   - Adicionar barra de progresso

3. **Aumentar Cobertura de Testes** ⭐⭐
   - Testes para controllers principais
   - Testes de integração de workflows
   - CI/CD com testes automáticos

4. **Melhorar Relatórios Existentes** ⭐⭐
   - Adicionar gráficos visuais
   - Exportação para PDF
   - Agendamento de relatórios

### Fase 2: Expansão Core (Médio Prazo - 3-4 meses)
**Objetivo:** Completar funcionalidades críticas de estoque

5. **Gestão de Compras** ⭐⭐⭐
   - Pedidos de compra
   - Recebimento de mercadorias
   - Vinculação com movimentações

6. **Rastreabilidade Avançada** ⭐⭐⭐
   - Lotes e números de série
   - FIFO/FEFO
   - Datas de validade

7. **Planejamento de Estoque** ⭐⭐
   - Reposição automática
   - Previsão de demanda
   - Curva ABC

8. **Aplicativo Mobile/PWA** ⭐⭐⭐
   - Contagem em campo
   - Scanner de código de barras
   - Modo offline

### Fase 3: Integração e Inteligência (Longo Prazo - 5-6 meses)
**Objetivo:** Tornar o sistema integrado e inteligente

9. **API REST Externa** ⭐⭐
   - Endpoints de integração
   - Autenticação via token
   - Documentação Swagger

10. **Gestão de Vendas** ⭐⭐
    - Pedidos de venda
    - Picking e expedição
    - Gestão de clientes

11. **Relatórios Avançados** ⭐⭐
    - Giro de estoque
    - Valoração de estoque
    - Análise de obsolescência

12. **Custos e Financeiro** ⭐⭐
    - Custo médio ponderado
    - Valoração total
    - Margem de lucro

### Fase 4: Otimização e Escala (Longo Prazo - 7+ meses)
**Objetivo:** Preparar para grandes volumes

13. **Localização Física Detalhada** ⭐
    - Endereçamento hierárquico
    - Mapeamento visual
    - Otimização de rotas

14. **BI e Analytics** ⭐
    - Dashboards customizáveis
    - Machine Learning para previsões
    - Análises preditivas

15. **Otimizações de Performance** ⭐
    - Cache avançado
    - Otimização de queries
    - Sharding de banco de dados

---

## 📈 MÉTRICAS DE COMPLETUDE POR CASO DE USO

### Caso de Uso 1: Auditoria de Estoque (COMPLETO - 90%)
**Status:** ✅ PRONTO PARA PRODUÇÃO

**Fluxo:**
1. ✅ Criar auditoria
2. ✅ Criar múltiplas contagens
3. ✅ Importar contagens via CSV
4. ✅ Visualizar divergências
5. ✅ Gerar relatórios
6. ⚠️ **Falta:** Notificações automáticas, agendamento

### Caso de Uso 2: Controle de Estoque Básico (BOM - 75%)
**Status:** ⚠️ FUNCIONAL, MAS LIMITADO

**Fluxo:**
1. ✅ Cadastrar produtos
2. ✅ Registrar entradas/saídas
3. ✅ Visualizar níveis de estoque
4. ✅ Alertas de estoque baixo
5. ⚠️ **Falta:** Pedidos de compra, FIFO/FEFO, lotes

### Caso de Uso 3: Gestão de Compras (NÃO IMPLEMENTADO - 20%)
**Status:** ❌ NÃO FUNCIONAL

**Fluxo:**
1. ❌ Criar pedido de compra
2. ❌ Aprovar pedido
3. ❌ Registrar recebimento
4. ✅ Conferir com nota fiscal (manual)
5. ✅ Dar entrada no estoque

### Caso de Uso 4: Gestão de Vendas (NÃO IMPLEMENTADO - 15%)
**Status:** ❌ NÃO FUNCIONAL

**Fluxo:**
1. ❌ Criar pedido de venda
2. ❌ Separar produtos (picking)
3. ❌ Registrar expedição
4. ✅ Dar saída no estoque (manual)

### Caso de Uso 5: Rastreabilidade (LIMITADO - 40%)
**Status:** ⚠️ BÁSICO

**Fluxo:**
1. ✅ Ver histórico de movimentações de um produto
2. ❌ Rastrear lote específico
3. ❌ Rastrear número de série
4. ✅ Ver auditoria de alterações
5. ❌ Fazer recall por lote

---

## 💡 RECOMENDAÇÕES PRIORITÁRIAS

### Curto Prazo (Próximas 2 semanas)
1. **Implementar Sistema de Notificações** (E-mails básicos)
2. **Mover importações CSV para Jobs assíncronos**
3. **Adicionar testes para ProductController e InventoryMovementController**

### Médio Prazo (Próximos 2 meses)
4. **Implementar módulo de Compras básico**
5. **Adicionar suporte a Lotes e Validades**
6. **Criar PWA para contagem em campo**

### Longo Prazo (3-6 meses)
7. **Desenvolver API REST completa**
8. **Implementar módulo de Vendas**
9. **Adicionar relatórios avançados (Giro, ABC, Valoração)**

---

## 🎓 CONCLUSÃO

### O que o sistema JÁ FAZ MUITO BEM:
✅ Auditoria de estoque completa e robusta
✅ Controle de acesso granular e seguro
✅ Gestão básica de estoque funcional
✅ Multi-tenancy bem implementado
✅ Interface moderna e responsiva
✅ Importação em massa via CSV

### O que o sistema PRECISA para ser COMPLETO:
⚠️ Sistema de notificações
⚠️ Jobs assíncronos para operações pesadas
⚠️ Módulo de compras (Pedidos → Recebimento)
⚠️ Rastreabilidade por lote/série/validade
⚠️ Aplicativo mobile/PWA para campo

### O que seria DESEJÁVEL mas não crítico:
💡 API REST externa
💡 Módulo de vendas completo
💡 Relatórios avançados (Giro, ABC, etc.)
💡 Planejamento inteligente de estoque
💡 Custos e valoração avançados

---

## 📝 NOTA FINAL

O projeto **InMyStock** está em um **excelente nível de desenvolvimento** para um MVP. O core da aplicação (auditoria de estoque) está **completo e funcional**. O sistema já pode ser utilizado em produção para o caso de uso principal.

As funcionalidades faltantes são **complementares** e podem ser implementadas gradualmente conforme a demanda dos usuários. A arquitetura atual é sólida e permite expansão sem refatorações significativas.

**Recomendação:** Colocar em produção para usuários beta, coletar feedback, e priorizar desenvolvimentos baseado em uso real.

---

**Analista:** Claude (Anthropic)
**Data:** 06/11/2025
**Versão do Documento:** 1.0
