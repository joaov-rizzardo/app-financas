# App Finanças — CLAUDE.md

Guia de referência para o Claude Code. Leia este arquivo antes de qualquer alteração no projeto.

---

## Regra de idioma

| O que | Idioma |
|---|---|
| Texto exibido ao usuário (labels, títulos, mensagens, botões) | **Português** |
| Código (nomes de funções, variáveis, tipos, interfaces, comentários) | **Inglês** |

> Exemplo correto: `function formatCurrency()` retorna `"R$ 1.200,00"` e um card com título `"Saldo total"`.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React Native + Expo | SDK 54 |
| Estilização | NativeWind (Tailwind CSS) | v4 |
| Componentes base | Primitivos próprios estilo React Native Reusables | — |
| Navegação | React Navigation — Bottom Tabs | v7 |
| Backend / DB | Firebase Web SDK — Firestore | v12 |
| Ícones | lucide-react-native | latest |
| Variantes | class-variance-authority (cva) | latest |
| Merge de classes | clsx + tailwind-merge (`cn()`) | latest |
| Linguagem | TypeScript strict | ~5.9 |

---

## Estrutura de pastas

```
app-financas/
├── src/
│   ├── components/
│   │   └── ui/               # Componentes primitivos reutilizáveis
│   │       ├── Badge.tsx         # Badge, DotBadge
│   │       ├── Button.tsx        # Button, Chip
│   │       ├── Card.tsx          # Card, CardHeader, CardContent, CardFooter, StatCard, StatRow
│   │       ├── CategoryBadge.tsx # CategoryBadge — ícone + nome com cor dinâmica
│   │       ├── Separator.tsx
│   │       ├── Text.tsx          # Text, Label
│   │       └── index.ts
│   ├── constants/
│   │   ├── colors.ts         # Tokens de cor — fonte única da verdade
│   │   ├── theme.ts          # Tokens de espaçamento, raio, tipografia
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCategories.ts
│   │   ├── useTransactions.ts
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts          # cn(), formatCurrency(), formatShortDate(), toPercent(), etc.
│   ├── navigation/
│   │   ├── CategoriesNavigator.tsx  # Navegador estado (list ↔ form) para Categorias
│   │   ├── TabNavigator.tsx
│   │   └── index.ts
│   ├── screens/
│   │   ├── CategoriesScreen.tsx    # Listagem com tabs Receitas/Despesas
│   │   ├── CategoryFormScreen.tsx  # Criar/editar categoria (nome, cor, ícone)
│   │   ├── DashboardScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── CreditCardScreen.tsx
│   │   ├── BudgetsScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── index.ts
│   ├── services/
│   │   ├── categories.ts     # CRUD de categorias + seedDefaultCategories()
│   │   ├── firebase.ts       # Inicialização do app Firebase
│   │   ├── transactions.ts   # CRUD de transações no Firestore
│   │   └── index.ts
│   └── types/
│       ├── finance.ts        # Transaction, Account, Budget, Goal
│       ├── navigation.ts     # TabParamList, TabScreenProps
│       └── index.ts
├── App.tsx                   # Entry point — providers + NavigationContainer
├── global.css                # Diretivas Tailwind (@tailwind base/components/utilities)
├── metro.config.js           # withNativeWind() — obrigatório para NativeWind v4
├── tailwind.config.js        # Paleta e tokens customizados
├── babel.config.js           # jsxImportSource nativewind + module-resolver
├── nativewind-env.d.ts       # /// <reference types="nativewind/types" />
├── .env                      # Credenciais Firebase (gitignored)
└── .env.example              # Template das variáveis de ambiente
```

---

## Convenções de código

### Componentes UI
- Sempre usar `cn()` de `@/lib/utils` para merge de classes Tailwind.
- Variantes de componentes usam `cva` do `class-variance-authority`.
- Props de className são sempre opcionais e aplicadas no final via `cn()`.
- Nenhum componente usa `StyleSheet.create` — apenas classes Tailwind via NativeWind.

```tsx
// Padrão correto
export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <View className={cn('rounded-2xl p-4', cardVariants[variant], className)} {...props} />
  );
}
```

### Screens
- Arquivos de screen usam nomes em inglês (`TransactionsScreen.tsx`, `CreditCardScreen.tsx`, etc.).
- As rotas do `TabParamList` mantêm os nomes em português (`"Lançamentos"`, `"Cartão"`, etc.) — são nomes internos de rota, não afetam o código dos componentes.
- Dados mock ficam em constantes no topo do arquivo, fora do componente.
- Sub-componentes locais ficam no mesmo arquivo, acima da função de screen principal.

