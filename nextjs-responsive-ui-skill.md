# Skill: Responsive UI Engineering para Next.js

## Objetivo

Construir interfaces Next.js responsivas, acessíveis, previsíveis e consistentes em mobile, tablet, desktop e ecrãs largos, sem simplesmente "encolher" a versão desktop.

Esta skill aplica-se sobretudo a:

- Next.js + React + TypeScript
- Tailwind CSS v4
- shadcn/ui
- dashboards SaaS
- tabelas de dados
- formulários
- páginas de detalhe
- filtros e barras de acção
- cards e métricas
- navegação
- modais e drawers
- interfaces com grandes volumes de dados

> Princípio central: **responsividade é adaptação da hierarquia e da interacção, não apenas alteração de largura.**

---

## 1. Princípios fundamentais

### 1.1 Mobile-first

Implementar primeiro a versão mais estreita e depois adicionar melhorias para `sm`, `md`, `lg`, `xl` e `2xl`.

Em Tailwind:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

Não pensar:

```text
sm = mobile
```

Pensar:

```text
sem prefixo = mobile/base
sm = 640px+
md = 768px+
lg = 1024px+
xl = 1280px+
2xl = 1536px+
```

Tailwind adopta uma abordagem mobile-first e permite também container queries para componentes que devem responder ao espaço do próprio container em vez do viewport.

---

## 2. Breakpoints: não desenhar para dispositivos específicos

Evitar:

```text
iPhone
Samsung
iPad
MacBook
```

Preferir:

```text
content-based breakpoints
```

Perguntar:

> "Em que largura este componente deixa de funcionar correctamente?"

e não:

> "Qual é o breakpoint do iPhone?"

Breakpoints padrão Tailwind:

| Prefixo | A partir de |
|---|---:|
| base | 0px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Não adicionar breakpoints só porque existem.

Criar breakpoint customizado apenas quando existe uma necessidade real do layout.

---

## 3. Container principal

Dashboards devem possuir uma área de conteúdo controlada.

Preferir:

```tsx
<main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  ...
</main>
```

Em ecrãs muito largos, não deixar conteúdo ocupar toda a largura.

Evitar:

```tsx
<main className="w-full">
```

quando o conteúdo é predominantemente texto, tabelas ou cards.

### Regra

- Header global pode ser full-width.
- Conteúdo interno deve possuir `max-width`.
- O `max-width` deve ser determinado pela densidade da interface.

---

# 4. Grelhas de cards

## 4.1 Quatro cards no desktop → 2×2 no mobile

Para uma dashboard com quatro cards:

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  <MetricCard />
  <MetricCard />
  <MetricCard />
  <MetricCard />
</div>
```

Resultado:

```text
Desktop

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  01  │ │  02  │ │  03  │ │  04  │
└──────┘ └──────┘ └──────┘ └──────┘


Mobile

┌────────┐ ┌────────┐
│   01   │ │   02   │
├────────┤ ├────────┤
│   03   │ │   04   │
└────────┘ └────────┘
```

Não fazer automaticamente:

```tsx
grid-cols-1 lg:grid-cols-4
```

se os quatro cards continuarem legíveis em 2 colunas.

### Quando usar 1 coluna

Usar:

```tsx
grid-cols-1
```

quando cada card contém:

- muito texto;
- gráficos;
- tabelas;
- acções complexas;
- formulários;
- informação que perde significado quando comprimida.

---

# 5. Cards: adaptar conteúdo, não apenas tamanho

Um card desktop pode ter:

```text
Revenue
Kz 2.340.000
+14,8% vs mês anterior
```

No mobile:

```text
Receita
Kz 2,34M
+14,8%
```

Não reduzir apenas `font-size`.

Também pode ser necessário:

- encurtar labels;
- esconder informação secundária;
- alterar o alinhamento;
- reduzir padding;
- transformar texto em tooltip;
- converter valores extensos em formato compacto.

Exemplo:

```tsx
<p className="text-xs sm:text-sm text-muted-foreground">
  <span className="sm:hidden">Receita</span>
  <span className="hidden sm:inline">Receita total do período</span>
