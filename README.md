# App Finanças

Aplicativo de finanças pessoais construído com React Native + Expo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Estilização | NativeWind 4 (Tailwind CSS para RN) |
| Componentes | React Native Reusables (padrão) + componentes próprios |
| Navegação | React Navigation 7 — Bottom Tabs |
| Backend / DB | Firebase v12 — Firestore |
| Linguagem | TypeScript (strict) |
| Bundler | Metro + NativeWind Metro plugin |

---

## Estrutura de pastas

```
app-financas/
├── assets/               # Ícones e splash screen
├── src/
│   ├── components/
│   │   └── ui/           # Button, Card, Badge, Text, Separator
│   ├── constants/
│   │   ├── colors.ts     # Tokens de cor (única fonte da verdade)
│   │   └── theme.ts      # Tokens de espaçamento, raio, tipografia
│   ├── hooks/
│   │   └── useTransactions.ts
│   ├── lib/
│   │   └── utils.ts      # cn(), formatCurrency(), formatDate()
│   ├── navigation/
│   │   └── TabNavigator.tsx
│   ├── screens/
│   │   ├── DashboardScreen/      # Módulo Dashboard
│   │   │   ├── index.tsx         # Orquestração de dados + layout principal
│   │   │   ├── MonthHeader.tsx   # Header com navegação de mês
│   │   │   ├── SummaryCards.tsx  # Cards de Receitas / Despesas / Saldo
│   │   │   ├── SavingsRateCard.tsx  # Card de taxa de poupança (destaque)
│   │   │   ├── BudgetSummaryCard.tsx # Barra de resumo de orçamentos
│   │   │   ├── RecentTransactions.tsx # Últimos 5 lançamentos
│   │   │   └── CreditCardInvoiceCard.tsx # Fatura atual do cartão
│   │   ├── TransactionsScreen/   # Módulo Lançamentos
│   │   ├── CreditCardScreen.tsx  # Módulo Cartão
│   │   ├── BudgetsScreen.tsx     # Módulo Orçamentos
│   │   ├── GoalsScreen.tsx       # Módulo Metas
│   │   ├── ReportsScreen/        # Módulo Relatórios
│   │   │   ├── index.tsx         # Orquestração de dados + layout principal
│   │   │   ├── PeriodSelector.tsx  # Seletor de período (mês / 3m / 6m / 12m)
│   │   │   ├── SummarySection.tsx  # Cards de receita, despesa, saldo e poupança
│   │   │   ├── DonutChartCard.tsx  # Gráfico de rosca + lista de categorias
│   │   │   ├── BarChartCard.tsx    # Gráfico de barras: fixo vs variável
│   │   │   ├── LineChartCard.tsx   # Gráfico de linha: evolução do saldo
│   │   │   └── HighlightCard.tsx   # Mês mais gasto e mês mais economizado
│   ├── services/
│   │   ├── firebase.ts       # Inicialização do Firebase
│   │   └── transactions.ts   # CRUD de transações no Firestore
│   └── types/
│       ├── finance.ts        # Interfaces de domínio
│       └── navigation.ts     # Tipos de rotas
├── App.tsx               # Entry point — providers + NavigationContainer
├── global.css            # Diretivas Tailwind (lidas pelo Metro/NativeWind)
├── metro.config.js       # withNativeWind() aplicado
├── tailwind.config.js    # Paleta e tokens customizados
├── babel.config.js       # nativewind JSX source + module-resolver
├── .env.example          # Template de variáveis de ambiente
└── .env                  # Credenciais locais (ignorado pelo git)
```

---

## Tema escuro

O tema foi definido como padrão em três camadas:

1. **`app.json`** — `"userInterfaceStyle": "dark"` força o tema escuro no SO.
2. **`src/constants/colors.ts`** — fonte única de todos os tokens de cor.
3. **`tailwind.config.js`** — os tokens são mapeados para classes Tailwind, usadas diretamente nos componentes.

### Paleta principal

| Token | Hex | Uso |
|---|---|---|
| `background.DEFAULT` | `#0f0f14` | Fundo da tela |
| `background.surface` | `#17171f` | Cards / painéis |
| `background.elevated` | `#1e1e2a` | Modais, dropdowns |
| `primary` | `#7c3aed` | Ações primárias, ênfase |
| `accent` | `#06b6d4` | Destaques secundários |
| `text.primary` | `#f4f4f8` | Texto principal |
| `text.secondary` | `#a0a0b8` | Texto auxiliar |
| `success` | `#10b981` | Receitas, positivo |
| `danger` | `#ef4444` | Despesas, alertas |

---

## Modelo de dados (Firestore)

Cada coleção e seus campos. Campos opcionais marcados com `?`.

