# App Finanças — CLAUDE.md

## Idioma
- Texto exibido ao usuário: **Português**
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
- Usar `cn()` de `@/lib/utils` — nunca `StyleSheet.create`.
- Variantes de componentes usam `cva`.
- Imports sempre via alias `@/` (nunca caminhos relativos longos).
- Dados mock em constantes no topo do arquivo, fora do componente.
- **Organização de sub-componentes de tela:**
  - 1–2 sub-componentes simples: mesmo arquivo, acima da função principal.
  - 3+ sub-componentes: organizar como pasta (`ScreenName/index.tsx`), cada sub-componente em seu próprio arquivo dentro da pasta. A interface de props do screen deve ser exportada (`export interface`). Helpers e constantes exclusivos da tela ficam no `index.tsx`.

---

## Paleta de cores (`src/constants/colors.ts`)
> Sincronizar sempre com `tailwind.config.js`.

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

### NativeWind v4
- `metro.config.js`: `withNativeWind(config, { input: './global.css' })`
- `babel.config.js`: `jsxImportSource: 'nativewind'` no preset `babel-preset-expo`
- **Não usar** `styled()` wrappers — incompatível com NativeWind v4

### React Navigation
- `enableScreens(false)` em `App.tsx` **antes** de qualquer render — resolve erro de cast no Android
- Rotas do `TabParamList` em português (`"Lançamentos"`, etc.) — não alterar, quebra estado de navegação

### Firebase
- Usar **Firebase Web SDK** (não `@react-native-firebase`) — compatível com Expo Go
- `getApps().length === 0` evita re-inicialização em hot-reload

### `app.json`
- `"newArchEnabled": false` — New Architecture incompatível com `react-native-screens`
- Não adicionar `edgeToEdgeEnabled` ou `predictiveBackGestureEnabled` — causam erros no Android

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
- `TransactionsNavigator` — controla navegação entre lista e formulário (mesmo padrão do `CategoriesNavigator`)
- `TransactionsScreen` — listagem com seletor de mês, filtros, swipe-to-delete
- `TransactionFormScreen` — criação/edição com todos os campos
- `useTransactions(month?)` — hook React Query; `month` no formato `YYYY-MM`

### Padrões do formulário
- **Máscara de valor**: entrada em centavos (inteiros), dividida por 100 para exibição; armazenada como `number` no Firestore
- **Bottom sheet de categoria**: `Modal` animado com `Animated.Value` translateY — mesmo padrão do `ConfirmDialog`
- **Seletor de data**: modal com botões ± por componente (dia / mês / ano)
- **Recorrente e parcelado são mutuamente exclusivos** — ativar um desativa o outro
- **Swipe-to-delete**: `PanResponder` + `Animated.Value` translateX; limiar de 72px para acionar `ConfirmDialog`

### Coleção Firestore `transactions`
```
{
  type: 'income' | 'expense'
  amount: number          // valor positivo sempre
  date: string            // ISO 8601 (YYYY-MM-DD)
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

### Fluxo de inicialização (`App.tsx`)
Ao abrir o app, antes de montar o `NavigationContainer`, `App.tsx` executa um ciclo de verificação de recorrências com a seguinte máquina de estados:

```
'checking' → 'processing' → 'ready' → (mostra app)
```

- **`checking`**: chama `hasPendingRecurringItems()` — se não houver pendentes, pula direto para o app sem exibir tela de loading.
- **`processing`**: chama `processRecurringItems(onProgress)` com callback de progresso.
- **`ready`**: exibe tela de sucesso por `READY_DISPLAY_DURATION` (1200 ms) antes de montar o app.
- Em caso de erro inesperado, o app abre normalmente (fail-open).

> O `QueryClientProvider` só é montado após o processamento, pois `processRecurringItems` chama o Firestore diretamente (sem React Query). A `RecurringProcessingScreen` usa `StyleSheet.create` em vez de NativeWind.

### Serviço (`src/services/recurringProcessor.ts`)
| Função | Descrição |
|---|---|
| `hasPendingRecurringItems()` | Verificação rápida — retorna `true` se algum item precisa de geração |
| `processRecurringItems(onProgress?)` | Processa todos os itens pendentes; retorna `ProcessingResult` |

**Critério de geração por frequência:**
- `monthly`: gera se `lastGeneratedAt` for nulo ou de mês anterior ao atual.
- `weekly`: gera se `lastGeneratedAt` for nulo ou há ≥ 7 dias.

**Data da transação gerada:**
- `monthly`: preserva o dia original de `startDate` no mês atual, capped ao último dia do mês.
- `weekly`: usa a data de hoje.

**Fluxo por item:**
1. Cria a `transaction` via `createTransaction()`.
2. Se for a última parcela (`installmentCurrent >= installmentTotal`): deleta o `RecurringItem`.
3. Caso contrário: atualiza `lastGeneratedAt` e incrementa `installmentCurrent` (se aplicável).

### Prevenção de duplicatas
Ao criar um `RecurringItem` pelo formulário (`useTransactions.ts`), `lastGeneratedAt` é definido imediatamente com o timestamp atual. Assim, o processador de startup nunca regera a primeira transação já criada pelo formulário.

### Tela de loading (`src/screens/RecurringProcessingScreen.tsx`)
Props:
```typescript
type AppStatus = 'checking' | 'processing' | 'ready';

interface RecurringProcessingScreenProps {
  status: AppStatus;
  progress?: ProcessingProgress; // { total, processed, currentDescription }
}
```

- `checking` → spinner animado + texto "Verificando recorrências..."
- `processing` → barra de progresso animada + contador + nome do item atual
- `ready` → checkmark com "Tudo em dia!" (desaparece após 1200 ms)

---

## Utilitários (`src/lib/utils.ts`)
| Função | Descrição |
|---|---|
| `cn(...classes)` | Merge seguro de classes Tailwind |
| `formatCurrency(value)` | BRL — `R$ 1.200,00` |
| `formatCurrencyCompact(value)` | Compacto — `R$ 5,8k` |
| `formatShortDate(isoStr)` | `10 abr.` |
| `formatDate(isoStr)` | `10 de abril de 2026` |
| `amountSign(value)` | `"+"` ou `"-"` |
| `clamp(value, min, max)` | Limita entre min e max |
| `toPercent(current, total)` | Percentual 0–100, clamped |

---

## Comandos
```bash
npm start -- --clear   # sempre após mudanças em babel/metro/tailwind
npm run android
npm run ios
```

## Variáveis de ambiente
Copiar `.env.example` → `.env` (nunca commitar `.env`).
Prefixo `EXPO_PUBLIC_FIREBASE_*` para todas as credenciais Firebase.