</p>
```

---

# 6. Textos longos

Texto não deve destruir o layout.

Usar:

```tsx
min-w-0
break-words
overflow-hidden
text-ellipsis
```

conforme o caso.

Para uma linha:

```tsx
<p className="min-w-0 truncate">
  {name}
</p>
```

Para várias linhas:

```tsx
<p className="line-clamp-2 break-words">
  {description}
</p>
```

Para identificadores longos:

```tsx
<span className="break-all">
  {longIdentifier}
</span>
```

Não usar `break-all` em texto normal: pode prejudicar a legibilidade.

---

# 7. Tamanho de texto responsivo

Não criar dezenas de tamanhos arbitrários.

Exemplo:

```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
```

Para números de métricas:

```tsx
<p className="text-xl sm:text-2xl lg:text-3xl font-semibold tabular-nums">
```

Valores financeiros devem preferencialmente utilizar:

```tsx
tabular-nums
```

para alinhamento visual dos algarismos.

### Regra

Reduzir tipografia quando necessário, mas nunca a ponto de prejudicar legibilidade.

Não usar:

```tsx
text-[9px]
```

apenas para impedir quebra de texto.

Primeiro tentar:

1. abreviar o texto;
2. permitir duas linhas;
3. reorganizar o layout;
4. esconder informação secundária;
5. usar tooltip;
6. só depois reduzir a tipografia.

---

# 8. Tabelas: nunca assumir que uma tabela desktop deve permanecer tabela no mobile

Uma tabela com:

```text
Cliente | Estado | Plano | Valor | Data | Acções
```

pode funcionar perfeitamente em desktop e ser péssima em 360px.

Existem quatro estratégias principais.

## Estratégia A — tabela com scroll horizontal

Usar quando a relação entre linhas e colunas é essencial.

```tsx
<div className="overflow-x-auto">
  <Table />
</div>
```

Utilizar quando:

- comparação entre colunas é importante;
- existem muitas colunas;
- dados financeiros precisam de alinhamento tabular;
- o utilizador precisa de comparar várias linhas.

Não esconder colunas importantes apenas para evitar scroll.

---

## Estratégia B — tabela → cards

É a estratégia preferencial para dashboards SaaS quando a leitura por registo é mais importante que a comparação entre colunas.

Desktop:

```text
┌──────────┬────────┬────────┬─────────┐
│ Cliente  │ Estado │ Plano  │ Valor   │
├──────────┼────────┼────────┼─────────┤
│ João     │ Pago   │ Pro    │ 50.000  │
│ Maria    │ Pendente │ Base │ 20.000  │
└──────────┴────────┴────────┴─────────┘
```

Mobile:

```text
┌────────────────────────────┐
│ João                  Pago │
│ Plano              Pro     │
│ Valor          50.000 Kz   │
│                            │
│ Ver detalhes          →    │
└────────────────────────────┘

┌────────────────────────────┐
│ Maria             Pendente │
│ Plano             Base     │
│ Valor          20.000 Kz   │
│                            │
│ Ver detalhes          →    │
└────────────────────────────┘
```

Implementação:

```tsx
<div className="hidden md:block">
  <DesktopTable />
</div>

<div className="grid gap-3 md:hidden">
  {items.map((item) => (
    <MobileCard key={item.id} item={item} />
  ))}
</div>
```

### Regra importante

Não duplicar lógica de negócio.

Os dois componentes devem consumir os mesmos dados:

```tsx
const items = data?.items ?? [];