### `transactions`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Gerado pelo Firestore |
| `type` | `"income" \| "expense"` | Tipo da transação |
| `amount` | `number` | Valor em reais |
| `date` | `string` | ISO 8601 |
| `categoryId` | `string` | Ref para `categories` |
| `description` | `string` | Descrição livre |
| `isRecurring` | `boolean` | Gerada por item recorrente? |
| `recurringId?` | `string` | Ref para `recurringItems` |
| `installmentTotal?` | `number` | Total de parcelas |
| `installmentCurrent?` | `number` | Parcela atual |
| `createdAt` | `string` | ISO 8601 |

### `categories`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Gerado pelo Firestore |
| `name` | `string` | Nome exibido |
| `icon` | `string` | Nome do ícone lucide-react-native |
| `color` | `string` | Hex color |
| `type` | `"income" \| "expense"` | Tipo da categoria |

### `budgets`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Gerado pelo Firestore |
| `categoryId` | `string` | Ref para `categories` |
| `amount` | `number` | Limite do orçamento |
| `month` | `string` | `YYYY-MM` |

### `goals`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Gerado pelo Firestore |
| `name` | `string` | Nome da meta |
| `targetAmount` | `number` | Valor alvo |
| `currentAmount` | `number` | Valor poupado até agora |
| `deadline` | `string` | `YYYY-MM-01` — primeiro dia do mês-alvo |
| `contributions` | `GoalContributionEntry[]` | Histórico de aportes (embutido no documento) |
| `createdAt` | `string` | ISO 8601 |

Cada entrada em `contributions`:

| Campo | Tipo | Descrição |
|---|---|---|
| `amount` | `number` | Valor do aporte |
| `date` | `string` | `YYYY-MM-DD` — data do aporte |
| `createdAt` | `string` | ISO 8601 |

### `recurringItems`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Gerado pelo Firestore |
| `type` | `"income" \| "expense"` | Tipo |
| `amount` | `number` | Valor |
| `categoryId` | `string` | Ref para `categories` |
| `description` | `string` | Descrição |
| `frequency` | `"monthly" \| "weekly"` | Frequência de geração |
| `startDate` | `string` | ISO 8601 |
| `lastGeneratedAt?` | `string` | ISO 8601 — última geração |

### `creditCardExpenses`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Gerado pelo Firestore |
| `amount` | `number` | Valor da compra |
| `description` | `string` | Descrição |
| `categoryId` | `string` | Ref para `categories` |
| `date` | `string` | ISO 8601 |
| `installmentTotal` | `number` | Total de parcelas |
| `installmentCurrent` | `number` | Parcela atual |
| `invoiceMonth` | `string` | `YYYY-MM` — fatura alvo |

### `creditCardConfig`
Documento único com ID `"default"`.

| Campo | Tipo | Descrição |
|---|---|---|
| `closingDay` | `number` | Dia de fechamento da fatura (1–31) |
| `dueDay` | `number` | Dia de vencimento da fatura (1–31) |

---

## Módulo Dashboard

### Arquitetura
- `DashboardScreen/index.tsx` — orquestra todos os dados via React Query e passa props para sub-componentes
- Navegação por mês: estado local `selectedMonth` (YYYY-MM) com setas de navegação
- Card de fatura sempre baseado no mês corrente (independente do mês selecionado)

### Seções da tela
| Componente | Dados | Ação |
|---|---|---|
| `MonthHeader` | `selectedMonth` | Navegar entre meses |
| `SummaryCards` | `useTransactions(month)` | — |
| `SavingsRateCard` | Receitas e despesas do mês | — |
| `BudgetSummaryCard` | `useBudgets(month)` + transações | Navegar para Orçamentos |
| `RecentTransactions` | Últimas 5 transações do mês | Navegar para Lançamentos |
| `CreditCardInvoiceCard` | `useCreditCardExpenses(invoiceMonth)` + config | Navegar para Cartão |

### Taxa de poupança
- `>= 20%` → verde | `10–19%` → amarelo | `< 10%` → vermelho
- Barra de progresso + valor economizado em reais

---

## Módulo de Metas

### Arquitetura
- `GoalsScreen` — tela única com lista de metas + modais em bottom sheet
- `useGoals` — React Query; operações `create`, `update`, `remove`, `addContribution`
- `src/services/goals.ts` — CRUD Firestore + `addGoalContribution` (usa `arrayUnion` + `increment`)

### Funcionalidades
- **Listagem**: card por meta com barra de progresso colorida por status
- **Criação/edição**: modal bottom sheet com nome, valor alvo e seletor mês/ano
- **Aportes**: botão "Adicionar valor" em cada card; registra o valor e a data no array `contributions` do documento
- **Estimativa de conclusão**: média de aportes dos últimos 3 meses → "No ritmo atual, você atingirá essa meta em X meses"
- **Status visual**:
  - 🟢 **No prazo** — no ritmo para atingir antes do prazo
  - 🔴 **Atrasada** — prazo vencido ou ritmo insuficiente
  - 🏆 **Concluída** — `currentAmount >= targetAmount`

### Lógica de status
```ts
getGoalStatus(goal):
  if currentAmount >= targetAmount → 'completed'
  if monthsLeft < 0 → 'delayed'
  if monthlyAvg(last 3 months) > 0:
    if ceil(remaining / avg) <= monthsLeft → 'on_track'
    else → 'delayed'
  else → 'on_track'  // sem dados de aporte ainda
```

