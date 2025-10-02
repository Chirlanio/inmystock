# Button Component

Um componente Button robusto e versátil construído com Radix UI, class-variance-authority (CVA) e Tailwind CSS.

## Características

- ✅ **9 Variantes**: default, destructive, outline, secondary, ghost, link, success, warning
- ✅ **7 Tamanhos**: sm, default, lg, xl, icon, icon-sm, icon-lg
- ✅ **Loading State**: Spinner automático com `loading` prop
- ✅ **Ícones**: Suporte para `leftIcon` e `rightIcon`
- ✅ **TypeScript**: Totalmente tipado com TypeScript
- ✅ **Acessibilidade**: Suporte completo para atributos ARIA e focus-visible
- ✅ **Polimórfico**: Suporte para `asChild` com Radix Slot
- ✅ **Responsivo**: Tamanhos adaptáveis de ícones baseados no size do botão

## Instalação

O componente já está instalado no projeto. Importação:

```tsx
import { Button } from '@/components/ui/button';
```

## Props

```typescript
interface ButtonProps extends React.ComponentProps<"button"> {
  // Variante visual do botão
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning"

  // Tamanho do botão
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg"

  // Estado de carregamento (mostra spinner)
  loading?: boolean

  // Ícone à esquerda do texto
  leftIcon?: React.ReactNode

  // Ícone à direita do texto
  rightIcon?: React.ReactNode

  // Renderiza como elemento filho (Radix Slot)
  asChild?: boolean

  // Todos os atributos HTML padrão de button
  // (onClick, disabled, type, etc.)
}
```

## Exemplos de Uso

### Básico

```tsx
<Button>Clique aqui</Button>
```

### Com Variantes

```tsx
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="success">Salvar</Button>
<Button variant="warning">Atenção</Button>
```

### Com Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="xl">Extra Grande</Button>
```

### Com Ícones (Recomendado ✨)

```tsx
import { Plus, Edit, Trash2, Download } from 'lucide-react';

// Ícone à esquerda
<Button leftIcon={<Plus />}>
  Criar Novo
</Button>

// Ícone à direita
<Button rightIcon={<ArrowRight />}>
  Próximo
</Button>

// Apenas ícone
<Button size="icon">
  <Edit />
</Button>

<Button size="icon-sm">
  <X />
</Button>

<Button size="icon-lg">
  <Save />
</Button>
```

### Com Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

<Button loading={isLoading}>
  Salvando...
</Button>

// O texto ainda é exibido, mas um spinner aparece no lugar do ícone
<Button loading={processing} leftIcon={<Save />}>
  Salvar
</Button>
```

### Desabilitado

```tsx
<Button disabled>
  Desabilitado
</Button>
```

### Em Formulários

```tsx
const { data, post, processing } = useForm({...});

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  post('/endpoint');
};

<form onSubmit={handleSubmit}>
  <Button type="submit" loading={processing}>
    Enviar
  </Button>
</form>
```

### Com Link (Inertia)

```tsx
import { Link } from '@inertiajs/react';

// Usando asChild (não suporta leftIcon/rightIcon/loading)
<Button variant="outline" asChild>
  <Link href="/areas">Voltar</Link>
</Button>

// Recomendado: Usar onClick
<Button variant="outline" onClick={() => router.visit('/areas')}>
  Voltar
</Button>

// Com ícone (use onClick, não asChild)
<Button variant="outline" leftIcon={<ArrowLeft />} onClick={() => router.visit('/areas')}>
  Voltar
</Button>
```

### Padrões de Uso Comum

#### Actions de Modal

```tsx
<DialogFooter>
  <Button variant="outline" onClick={() => setIsOpen(false)}>
    Cancelar
  </Button>
  <Button loading={processing} onClick={handleSave}>
    Salvar
  </Button>
</DialogFooter>
```

#### Actions de Tabela

```tsx
<div className="flex gap-2">
  <Button
    variant="ghost"
    size="icon-sm"
    onClick={() => handleView(item)}
    title="Visualizar"
  >
    <Eye />
  </Button>
  <Button
    variant="ghost"
    size="icon-sm"
    onClick={() => handleEdit(item)}
    title="Editar"
  >
    <Edit />
  </Button>
  <Button
    variant="ghost"
    size="icon-sm"
    onClick={() => handleDelete(item)}
    title="Excluir"
    className="text-destructive hover:text-destructive"
  >
    <Trash2 />
  </Button>
</div>
```

#### Botão de Criar/Adicionar

```tsx
<Button leftIcon={<Plus />} onClick={() => setIsCreateModalOpen(true)}>
  Nova Auditoria
</Button>
```

#### Navegação com Ícone

```tsx
import { ArrowLeft } from 'lucide-react';

<Button variant="ghost" size="icon" onClick={() => router.visit('/back')}>
  <ArrowLeft />
</Button>
```

## Melhores Práticas

### ✅ Faça