return (
  <>
    <DesktopTable items={items} />
    <MobileCards items={items} />
  </>
);
```

A transformação é visual.

---

# 9. Quando NÃO transformar tabela em cards

Não transformar quando:

- comparação horizontal é essencial;
- o utilizador precisa de comparar muitas linhas;
- há dezenas de colunas mas poucas são relevantes;
- a tabela é uma ferramenta analítica;
- a semântica tabular é fundamental.

Nesses casos:

```tsx
<div className="overflow-x-auto">
  <Table />
</div>
```

pode ser a melhor solução.

WCAG permite excepções de reflow para conteúdos cuja utilização depende de uma relação bidimensional, incluindo tabelas. Ainda assim, as células e o restante conteúdo devem permanecer utilizáveis.

---

# 10. Não esconder dados importantes no mobile

Evitar:

```tsx
hidden sm:table-cell
```

sem verificar se o dado é necessário para a tarefa.

Antes de esconder:

- verificar se o dado pode aparecer no card;
- mover para "Ver detalhes";
- usar accordion;
- usar drawer;
- usar menu contextual.

A informação pode mudar de posição, mas não deve desaparecer sem motivo.

---

# 11. Toolbar responsiva

Uma toolbar desktop:

```text
[Pesquisar] [Filtros] [Exportar] [Novo]
```

não deve simplesmente ficar comprimida.

Mobile:

```text
[Pesquisar........................]
[ Filtros ] [ + Novo ]
```

Implementação:

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  <div className="min-w-0 flex-1">
    <SearchInput />
  </div>

  <div className="flex flex-wrap gap-2">
    <FilterButton />
    <ExportButton />
    <CreateButton />
  </div>
</div>
```

---

# 12. Botões

Evitar vários botões lado a lado em mobile:

```text
[Editar] [Duplicar] [Exportar] [Eliminar]
```

Preferir:

```text
[Editar] [•••]
```

e colocar acções secundárias num menu.

### Hierarquia

Mobile deve preservar:

1. acção primária;
2. acção secundária;
3. restantes acções no menu.

---

# 13. Botões com texto longo

Não diminuir a fonte para 10px.

Preferir:

Desktop:

```text
Descarregar ficheiro original
```

Mobile:

```text
Descarregar
```

Exemplo:

```tsx
<Button>
  <Download />
  <span className="hidden sm:inline">
    Descarregar ficheiro original
  </span>
  <span className="sm:hidden">
    Descarregar
  </span>
</Button>
```

Ícones nunca devem ser a única indicação de uma acção ambígua.

---

# 14. Flexbox: `min-w-0` é obrigatório em muitos layouts

Problema comum:

```tsx
<div className="flex">
  <div>
    <span>nome-muito-muito-muito-longo...</span>
  </div>
  <Button />
</div>
```

O texto pode impedir o flex container de encolher.

Preferir:

```tsx
<div className="flex min-w-0 items-center gap-2">
  <div className="min-w-0 flex-1">
    <p className="truncate">
      {name}
    </p>
  </div>

  <Button className="shrink-0">
    ...
  </Button>
</div>
```

Regra:

```text
conteúdo textual em flex
        ↓
min-w-0
        +
truncate/line-clamp quando apropriado
```

---

# 15. Imagens

Nunca deixar imagens criarem overflow.

Preferir:

```tsx
<Image
  src={src}
  alt={alt}
  width={1600}
  height={900}
  className="h-auto w-full object-cover"
/>
```

Para containers:

```tsx
<div className="aspect-video w-full overflow-hidden">
  <Image
    ...
    className="h-full w-full object-cover"
  />
</div>
```

Imagens devem respeitar o container.

---

# 16. Vídeo

Vídeos:

```tsx
<video
  className="h-auto w-full"
  controls
/>
```

Nunca assumir:

```tsx
width: 1920px;
```

em componentes responsivos.

Para players complexos:

- adaptar os controlos;
- reduzir elementos secundários;
- manter área de toque suficiente;
- evitar menus que ultrapassem o viewport.

---

# 17. Modais

