# App Finanças — CLAUDE.md

## Idioma
- UI/texto exibido ao usuário: **Português**
- Código (funções, variáveis, tipos, comentários): **Inglês**

---

## Stack
| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Estilização | NativeWind v4 (Tailwind CSS) |
| Navegação | React Navigation — Bottom Tabs v7 |
| Backend / DB | Firebase Web SDK — Firestore v12 |
| Ícones | lucide-react-native |
| Variantes | class-variance-authority (cva) |
| Merge de classes | clsx + tailwind-merge (`cn()`) |
| Linguagem | TypeScript strict ~5.9 |

---

## Convenções
- `cn()` de `@/lib/utils` — nunca `StyleSheet.create` (exceto `RecurringProcessingScreen`, pré-QueryClient)
- Variantes de componentes com `cva`
- Imports via alias `@/` (nunca caminhos relativos longos)
- Mock data: constantes no topo do arquivo, fora do componente
- Sub-componentes: 1–2 simples no mesmo arquivo; 3+ → pasta `ScreenName/index.tsx` com arquivo por sub-componente; interface de props exportada (`export interface`)

---

## Paleta de cores (`src/constants/colors.ts` ↔ `tailwind.config.js`)

| Token | Hex | Uso |
|---|---|---|
| `background.DEFAULT` | `#0f0f14` | Fundo de telas |
| `background.surface` | `#17171f` | Cards |
| `background.elevated` | `#1e1e2a` | Modais, hero cards |
| `background.card` | `#232334` | Elementos internos |
| `primary.DEFAULT` | `#7c3aed` | Ação principal |
| `primary[400]` | `#a78bfa` | Texto de destaque |
| `accent.DEFAULT` | `#06b6d4` | Ênfase secundária |
| `text.primary` | `#f4f4f8` | Texto principal |
| `text.secondary` | `#a0a0b8` | Texto auxiliar |
| `text.muted` | `#5c5c78` | Labels, metadados |
| `success` | `#10b981` | Receitas, positivo |
| `warning` | `#f59e0b` | Atenção |
| `danger` | `#ef4444` | Despesas |
| `info` | `#3b82f6` | Informativo |
| `border.DEFAULT` | `#2a2a3d` | Bordas |

---

## Configurações críticas

- **NativeWind v4**: `withNativeWind` no `metro.config.js`; `jsxImportSource: 'nativewind'` no `babel.config.js`; **não usar** `styled()` wrappers
- **React Navigation**: `enableScreens(false)` em `App.tsx` antes de qualquer render; rotas do `TabParamList` em português — não alterar
- **Firebase**: Web SDK (não `@react-native-firebase`); `getApps().length === 0` evita re-inicialização
- **app.json**: `"newArchEnabled": false`; não adicionar `edgeToEdgeEnabled` nem `predictiveBackGestureEnabled`

---

## Navegação — Bottom Tabs
| Rota | Componente | Label | Ícone |
|---|---|---|---|
| `Dashboard` | `DashboardScreen` | Início | `LayoutDashboard` |
| `Lançamentos` | `TransactionsNavigator` | Lançamentos | `ArrowLeftRight` |
| `Cartão` | `CreditCardScreen` | Cartão | `CreditCard` |
| `Orçamentos` | `BudgetsScreen` | Orçamentos | `PieChart` |
| `Metas` | `GoalsScreen` | Metas | `Target` |
| `Relatórios` | `ReportsScreen` | Relatórios | `BarChart2` |
| `Categorias` | `CategoriesNavigator` | Categorias | `Tags` |

---

## Módulo de Lançamentos

### Arquitetura
- `TransactionsNavigator` → `TransactionsScreen` (lista) + `TransactionFormScreen` (criação/edição)
- `useTransactions(month?)` — React Query; `month` formato `YYYY-MM`

### Padrões do formulário
- **Valor**: entrada em centavos (inteiros), exibição ÷ 100, armazenado como `number`
- **Categoria**: bottom sheet com `Modal` + `Animated.Value` translateY
- **Data**: modal com botões ± por componente (dia / mês / ano)
- **Recorrente e parcelado** são mutuamente exclusivos
- **Swipe-to-delete**: `PanResponder` + `Animated.Value` translateX; limiar 72 px → `ConfirmDialog`

