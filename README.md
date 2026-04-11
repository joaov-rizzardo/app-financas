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
│   │   ├── DashboardScreen.tsx
│   │   ├── LancamentosScreen.tsx
│   │   ├── CartaoScreen.tsx
│   │   ├── OrcamentosScreen.tsx
│   │   ├── MetasScreen.tsx
│   │   └── RelatoriosScreen.tsx
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
- [ ] Implementar CRUD completo de Lançamentos na tela de Lançamentos
- [ ] Conectar Orçamentos e Metas ao Firestore (hooks + services)
- [ ] Adicionar paginação / scroll infinito na listagem de transações

### Gráficos reais
- [ ] Integrar `victory-native` ou `react-native-gifted-charts` para os gráficos em Relatórios

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