Modal desktop:

```text
┌──────────────────────────────┐
│ Editar cliente               │
│                              │
│ campos...                    │
│                              │
│ [Cancelar] [Guardar]         │
└──────────────────────────────┘
```

Mobile pode ser:

```text
┌─────────────────────┐
│ Editar cliente      │
│                     │
│ campos...           │
│                     │
│ [Guardar]           │
└─────────────────────┘
```

Regras:

```tsx
className="
  w-[calc(100%-2rem)]
  max-w-lg
  max-h-[90dvh]
  overflow-y-auto
"
```

Para fluxos complexos, considerar transformar modal em:

- drawer;
- sheet;
- página dedicada.

Não comprimir um formulário desktop enorme num modal minúsculo.

---

# 18. Formulários

Desktop:

```text
Nome                 Apelido
[................]   [................]

Email                Telefone
[................]   [................]
```

Mobile:

```text
Nome
[................]

Apelido
[................]

Email
[................]

Telefone
[................]
```

Tailwind:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
```

Não colocar dois inputs numa linha mobile só porque existe espaço físico.

---

# 19. Inputs

Inputs devem ocupar o espaço disponível:

```tsx
className="w-full min-w-0"
```

Evitar larguras rígidas:

```tsx
w-[400px]
```

Preferir:

```tsx
w-full max-w-md
```

---

# 20. Navegação

Desktop:

```text
Logo | Dashboard | Clientes | Produtos | Relatórios | Perfil
```

Mobile:

```text
Logo                         Menu
```

ou:

```text
Bottom navigation
```

Não tentar encaixar toda a navegação desktop no topo do mobile.

---

# 21. Sidebar

Dashboard:

```text
Desktop:
┌──────┬────────────────────┐
│      │                    │
│ Side │      Content       │
│ bar  │                    │
│      │                    │
└──────┴────────────────────┘
```

Mobile:

```text
┌──────────────────────────┐
│ Header              Menu │
├──────────────────────────┤
│                          │
│        Content           │
│                          │
└──────────────────────────┘
```

A sidebar deve tornar-se:

- drawer;
- sheet;
- menu sobreposto;

em vez de ocupar permanentemente a largura do mobile.

---

# 22. Dashboard: hierarquia

No mobile, a ordem da informação deve seguir a importância da tarefa.

Exemplo:

```text
1. KPIs
2. Acção principal
3. Alertas
4. Gráficos
5. Actividade recente
6. Dados secundários
```

Não simplesmente copiar a ordem visual do desktop.

---

# 23. Gráficos

Gráficos devem:

```tsx
<div className="w-full min-w-0">
  <Chart />
</div>
```

Nunca:

```tsx
width: 800px;
```

Usar container queries quando o gráfico é um componente reutilizável dentro de diferentes layouts.

Para gráficos complexos:

- reduzir labels;
- reduzir número de ticks;
- abreviar números;
- permitir tooltip;
- esconder legendas secundárias;
- preservar leitura dos dados principais.

Exemplo:

```text
1 200 000 Kz
```

pode tornar-se:

```text
1,2M Kz
```

no mobile.

---

# 24. Container queries

Quando um componente aparece em vários contextos, preferir container queries a media queries baseadas no viewport.

Exemplo:

```tsx
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2">
    ...
  </div>
</div>
```

Isto é útil para:

- cards;
- widgets de dashboard;
- gráficos;
- painéis;
- componentes reutilizáveis.

O componente passa a responder ao espaço disponível e não ao tamanho total da janela.

---

# 25. Overflow horizontal

Antes de usar:

```tsx
overflow-x-auto
```

descobrir a causa.

Problemas comuns:

- `min-width` excessivo;
- texto sem quebra;
- `w-screen` dentro de container com padding;
- imagem fixa;
- flex child sem `min-w-0`;
- botão com largura rígida;
- tabela demasiado larga.

Não usar `overflow-x-hidden` como "correcção".

Isso pode esconder conteúdo em vez de resolver o problema.

---

# 26. `w-screen` deve ser usado com cuidado

Dentro de um container:

```tsx
<div className="px-4">
  <div className="w-screen">
