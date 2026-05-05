# Recanto Vila Rica — Interface

Frontend do sistema de reservas do Recanto Vila Rica. Permite que usuários façam reservas de espaço para eventos, acompanhem pagamentos, negociem condições especiais e gerenciem seu perfil. Inclui painel administrativo completo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + **TypeScript** (strict mode) |
| Build | Vite 8 |
| Estilos | styled-components v6 |
| Roteamento | React Router v7 |
| HTTP | Axios com interceptors (refresh token automático) |
| Testes | Vitest + Testing Library + MSW |
| Animações | GSAP |
| Erros | Sentry |
| Deploy | Vercel (auto-deploy via GitHub) |

---

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Intro animada |
| `/home` | Dashboard do usuário (stats, reservas, promoções) |
| `/venues` | Espaços disponíveis |
| `/reservas` | Histórica de reservas com cancelamento |
| `/reservar/:venueId` | Fluxo de criação de reserva |
| `/checkout/:id` | Pagamento via Stripe ou PIX |
| `/negociacoes` | Lista de negociações |
| `/negociacoes/:id` | Chat de negociação |
| `/promocoes` | Campanhas ativas e referrals |
| `/contato` | Formulário de contato |
| `/perfil` | Edição de perfil |
| `/admin` | Painel administrativo (role ADMIN) |
| `/login` `/cadastro` | Autenticação |

---

## URL de Produção

```
https://recanto-vila-rica.vercel.app
```

---

## Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env.local

# 3. Iniciar em desenvolvimento
npm run dev
```

Disponível em `http://localhost:5173`.

> A API deve estar rodando em `http://localhost:3000` para o frontend funcionar localmente.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento com HMR |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm test` | Testes (vitest run) |
| `npm run test:coverage` | Cobertura de testes |
| `npm run typecheck` | Checagem de tipos (tsc --noEmit) |
| `npm run lint` | ESLint |

---

## Testes

```bash
npm test                 # todos os testes
npm run test:coverage    # com relatório de cobertura
npm run test:watch       # modo watch
```

Cobertura atual: **84%+ lines, 82%+ functions, 75%+ branches**.

---

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=
VITE_SENTRY_DSN=
```

---

## Arquitetura

```
src/
├── components/     # Componentes reutilizáveis (Button, Input, Header, etc.)
├── contexts/       # AuthContext, ThemeContext
├── hooks/          # useApiData, usePagination, useReservations, useNegotiations
├── pages/          # Páginas agrupadas por rota
├── routes/         # Configuração de rotas (privadas e admin)
├── services/       # Chamadas à API (11 arquivos, todos tipados)
├── types/          # Interfaces de domínio centralizadas
├── utils/          # Formatadores, validadores, traduções
├── constants/      # Regras de negócio (planos, reembolso)
├── config/         # Sentry
└── styles/         # GlobalStyle com design tokens (CSS variables)
```

### Design System

Toda a paleta é definida via CSS variables no `GlobalStyle`, com suporte a dark mode via `[data-theme="dark"]`:

- **Brand**: verde-floresta (`#1f4f41`) com escala completa
- **Gold**: dourado (`#c9a84c`) como segundo acento
- **Neutrals**: grays com temperatura verde
- **Dark mode**: fundo verde-floresta escuro, brand mais claro na mesma família
- **Sombras**: `--shadow-sm/md/lg` com progressão coerente
- **Radius**: `--radius-sm/md/lg` padronizados em todos os componentes

### Padrões aplicados

- **TypeScript strict mode** — `strict: true`, zero erros de tipo
- **AbortController** em todos os `useEffect` com chamada de API
- **Lazy loading** em todas as rotas (React.lazy + Suspense)
- **Interceptors Axios** — injeção de token e renovação automática (401)
- **MSW** — mocks de API nos testes de integração

---

## CI/CD

Deploy automático no Vercel a cada push para a branch `main`.

---

## Autor

**Mateus Vitor Ferreira**