---

## Módulo de Relatórios

### Arquitetura
- `ReportsScreen/index.tsx` — orquestra estado de período e passa dados para sub-componentes
- `useReports(period)` — React Query; busca transações do período selecionado + últimos 6 meses para tendências
- Gráficos renderizados com `react-native-svg` (zero dependência de biblioteca de terceiros para charts)

### Seções da tela

| Componente | Descrição |
|---|---|
| `PeriodSelector` | Tabs Mês / 3m / 6m / 12m; navegação por seta quando modo = Mês |
| `SummarySection` | 4 KPI cards: receita, despesa, saldo e taxa de poupança |
| `DonutChartCard` | Gráfico de rosca (SVG) + lista detalhada com valor e % por categoria |
| `BarChartCard` | Barras agrupadas: fixo (roxo) vs variável (ciano) nos últimos 6 meses |
| `LineChartCard` | Linha de evolução do saldo com área de gradiente nos últimos 6 meses |
| `HighlightCard` | Destaque do mês com maior gasto e mês com maior saldo nos últimos 6 meses |

### Lógica de "fixo vs variável"
- **Fixo** → `tx.isRecurring === true` (gerados de `recurringItems`)
- **Variável** → `tx.isRecurring === false` (lançamentos avulsos)

### Período selecionável
- **Mês**: filtra transações de `YYYY-MM-01` a `YYYY-MM-31`
- **3 / 6 / 12 meses**: filtra do início do mês N atrás até o fim do mês atual

---

## Configuração do Firebase

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as credenciais do seu projeto no [Firebase Console](https://console.firebase.google.com/):
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```

3. As variáveis com prefixo `EXPO_PUBLIC_` são embutidas pelo Expo em tempo de build, sem precisar de um servidor intermediário.

> **Segurança**: o arquivo `.env` está no `.gitignore` e nunca deve ser commitado.

---

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar o Metro bundler
npm start

# Rodar no Android
npm run android

# Rodar no iOS (macOS necessário)
npm run ios

# Rodar na web
npm run web
```

---

## Decisões técnicas

### NativeWind v4 com New Architecture
Expo SDK 54 usa a New Architecture por padrão (`newArchEnabled: true`). NativeWind v4 é compatível e foi configurado via `withNativeWind()` no `metro.config.js` + `jsxImportSource: 'nativewind'` no Babel. Isso elimina a necessidade de `styled()` wrappers.

### Path aliases `@/*`
O alias `@/` aponta para `src/`, configurado em `tsconfig.json` e em `babel-plugin-module-resolver`. Evita imports relativos longos como `../../../components/ui`.

### `cn()` utility
`clsx` + `tailwind-merge` combinados para resolver conflitos de classes Tailwind dinamicamente — padrão adotado pelo React Native Reusables.

### Firebase Web SDK (não RN-Firebase)
Optou-se pelo Firebase Web SDK (v12) em vez de `@react-native-firebase/app` pois funciona sem código nativo adicional (zero-config com Expo Go), tornando o setup mais simples. A troca para RN Firebase é indicada quando houver necessidade de notificações push nativas ou uso offline intenso.

### Componentes base
Os componentes em `src/components/ui/` seguem os padrões do React Native Reusables: `cva` para variantes, `cn()` para merge de classes, e props tipadas com interfaces explícitas.

---

## Próximos passos

### Autenticação
- [ ] Configurar Firebase Auth (e-mail/senha ou Google Sign-In via `expo-auth-session`)
- [ ] Criar telas de Login e Cadastro
- [ ] Proteger rotas com um `AuthNavigator` envolvendo o `TabNavigator`

### Funcionalidades de dados
- [x] Dashboard com resumo mensal, navegação por mês, taxa de poupança, orçamentos e fatura do cartão
- [ ] Implementar CRUD completo de Lançamentos na tela de Lançamentos
- [x] Conectar Orçamentos ao Firestore — `useBudgets`, listagem por mês, criar/editar limite por categoria
- [x] Conectar Metas ao Firestore — `useGoals`, criar/editar/excluir metas, aportes manuais, estimativa de conclusão por média dos últimos 3 meses
- [ ] Adicionar paginação / scroll infinito na listagem de transações

### Gráficos reais
- [x] Tela de Relatórios com gráficos SVG nativos via `react-native-svg`

### UX / Design
- [ ] Bottom sheet para criação rápida de lançamentos (`@gorhom/bottom-sheet`)
- [ ] Animações de entrada com `react-native-reanimated`
- [ ] Skeleton loaders durante carregamento de dados

### Build & CI
- [ ] Configurar EAS Build para gerar APK / IPA
- [ ] Adicionar Expo Updates para OTA
- [ ] Configurar ESLint + Prettier

### Testes
- [ ] Testes unitários com Jest + `@testing-library/react-native`
- [ ] Testes E2E com Detox ou Maestro