```

pode criar overflow horizontal.

Preferir:

```tsx
w-full
```

na maioria dos componentes.

---

# 27. `100dvh` em interfaces móveis

Para áreas de viewport:

```tsx
min-h-dvh
```

é geralmente preferível a:

```tsx
min-h-screen
```

quando o layout depende da altura real do viewport móvel.

Especialmente em:

- sidebars;
- sheets;
- páginas full-screen;
- players;
- páginas de login.

---

# 28. Safe areas

Para interfaces mobile com elementos junto às bordas do dispositivo:

```css
padding-bottom: env(safe-area-inset-bottom);
```

é relevante para:

- bottom navigation;
- barras fixas;
- drawers;
- players.

---

# 29. Elementos fixos

Evitar:

```text
fixed bottom-0
```

sem considerar:

- safe area;
- teclado virtual;
- conteúdo atrás do elemento;
- zoom;
- altura reduzida;
- orientação landscape.

Adicionar padding ao conteúdo quando necessário.

---

# 30. Touch targets

Elementos interactivos devem possuir uma área de toque confortável.

Não criar:

```tsx
<button className="h-5 w-5">
```

para uma acção importante.

Preferir componentes com área de toque adequada, mesmo quando o ícone visual é pequeno.

Isto é especialmente importante em:

- menu;
- fechar;
- editar;
- paginação;
- filtros;
- navegação;
- controlos de player.

---

# 31. Hover não pode ser requisito

Nunca esconder informação essencial atrás de:

```css
:hover
```

porque touchscreens não possuem hover equivalente.

Se uma informação é importante:

- mostrar directamente;
- usar click/tap;
- usar tooltip complementar.

---

# 32. Tooltips

Tooltips devem ser complementares.

Não colocar a única descrição de uma acção importante apenas no tooltip.

Exemplo ruim:

```text
[ícone]
```

sem contexto.

Melhor:

```text
[ícone] Descarregar
```

ou usar `aria-label` quando o contexto visual for suficientemente claro.

---

# 33. Acessibilidade e reflow

A interface deve ser testada a partir de **320 CSS px** e também com zoom elevado.

WCAG 2.2 estabelece o critério de Reflow para conteúdo não exceptuado: deve poder ser apresentado sem perda de informação ou funcionalidade e sem scrolling em duas dimensões a 320 CSS px. Tabelas e outros conteúdos cuja utilização dependa de relações bidimensionais possuem excepções específicas.

Testar:

```text
320px
375px
390px
414px
768px
1024px
1280px
1440px
1536px+
```

Também testar zoom:

```text
200%
400%
```

Não testar apenas o viewport físico de um telemóvel.

---

# 34. Estados responsivos

Todos os componentes devem ser testados em:

```text
Loading
Empty
Error
Success
Long content
Many items
No permissions
Disabled
```

Exemplo:

Um empty state desktop pode ter:

```text
Ainda não existem clientes.

[Adicionar cliente]
```

Mobile:

```text
Ainda não existem clientes.

[+ Adicionar]
```

---

# 35. Skeletons

Skeletons devem possuir a mesma estrutura aproximada do conteúdo real.

Não fazer um skeleton desktop gigante que cause layout shift no mobile.

Cards:

```tsx
<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
  ...