### Schema Firestore `transactions`
```ts
{
  type: 'income' | 'expense'
  amount: number          // sempre positivo
  date: string            // YYYY-MM-DD
  categoryId: string
  description: string
  isRecurring: boolean
  recurringId?: string
  installmentTotal?: number
  installmentCurrent?: number
  createdAt: string       // ISO 8601
}
```

---

## Módulo de Recorrências

### Fluxo `App.tsx` (pré-NavigationContainer)
`checking → processing → ready → (app)`

- `checking`: `hasPendingRecurringItems()` — sem pendentes, abre direto sem loading
- `processing`: `processRecurringItems(onProgress)`
- `ready`: exibe "Tudo em dia!" por 1200 ms

### Serviço `src/services/recurringProcessor.ts`
- **`monthly`**: gera se `lastGeneratedAt` nulo ou mês anterior; data = dia original do `startDate` no mês atual (capped ao último dia)
- **`weekly`**: gera se `lastGeneratedAt` nulo ou ≥ 7 dias; data = hoje
- Última parcela (`installmentCurrent >= installmentTotal`) → deleta o `RecurringItem`
- **Anti-duplicata**: `lastGeneratedAt` definido no momento da criação do `RecurringItem`

---

## Utilitários (`src/lib/utils.ts`)
| Função | Saída |
|---|---|
| `cn(...classes)` | merge Tailwind |
| `formatCurrency(v)` | `R$ 1.200,00` |
| `formatCurrencyCompact(v)` | `R$ 5,8k` |
| `formatShortDate(iso)` | `10 abr.` |
| `formatDate(iso)` | `10 de abril de 2026` |
| `amountSign(v)` | `"+"` ou `"-"` |
| `clamp(v, min, max)` | número limitado |
| `toPercent(cur, tot)` | 0–100 clamped |
| `getInvoiceMonth(date, closingDay)` | `"YYYY-MM"` — fatura correta para a data |
| `getInvoiceDueDate(invoiceMonth, dueDay)` | `"YYYY-MM-DD"` — vencimento da fatura |
| `formatInvoiceMonth(invoiceMonth)` | `"abril 2026"` — exibição no header |
| `shiftInvoiceMonth(invoiceMonth, delta)` | navegar entre faturas |

---

---

## Módulo de Cartão de Crédito

### Arquitetura
- `CreditCardNavigator` → `CreditCardScreen` (lista/fatura) + `CreditCardExpenseFormScreen` (novo gasto) + `CreditCardConfigScreen` (configurações)
- Mesmo padrão de state machine que `TransactionsNavigator`

### Lógica de fatura
- `getInvoiceMonth(date, closingDay)`: se `day(date) > closingDay` → fatura do mês seguinte; caso contrário → fatura do mês atual
- `getInvoiceDueDate(invoiceMonth, dueDay)`: vencimento = dueDay do mês após invoiceMonth
- `invoiceMonth` é sempre `YYYY-MM` e referencia o mês de fechamento do ciclo (não o mês do vencimento)

### Assinaturas no cartão (`isCreditCard`)
- `RecurringItem.isCreditCard?: boolean` — flag adicionada ao tipo
- `recurringProcessor.ts`: quando `item.isCreditCard === true`, gera `CreditCardExpense` (em vez de `Transaction`), usando `getInvoiceMonth(today, config.closingDay)`
- Parcelamentos no cartão também usam `RecurringItem` com `isCreditCard: true` + `installmentTotal`

### Schema Firestore
- `creditCardExpenses`: `amount, description, categoryId, date (ISO), installmentTotal, installmentCurrent, invoiceMonth (YYYY-MM)`
- `creditCardConfig/default`: `closingDay (1–28), dueDay (1–28), limit? (number, centavos)`

### Hooks
- `useCreditCardExpenses(invoiceMonth?)` — query key `['creditCardExpenses', invoiceMonth]`
- `useCreditCardConfig()` — query key `['creditCardConfig']`

---

## Comandos
```bash
npm start -- --clear   # obrigatório após mudanças em babel/metro/tailwind
npm run android
npm run ios
```

## Variáveis de ambiente
`.env.example` → `.env` (nunca commitar). Prefixo `EXPO_PUBLIC_FIREBASE_*`.