- Use `leftIcon` e `rightIcon` em vez de colocar ícones diretamente como children
- Use `loading` prop para estados de carregamento
- Use tamanhos específicos de ícone (`icon`, `icon-sm`, `icon-lg`) para botões apenas com ícone
- Use `title` attribute para acessibilidade em botões apenas com ícone
- Use `variant="destructive"` para ações destrutivas (excluir, remover)
- Use `variant="outline"` para ações secundárias (cancelar, voltar)
- Use `type="submit"` em formulários
- Use `onClick` com router em vez de `asChild` quando precisar de ícones

```tsx
// ✅ Bom
<Button leftIcon={<Plus />}>Criar</Button>
<Button loading={processing}>Salvando</Button>
<Button size="icon" title="Editar"><Edit /></Button>
<Button onClick={() => router.visit('/path')}>Ir</Button>

// ❌ Evite
<Button><Plus className="mr-2" />Criar</Button>
<Button disabled={processing}>{processing ? 'Salvando...' : 'Salvar'}</Button>
<Button><Edit /></Button> {/* Sem title */}
<Button asChild leftIcon={<Plus />}><Link>Ir</Link></Button> {/* asChild não suporta ícones */}
```

### ⚠️ Limitações

**`asChild` não suporta `leftIcon`, `rightIcon` ou `loading`**

Quando você usa `asChild={true}`, o componente Radix Slot espera receber apenas um único elemento filho. Isso significa que as props `leftIcon`, `rightIcon` e `loading` não funcionarão.

```tsx
// ❌ NÃO funciona
<Button asChild leftIcon={<Plus />}>
  <Link href="/create">Criar</Link>
</Button>

// ✅ Use onClick
<Button leftIcon={<Plus />} onClick={() => router.visit('/create')}>
  Criar
</Button>

// ✅ Ou asChild sem ícones
<Button asChild>
  <Link href="/create">Criar</Link>
</Button>
```

### Combinações Recomendadas

| Ação | Variant | Icon | Exemplo |
|------|---------|------|---------|
| Criar/Adicionar | `default` | `Plus` | `<Button leftIcon={<Plus />}>Criar</Button>` |
| Salvar | `default` | `Save` | `<Button loading={processing}>Salvar</Button>` |
| Editar | `outline` ou `ghost` | `Edit` | `<Button variant="ghost" size="icon-sm"><Edit /></Button>` |
| Excluir | `destructive` | `Trash2` | `<Button variant="destructive" leftIcon={<Trash2 />}>Excluir</Button>` |
| Cancelar | `outline` | - | `<Button variant="outline">Cancelar</Button>` |
| Confirmar | `success` | `Check` | `<Button variant="success" leftIcon={<Check />}>Confirmar</Button>` |
| Download | `secondary` | `Download` | `<Button variant="secondary" leftIcon={<Download />}>Download</Button>` |
| Voltar | `ghost` | `ArrowLeft` | `<Button variant="ghost" size="icon"><ArrowLeft /></Button>` |

## Variantes

### Visual

- **default**: Botão primário azul
- **destructive**: Botão vermelho para ações destrutivas
- **outline**: Botão com borda, fundo transparente
- **secondary**: Botão secundário cinza
- **ghost**: Botão transparente, hover com fundo
- **link**: Estilo de link com underline
- **success**: Botão verde para ações de sucesso
- **warning**: Botão amarelo para avisos

### Tamanhos de Botão com Texto

- **sm**: 32px altura, padding reduzido, texto xs
- **default**: 36px altura, padding padrão
- **lg**: 40px altura, padding aumentado, texto base
- **xl**: 48px altura, padding grande, texto lg

### Tamanhos de Botão Apenas Ícone

- **icon-sm**: 32x32px
- **icon**: 36x36px (padrão)
- **icon-lg**: 40x40px

## TypeScript

O componente é totalmente tipado:

```tsx
import { ButtonProps } from '@/components/ui/button';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Acessibilidade

- Suporta todos os atributos ARIA padrão
- Focus-visible com ring customizado
- Disabled state com opacity reduzida
- Title attribute recomendado para botões apenas com ícone

## Performance

- Usa `React.forwardRef` para suporte a refs
- Renderização condicional eficiente para loading/icons
- CVA para composição de classes otimizada

## Dependências

- `@radix-ui/react-slot`: Para polimorfismo com asChild
- `class-variance-authority`: Para variantes de estilo
- `lucide-react`: Para ícones (Loader2)
- `tailwindcss`: Para estilos

## Changelog

### v2.0 (Atual)
- ✨ Adicionadas props `leftIcon` e `rightIcon`
- ✨ Adicionada prop `loading` com spinner automático
- ✨ Adicionadas variantes `success` e `warning`
- ✨ Adicionados tamanhos `xl`, `icon-sm`, `icon-lg`
- ✨ Adicionado `React.forwardRef` para suporte a refs
- 🎨 Tamanhos de ícones adaptativos baseados no size do botão
- 📝 TypeScript interface exportada (`ButtonProps`)

### v1.0
- Versão inicial com shadcn/ui