</div>
```

Skeleton deve utilizar a mesma grid.

---

# 36. Tabelas com acções

Desktop:

```text
Cliente | Estado | Valor | Data | [Editar] [•••]
```

Mobile:

```text
┌─────────────────────────┐
│ João Silva          •••  │
│ Pago                    │
│ 50.000 Kz               │
│ 03 Out 2026             │
└─────────────────────────┘
```

Acções secundárias devem migrar para menu.

---

# 37. Paginação

Desktop:

```text
[Anterior] 1 2 3 4 5 [Seguinte]
```

Mobile:

```text
[‹] 2 / 20 [›]
```

ou:

```text
[Carregar mais]
```

quando o contexto justificar.

Não obrigar o utilizador a tocar em cinco números minúsculos.

---

# 38. Filtros

Desktop:

```text
[Pesquisar] [Estado] [Data] [Plano] [Limpar]
```

Mobile:

```text
[Pesquisar................]
[Filtros (3)]
```

Ao abrir:

```text
┌──────────────────────────┐
│ Filtros                  │
│                          │
│ Estado                   │
│ [Pago ▼]                 │
│                          │
│ Plano                    │
│ [Pro ▼]                  │
│                          │
│ [Limpar] [Aplicar]       │
└──────────────────────────┘
```

Usar Sheet/Drawer quando houver vários filtros.

---

# 39. Texto e labels

Criar versões curtas apenas quando necessário.

Exemplo:

```text
Desktop:
"Data de criação"

Mobile:
"Criado em"
```

Não truncar texto essencial:

```text
"Confi..."
```

quando uma label curta resolveria o problema.

---

# 40. Números

Valores extensos devem poder adaptar-se.

```text
Desktop:
1.250.000 Kz

Mobile:
1,25M Kz
```

Percentagens:

```text
+12,8%
```

Em dashboards, considerar uma função de formatação responsiva:

```tsx
formatCompactCurrency(value)
```

Atenção: não sacrificar precisão onde o utilizador precisa do valor exacto.

Nesse caso:

```text
1,25M Kz
```

e tooltip/detalhe:

```text
1.250.000 Kz
```

---

# 41. Datas

Desktop:

```text
03 de Outubro de 2026, 14:32
```

Mobile:

```text
03 Out, 14:32
```

A informação completa pode aparecer no detalhe ou tooltip.

---

# 42. Breadcrumbs

Desktop:

```text
Dashboard / Clientes / João Silva / Facturas
```

Mobile:

```text
← João Silva
```

Não deixar breadcrumbs longos ocuparem duas ou três linhas.

---

# 43. Tabs

Tabs horizontais podem causar overflow.

Opções:

1. scroll horizontal controlado;
2. reduzir labels;
3. transformar em select;
4. agrupar tabs;
5. mostrar apenas tabs prioritárias.

Nunca cortar silenciosamente tabs importantes.

---

# 44. Selects

Um select com labels extensas deve ter:

```tsx
min-w-0
```

e texto truncado no trigger quando necessário.

Não deixar o select determinar a largura do layout inteiro.

---

# 45. Dialogs e dropdowns

Menus e dropdowns não devem sair do viewport.

Considerar:

```text
align
side
collisionPadding
```

quando suportados pelo componente.

Componentes Radix/shadcn já oferecem primitives adequadas para muitos destes casos.

Não substituir o comportamento do componente importado com CSS excessivo.

---

# 46. Componentes importados

Quando se usa:

```tsx
Button
Dialog
Sheet
Table
DropdownMenu
Select
```

preferir ajustar:

```tsx
className
```

e composição externa.

Não editar internamente o componente partilhado apenas para corrigir um caso específico.

---

# 47. Não usar JS para tudo

Evitar:

```tsx
const isMobile = window.innerWidth < 768;
```

apenas para mudar layout.

Isso pode provocar:

- hydration issues;
- flicker;
- duplicação de lógica;
- problemas em SSR.

Preferir CSS/Tailwind para layout.

Usar JavaScript apenas quando o comportamento realmente depende do viewport e não pode ser resolvido por CSS.

---

# 48. Server Components continuam responsivos

Responsividade não deve obrigar um componente a ser Client Component.

Sempre que possível:

```tsx
Server Component
   ↓