### Imports
- Usar o alias `@/` para imports de `src/`:
  ```ts
  import { colors } from '@/constants/colors';
  import { cn } from '@/lib/utils';
  ```
- Nunca usar caminhos relativos longos (`../../components`).

---

## Tema e paleta de cores

### Tokens (`src/constants/colors.ts`)
Arquivo **nunca deve ser alterado** sem revisar também o `tailwind.config.js`, pois os dois precisam estar sincronizados.

| Token | Hex | Uso |
|---|---|---|
| `background.DEFAULT` | `#0f0f14` | Fundo de todas as telas |
| `background.surface` | `#17171f` | Cards e painéis |
| `background.elevated` | `#1e1e2a` | Modais, hero cards |
| `background.card` | `#232334` | Elementos internos de card |
| `primary.DEFAULT` | `#7c3aed` | Violet — ação principal, ênfase |
| `primary[400]` | `#a78bfa` | Violet claro — texto de destaque |
| `accent.DEFAULT` | `#06b6d4` | Cyan — ênfase secundária |
| `text.primary` | `#f4f4f8` | Texto principal |
| `text.secondary` | `#a0a0b8` | Texto auxiliar |
| `text.muted` | `#5c5c78` | Labels, datas, metadados |
| `success` | `#10b981` | Receitas, positivo, on-track |
| `warning` | `#f59e0b` | Atenção, próximo ao limite |
| `danger` | `#ef4444` | Despesas, acima do limite |
| `info` | `#3b82f6` | Informativo neutro |
| `border.DEFAULT` | `#2a2a3d` | Bordas de cards |

### Uso correto de opacidade
Para fundos com opacidade, usar a sintaxe do Tailwind:
```tsx
// correto
<View className="bg-success/10 border border-success/20" />
// para hex sem Tailwind, concatenar manualmente
style={{ backgroundColor: colors.primary.DEFAULT + '20' }}
```

---

## Configurações críticas

### NativeWind v4
- `metro.config.js` deve usar `withNativeWind(config, { input: './global.css' })`.
- `babel.config.js` deve ter `jsxImportSource: 'nativewind'` no preset `babel-preset-expo`.
- `nativewind-env.d.ts` com `/// <reference types="nativewind/types" />` na raiz.
- **Não usar** `styled()` wrappers — incompatível com NativeWind v4.

### React Navigation
- `enableScreens(false)` chamado em `App.tsx` **antes** de qualquer render de navegação.
  - Resolve o erro `java.lang.String cannot be cast to java.lang.Boolean` no Android.
- `NavigationContainer` recebe o tema escuro completo via prop `theme`.
- Rotas do `TabParamList` mantêm os nomes em português (ex: `"Lançamentos"`) pois mudar quebraria o estado de navegação salvo.
- Labels exibidas nas tabs são em português e configuradas em `TabNavigator.tsx`.

### Firebase
- Usar o **Firebase Web SDK** (não `@react-native-firebase`).
  - Funciona sem código nativo, compatível com Expo Go.
- Credenciais lidas de variáveis `EXPO_PUBLIC_*` no `.env`.
- `getApps().length === 0` evita re-inicialização em hot-reload.

### `app.json`
- `"userInterfaceStyle": "dark"` — tema escuro forçado no SO.
- `"newArchEnabled": false` — New Architecture desabilitada por incompatibilidade com `react-native-screens`.
- Não adicionar `edgeToEdgeEnabled` ou `predictiveBackGestureEnabled` — causam erros de cast no Android.

### Path alias
- `@/` → `src/` configurado em:
  1. `tsconfig.json` (`paths`)
  2. `babel.config.js` (`babel-plugin-module-resolver`)

---

## Navegação (TabNavigator)

As 6 abas do bottom tab:

| Nome da rota | Componente | Label exibida | Ícone |
|---|---|---|---|
| `Dashboard` | `DashboardScreen` | Início | `LayoutDashboard` |
| `Lançamentos` | `TransactionsScreen` | Lançamentos | `ArrowLeftRight` |
| `Cartão` | `CreditCardScreen` | Cartão | `CreditCard` |
| `Orçamentos` | `BudgetsScreen` | Orçamentos | `PieChart` |
| `Metas` | `GoalsScreen` | Metas | `Target` |
| `Relatórios` | `ReportsScreen` | Relatórios | `BarChart2` |
| `Categorias` | `CategoriesNavigator` | Categorias | `Tags` |

---

## Utilitários (`src/lib/utils.ts`)

