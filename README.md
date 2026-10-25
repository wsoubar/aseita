# A Seita

Rede social para jogadores de RPG: cadastre personagens de **diversos sistemas**,
publique no feed, curta e comente, visite perfis de outros jogadores e acompanhe
o **ranking de popularidade** dos personagens.

## Arquitetura

A aplicação é uma SPA inicializada em `src/main.tsx`. `src/App.tsx` configura o
cliente do TanStack Query, o roteador, os provedores de autenticação e notificações,
e as rotas da aplicação. As páginas autenticadas ficam sob `ProtectedRoute` e
compartilham `AppLayout`; login, cadastro e onboarding são rotas públicas.

As funcionalidades ficam isoladas em `src/features/`: `auth`, `characters`,
`feed`, `profile`, `ranking` e `systems`. Cada área reúne páginas e componentes
próprios e, quando aplicável, um `api.ts` com consultas e mutações Supabase e hooks
do TanStack Query. O estado remoto é cacheado pelo React Query; o feed usa
paginação infinita e atualização otimista de curtidas.

Componentes de layout e primitivos visuais compartilhados ficam em
`src/components/`. `src/lib/` concentra o cliente Supabase, schemas Zod, tema e
utilitários; `src/types.ts` reúne os tipos de domínio.

## Stack

- **Vite + React 19 + TypeScript** (SPA)
- **Tailwind CSS v4** para estilos
- **React Router v7** para navegação
- **TanStack Query v5** para cache e estado remoto
- **React Hook Form + Zod** para formulários e validação
- **Supabase** para autenticação e Postgres com Row Level Security (RLS)

Avatares e imagens de personagens podem ser enviados ao bucket público do
Supabase Storage. URLs externas já salvas continuam funcionando. Os uploads
aceitam JPEG, PNG e WebP com até **2 MB** e **4 megapixels** por arquivo. Antes
do envio, o navegador converte avatares para WebP com até 512 px na maior
dimensão e imagens de personagem para WebP com até 1600 px, preservando a
proporção e ajustando a qualidade para manter o arquivo convertido abaixo de
2 MB.

## Configuração

### 1. Dependências

```sh
npm install
```

### 2. Projeto Supabase

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, execute o conteúdo de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   Esse script cria tabelas, índices, triggers, policies de RLS, a view de
   ranking e faz o seed dos sistemas.
3. Em **Authentication > Providers**, habilite **Email** (e **Google**, se quiser
   login social). Em **Authentication > URL Configuration**, adicione a URL do
   app (ex.: `http://localhost:5173`) em *Redirect URLs*.

### 3. Variáveis de ambiente

Copie o exemplo e preencha com os dados de **Project Settings > API**:

```sh
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-publica
```

O cliente é criado em `src/lib/supabase.ts` usando essas variáveis. Sem elas, a
interface mostra um aviso de configuração. A migração cria o bucket público
`aseita-images`, com limite de 2 MB e allowlist JPEG/PNG/WebP; políticas RLS
restringem envio e exclusão ao diretório do usuário autenticado. A interface
também valida o tipo real do arquivo e o limite de 4 MP. Use apenas a **anon
key** pública; nunca coloque a `service_role` no cliente.

## Organização do código

```text
src/
  App.tsx                 provedores e rotas da SPA
  main.tsx                ponto de entrada React
  components/
    layout/               navegação e proteção de rotas
    ui/                   componentes visuais compartilhados
  features/
    auth/                 sessão, login, registro e onboarding
    characters/           fichas e atributos dinâmicos
    feed/                 publicações, curtidas e comentários
    profile/              perfil público e configurações
    ranking/              ranking de popularidade
    systems/              catálogo de sistemas de RPG
  lib/                    Supabase, schemas, tema e utilitários
  types.ts                tipos de domínio
supabase/migrations/      schema, políticas e dados iniciais
.github/workflows/        CI e deploy no GitHub Pages
```

## Fluxo do usuário

Cadastro → **onboarding** (escolher nick e sistema preferido) → criar
personagem → publicar no feed (opcionalmente vinculando um personagem) →
curtir/comentar → visitar o perfil de quem postou → ranking.

## Modelo de dados e acesso

A migração inicial define `systems`, `profiles`, `characters`, `posts`, `likes` e
`comments`, além da view `character_rankings`. Os dados livres de cada personagem
ficam em `characters.data` (`jsonb`). Triggers mantêm timestamps e contagem de
curtidas; o score do ranking combina curtidas do personagem e comentários em
publicações vinculadas a ele.

As tabelas usam RLS: leitura pública e escrita limitada conforme a identidade do
usuário e as policies definidas na migração. O frontend acessa o Supabase com a
anon key pública; a autorização efetiva é aplicada no banco pelas policies.

## Comandos

```sh
npm run dev       # servidor de desenvolvimento com HMR
npm run build     # checagem TypeScript e build de produção em dist/
npm run lint      # ESLint
npm test          # testes automatizados (node:test)
npm run preview   # serve o build de produção localmente
```

O workflow de CI executa `npm run lint`, `npm test` e `npm run build` em pushes e
pull requests.

## Deploy (GitHub Pages)

O workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
publica o conteúdo de `dist/` no GitHub Pages em pushes para `main`. Ele define o
`base` do Vite pelo caminho publicado e injeta `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` a partir dos secrets do repositório. Para suportar rotas
da SPA, o workflow copia `index.html` para `404.html`.

Configuração inicial:

1. Em *Settings > Secrets and variables > Actions*, crie os secrets
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
2. Em *Settings > Pages*, defina **Source: GitHub Actions**.
3. Adicione a URL publicada em **Supabase > Authentication > URL Configuration
   > Redirect URLs**.

Para outros hosts, execute `npm run build` e publique `dist/`, configurando as
mesmas variáveis de ambiente no painel do host.