dados
   ↓
HTML + CSS responsivo
```

Em vez de transformar uma página inteira em:

```tsx
"use client";
```

apenas para detectar mobile.

---

# 49. Desktop e mobile podem ter componentes visuais diferentes

Não existe obrigação de usar exactamente o mesmo DOM para todos os tamanhos.

É aceitável:

```tsx
<DesktopTable />
<MobileCards />
```

quando a experiência realmente é diferente.

O importante é:

- mesma fonte de dados;
- mesma lógica;
- mesma informação essencial;
- acessibilidade;
- sem inconsistências de estado.

---

# 50. Regra para decidir o layout

Para cada componente perguntar:

### 1. O conteúdo ainda é legível?

Se sim:

```text
mantém estrutura
```

### 2. Ficou apertado?

Então:

```text
reduzir spacing
↓
reduzir informação secundária
↓
reorganizar
```

### 3. Continua impossível?

Então:

```text
mudar estrutura
```

Exemplo:

```text
Tabela
↓
Cards
```

ou:

```text
Toolbar horizontal
↓
Toolbar vertical
```

---

# 51. Checklist obrigatório para cada página

## Layout

- [ ] `width` não ultrapassa viewport
- [ ] container possui `max-width` quando necessário
- [ ] padding responsivo
- [ ] gaps responsivos
- [ ] nenhum `min-width` desnecessário
- [ ] `w-screen` utilizado apenas quando necessário
- [ ] `min-w-0` aplicado nos flex children relevantes

## Typography

- [ ] headings adaptam
- [ ] labels não quebram de forma absurda
- [ ] números usam `tabular-nums` quando apropriado
- [ ] texto longo usa wrap/truncate/line-clamp adequado
- [ ] não foram criados tamanhos ilegíveis apenas para caber

## Cards

- [ ] desktop e mobile possuem densidade apropriada
- [ ] 4 cards → 2×2 quando apropriado
- [ ] cards com conteúdo complexo podem passar para 1 coluna
- [ ] informação secundária é reduzida no mobile

## Tables

- [ ] decisão explícita entre tabela e cards
- [ ] scroll horizontal quando necessário
- [ ] colunas importantes não desaparecem
- [ ] acções secundárias vão para menu
- [ ] dados continuam acessíveis

## Forms

- [ ] 1 coluna no mobile
- [ ] 2+ colunas em desktop quando apropriado
- [ ] inputs `w-full`
- [ ] labels legíveis
- [ ] erros não quebram layout

## Navigation

- [ ] sidebar transforma-se em drawer/sheet
- [ ] header adapta
- [ ] tabs não ficam inutilizáveis
- [ ] breadcrumbs simplificados

## Accessibility

- [ ] testado a 320px
- [ ] testado com 200% zoom
- [ ] testado com 400% zoom quando aplicável
- [ ] foco visível
- [ ] touch targets adequados
- [ ] hover não é requisito
- [ ] informação essencial não depende de tooltip

## States

- [ ] loading
- [ ] empty
- [ ] error
- [ ] long content
- [ ] many items
- [ ] disabled
- [ ] permissions

---

# 52. Padrões Tailwind recomendados

## Dashboard

```tsx
<div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
```

## Conteúdo

```tsx
<main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
```

## Flex responsivo

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
```

## Formulário

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
```

## Card textual

```tsx
<div className="min-w-0 flex-1">
  <p className="truncate">
    ...
  </p>
</div>
```

## Tabela

```tsx
<div className="overflow-x-auto">
  <Table />
</div>
```

## Mobile cards

```tsx
<div className="grid gap-3 md:hidden">
  ...
</div>
```

## Desktop table

```tsx
<div className="hidden md:block">
  ...
</div>
```

## Modal

```tsx
className="
  w-[calc(100%-2rem)]
  max-w-lg
  max-h-[90dvh]
  overflow-y-auto
