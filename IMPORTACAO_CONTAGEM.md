# 📦 Importação de Contagem de Estoque - InMyStock

## 🎯 Visão Geral

Este sistema permite importar dados de contagem de estoque através de arquivos de texto (TXT ou CSV), suportando dois formatos diferentes de acordo com a necessidade de cada operação.

## 📋 Formatos Suportados

### 1. Somente Código de Barras
**Quando usar:** Quando você tem uma leitora de código de barras e passa produto por produto.

**Formato do arquivo:**
```
7891234567890
7891234567890
7895678901234
7891234567890
```

**Características:**
- Um código de barras por linha
- Códigos podem se repetir
- O sistema conta automaticamente as ocorrências
- Ideal para contagem com leitora de código de barras

**Exemplo de resultado:**
- `7891234567890`: 3 unidades (aparece 3 vezes)
- `7895678901234`: 1 unidade (aparece 1 vez)

### 2. Código de Barras + Quantidade
**Quando usar:** Quando você já tem a quantidade contada e quer inserir direto.

**Formato do arquivo:**
```
7891234567890,5
7895678901234,12
7896543210987,8
```

**Características:**
- Formato: `código[separador]quantidade`
- Suporta diferentes separadores (vírgula, ponto e vírgula, tab, pipe)
- Quantidade pode ter decimais (ex: 2.5)
- Ideal para contagens manuais com anotação de quantidade

## 🔧 Delimitadores Suportados

Para o formato "Código + Quantidade", você pode escolher o separador:

| Separador | Símbolo | Exemplo |
|-----------|---------|---------|
| Vírgula | `,` | `7891234567890,5` |
| Ponto e Vírgula | `;` | `7891234567890;5` |
| Tabulação | Tab | `7891234567890[TAB]5` |
| Pipe | `\|` | `7891234567890\|5` |

## 📁 Tipos de Arquivo

- **TXT**: Arquivo de texto simples
- **CSV**: Arquivo separado por vírgulas ou outro delimitador
- **Tamanho máximo**: 10 MB

## 🚀 Como Usar

### Passo 1: Preparar o Arquivo

#### Opção A: Somente Código de Barras
1. Crie um arquivo TXT
2. Adicione um código de barras por linha
3. Códigos repetidos são automaticamente contados
4. Salve o arquivo

#### Opção B: Código + Quantidade
1. Crie um arquivo TXT ou CSV
2. Formato: `codigo[separador]quantidade`
3. Escolha um separador consistente
4. Salve o arquivo

### Passo 2: Acessar a Importação

1. Acesse **Menu → Auditorias de Estoque**
2. Clique em uma auditoria
3. Visualize a lista de contagens
4. Clique no botão **"Importar"** da contagem desejada

### Passo 3: Configurar a Importação

1. **Selecione o formato:**
   - Somente Código de Barras
   - Código de Barras + Quantidade

2. **Se escolheu "Código + Quantidade":**
   - Selecione o separador usado no arquivo

3. **Envie o arquivo:**
   - Clique em "Escolher arquivo"
   - Selecione o arquivo preparado
   - Clique em "Importar Arquivo"

### Passo 4: Acompanhar o Resultado

Após o upload, você verá:
- ✅ Total de linhas processadas
- ✅ Linhas bem-sucedidas
- ❌ Linhas com erro (se houver)
- 📊 Taxa de sucesso
- 🔍 Lista detalhada de erros

## ⚠️ Regras Importantes

### ✅ O que o sistema FAZ:

1. **Acumula quantidades duplicadas:**
   - Se o mesmo produto aparece 2x no arquivo, as quantidades são somadas

2. **Soma com existentes:**
   - Se o produto já existe na contagem, a quantidade é adicionada

3. **Valida códigos:**
   - Verifica se o produto existe no sistema
   - Reporta produtos não encontrados como erro

4. **Processa linha por linha:**
   - Erros em uma linha não afetam as outras
   - Continua processando mesmo com erros

### ❌ O que o sistema NÃO permite:

1. **Produtos não cadastrados:**
   - Produtos que não existem no sistema são rejeitados
   - Aparecem na lista de erros

2. **Quantidades inválidas:**
   - Quantidade zero ou negativa
   - Formato incorreto (letras em vez de números)

3. **Formato incorreto:**
   - Linhas que não seguem o padrão escolhido
   - Falta de separador (quando necessário)

## 📊 Exemplo Completo

### Cenário: Contagem de Loja

**Arquivo: contagem_loja_A.txt**
```
7891234567890
7891234567890
7895678901234
7891234567890
7896543210987
7895678901234
7899876543210
```

**Resultado:**
```
✅ 7 linhas processadas
✅ 7 linhas bem-sucedidas
❌ 0 linhas com erro

Produtos contados:
- Produto A (7891234567890): 3 unidades
- Produto B (7895678901234): 2 unidades
- Produto C (7896543210987): 1 unidade
- Produto D (7899876543210): 1 unidade
```

## 🔍 Histórico de Importações

Acesse o histórico para:
- Ver todas as importações realizadas
- Baixar arquivos originais
- Verificar erros de importações antigas
- Consultar estatísticas

**Caminho:** Detalhes da Contagem → Ver Histórico de Importações

## 🆘 Solução de Problemas

### Erro: "Produto não encontrado no sistema"
**Solução:** Cadastre o produto no sistema antes de importar

### Erro: "Formato inválido"
**Solução:** Verifique se o arquivo segue o padrão correto
- Para "Somente Código": um código por linha
- Para "Código + Quantidade": código[separador]quantidade

### Erro: "Quantidade inválida"
**Solução:** Verifique se a quantidade é um número positivo

### Muitos erros na importação
**Solução:**
1. Baixe o arquivo original
2. Verifique a lista de erros
3. Corrija os problemas
4. Faça nova importação

## 💡 Dicas e Melhores Práticas

1. **Teste com arquivo pequeno:**
   - Faça primeiro com 5-10 linhas
   - Verifique se está funcionando
   - Depois importe o arquivo completo

2. **Use encoding UTF-8:**
   - Evita problemas com caracteres especiais
   - Garante compatibilidade

3. **Linhas vazias são ignoradas:**
   - Pode ter linhas em branco
   - Não afeta o processamento

4. **Backup dos arquivos:**
   - Guarde os arquivos originais
   - Sistema permite baixar depois

5. **Importação incremental:**
   - Pode importar múltiplas vezes
   - Quantidades são somadas
   - Útil para contagem por área/setor

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este manual primeiro
2. Consulte o histórico de importações
3. Entre em contato com o administrador do sistema

---

**Versão do documento:** 1.0
**Última atualização:** 2025-10-03