| Função | Descrição |
|---|---|
| `cn(...classes)` | Merge seguro de classes Tailwind |
| `formatCurrency(value)` | Formata número como moeda BRL (`R$ 1.200,00`) |
| `formatCurrencyCompact(value)` | Versão compacta (`R$ 5,8k`) |
| `formatShortDate(isoStr)` | Data curta em pt-BR (`10 abr.`) |
| `formatDate(isoStr)` | Data completa em pt-BR (`10 de abril de 2026`) |
| `amountSign(value)` | Retorna `"+"` ou `"-"` |
| `clamp(value, min, max)` | Limita valor entre min e max |
| `toPercent(current, total)` | Percentual 0–100, clamped |

---

## Componentes UI (`src/components/ui/`)

### `Text` + `Label`
```tsx
<Text size="2xl" weight="bold">Saldo total</Text>
<Label>abril 2026</Label>  {/* uppercase + tracking-widest + muted */}
```
Variantes de `variant`: `default | secondary | muted | destructive | success | warning`

### `Card` + `StatCard`
```tsx
<Card variant="elevated">...</Card>   // bg-background-elevated
<Card variant="default">...</Card>    // bg-background-surface
<StatCard className="flex-1">...</StatCard>
```

### `Button` + `Chip`
```tsx
<Button variant="primary" label="Salvar" />
<Button variant="accent" size="icon"><Plus /></Button>
<Chip label="Receitas" selected={filter === 'income'} onPress={() => setFilter('income')} />
```
Variantes: `primary | accent | secondary | outline | ghost | destructive`

### `Badge` + `DotBadge`
```tsx
<Badge label="Pendente" variant="warning" />
<DotBadge label="Receitas" color={colors.success} />
```

### `CategoryBadge`
Componente reutilizável para exibir ícone + nome de uma categoria com a cor da categoria.
```tsx
<CategoryBadge icon="Utensils" color="#f97316" name="Alimentação" />
<CategoryBadge icon="Briefcase" color="#10b981" name="Salário" size="lg" />
<CategoryBadge icon="Car" color="#f59e0b" name="Transporte" showLabel={false} />
```
Props: `icon` (lucide icon name), `color` (hex), `name`, `size` (`sm|md|lg`), `showLabel` (default `true`).

---

## Padrões de design por tela

### Dashboard
- Hero card com saldo total, taxa de poupança, breakdown receita/despesa.
- Linha de stat cards (Receitas / Despesas) com variação % mensal.
- Lista de transações recentes com ícone de categoria.

### Lançamentos (Transactions)
- Barra de resumo: receitas / despesas / saldo líquido.
- Chips de filtro: Todos / Receitas / Despesas.
- Lista agrupada por data com ícone de categoria.

### Cartão (Credit Card)
- Widget de cartão com layout escalonado (inline styles para simular gradiente).
- Barra de uso do limite com cor dinâmica (verde → amarelo → vermelho).
- Tabela de resumo de fatura.
- Lista de compras com badge "Pendente".

### Orçamentos (Budgets)
- Resumo do mês: total gasto, quantidade em dia vs acima.
- Card por categoria com barra de progresso color-coded:
  - Verde: < 70% usado
  - Amarelo: 70–90% usado
  - Vermelho: ≥ 90% ou acima do limite.

### Metas (Goals)
- Hero card com total poupado para todas as metas + barra geral.
- Card por meta: emoji, prazo, barra de progresso, valor atual/alvo.

### Relatórios (Reports)
- KPIs: Receitas vs Despesas com variação % mês anterior.
- Card de poupança líquida com barra de savings rate.
- Gráfico de barras manual (Views) com meses e legenda.
- Breakdown por categoria com barras coloridas e percentuais.

### Categorias (Categories)
- `CategoriesNavigator` — navegador baseado em estado (sem stack navigator extra): alterna entre `CategoriesScreen` e `CategoryFormScreen`.
- `CategoriesScreen` — grid 2 colunas com chips Despesas/Receitas para filtrar; FAB (+) no canto inferior; long-press abre Alert com opções Editar/Excluir.
- `CategoryFormScreen` — preview do ícone + cor no topo; seletor de tipo (Despesa/Receita); input de nome; paleta de 16 cores (círculos com check); grid de 36 ícones lucide; botão salvar.
- Seeding automático de 10 categorias padrão (4 receita, 6 despesa) via `seedDefaultCategories()` — usa AsyncStorage para executar apenas uma vez.
- `useCategories(type?)` — hook com CRUD otimista; `type` é opcional para filtrar por tipo.

---

## Comandos úteis

```bash
# Iniciar com cache limpo (usar sempre após mudanças em babel/metro/tailwind)
npm start -- --clear

# Android
npm run android

# iOS
npm run ios
```

---

## Variáveis de ambiente

Copiar `.env.example` para `.env` e preencher:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

O arquivo `.env` está no `.gitignore` e nunca deve ser commitado.