"
```

## Full-height mobile

```tsx
className="min-h-dvh"
```

---

# 53. Anti-patterns

## Anti-pattern 1

```tsx
<div className="flex w-[1200px]">
```

Problema: overflow.

---

## Anti-pattern 2

```tsx
<div className="grid grid-cols-4">
```

sem considerar mobile.

---

## Anti-pattern 3

```tsx
<p className="text-[9px]">
```

apenas para fazer texto caber.

---

## Anti-pattern 4

```tsx
overflow-x-hidden
```

para esconder overflow causado por um bug.

---

## Anti-pattern 5

```tsx
window.innerWidth < 768
```

para controlar layout.

---

## Anti-pattern 6

Tabela desktop comprimida até 320px.

---

## Anti-pattern 7

Esconder colunas importantes:

```tsx
hidden md:table-cell
```

sem fornecer alternativa.

---

## Anti-pattern 8

Todos os componentes em `w-full` sem `max-width`.

Resultado: interfaces excessivamente largas em monitores grandes.

---

## Anti-pattern 9

Todos os componentes com `rounded-*`, `p-*` e `gap-*` enormes em mobile.

Responsive não significa apenas esconder conteúdo.

Também significa ajustar densidade.

---

# 54. Ordem de implementação recomendada

Ao tornar uma página existente responsiva:

### Passo 1

Corrigir overflow.

### Passo 2

Definir container.

### Passo 3

Implementar layout mobile-first.

### Passo 4

Adaptar grids.

### Passo 5

Adaptar tipografia.

### Passo 6

Adaptar tabelas.

### Passo 7

Adaptar toolbar e filtros.

### Passo 8

Adaptar formulários.

### Passo 9

Adaptar navegação/sidebar.

### Passo 10

Testar estados extremos.

### Passo 11

Testar acessibilidade/reflow.

### Passo 12

Testar dispositivos reais.

---

# 55. Critério de qualidade

Uma interface só deve ser considerada responsiva quando:

```text
320px
   ↓
conteúdo utilizável

375px
   ↓
layout confortável

768px
   ↓
tablet funcional

1024px
   ↓
desktop compacto

1280px
   ↓
desktop completo

1536px+
   ↓
conteúdo continua controlado
```

Responsividade não é:

> "Não aparece scroll horizontal."

Responsividade é:

> **A mesma tarefa pode ser executada de forma clara, eficiente e acessível independentemente do espaço disponível.**

---

# 56. Regra final para agentes de código

Antes de alterar qualquer componente React/Next.js, o agente deve responder mentalmente:

```text
1. Como funciona no mobile?
2. Como funciona no tablet?
3. Como funciona no desktop?
4. O conteúdo pode quebrar?
5. Existe informação secundária que pode ser reduzida?
6. Uma tabela deve continuar tabela?
7. Uma toolbar precisa de outra composição?
8. Os botões continuam utilizáveis?
9. O componente possui min-width problemático?
10. O layout depende do viewport ou do container?
11. Existe estado loading/empty/error?
12. A interface funciona a 320px?
```

Se a resposta a qualquer uma destas perguntas for "não", corrigir antes de considerar a implementação concluída.

---

## Referências

- Tailwind CSS — Responsive Design: https://tailwindcss.com/docs/responsive-design
- Tailwind CSS — Container Queries: https://tailwindcss.com/docs/responsive-design#container-queries
- Tailwind CSS — Table Layout: https://tailwindcss.com/docs/table-layout
- W3C WCAG 2.2 — Reflow (1.4.10): https://www.w3.org/WAI/WCAG22/Understanding/reflow.html

## Princípio de engenharia

**Mobile não é uma versão pequena do desktop. É uma composição diferente da mesma experiência.**

A implementação deve preservar a informação e a capacidade de executar a tarefa, enquanto adapta hierarquia, densidade, navegação e interacção ao espaço disponível.
